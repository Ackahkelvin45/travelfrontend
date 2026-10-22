"use client";

import type { PolicyDoc } from "@/lib/api/packagesApi";
import { XIcon } from "@/components/ui/icons";

/** Full text of one published policy document, in an overlay. */
export default function PolicyModal({ doc, onClose }: { doc: PolicyDoc | null; onClose: () => void }) {
  if (!doc) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={doc.title}
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold font-raleway text-text-primary">
            {doc.title}
          </h3>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-text-primary p-1 -m-1">
            <XIcon size={16} />
          </button>
        </div>
        <div className="text-sm font-open-sans text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
          {doc.body}
        </div>
      </div>
    </div>
  );
}
