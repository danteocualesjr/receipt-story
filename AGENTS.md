# AGENTS.md

## Cursor Cloud specific instructions

### Product

**Receipt → Story** — a Next.js 15 hackathon MVP. Users upload a receipt photo (or use demo mode) and get a one-line memory card. Demo mode works without any API key.

### Services

| Service | Port | Notes |
|---------|------|-------|
| Next.js dev server | 3000 | Single service; frontend + `/api/story` API route |

No Docker, database, or separate backend is required.

### Common commands

See `package.json` scripts and `README.md` for standard commands:

- **Install:** `npm install`
- **Dev:** `npm run dev` → http://localhost:3000
- **Build:** `npm run build`
- **Production:** `npm run start` (after build)

### Lint

`npm run lint` opens an interactive ESLint setup wizard because the repo has no `.eslintrc` yet. Type-checking and lint run successfully as part of `npm run build`. Use `npm run build` to verify lint/types until ESLint is configured.

### Tests

No automated test suite is configured (`package.json` has no `test` script).

### Optional: real receipt processing

Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY` for live vision AI. Without it, **Try demo story** and upload fallback still work.

### Hello-world verification

1. Start `npm run dev`
2. Open http://localhost:3000
3. Click **Try demo story** — expect a memory card for "Midnight Ramen Co."

Or via API: `curl -s -X POST -F "demo=true" http://localhost:3000/api/story`
