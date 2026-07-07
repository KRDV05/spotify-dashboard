const BASE = "http://127.0.0.1:8000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getAuthStatus: () => request("/auth/status"),
  getLoginUrl: () => request("/auth/login"),
  logout: () => request("/auth/logout", { method: "POST" }),
  sync: (timeRange = "medium_term") =>
    request(`/sync?time_range=${timeRange}`, { method: "POST" }),
  getForgotten: () => request("/recommendations/forgotten"),
  getOutside: () => request("/recommendations/outside"),
  getSummary: () => request("/analytics/summary"),
  getTopArtists: () => request("/analytics/top-artists"),
  getDecades: () => request("/analytics/decades"),
  getDuration: () => request("/analytics/duration"),
  getExtremes: () => request("/analytics/extremes"),
};