"use client";

import type { MemoryStory } from "@/lib/types";

type Props = {
  story: MemoryStory;
  previewUrl?: string | null;
};

export function MemoryCard({ story, previewUrl }: Props) {
  return (
    <article
      id="memory-card"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        boxShadow: "var(--shadow)",
        overflow: "hidden",
        maxWidth: 420,
        width: "100%",
      }}
    >
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="Receipt"
          style={{
            width: "100%",
            height: 140,
            objectFit: "cover",
            filter: "saturate(0.92)",
          }}
        />
      ) : null}
      <div style={{ padding: "1.5rem 1.5rem 1.25rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "0.75rem",
          }}
        >
          <span style={{ fontSize: "2rem", lineHeight: 1 }} aria-hidden>
            {story.emoji}
          </span>
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--muted)",
              }}
            >
              {story.category}
            </p>
            <p style={{ margin: "0.15rem 0 0", fontWeight: 600 }}>
              {story.merchant}
            </p>
          </div>
        </div>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-serif)",
            fontSize: "1.35rem",
            lineHeight: 1.45,
            color: "var(--ink)",
          }}
        >
          {story.storyLine}
        </p>
        <footer
          style={{
            marginTop: "1.25rem",
            paddingTop: "1rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.875rem",
            color: "var(--muted)",
          }}
        >
          <span>{story.date}</span>
          <span style={{ fontWeight: 600, color: "var(--ink)" }}>
            {story.amount}
          </span>
        </footer>
        {story.demo ? (
          <p
            style={{
              margin: "0.75rem 0 0",
              fontSize: "0.7rem",
              color: "var(--accent)",
            }}
          >
            Demo memory — add OPENAI_API_KEY for real receipts
          </p>
        ) : null}
      </div>
    </article>
  );
}
