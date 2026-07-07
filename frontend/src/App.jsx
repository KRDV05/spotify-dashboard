import { useEffect, useState, useCallback } from "react";
import { api } from "./api";
import Login from "./components/Login";
import TabNav from "./components/TabNav";
import Recommendations from "./components/Recommendations";
import Analytics from "./components/Analytics";

const TIME_RANGES = {
  short_term: "Last 4 weeks",
  medium_term: "Last 6 months",
  long_term: "All time",
};

export default function App() {
  const [loggedIn, setLoggedIn] = useState(null);
  const [tab, setTab] = useState("recommendations");
  const [timeRange, setTimeRange] = useState("medium_term");
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [dataVersion, setDataVersion] = useState(0);

  useEffect(() => {
    api.getAuthStatus().then((s) => setLoggedIn(s.logged_in));
  }, []);

  const runSync = useCallback(async (range) => {
    setSyncing(true);
    setSyncStatus("Fetching your library from Spotify... this may take up to a minute for large libraries.");
    try {
      const result = await api.sync(range);
      setSyncStatus(
        `Synced ${result.liked_count} liked songs, ${result.top_count} top tracks, ${result.followed_count} followed artists (${TIME_RANGES[range]})`
      );
      setDataVersion((v) => v + 1);
    } catch (e) {
      setSyncStatus(`Error: ${e.message}`);
    } finally {
      setSyncing(false);
    }
  }, []);

  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
    if (loggedIn) runSync(newRange);
  };

  const handleLogout = async () => {
    await api.logout();
    setLoggedIn(false);
  };

  if (loggedIn === null) return <div className="p-8">Loading...</div>;
  if (!loggedIn) return <Login />;

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-700 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Spotify Dashboard</h1>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            disabled={syncing}
            className="bg-spotify-gray text-sm rounded px-2 py-1 disabled:opacity-50"
          >
            {Object.entries(TIME_RANGES).map(([v, label]) => (
              <option key={v} value={v}>{label}</option>
            ))}
          </select>
          <button
            onClick={() => runSync(timeRange)}
            disabled={syncing}
            className="bg-spotify-green text-black text-sm font-bold px-3 py-1 rounded-full disabled:opacity-50"
          >
            {syncing ? "Syncing..." : "Sync"}
          </button>
          <button onClick={handleLogout} className="text-sm text-spotify-lightgray">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {syncStatus && <p className="text-sm text-spotify-lightgray mb-4">{syncStatus}</p>}
        <TabNav active={tab} onChange={setTab} />
        {tab === "recommendations" ? (
          <Recommendations key={`rec-${dataVersion}`} />
        ) : (
          <Analytics key={`ana-${dataVersion}`} />
        )}
      </main>
    </div>
  );
}