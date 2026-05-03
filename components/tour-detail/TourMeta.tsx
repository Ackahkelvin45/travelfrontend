interface TourMetaProps {
  duration: string;
  groupSize: string;
  ages: string;
  languages: string[];
}

const MetaIcon = ({ type }: { type: string }) => {
  if (type === "duration")
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bd8f3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    );
  if (type === "group")
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bd8f3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  if (type === "ages")
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bd8f3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" /><path d="M6 20v-2a6 6 0 0 1 12 0v2" />
      </svg>
    );
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bd8f3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
};

export default function TourMeta({ duration, groupSize, ages }: TourMetaProps) {
  const items = [
    { type: "duration", label: "Duration", value: duration },
    { type: "group", label: "Group Size", value: groupSize },
    { type: "ages", label: "Ages", value: ages },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-100 dark:border-gray-700">
      {items.map((item) => (
        <div key={item.type} className="flex items-center gap-3">
          <MetaIcon type={item.type} />
          <div>
            <p className="text-xs text-gray-800 dark:text-gray-400 font-open-sans">{item.label}</p>
            <p className="text-sm font-semibold font-open-sans text-text-primary">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
