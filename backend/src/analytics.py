from src import database


def top_artists_by_saved_count(limit=10):
    sql = "SELECT artist_name, COUNT(*) AS saved_count FROM liked_songs GROUP BY artist_name ORDER BY saved_count DESC LIMIT ?"
    return database.query(sql, (limit,))


def library_summary_stats():
    """Compute headline stats about the user's saved library."""
    sql = """
        SELECT
            COUNT(*) AS total_tracks,
            COUNT(DISTINCT artist_id) AS unique_artists,
            COUNT(DISTINCT album_name) AS unique_albums,
            ROUND(SUM(duration_ms) / 3600000.0, 1) AS total_hours,
            ROUND(AVG(duration_ms) / 60000.0, 2) AS avg_minutes,
            MIN(SUBSTR(release_date, 1, 4)) AS oldest_year,
            MAX(SUBSTR(release_date, 1, 4)) AS newest_year
        FROM liked_songs
        WHERE release_date IS NOT NULL AND release_date != ''
    """
    row = database.query(sql).iloc[0]
    return row.to_dict()


def songs_by_decade():
    sql = "SELECT (CAST(SUBSTR(release_date, 1, 4) AS INTEGER) / 10) * 10 AS decade, COUNT(*) AS song_count FROM liked_songs WHERE release_date IS NOT NULL AND release_date != '' GROUP BY decade ORDER BY decade"
    return database.query(sql)


def longest_and_shortest_songs(n=5):
    longest_sql = "SELECT track_name, artist_name, ROUND(duration_ms / 60000.0, 2) AS minutes FROM liked_songs ORDER BY duration_ms DESC LIMIT ?"
    shortest_sql = "SELECT track_name, artist_name, ROUND(duration_ms / 60000.0, 2) AS minutes FROM liked_songs ORDER BY duration_ms ASC LIMIT ?"
    return database.query(longest_sql, (n,)), database.query(shortest_sql, (n,))


def duration_distribution():
    sql = """
    SELECT
        CASE
            WHEN duration_ms < 120000 THEN '< 2 min'
            WHEN duration_ms < 180000 THEN '2-3 min'
            WHEN duration_ms < 240000 THEN '3-4 min'
            WHEN duration_ms < 300000 THEN '4-5 min'
            WHEN duration_ms < 360000 THEN '5-6 min'
            ELSE '6+ min'
        END AS duration_bucket,
        COUNT(*) AS song_count
    FROM liked_songs
    GROUP BY duration_bucket
    ORDER BY
        CASE duration_bucket
            WHEN '< 2 min' THEN 1
            WHEN '2-3 min' THEN 2
            WHEN '3-4 min' THEN 3
            WHEN '4-5 min' THEN 4
            WHEN '5-6 min' THEN 5
            ELSE 6
        END
    """
    return database.query(sql)