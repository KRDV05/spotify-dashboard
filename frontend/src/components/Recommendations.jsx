import { useEffect, useState } from "react";
import { api } from "../api";

export default function Recommendations() {
  const [forgotten, setForgotten] = useState([]);
  const [outside, setOutside] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.getForgotten(), api.getOutside()])
      .then(([f, o]) => {
        setForgotten(f);
        setOutside(o);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading recommendations...</div>;
  if (error) return <div className="text-red-400">Error: {error}</div>;

  const renderTrack = (track) => (
    <a key={track.track_id} href={track.spotify_url} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-3 bg-spotify-gray rounded-lg hover:bg-neutral-700 transition">
      {track.album_image ? <img src={track.album_image} alt="" className="w-16 h-16 rounded" /> : null}
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{track.track_name}</div>
        <div className="text-sm text-spotify-lightgray truncate">{track.artist_name} - {track.album_name}</div>
      </div>
    </a>
  );

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-1">Forgotten Favorites</h2>
        <p className="text-spotify-lightgray mb-4">Liked songs from artists you follow but arent in your top tracks.</p>
        <div className="grid gap-3 md:grid-cols-2">
          {forgotten.length === 0 ? <p className="text-spotify-lightgray">Nothing to show yet.</p> : forgotten.map(renderTrack)}
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-1">Outside Your Rotation</h2>
        <p className="text-spotify-lightgray mb-4">Liked songs from artists outside your top tracks.</p>
        <div className="grid gap-3 md:grid-cols-2">
          {outside.length === 0 ? <p className="text-spotify-lightgray">Nothing to show yet.</p> : outside.map(renderTrack)}
        </div>
      </section>
    </div>
  );
}
