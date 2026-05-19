# Receipt → Story

Turn a receipt photo into a one-line memory — hackathon MVP.

Dark journal UI · drag-and-drop upload · demo mode without an API key.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Real receipts (optional)

1. Copy `.env.example` to `.env.local`
2. Add your `OPENAI_API_KEY`
3. Upload a receipt photo

Without an API key, use **Try demo story** on the home page.

## Demo script

1. Click **Try demo story** — instant ramen memory card
2. Or upload any receipt image (with API key) — AI reads it and writes the story

## Stack

- Next.js 15 (App Router)
- OpenAI vision (`gpt-4o-mini` by default)
