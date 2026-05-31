"use client";

import React, { useEffect, useMemo, useState, useId } from "react";
import { useSafety } from "./SafetyProvider";

/**
 * Hydration-safe external-link detection.
 * Never reads `window` during render — origin is set via useEffect after mount.
 */
function computeExternal(href: string, origin: string | null): boolean {
  // Relative URLs are always internal
  if (href.startsWith("/") || href.startsWith("#")) return false;

  const looksAbsolute = /^https?:\/\//i.test(href);

  // Pre-mount: be conservative — treat absolute URLs as external
  if (!origin) return looksAbsolute;

  try {
    const u = new URL(href, origin);
    return u.origin !== origin;
  } catch {
    // If URL parsing fails, treat as external to force confirm
    return true;
  }
}

export function SafeLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { prefs } = useSafety();
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState<string | null>(null);
  const titleId = useId();

  // Set origin after mount — keeps SSR render deterministic
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const isExternal = useMemo(() => computeExternal(href, origin), [href, origin]);

  // If not external or confirmations disabled: render a normal link
  if (!isExternal || !prefs.externalLinkConfirm) {
    const target = isExternal ? "_blank" : undefined;
    const rel = isExternal ? "noopener noreferrer" : undefined;
    return (
      <a href={href} className={className} target={target} rel={rel}>
        {children}
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {children}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 id={titleId} className="text-lg font-bold text-foreground">
              {"You're leaving this site"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This link opens an external website. For youth safety and
              accessibility, confirm before continuing.
            </p>

            <div className="mt-4 rounded-xl border border-border bg-secondary/50 p-3 font-mono text-xs text-foreground break-all">
              {href}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-xl bg-secondary border border-border hover:border-muted-foreground/40 font-bold uppercase tracking-widest text-xs text-foreground transition-colors"
              >
                Cancel
              </button>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest text-xs text-center transition-colors"
                onClick={() => setOpen(false)}
              >
                Continue
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
