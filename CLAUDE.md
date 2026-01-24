# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multi-tool web application repository hosted on GitHub Pages. Currently contains the **Drum Lesson Practice App** - an interactive React-based tool for learning drum patterns. New tools can be added to the `apps/` directory.

**Live site:** https://jcsims.github.io/tools/

## Build Commands

```bash
# Root level - builds all apps
npm run build              # Build all apps using scripts/build-all.js
npm run build:drum-lesson  # Build only drum-lesson app

# App level (from apps/drum-lesson/)
npm run dev       # Vite dev server at localhost:5173
npm run build     # TypeScript check + Vite build
npm run lint      # ESLint for TypeScript/React
npm run preview   # Preview built output
```

## Architecture

```
apps/
└── drum-lesson/
    ├── src/
    │   ├── App.tsx           # Main state management
    │   ├── audioEngine.ts    # Web Audio API synthesis
    │   ├── types.ts          # Types + INSTRUMENT_INFO + SAMPLE_SONGS
    │   └── components/       # UI components with co-located CSS
scripts/
└── build-all.js              # Build orchestration for all apps
public/
└── index.html                # Tools collection landing page
```

## Key Technical Details

**Stack:** React 19 + TypeScript + Vite

**Audio:** Web Audio API with synthesized drums (no audio files) - kick uses frequency sweep, snare uses noise+oscillator, hi-hat uses highpass-filtered noise.

**Notation:** Custom SVG renderer with beat-position coordinates. Beat values are fractional (0-3.5 for 8th notes in 4/4).

**Data:** Songs stored in browser localStorage. Structure: `Song { measures: Measure[] }` → `Measure { notes: DrumNote[] }` → `DrumNote { instrument, beat }`.

## Adding a New Tool

1. Create `apps/<tool-name>/` with its own `package.json`
2. Configure `vite.config.ts` with `base: './'` (relative paths for GitHub Pages and Netlify compatibility)
3. Add `npm run build:<tool-name>` script to root `package.json`
4. Update `scripts/build-all.js` to include the new app
5. Add link in `public/index.html`

## Deployment

- **Production:** Automatic via GitHub Actions on push to `main`. Deploys to GitHub Pages.
- **PR Previews:** Automatic via Netlify. Each PR gets a preview deployment.
