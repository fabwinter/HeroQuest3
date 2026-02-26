# HeroQuest Map Generator (Next.js)

This repository now contains a starter Next.js web app that generates HeroQuest maps on the canonical 26x19 board using a deterministic, rule-based generator.

## Implemented

- App Router UI with sliders, dropdown, checkboxes, free-text prompt, seed input, and JSON export.
- `/api/generate` route that validates input with Zod and generates a map document.
- Layered map JSON format with `meta`, `board`, `entities`, and `events`.
- Deterministic seeded placement for doors, monsters, traps, and furniture.
- Basic SVG board renderer (26x19) with visual markers for generated entities.

## Run

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.
