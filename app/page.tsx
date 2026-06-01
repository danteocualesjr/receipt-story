"use client";

import { MemoryCard } from "@/app/components/MemoryCard";
import type { MemoryStory } from "@/lib/types";
import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [story, setStory] = useState<MemoryStory | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

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
      const res = await fetch("/api/story", { method: "POST", body });
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
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file, like a JPEG, PNG, or WebP receipt.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Choose an image under 8 MB so it can be processed quickly.");
      return;
    }
    void processFile(file);
  };

  const openFilePicker = () => inputRef.current?.click();

  const onDropzoneKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget || loading) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openFilePicker();
    }
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
    setToast("Story copied");
  };

  const dropzoneClass = [
    "dropzone",
    dragOver ? "dropzone--active" : "",
    loading ? "dropzone--loading" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className="page">
      <header className="header">
        <span className="badge">✦ Receipt → Story</span>
        <h1 className="title">Every receipt has a story.</h1>
        <p className="subtitle">
          Upload a photo. Get a one-line memory you&apos;ll actually want to keep.
        </p>
        <div className="steps">
          <div className="step">
            <strong>1. Snap</strong>
            Photo of any receipt
          </div>
          <div className="step">
            <strong>2. Read</strong>
            AI finds the moment
          </div>
          <div className="step">
            <strong>3. Keep</strong>
            Copy & share the story
          </div>
        </div>
      </header>

      <section
        className={dropzoneClass}
        role="button"
        tabIndex={loading ? -1 : 0}
        aria-label="Upload a receipt photo"
        aria-disabled={loading}
        onKeyDown={onDropzoneKeyDown}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          onFile(e.dataTransfer.files[0] ?? null);
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
        <p className="dropzone__icon" aria-hidden>
          {loading ? "⏳" : "🧾"}
        </p>
        <p className="dropzone__label">
          {loading ? "Reading your receipt…" : "Drop a receipt here, or choose a photo"}
        </p>
        <button
          type="button"
          className="btn btn--primary"
          onClick={openFilePicker}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" aria-hidden />
              Processing
            </>
          ) : (
            "Choose photo"
          )}
        </button>
        <p className="demo-hint">
          <button
            type="button"
            className="link-btn"
            onClick={() => void tryDemo()}
            disabled={loading}
          >
            Try demo story
          </button>
          {" · no API key needed"}
        </p>
      </section>

      {error ? (
        <p className="alert" role="alert">
          {error}
        </p>
      ) : null}

      {loading && !story ? (
        <div className="skeleton-wrap" aria-busy="true" aria-label="Creating your memory">
          <div className="skeleton-card">
            <div className="skeleton-line skeleton-line--short" />
            <div className="skeleton-line" />
            <div className="skeleton-line skeleton-line--story" />
            <div className="skeleton-line skeleton-line--short" />
          </div>
        </div>
      ) : null}

      {story ? (
        <section className="card-wrap" key={story.storyLine}>
          <MemoryCard story={story} previewUrl={previewUrl} />
          <div className="actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => void copyStory()}
            >
              Copy story
            </button>
            <button
              type="button"
              className="btn btn--soft"
              onClick={openFilePicker}
            >
              Another receipt
            </button>
          </div>
        </section>
      ) : null}

      <p className="footer-note">
        Built for hackathon demos · Powered by vision AI
      </p>

      {toast ? <div className="toast" role="status">{toast}</div> : null}
    </main>
  );
}
