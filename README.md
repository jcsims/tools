# Tools Collection

A growing collection of useful web tools, hosted on GitHub Pages.

**Live Site:** https://jcsims.github.io/tools/

## Available Tools

### Drum Lesson Practice
A kid-friendly web app for learning drums featuring:
- Interactive drum notation with color-coded instruments
- Adjustable playback tempo (30-200 BPM)
- Tooltips showing instrument names on hover
- Song management with local storage
- OCR scanning of drum sheet images
- Camera capture support for mobile devices

**Link:** [/drum-lesson/](https://jcsims.github.io/tools/drum-lesson/)

## Project Structure

```
tools/
├── apps/                    # Individual tool applications
│   └── drum-lesson/         # Drum lesson practice app
│       ├── src/             # React source code
│       ├── package.json     # App dependencies
│       └── vite.config.ts   # Vite configuration
├── public/                  # Root static files
│   └── index.html           # Tools index page
├── scripts/                 # Build scripts
│   └── build-all.js         # Builds all apps
├── .github/workflows/       # GitHub Actions
│   └── deploy.yml           # Auto-deploy to Pages
└── package.json             # Root package scripts
```

## Development

### Running an app locally

```bash
cd apps/drum-lesson
npm install
npm run dev
```

### Building all apps

```bash
node scripts/build-all.js
```

This builds all apps and combines them with the index page into `dist/`.

## Adding a New Tool

1. Create a new directory under `apps/`:
   ```bash
   mkdir -p apps/my-new-tool
   cd apps/my-new-tool
   npm create vite@latest . -- --template react-ts
   ```

2. Update `vite.config.ts` with the correct base path:
   ```ts
   export default defineConfig({
     plugins: [react()],
     base: '/tools/my-new-tool/',
   })
   ```

3. Add a card for the new tool in `public/index.html`

4. Push to `main` to auto-deploy

## Deployment

The site automatically deploys to GitHub Pages when pushing to the `main` branch.

To enable GitHub Pages:
1. Go to repo Settings → Pages
2. Set Source to "GitHub Actions"
