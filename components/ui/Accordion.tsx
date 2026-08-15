"use client";

import { useState, type ReactNode } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";

interface AccordionItemProps {
  title: ReactNode;
  /** Small line under the title, visible while collapsed. */
  subtitle?: ReactNode;
  /** Leading icon, rendered in a tinted square. */
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * Single collapsible row — the standard pattern for secondary tour
 * information. Compose several inside a plain flex column; the rows draw
 * their own hairline borders so the group reads as one surface.
 */
export function AccordionItem({ title, subtitle, icon, defaultOpen = false, children }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-3.5 px-4 sm:px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
      >
        {icon && (
          <span className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            {icon}
          </span>
        )}
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-bold font-raleway text-text-primary">{title}</span>
          {subtitle && (
            <span className="block text-xs text-gray-500 dark:text-gray-400 font-open-sans mt-0.5 truncate">
              {subtitle}
            </span>
          )}
        </span>
        <ChevronDownIcon
          size={18}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div className={`acc-body ${open ? "acc-open" : ""}`} aria-hidden={!open}>
        <div>
          <div className="px-4 sm:px-5 pb-5 pt-1 text-sm text-gray-700 dark:text-gray-300 font-open-sans leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
