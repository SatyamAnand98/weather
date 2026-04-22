import type { Metadata, Viewport } from "next";
import "leaflet/dist/leaflet.css";

import "./globals.css";

export const metadata: Metadata = {
  title: "Family Weather Intelligence",
  description:
    "A private weather dashboard with current conditions, 16-day Open-Meteo forecasts, location tools, maps, and 3-month historical analytics.",
  icons: {
    icon: "/favicon.svg"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7faf8" },
    { media: "(prefers-color-scheme: dark)", color: "#17211e" }
  ]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
