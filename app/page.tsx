"use client";

import { MemoryCard } from "@/app/components/MemoryCard";
import type { MemoryStory } from "@/lib/types";
import { useCallback, useRef, useState } from "react";

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [story, setStory] = useState<MemoryStory | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setLoading(true);
    setStory(null);

    const url = URL.createObjectURL(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });

    try {
      const body = new FormData();
      body.append("receipt", file);

      const res = await fetch("/api/story", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setStory(data as MemoryStory);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  const onFile = (file: File | null) => {
    if (!file) return;
    void processFile(file);
  };

  const tryDemo = async () => {
    setError(null);
    setLoading(true);
    setStory(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    try {
      const body = new FormData();
      body.append("demo", "true");
      const res = await fetch("/api/story", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setStory(data as MemoryStory);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyStory = async () => {
    if (!story) return;
    const text = `${story.emoji} ${story.storyLine}\n— ${story.merchant}, ${story.amount} · ${story.date}`;
    await navigator.clipboard.writeText(text);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "2.5rem 1.25rem 4rem",
        maxWidth: 520,
        margin: "0 auto",
      }}
    >
      <header style={{ marginBottom: "2rem" }}>
        <p
          style={{
            margin: 0,
            fontSize: "0.8rem",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--muted)",
          }}
        >
          Hackathon MVP
        </p>
        <h1
          style={{
            margin: "0.35rem 0 0",
            fontFamily: "var(--font-serif)",
            fontSize: "2.25rem",
            fontWeight: 500,
            lineHeight: 1.15,
          }}
        >
          Receipt → Story
        </h1>
        <p style={{ margin: "0.75rem 0 0", color: "var(--muted)", lineHeight: 1.5 }}>
          Snap a receipt. Get a one-line memory worth keeping.
        </p>
      </header>

      <section
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          onFile(file ?? null);
        }}
        style={{
          border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border)"}`,
          borderRadius: 16,
          padding: "2rem 1.25rem",
          textAlign: "center",
          background: dragOver ? "var(--accent-soft)" : "rgba(255,253,248,0.6)",
          transition: "border-color 0.15s, background 0.15s",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
        <p style={{ margin: "0 0 1rem", fontSize: "2rem" }} aria-hidden>
          🧾
        </p>
        <p style={{ margin: "0 0 1rem", color: "var(--muted)" }}>
          Drop a receipt photo, or
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          style={{
            background: "var(--ink)",
            color: "#fff",
            border: "none",
            borderRadius: 999,
            padding: "0.65rem 1.35rem",
            fontWeight: 600,
          }}
        >
          {loading ? "Reading receipt…" : "Choose photo"}
        </button>
        <p style={{ margin: "1rem 0 0", fontSize: "0.85rem" }}>
          <button
            type="button"
            onClick={tryDemo}
            disabled={loading}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent)",
              textDecoration: "underline",
              padding: 0,
            }}
          >
            Try demo story
          </button>
          {" "}
          (no API key needed)
        </p>
      </section>

      {error ? (
        <p
          role="alert"
          style={{
            marginTop: "1rem",
            padding: "0.75rem 1rem",
            background: "#fef2f2",
            color: "#b91c1c",
            borderRadius: 8,
            fontSize: "0.9rem",
          }}
        >
          {error}
        </p>
      ) : null}

      {story ? (
        <section style={{ marginTop: "2rem" }}>
          <MemoryCard story={story} previewUrl={previewUrl} />
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              marginTop: "1rem",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => void copyStory()}
              style={{
                flex: 1,
                minWidth: 140,
                padding: "0.6rem 1rem",
                borderRadius: 999,
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
              }}
            >
              Copy story
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              style={{
                flex: 1,
                minWidth: 140,
                padding: "0.6rem 1rem",
                borderRadius: 999,
                border: "none",
                background: "var(--accent-soft)",
                color: "var(--accent)",
                fontWeight: 600,
              }}
            >
              Another receipt
            </button>
          </div>
        </section>
      ) : null}
    </main>
  );
}
