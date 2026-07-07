import { Music } from "lucide-react";
import { api } from "../api";

export default function Login() {
  const handleLogin = async () => {
    const { auth_url } = await api.getLoginUrl();
    window.location.href = auth_url;
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Music className="mx-auto mb-6 text-spotify-green" size={64} />
        <h1 className="text-4xl font-bold mb-2">Spotify Dashboard</h1>
        <p className="text-spotify-lightgray mb-8">
          Recommendations + SQL analytics on your listening library
        </p>
        <button
          onClick={handleLogin}
          className="bg-spotify-green hover:bg-green-400 text-black font-bold py-3 px-8 rounded-full transition"
        >
          Log in with Spotify
        </button>
      </div>
    </div>
  );
}