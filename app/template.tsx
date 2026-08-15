/**
 * Remounts on every route change, giving each page a subtle entrance
 * (fade + 10px rise, 400ms — see .page-enter). Navbar/Footer live in
 * layout.tsx and stay put, so navigation feels continuous, not replaced.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
