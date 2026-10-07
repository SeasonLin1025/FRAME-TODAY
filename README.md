# FRAME TODAY

FRAME TODAY is a static, weather-led photography inspiration journal. It presents a small collection of themed editorial issues, including shot ideas, composition notes, colour palettes and downloadable visual cards.

## Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS
- Framer Motion and html2canvas

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

The production files are written to `dist/`.

## Assets

All editorial images and bundled font files are preserved under `public/assets/`. Vite copies this directory to the build output, so the issue image paths remain self-contained when this repository is cloned and built on its own.

## Boundaries

This repository contains the frontend source and static interaction only. It has no confirmed backend, database, authentication, external API, or production deployment configuration. The included content can reproduce the supplied client-side experience, but is not a verified full-site backup.
