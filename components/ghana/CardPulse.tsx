/** Loading placeholder for package cards. CSS-only (dark: classes), so the
 * server and client render identical markup — no hydration mismatch. */
export default function CardPulse() {
  return (
    <div aria-hidden="true" className="rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-md animate-pulse">
      <div className="h-52 bg-gray-200 dark:bg-gray-800" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}
