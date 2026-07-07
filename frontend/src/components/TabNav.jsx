export default function TabNav({ active, onChange }) {
  const tabs = [
    { id: "recommendations", label: "Recommendations" },
    { id: "analytics", label: "Analytics" },
  ];
  return (
    <div className="flex gap-2 border-b border-neutral-700 mb-6">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-4 py-2 font-semibold transition ${
            active === t.id
              ? "text-spotify-green border-b-2 border-spotify-green"
              : "text-spotify-lightgray hover:text-white"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}