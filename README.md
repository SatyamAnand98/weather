# Family Weather Intelligence

A private, Vercel-ready weather dashboard built with Next.js, TypeScript, Tailwind CSS, Leaflet, Recharts, and Open-Meteo.

## Features

- Current weather with interpreted WMO weather codes, wind, humidity, pressure, cloud cover, visibility, precipitation, UV, day/night, sunrise, and sunset.
- 16-day forecast from the Open-Meteo forecast API with expandable hourly details.
- Previous 90 days of historical weather from the Open-Meteo archive API.
- Browser geolocation, manual latitude/longitude entry, Open-Meteo city search, and Leaflet/OpenStreetMap location picker.
- Light and dark mode with local persistence.
- No mock data and no required environment variables.

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
```

## Start Production Build

```bash
npm run start
```

## Type Check

```bash
npm run typecheck
```

## Deploy To Vercel

1. Push this project to a Git repository.
2. Import the repository in Vercel.
3. Use the default Next.js settings.
4. Deploy.

## Environment Variables

No environment variables are required for personal/family use. The app calls public Open-Meteo endpoints through Next.js route handlers.

## Data Sources

- Forecast and current weather: `https://api.open-meteo.com/v1/forecast`
- Historical archive: `https://archive-api.open-meteo.com/v1/archive`
- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Map tiles: OpenStreetMap
