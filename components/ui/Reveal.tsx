"use client";

import { useCallback, useRef, useState, type ElementType, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Wrapper element — keep it semantic (section, li, …). */
  as?: ElementType;
  /** "up" (default) fades + rises, "fade" only fades, "scale" fades + settles. */
  variant?: "up" | "fade" | "scale";
  /** Stagger offset in ms, e.g. index * 70. */
  delay?: number;
  className?: string;
}

/**
 * Viewport-based reveal — the app's single entrance pattern. Elements start
 * hidden (see .reveal in globals.css) and transition in when they enter the
 * viewport; content already on screen animates immediately on mount, and
 * anything above the viewport (restored scroll) shows instantly. Fires once.
 * Under prefers-reduced-motion the CSS forces content visible with no motion.
 */
export default function Reveal({ children, as = "div", variant = "up", delay = 0, className = "" }: RevealProps) {
  const [visible, setVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setRef = useCallback((el: HTMLElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // isIntersecting: entered (or started in) the viewport.
        // bottom < 0: already scrolled past — reveal immediately, the
        // observer would otherwise never fire for it.
        if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    observerRef.current = observer;
  }, []);

  const variantClass = variant === "fade" ? "reveal-fade" : variant === "scale" ? "reveal-scale" : "";
  const Tag = as;

  return (
    <Tag
      ref={setRef}
      className={`reveal ${variantClass} ${visible ? "is-visible" : ""} ${className}`.trim()}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
