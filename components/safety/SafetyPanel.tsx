"use client";

import React, { useId, useMemo, useState } from "react";
import { useSafety, type AgeMode } from "./SafetyProvider";

function ModePill({ mode, locked }: { mode: AgeMode; locked: boolean }) {
  const label = mode.toUpperCase();

  const cls =
    mode === "adult"
      ? "border-muted-foreground/30 text-foreground bg-secondary/40"
      : mode === "teen"
        ? "border-blue-500/40 text-blue-200 bg-blue-500/5"
        : "border-rose-500/40 text-rose-200 bg-rose-500/5";

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-[10px] font-bold tracking-widest ${cls}`}
      aria-label={`Age mode: ${label}${locked ? ", PIN locked" : ""}`}
    >
      {label}
      {locked ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3 h-3 opacity-80"
          aria-hidden="true"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ) : null}
    </span>
  );
}

export function SafetyPanel({ compact = false }: { compact?: boolean }) {
  const { prefs, update, setPin, clearPin, verifyPin, reset } = useSafety();

  const [open, setOpen] = useState(false);

  // Set PIN
  const [pin, setPinValue] = useState("");
  const [pin2, setPin2Value] = useState("");
  const [pinErr, setPinErr] = useState("");
  const [pinOk, setPinOk] = useState(false);

  // Unlock to adult
  const [unlockPin, setUnlockPin] = useState("");
  const [unlockErr, setUnlockErr] = useState("");

  const panelId = useId();
  const titleId = useId();

  const isMinorMode = prefs.ageMode === "child" || prefs.ageMode === "teen";
  const locked = prefs.pinLockEnabled && isMinorMode;

  const buttonClass = useMemo(() => {
    const base =
      "rounded-xl bg-secondary border border-border hover:border-primary/40 transition-all " +
      "focus:outline-none focus:ring-2 focus:ring-ring font-bold uppercase tracking-widest text-foreground";
    return compact ? `px-3 py-2 text-xs ${base}` : `px-4 py-2 text-sm ${base}`;
  }, [compact]);

  async function requestMode(next: AgeMode) {
    setUnlockErr("");

    // Moving INTO teen/child is always allowed (safer by default).
    if (next === "teen" || next === "child") {
      update({ ageMode: next });
      return;
    }

    // Moving to adult
    if (!prefs.pinLockEnabled) {
      update({ ageMode: "adult" });
      return;
    }

    const ok = await verifyPin(unlockPin);
    if (!ok) {
      setUnlockErr("Incorrect PIN");
      return;
    }

    update({ ageMode: "adult" });
    setUnlockPin("");
  }

  async function handleSetPin() {
    setPinErr("");
    setPinOk(false);

    if (!pin || pin.length < 4) {
      setPinErr("PIN must be at least 4 characters.");
      return;
    }
    if (pin !== pin2) {
      setPinErr("PIN entries do not match.");
      return;
    }

    try {
      await setPin(pin);
      setPinValue("");
      setPin2Value("");
      setPinOk(true);
      window.setTimeout(() => setPinOk(false), 2500);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      setPinErr(msg === "PIN_TOO_SHORT" ? "PIN must be at least 4 characters." : "Unable to set PIN.");
    }
  }

  return (
    <section aria-label="Safety controls">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={buttonClass}
        aria-expanded={open}
        aria-controls={panelId}
      >
        Safety{" "}
        <span className="ml-2 align-middle">
          <ModePill mode={prefs.ageMode} locked={prefs.pinLockEnabled} />
        </span>
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute right-0 top-full mt-2 w-[min(440px,calc(100vw-2rem))] rounded-2xl border border-border bg-card/95 backdrop-blur-xl p-6 shadow-2xl z-50"
          role="region"
          aria-labelledby={titleId}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 id={titleId} className="text-lg font-bold text-foreground">
                Youth Safety Utility
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Local-first safeguards for children/teens and vulnerable users.
                No surveillance. Guardrails only.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={reset}
                className="px-3 py-2 rounded-xl bg-secondary border border-border hover:border-muted-foreground/40 text-xs font-bold uppercase tracking-widest text-foreground transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-xl bg-secondary border border-border hover:border-muted-foreground/40 text-xs font-bold uppercase tracking-widest text-foreground transition-colors"
              >
                Close
              </button>
            </div>
          </div>

          {/* Age mode */}
          <div className="mt-6">
            <div className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Age Mode</div>
            <p className="text-sm text-muted-foreground mt-1">
              Tightens outbound links and redaction. Exiting Child/Teen can be PIN-locked.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {(["adult", "teen", "child"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => requestMode(m)}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest transition-colors ${
                    prefs.ageMode === m
                      ? "bg-primary/15 border-primary/30 text-primary"
                      : "bg-secondary border-border text-foreground hover:border-muted-foreground/40"
                  }`}
                  aria-pressed={prefs.ageMode === m}
                >
                  {m}
                </button>
              ))}
            </div>

            {locked && (
              <div className="mt-4">
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Enter PIN to switch to Adult
                </label>
                <input
                  value={unlockPin}
                  onChange={(e) => setUnlockPin(e.target.value)}
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  className="mt-2 w-full max-w-xs bg-background/40 border border-border rounded-xl px-4 py-2 text-sm font-mono text-foreground outline-none focus:ring-2 focus:ring-ring"
                  aria-label="PIN to unlock adult mode"
                />
                {unlockErr && (
                  <div className="mt-2 text-sm text-destructive" role="alert">
                    {unlockErr}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="mt-6 grid gap-3">
            <label className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-secondary/40">
              <div>
                <div className="font-bold text-foreground text-sm">Redact sensitive text</div>
                <div className="text-xs text-muted-foreground">Masks emails, phones, seed-like strings in logs and UI.</div>
              </div>
              <input
                type="checkbox"
                checked={prefs.redactSensitiveText}
                onChange={(e) => update({ redactSensitiveText: e.target.checked })}
                className="accent-primary w-4 h-4"
                aria-label="Toggle sensitive text redaction"
              />
            </label>

            <label className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-secondary/40">
              <div>
                <div className="font-bold text-foreground text-sm">Confirm external links</div>
                <div className="text-xs text-muted-foreground">Shows an accessible confirmation before leaving the site.</div>
              </div>
              <input
                type="checkbox"
                checked={prefs.externalLinkConfirm}
                onChange={(e) => update({ externalLinkConfirm: e.target.checked })}
                className="accent-primary w-4 h-4"
                aria-label="Toggle external link confirmations"
              />
            </label>
          </div>

          {/* PIN lock */}
          <div className="mt-6 rounded-2xl border border-border bg-secondary/30 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Parental PIN Lock</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Locks switching out of Child/Teen mode. PIN stored as PBKDF2-SHA256 (310k iterations, local only).
                </p>
              </div>

              {prefs.pinLockEnabled ? (
                <button
                  type="button"
                  onClick={clearPin}
                  className="px-3 py-2 rounded-xl bg-secondary border border-border hover:border-muted-foreground/40 text-xs font-bold uppercase tracking-widest text-foreground transition-colors"
                >
                  Disable
                </button>
              ) : null}
            </div>

            {!prefs.pinLockEnabled && (
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                <input
                  value={pin}
                  onChange={(e) => setPinValue(e.target.value)}
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Set PIN"
                  className="bg-background/40 border border-border rounded-xl px-4 py-2 text-sm font-mono text-foreground outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                  aria-label="Set PIN"
                />
                <input
                  value={pin2}
                  onChange={(e) => setPin2Value(e.target.value)}
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Confirm PIN"
                  className="bg-background/40 border border-border rounded-xl px-4 py-2 text-sm font-mono text-foreground outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                  aria-label="Confirm PIN"
                />

                <button
                  type="button"
                  onClick={handleSetPin}
                  className="sm:col-span-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Enable PIN Lock
                </button>

                {pinErr && (
                  <div className="sm:col-span-2 text-sm text-destructive" role="alert">
                    {pinErr}
                  </div>
                )}

                {pinOk && (
                  <div
                    className="sm:col-span-2 mt-1 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-sm text-center"
                    role="status"
                    aria-live="polite"
                  >
                    PIN Lock Enabled -- exiting Child/Teen now requires verification.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-muted-foreground/60">
            Safety mode protects children, teenagers, and vulnerable users while keeping the tool accessible to disabled veterans and disabled users worldwide.
          </div>
        </div>
      )}
    </section>
  );
}
