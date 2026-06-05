# AGENTS.md

## Cursor Cloud specific instructions

### Product overview

**Receipt → Story** is a single Next.js 15 (App Router) app. There is no separate backend, database, or Docker stack. All UI and API routes live in this repo.

### Services

| Service | Command | URL |
|---------|---------|-----|
| Next.js dev server | `npm run dev` | http://localhost:3000 |

Start the dev server in a tmux session if you need it to persist across commands.

### Standard commands

See `package.json` and `README.md` for the canonical commands:

- **Install deps:** `npm install`
- **Dev server:** `npm run dev`
- **Production build:** `npm run build` then `npm run start`
- **Lint:** `npm run lint` — may prompt interactively on first run if ESLint is not configured; `npm run build` already runs type-checking and lint during build.

### Environment variables

Optional. Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY` for real receipt uploads. Without it, use **Try demo story** on the home page or `POST /api/story` with `demo=true`.

### Hello-world verification

1. `npm run dev` → open http://localhost:3000
2. Click **Try demo story** — expect a "Midnight Ramen Co." memory card
3. Or: `curl -X POST http://localhost:3000/api/story -F "demo=true"` — expect JSON with `"demo":true`

### Gotchas

- No automated test suite in this repo; verify via build + manual/API demo flow above.
- Demo mode works without any API keys or external services.
