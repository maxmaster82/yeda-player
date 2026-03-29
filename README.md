# Yeda Labs – Video Player Assignment

A custom-built HLS video player with chapter support, timeline interaction, and quality switching.

## Demo

[YedaPlayer](https://staging.d2q8g6p4v03k54.amplifyapp.com/)

## Features

- HLS streaming via `hls.js` (no third-party player UI)
- Chapter markers on the timeline with visual dividers
- Timeline hover tooltip: current time + chapter name
- Click-to-seek on timeline
- Video quality selector (Auto / 720p / 1080p / etc.)
- Play / Pause / Skip ±10s controls
- Volume control with expandable slider + mute toggle
- Fullscreen support
- Buffered progress indicator
- Auto-hide controls (3s after last mouse movement)
- Loading spinner

## Tech Stack

- React 18 + Vite
- `hls.js` for HLS streaming
- Pure CSS — no UI framework

## Setup & Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

To build for production:
```bash
npm run build
```
