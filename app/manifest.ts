import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SplitCord",
    short_name: "SplitCord",
    description: "Drive personnel propulsé par Discord",
    start_url: "/drive",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#5865f2",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["productivity", "utilities"],
  };
}
