import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv

from src import auth, spotify_client, database, analytics, recommender

load_dotenv()

app = FastAPI(title="Spotify Dashboard API")

app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET", "dev-secret"), same_site="lax")
app.add_middleware(CORSMiddleware, allow_origins=[os.getenv("FRONTEND_URL", "http://127.0.0.1:5173")], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.get("/api/auth/login")
def login():
    return {"auth_url": auth.make_oauth().get_authorize_url()}


@app.get("/api/auth/callback")
def callback(request: Request, code: str = None, error: str = None):
    frontend = os.getenv("FRONTEND_URL", "http://127.0.0.1:5173")
    if error:
        return RedirectResponse(f"{frontend}?error={error}")
    if not code:
        raise HTTPException(400, "Missing code")
    token_info = auth.make_oauth().get_access_token(code, as_dict=True, check_cache=False)
    request.session["token"] = token_info
    return RedirectResponse(f"{frontend}?logged_in=1")


@app.get("/api/auth/status")
def status(request: Request):
    return {"logged_in": "token" in request.session}


@app.post("/api/auth/logout")
def logout(request: Request):
    request.session.clear()
    return {"ok": True}


def get_sp(request: Request):
    token = request.session.get("token")
    if not token:
        raise HTTPException(401, "Not logged in")
    return auth.client_from_token(token)


@app.post("/api/sync")
def sync(request: Request, time_range: str = "medium_term"):
    sp = get_sp(request)
    liked = spotify_client.fetch_liked_songs(sp)
    top = spotify_client.fetch_top_tracks(sp, time_range=time_range)
    followed = spotify_client.fetch_followed_artists(sp)
    database.save_dataframe(liked, "liked_songs")
    database.save_dataframe(top, "top_tracks")
    database.save_dataframe(followed, "followed_artists")
    return {"liked_count": len(liked), "top_count": len(top), "followed_count": len(followed)}


@app.get("/api/recommendations/forgotten")
def get_forgotten(request: Request, limit: int = 20):
    get_sp(request)
    if not all(database.table_exists(t) for t in ["liked_songs", "top_tracks", "followed_artists"]):
        raise HTTPException(400, "Sync your data first")
    liked = database.query("SELECT * FROM liked_songs")
    top = database.query("SELECT * FROM top_tracks")
    followed = database.query("SELECT * FROM followed_artists")
    return recommender.forgotten_favorites(liked, top, followed, limit).to_dict(orient="records")


@app.get("/api/recommendations/outside")
def get_outside(request: Request, limit: int = 20):
    get_sp(request)
    if not all(database.table_exists(t) for t in ["liked_songs", "top_tracks"]):
        raise HTTPException(400, "Sync your data first")
    liked = database.query("SELECT * FROM liked_songs")
    top = database.query("SELECT * FROM top_tracks")
    return recommender.outside_rotation(liked, top, limit).to_dict(orient="records")


@app.get("/api/analytics/summary")
def analytics_summary(request: Request):
    get_sp(request)
    if not database.table_exists("liked_songs"):
        raise HTTPException(400, "Sync your data first")
    return analytics.library_summary_stats()


@app.get("/api/analytics/top-artists")
def analytics_top_artists(request: Request, limit: int = 10):
    get_sp(request)
    return analytics.top_artists_by_saved_count(limit).to_dict(orient="records")


@app.get("/api/analytics/decades")
def analytics_decades(request: Request):
    get_sp(request)
    return analytics.songs_by_decade().to_dict(orient="records")


@app.get("/api/analytics/duration")
def analytics_duration(request: Request):
    get_sp(request)
    return analytics.duration_distribution().to_dict(orient="records")


@app.get("/api/analytics/extremes")
def analytics_extremes(request: Request, n: int = 5):
    get_sp(request)
    longest, shortest = analytics.longest_and_shortest_songs(n)
    return {"longest": longest.to_dict(orient="records"), "shortest": shortest.to_dict(orient="records")}


@app.get("/")
def root():
    return {"status": "ok", "docs": "/docs"}
