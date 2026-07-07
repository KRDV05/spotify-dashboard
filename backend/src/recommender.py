import pandas as pd


def forgotten_favorites(liked, top_tracks, followed, limit=20):
    if liked.empty or followed.empty:
        return pd.DataFrame()
    top_artist_ids = set(top_tracks["artist_id"]) if not top_tracks.empty else set()
    followed_ids = set(followed["artist_id"])
    mask = liked["artist_id"].isin(followed_ids) & ~liked["artist_id"].isin(top_artist_ids)
    candidates = liked[mask]
    if candidates.empty:
        return candidates
    n = min(limit, len(candidates))
    return candidates.sample(n=n).reset_index(drop=True)


def outside_rotation(liked, top_tracks, limit=20):
    if liked.empty:
        return pd.DataFrame()
    top_artist_ids = set(top_tracks["artist_id"]) if not top_tracks.empty else set()
    mask = ~liked["artist_id"].isin(top_artist_ids)
    candidates = liked[mask]
    if candidates.empty:
        return candidates
    # One song per artist for variety, then shuffle
    unique = candidates.groupby("artist_id", group_keys=False).apply(lambda g: g.sample(1))
    n = min(limit, len(unique))
    return unique.sample(n=n).reset_index(drop=True)