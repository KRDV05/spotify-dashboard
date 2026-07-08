#  Spotify Dashboard

A full-stack analytics and recommendation dashboard for your personal Spotify library. Pulls your saved songs, top tracks, and followed artists via the Spotify Web API, persists them to SQLite, and surfaces insights through SQL-powered analytics and set-difference-based recommendations.


<img width="1032" height="321" alt="Screenshot 2026-07-07 130934" src="https://github.com/user-attachments/assets/8c30f9a2-02a2-4c24-a9ad-71fede55f076" />


https://github.com/user-attachments/assets/d0071f61-93b0-4c0b-9ead-f4f50f406d59


<img width="1198" height="819" alt="Screenshot 2026-07-07 045240" src="https://github.com/user-attachments/assets/0f87f069-2f3b-4268-9c83-5d9ab17a8c98" />





---

## What It Does

- **Recommendations:**
  - *Forgotten Favorites* — liked songs from artists you follow but aren't in your current top tracks. 
  - *Outside Your Rotation* — liked songs from artists outside your top tracks
- **Analytics:** interactive charts and stat cards showing library size, artist diversity, listening hours, song length distribution, and songs by decade.
- **Time-range aware:** switch between 4-week, 6-month, and all-time views. 

---

## Tech Stack

| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend | FastAPI, Spotipy, Pandas|
| Database | SQLite (via `pandas.to_sql`) |
| Auth | Spotify OAuth 2.0 with automatic token refresh |
| Dev tooling | Uvicorn, python-dotenv |

---

## Architecture
User browser
│
▼
React SPA (Vite dev server, port 5173)
│
│ fetch(credentials: include)
▼
FastAPI backend (Uvicorn, port 8000)
│
├── OAuth flow → Spotify Accounts
├── Session cookie stores tokens (auto-refreshed)
│
├── /api/sync → Spotify Web API → Pandas → SQLite
├── /api/recommendations → SQL → Pandas → JSON
└── /api/analytics → SQL → Pandas → JSON
│
▼
SQLite (spotify_data.db) 
### Prerequisites

- Python 3.11+
- Node 18+
- A Spotify Developer app: https://developer.spotify.com/dashboard
  - Register `http://127.0.0.1:8000/api/auth/callback` as a Redirect URI
  - Copy your Client ID and Client Secret

### Backend

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # then fill in your Spotify credentials
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Backend runs on http://127.0.0.1:8000. Interactive API docs at http://127.0.0.1:8000/docs.

### Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://127.0.0.1:5173. Open it and click "Log in with Spotify."

---

## License 
MIT 
