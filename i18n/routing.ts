import { defineRouting } from "next-intl/routing";

export const locales = ["fr", "en", "es", "de", "it", "pt", "ja", "zh"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "fr",
  localeDetection: true,
});
