"use client";

import { useEffect, useState } from "react";
import { Settings2, X } from "lucide-react";

const FONT_SIZES = ["normal", "large", "xlarge"] as const;
type FontSize = (typeof FONT_SIZES)[number];

const FONT_SIZE_MAP: Record<FontSize, string> = {
  normal: "100%",
  large: "112.5%",
  xlarge: "125%",
};

export default function AccessibilityControls() {
  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>("normal");
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZE_MAP[fontSize];
  }, [fontSize]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [highContrast]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className="bg-card border border-border p-5 w-72 flex flex-col gap-4 shadow-2xl"
          role="dialog"
          aria-label="Accessibility settings"
        >
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-foreground">
              Accessibility
            </h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close accessibility panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Font size */}
          <div>
            <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest block mb-2">
              Text Size
            </label>
            <div className="flex gap-px bg-border">
              {FONT_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFontSize(size)}
                  className={`flex-1 py-2 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors ${
                    fontSize === size
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {size === "normal" ? "A" : size === "large" ? "A+" : "A++"}
                </button>
              ))}
            </div>
          </div>

          {/* High contrast */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="high-contrast-toggle"
              className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest"
            >
              High Contrast
            </label>
            <button
              id="high-contrast-toggle"
              type="button"
              role="switch"
              aria-checked={highContrast}
              onClick={() => setHighContrast(!highContrast)}
              className={`w-10 h-5 border transition-colors relative ${
                highContrast
                  ? "bg-primary border-primary"
                  : "bg-secondary border-border"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-foreground transition-transform ${
                  highContrast ? "left-5" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Accessibility settings"
        aria-expanded={open}
        className="w-12 h-12 bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors shadow-lg"
      >
        <Settings2 className="w-5 h-5" />
      </button>
    </div>
  );
}
