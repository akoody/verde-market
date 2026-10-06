import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Verde Market",
    short_name: "Verde",
    description: "Фермерские продукты с доставкой по Молдове",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfcfa",
    theme_color: "#2f7d4a",
    lang: "ru-MD",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  };
}
