"use client";

import { useEffect, useRef } from "react";

// Wraps server-rendered content and fades in any descendant with the `.sa`
// class as it scrolls into view. Content stays in the initial HTML (good for
// SEO + first paint); only the reveal animation runs on the client.
export function ScrollAnimator({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fadeInUp");
            entry.target.classList.remove("opacity-0", "translate-y-8");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    const el = ref.current;
    if (el) el.querySelectorAll(".sa").forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{children}</div>;
}
