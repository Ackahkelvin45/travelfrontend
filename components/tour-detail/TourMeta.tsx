import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon } from "@/components/ui/icons";
import type { ReactNode } from "react";

interface TourMetaProps {
  duration: string;
  groupSize: string;
  dates?: string;
  destination?: string | null;
}

/** Quick-facts strip under the hero: the four questions every traveller
 * asks first — how long, when, where, how many. */
export default function TourMeta({ duration, groupSize, dates, destination }: TourMetaProps) {
  const items: { icon: ReactNode; label: string; value: string }[] = [
    { icon: <ClockIcon size={18} />, label: "Duration", value: duration },
    ...(dates ? [{ icon: <CalendarIcon size={18} />, label: "Tour dates", value: dates }] : []),
    ...(destination ? [{ icon: <MapPinIcon size={18} />, label: "Destination", value: destination }] : []),
    { icon: <UsersIcon size={18} />, label: "Group size", value: groupSize },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-5 py-5 border-y border-gray-100 dark:border-gray-800">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            {item.icon}
          </span>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-open-sans">{item.label}</p>
            <p className="text-sm font-semibold font-open-sans text-text-primary">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
