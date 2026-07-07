import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { api } from "../api";

const GREEN = "#1DB954";

function StatCard({ label, value }) {
  return (
    <div className="bg-spotify-gray rounded-lg p-4">
      <div className="text-sm text-spotify-lightgray">{label}</div>
      <div className="text-2xl font-bold">{value ?? "-"}</div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-spotify-gray rounded-lg p-4">
      <h3 className="font-bold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      api.getSummary(), api.getTopArtists(), api.getDecades(),
      api.getDuration(), api.getExtremes(),
    ])
      .then(([summary, artists, decades, duration, extremes]) => {
        setData({ summary, artists, decades, duration, extremes });
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="text-red-400">Error: {error}</div>;
  if (!data) return <div>Loading analytics...</div>;

  const s = data.summary;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total tracks" value={s.total_tracks} />
        <StatCard label="Unique artists" value={s.unique_artists} />
        <StatCard label="Total hours" value={s.total_hours} />
        <StatCard label="Avg song length" value={s.avg_minutes ? `${s.avg_minutes} min` : "-"} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard label="Unique albums" value={s.unique_albums} />
        <StatCard label="Oldest track" value={s.oldest_year} />
        <StatCard label="Newest track" value={s.newest_year} />
      </div>

      <ChartCard title="Top 10 Artists by Saved Songs">
        <BarChart data={data.artists} layout="vertical" margin={{ left: 80 }}>
          <XAxis type="number" stroke="#B3B3B3" />
          <YAxis type="category" dataKey="artist_name" stroke="#B3B3B3" width={80} />
          <Tooltip contentStyle={{ background: "#191414", border: "none" }} />
          <Bar dataKey="saved_count" fill={GREEN} />
        </BarChart>
      </ChartCard>

      <ChartCard title="Songs by Decade">
        <BarChart data={data.decades}>
          <XAxis dataKey="decade" stroke="#B3B3B3" />
          <YAxis stroke="#B3B3B3" />
          <Tooltip contentStyle={{ background: "#191414", border: "none" }} />
          <Bar dataKey="song_count" fill={GREEN} />
        </BarChart>
      </ChartCard>

      <ChartCard title="Duration Distribution">
        <BarChart data={data.duration}>
          <XAxis dataKey="duration_bucket" stroke="#B3B3B3" />
          <YAxis stroke="#B3B3B3" />
          <Tooltip contentStyle={{ background: "#191414", border: "none" }} />
          <Bar dataKey="song_count" fill={GREEN} />
        </BarChart>
      </ChartCard>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-spotify-gray rounded-lg p-4">
          <h3 className="font-bold mb-3">Longest Songs</h3>
          <ul className="space-y-2">
            {data.extremes.longest.map((t, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="truncate">{t.track_name} - {t.artist_name}</span>
                <span className="text-spotify-lightgray">{t.minutes} min</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-spotify-gray rounded-lg p-4">
          <h3 className="font-bold mb-3">Shortest Songs</h3>
          <ul className="space-y-2">
            {data.extremes.shortest.map((t, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="truncate">{t.track_name} - {t.artist_name}</span>
                <span className="text-spotify-lightgray">{t.minutes} min</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}