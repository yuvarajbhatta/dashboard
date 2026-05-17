# Tesla Sensor Dash

Tesla Sensor Dash is a futuristic iPhone Safari PWA for live driving telemetry. It combines GPS speed, iPhone motion sensors, orientation data, G-force analysis, trip tracking, and a Tesla-inspired Safety Score into a landscape cockpit UI.

## Tech Stack

- React, Vite, TypeScript
- Tailwind CSS v4, PostCSS, Autoprefixer
- Framer Motion
- Recharts
- Zustand
- Lucide React
- date-fns
- clsx
- localforage / IndexedDB
- vite-plugin-pwa

## Install

```bash
npm install
npm run generate:icons
```

## Initialize From GitHub

```bash
git clone https://github.com/yuvarajbhatta/dashboard.git
cd dashboard
npm install
npm run generate:icons
npm run dev
```

## Commands

```bash
npm run dev
npm run build
npm run preview
```

The app is optimized for iPhone landscape use. For local development, `localhost` is treated as a secure context. For real iPhone testing from another device, serve over HTTPS so GPS, PWA, and sensor APIs work reliably.

## Required Configuration

- Use HTTPS in production. iPhone Safari blocks GPS and motion/orientation permissions on insecure origins, except `localhost`.
- Open the app on the iPhone, tap `Settings`, then tap `Enable Sensors`. iOS requires this user gesture before `DeviceMotionEvent.requestPermission()` and `DeviceOrientationEvent.requestPermission()` can run.
- Tap `Calibrate Mount` after the phone is mounted horizontally in the car. The app stores the current pitch, roll, yaw, and G-force baseline locally.
- Optional weather support uses `VITE_WEATHER_API_KEY`. Copy `.env.example` to `.env.local` and set the key locally or in your hosting provider. Do not commit real keys.
- Deploy the built `dist` output to any static HTTPS host. The source repo intentionally ignores `dist`, `dev-dist`, `node_modules`, logs, and `.env*` files because this GitHub repository is public.
- Do not commit secrets or private deployment tokens. If environment variables are added later, put public examples in `.env.example` only.

## Build For Production

```bash
npm run build
npm run preview
```

The Vite PWA plugin generates the service worker and manifest during the production build.

## iPhone Safari Notes

- Motion and orientation sensors require a user gesture before permission prompts can appear.
- `DeviceMotionEvent.requestPermission()` and `DeviceOrientationEvent.requestPermission()` are used on iOS Safari when available.
- GPS requires HTTPS or localhost.
- Home Screen installation is recommended for standalone display and better dashboard ergonomics.
- iOS Safari may ignore web fullscreen requests, so Drive Mode is designed around full viewport PWA layout rather than relying on fullscreen APIs.

## PWA Install

1. Open the HTTPS app URL in iPhone Safari.
2. Tap Share.
3. Tap Add to Home Screen.
4. Launch Sensor Dash from the Home Screen.
5. Tap `Enable Sensors`, then `Calibrate Mount` once the phone is mounted.

## Tesla Bluetooth Shortcut Idea

Create an iOS Shortcut automation:

1. Trigger: Bluetooth connects to your Tesla.
2. Action: Open URL.
3. URL: `https://your-domain.example/?drive=1`

The `drive=1` query starts the app in Drive Mode.

## Feature Overview

- GPS speed in MPH or KM/H
- Max speed, average speed, trip duration, and trip distance
- Live G-force vector meter
- Acceleration, braking, cornering, and combined G calculations
- Safety Score starting at 100 with configurable threshold logic in `src/services/safety.ts`
- Hard braking, aggressive acceleration, hard cornering, sudden swerving, shock spike, and instability counters
- Pitch, roll, yaw, compass-style orientation visualization
- Mount-angle calibration persisted locally
- Day, night, and auto theme modes
- Start, pause, resume, and end trip controls
- IndexedDB-backed trip history via localforage
- Animated Recharts telemetry graphs
- Offline app shell with `vite-plugin-pwa`

## Calibration

Mount the iPhone horizontally in the car, open the app, arm sensors, then tap Calibrate. The current pitch, roll, and yaw become the neutral baseline and are persisted in local storage.

## Safety

This app is informational only. Do not interact with the dashboard while driving. Use a mounted phone, configure permissions before motion, and rely on the vehicle’s native instrumentation for critical driving decisions.
