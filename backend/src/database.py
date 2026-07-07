import sqlite3
from pathlib import Path
import pandas as pd

DB_PATH = Path("data/spotify_data.db")


def get_connection():
    DB_PATH.parent.mkdir(exist_ok=True)
    return sqlite3.connect(DB_PATH)


def save_dataframe(df, table_name):
    if df.empty:
        return
    with get_connection() as conn:
        df.to_sql(table_name, conn, if_exists="replace", index=False)


def query(sql, params=()):
    with get_connection() as conn:
        return pd.read_sql_query(sql, conn, params=params)


def table_exists(table_name):
    sql = "SELECT name FROM sqlite_master WHERE type='table' AND name=?"
    return not query(sql, (table_name,)).empty
