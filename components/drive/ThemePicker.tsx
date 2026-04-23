"use client";

import { useEffect } from "react";
import { useThemeStore, ACCENT_COLORS, type AccentColor } from "@/store/themeStore";

export function ThemePicker() {
  const { accent, setAccent } = useThemeStore();

  // Apply CSS variable when accent changes
  useEffect(() => {
    const color = ACCENT_COLORS[accent];
    document.documentElement.style.setProperty("--primary-rgb", color.primary);
    // Override --primary and related Tailwind custom props
    const root = document.documentElement;
    root.style.setProperty("--primary", `rgb(${color.primary})`);
    root.style.setProperty("--ring", `rgb(${color.ring})`);
  }, [accent]);

  return (
    <div className="px-3 py-2">
      <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">Couleur</p>
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(ACCENT_COLORS) as AccentColor[]).map((c) => {
          const { primary } = ACCENT_COLORS[c];
          return (
            <button
              key={c}
              title={ACCENT_COLORS[c].label}
              onClick={() => setAccent(c)}
              className={`w-5 h-5 rounded-full transition-all cursor-pointer ${accent === c ? "ring-2 ring-offset-2 ring-offset-card scale-110" : "hover:scale-110"}`}
              style={{ backgroundColor: `rgb(${primary})`, ["--tw-ring-color" as string]: `rgb(${primary})` }}
            />
          );
        })}
      </div>
    </div>
  );
}
