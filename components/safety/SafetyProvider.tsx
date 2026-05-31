"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AgeMode = "adult" | "teen" | "child";

export type SafetyPrefs = {
  ageMode: AgeMode;
  redactSensitiveText: boolean;
  externalLinkConfirm: boolean;
  pinLockEnabled: boolean;
  pinSaltB64: string | null;
  pinHashB64: string | null;
};

type SafetyContextValue = {
  prefs: SafetyPrefs;
  setPrefs: (next: SafetyPrefs) => void;
  update: (patch: Partial<SafetyPrefs>) => void;
  reset: () => void;
  setPin: (pin: string) => Promise<void>;
  clearPin: () => void;
  verifyPin: (pin: string) => Promise<boolean>;
};

const DEFAULT: SafetyPrefs = {
  ageMode: "adult",
  redactSensitiveText: true,
  externalLinkConfirm: true,
  pinLockEnabled: false,
  pinSaltB64: null,
  pinHashB64: null,
};

const KEY = "valor_safety_prefs_v1";

const SafetyContext = createContext<SafetyContextValue | null>(null);

function safeLoad(): SafetyPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as Partial<SafetyPrefs>;
    return { ...DEFAULT, ...parsed };
  } catch {
    return DEFAULT;
  }
}

function applyToHtml(p: SafetyPrefs) {
  const el = document.documentElement;
  el.dataset.ageMode = p.ageMode;
  el.dataset.redact = p.redactSensitiveText ? "true" : "false";
}

function u8ToB64(u8: Uint8Array) {
  let s = "";
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s);
}

function b64ToU8(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hashPin(pin: string, salt: Uint8Array): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(pin),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 310_000, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return new Uint8Array(derived);
}

export function SafetyProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<SafetyPrefs>(DEFAULT);
  const [mounted, setMounted] = useState(false);

  // Load once on mount — never touches localStorage during SSR
  useEffect(() => {
    setMounted(true);
    setPrefs(safeLoad());
  }, []);

  // Force safety toggles on when in youth modes
  useEffect(() => {
    if (!mounted) return;
    if (prefs.ageMode !== "adult") {
      if (!prefs.externalLinkConfirm || !prefs.redactSensitiveText) {
        setPrefs((p) => ({ ...p, externalLinkConfirm: true, redactSensitiveText: true }));
        return; // will re-fire on the updated prefs
      }
    }
  }, [prefs.ageMode, prefs.externalLinkConfirm, prefs.redactSensitiveText, mounted]);

  // Persist + apply HTML dataset only after mount (prevents SSR flicker)
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs));
    } catch {
      // ignore storage failures (private mode / quota / policy)
    }
    applyToHtml(prefs);
  }, [prefs, mounted]);

  const value = useMemo<SafetyContextValue>(() => {
    return {
      prefs,
      setPrefs,
      update: (patch) => setPrefs((p) => ({ ...p, ...patch })),
      reset: () => setPrefs(DEFAULT),

      setPin: async (pin: string) => {
        if (!pin || pin.length < 4) throw new Error("PIN_TOO_SHORT");
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const h = await hashPin(pin, salt);
        setPrefs((p) => ({
          ...p,
          pinLockEnabled: true,
          pinSaltB64: u8ToB64(salt),
          pinHashB64: u8ToB64(h),
        }));
      },

      clearPin: () => {
        setPrefs((p) => ({
          ...p,
          pinLockEnabled: false,
          pinSaltB64: null,
          pinHashB64: null,
        }));
      },

      verifyPin: async (pin: string) => {
        if (!prefs.pinLockEnabled || !prefs.pinSaltB64 || !prefs.pinHashB64) return true;
        const salt = b64ToU8(prefs.pinSaltB64);
        const expected = prefs.pinHashB64;
        const got = u8ToB64(await hashPin(pin, salt));
        return got === expected;
      },
    };
  }, [prefs]);

  return <SafetyContext.Provider value={value}>{children}</SafetyContext.Provider>;
}

const FALLBACK: SafetyContextValue = {
  prefs: DEFAULT,
  setPrefs: () => {},
  update: () => {},
  reset: () => {},
  setPin: async () => {},
  clearPin: () => {},
  verifyPin: async () => true,
};

export function useSafety(): SafetyContextValue {
  const ctx = useContext(SafetyContext);
  return ctx ?? FALLBACK;
}
