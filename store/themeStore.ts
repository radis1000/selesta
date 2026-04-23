"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AccentColor = "blurple" | "emerald" | "rose" | "amber" | "sky" | "violet";

export const ACCENT_COLORS: Record<AccentColor, { label: string; primary: string; ring: string }> = {
  blurple:  { label: "Blurple",  primary: "88 101 242",  ring: "88 101 242" },
  emerald:  { label: "Emerald",  primary: "16 185 129",  ring: "16 185 129" },
  rose:     { label: "Rose",     primary: "244 63 94",   ring: "244 63 94" },
  amber:    { label: "Amber",    primary: "245 158 11",  ring: "245 158 11" },
  sky:      { label: "Sky",      primary: "14 165 233",  ring: "14 165 233" },
  violet:   { label: "Violet",   primary: "139 92 246",  ring: "139 92 246" },
};

interface ThemeState {
  accent: AccentColor;
  setAccent: (color: AccentColor) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      accent: "blurple",
      setAccent: (accent) => set({ accent }),
    }),
    { name: "splitcord-theme" }
  )
);
