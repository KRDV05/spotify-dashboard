import pandas as pd


def _extract_track(track, item=None):
    if not track:
        return None
    artists = track.get("artists") or [{}]
    album = track.get("album") or {}
    images = album.get("images") or []
    external = track.get("external_urls") or {}
    row = {
        "track_id": track.get("id"),
        "track_name": track.get("name"),
        "artist_name": artists[0].get("name"),
        "artist_id": artists[0].get("id"),
        "album_name": album.get("name"),
        "album_image": images[0].get("url") if images else None,
        "release_date": album.get("release_date"),
        "duration_ms": track.get("duration_ms"),
        "popularity": track.get("popularity"),
        "spotify_url": external.get("spotify"),
    }
    if item is not None:
        row["added_at"] = item.get("added_at")
    return row


def fetch_liked_songs(sp, max_tracks=10000):
    """Fetch all saved tracks up to max_tracks. Spotify caps at 50 per call."""
    rows = []
    offset = 0
    while offset < max_tracks:
        batch = sp.current_user_saved_tracks(limit=50, offset=offset)
        items = batch.get("items", [])
        if not items:
            break
        for item in items:
            row = _extract_track(item.get("track"), item)
            if row and row["track_id"]:
                rows.append(row)
        offset += 50
        # Spotify returns fewer than 50 when we've hit the end
        if len(items) < 50:
            break
    print(f"[sync] Fetched {len(rows)} liked tracks")
    return pd.DataFrame(rows)


def fetch_top_tracks(sp, time_range="medium_term"):
    result = sp.current_user_top_tracks(limit=50, time_range=time_range)
    rows = []
    for track in result.get("items", []):
        row = _extract_track(track)
        if row and row["track_id"]:
            rows.append(row)
    print(f"[sync] Fetched {len(rows)} top tracks ({time_range})")
    return pd.DataFrame(rows)


def fetch_followed_artists(sp):
    rows = []
    after = None
    while True:
        result = sp.current_user_followed_artists(limit=50, after=after)
        artists = result["artists"]["items"]
        if not artists:
            break
        for a in artists:
            rows.append({"artist_id": a.get("id"), "artist_name": a.get("name")})
        after = result["artists"]["cursors"]["after"]
        if not after:
            break
    print(f"[sync] Fetched {len(rows)} followed artists")
    return pd.DataFrame(rows)