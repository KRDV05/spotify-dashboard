import os
from dotenv import load_dotenv
from spotipy.oauth2 import SpotifyOAuth
import spotipy

load_dotenv()

SCOPES = "user-library-read user-top-read user-follow-read"


def make_oauth():
    return SpotifyOAuth(
        client_id=os.getenv("SPOTIFY_CLIENT_ID"),
        client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
        redirect_uri=os.getenv("SPOTIFY_REDIRECT_URI"),
        scope=SCOPES,
        cache_handler=None,
        open_browser=False,
    )


def client_from_token(token_info):
    return spotipy.Spotify(auth=token_info["access_token"])
