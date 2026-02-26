# HeroQuest Map Generator (Next.js)

A Next.js web app starter for generating HeroQuest quest maps on the canonical 26x19 board.

## What this now includes

- Next.js App Router UI with:
  - seed input
  - edition dropdown
  - free-text prompt
  - sliders (monster/trap/furniture)
  - checkboxes for trap and rule toggles
  - `Generate` and `Export JSON`
- `/api/generate` route:
  - strict Zod request validation
  - deterministic rule-based generation
  - semantic map validation before returning success
- Validation layer:
  - board size guard (26x19)
  - bounds checks
  - tile overlap detection
  - start/stairs tile safety check
- Explicit project detection metadata:
  - `next` pinned in dependencies
  - `vercel.json` with `framework: nextjs` and `rootDirectory: .`

## Local run

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Note on environments with restricted registries

If your environment blocks npm registry access, dependency installation and runtime checks will fail. In that case, run the same commands in a network-enabled environment.
