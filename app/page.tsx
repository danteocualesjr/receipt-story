"use client";

import { MemoryCard } from "@/app/components/MemoryCard";
import { DEMO_STORIES } from "@/lib/demo";
import type { MemoryStory } from "@/lib/types";
import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const THEME_STORAGE_KEY = "receipt-story-theme";
const HISTORY_STORAGE_KEY = "receipt-story-history";
const DEFAULT_THEME = "dark";
const HISTORY_LIMIT = 5;
const DEMO_OPTIONS = DEMO_STORIES.map((story, index) => ({
  index,
  label: `${story.emoji} ${story.merchant}`,
}));
const LOADING_STEPS = ["Reading merchant", "Finding the moment", "Writing keepsake"];

type Theme = "light" | "dark";

type SavedMemory = {
  id: string;
  story: MemoryStory;
  savedAt: string;
};

function formatStoryText(story: MemoryStory) {
  return `${story.emoji} ${story.storyLine}\n— ${story.merchant}, ${story.amount} · ${story.date}`;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatSavedAt(savedAt: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(savedAt));
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#0f0e0c" : "#fbf7ef");
}

function getStoredTheme(): Theme {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === "light" || storedTheme === "dark" ? storedTheme : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function storeTheme(theme: Theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Theme switching should still work for the current session if storage is unavailable.
  }
}

function createStoryId(story: MemoryStory) {
  return `${story.merchant}-${story.date}-${story.amount}-${story.storyLine}`;
}

function loadHistory(): SavedMemory[] {
  try {
    const stored = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as SavedMemory[];
    return Array.isArray(parsed) ? parsed.slice(0, HISTORY_LIMIT) : [];
  } catch {
    return [];
  }
}

function storeHistory(history: SavedMemory[]) {
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Local history is an enhancement; generation still works if storage is unavailable.
  }
}

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const lastFileRef = useRef<File | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [story, setStory] = useState<MemoryStory | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [loadingStep, setLoadingStep] = useState(0);
  const [fileDetails, setFileDetails] = useState<string | null>(null);
  const [history, setHistory] = useState<SavedMemory[]>([]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const nextTheme = getStoredTheme();
    setTheme(nextTheme);
    applyTheme(nextTheme);
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }

    const interval = window.setInterval(() => {
      setLoadingStep((current) => (current + 1) % LOADING_STEPS.length);
    }, 1200);
    return () => window.clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!story) return;

    setHistory((current) => {
      const savedMemory = {
        id: createStoryId(story),
        story,
        savedAt: new Date().toISOString(),
      };
      const next = [savedMemory, ...current.filter((item) => item.id !== savedMemory.id)].slice(
        0,
        HISTORY_LIMIT,
      );
      storeHistory(next);
      return next;
    });
  }, [story]);

  const toggleTheme = () => {
    setTheme((current) => {
      const nextTheme = current === "dark" ? "light" : "dark";
      storeTheme(nextTheme);
      applyTheme(nextTheme);
      return nextTheme;
    });
  };

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setCopied(false);
    setLoading(true);
    setLoadingStep(0);
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
    lastFileRef.current = file;
    setFileDetails(`${file.name || "Receipt image"} · ${formatFileSize(file.size)}`);
    void processFile(file);
  };

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (loading) return;
      const image = Array.from(event.clipboardData?.files ?? []).find((file) =>
        file.type.startsWith("image/"),
      );
      if (!image) return;

      event.preventDefault();
      setToast("Pasted receipt image");
      onFile(image);
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [loading]);

  const retryLastUpload = () => {
    if (!lastFileRef.current || loading) return;
    void processFile(lastFileRef.current);
  };

  const resetFileInput = () => {
    if (inputRef.current) inputRef.current.value = "";
  };

  const openFilePicker = () => {
    resetFileInput();
    inputRef.current?.click();
  };

  const chooseAnotherReceipt = () => {
    setError(null);
    setCopied(false);
    setStory(null);
    setFileDetails(null);
    resetFileInput();
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    openFilePicker();
  };

  const onDropzoneKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget || loading) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openFilePicker();
    }
  };

  const tryDemo = async (demoIndex?: number) => {
    setError(null);
    setCopied(false);
    setLoading(true);
    setLoadingStep(0);
    setStory(null);
    setFileDetails(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    try {
      const body = new FormData();
      body.append("demo", "true");
      if (typeof demoIndex === "number") body.append("demoIndex", String(demoIndex));
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
    await navigator.clipboard.writeText(formatStoryText(story));
    setCopied(true);
    setToast("Story copied");
    window.setTimeout(() => setCopied(false), 2000);
  };

  const shareStory = async () => {
    if (!story) return;
    const text = formatStoryText(story);
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Receipt Story",
          text,
        });
        setToast("Share sheet opened");
        return;
      }

      await navigator.clipboard.writeText(text);
      setToast("Story copied for sharing");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Unable to share this story.");
    }
  };

  const downloadStory = () => {
    if (!story) return;
    const safeMerchant = story.merchant.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const fileName = `receipt-story-${safeMerchant || "memory"}.txt`;
    const url = URL.createObjectURL(
      new Blob([formatStoryText(story)], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    setToast("Story downloaded");
  };

  const restoreMemory = (memory: SavedMemory) => {
    setError(null);
    setCopied(false);
    setFileDetails(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setStory(memory.story);
    setToast("Memory restored");
  };

  const clearHistory = () => {
    setHistory([]);
    storeHistory([]);
    setToast("Journal cleared");
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
        <div className="header__top">
          <span className="badge">✦ Receipt → Story</span>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-pressed={theme === "dark"}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            <span aria-hidden>{theme === "dark" ? "☀️" : "🌙"}</span>
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </div>
        <h1 className="title">Every receipt has a story.</h1>
        <p className="subtitle">
          Upload a photo. Get a one-line memory you&apos;ll actually want to keep.
        </p>
        <div className="hero-stats" aria-label="Product highlights">
          <span>
            <strong>Instant</strong>
            Story draft
          </span>
          <span>
            <strong>Camera-ready</strong>
            Mobile upload
          </span>
          <span>
            <strong>Demo-safe</strong>
            Works offline
          </span>
        </div>
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
        role="group"
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
        <p className="dropzone__support">
          JPEG, PNG, or WebP under 8 MB · paste from clipboard supported
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
            <>
              <span className="btn__icon" aria-hidden>
                📷
              </span>
              Choose photo
            </>
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
        <div className="demo-options" aria-label="Demo story choices">
          {DEMO_OPTIONS.map((option) => (
            <button
              type="button"
              key={option.index}
              className="demo-chip"
              onClick={() => void tryDemo(option.index)}
              disabled={loading}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="dropzone__pills" aria-label="Upload notes">
          <span>No signup</span>
          <span>Camera upload</span>
          <span>Paste image</span>
          <span>Demo fallback</span>
        </div>
        {fileDetails ? (
          <p className="file-details" aria-live="polite">
            Selected: {fileDetails}
          </p>
        ) : null}
      </section>

      {error ? (
        <div className="alert" role="alert">
          <span>{error}</span>
          {lastFileRef.current ? (
            <button
              type="button"
              className="link-btn"
              onClick={retryLastUpload}
              disabled={loading}
            >
              Try again
            </button>
          ) : null}
        </div>
      ) : null}

      {loading && !story ? (
        <div className="skeleton-wrap" aria-busy="true" aria-label="Creating your memory">
          <div className="skeleton-card">
            <div className="skeleton-line skeleton-line--short" />
            <div className="skeleton-line" />
            <div className="skeleton-line skeleton-line--story" />
            <div className="skeleton-line skeleton-line--short" />
          </div>
          <ol className="loading-steps" aria-label="Story creation progress">
            {LOADING_STEPS.map((step, index) => (
              <li
                key={step}
                className={index === loadingStep ? "loading-steps__item--active" : undefined}
                aria-current={index === loadingStep ? "step" : undefined}
              >
                {step}
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {story ? (
        <section
          className="card-wrap"
          key={story.storyLine}
          aria-live="polite"
          aria-label="Generated memory story"
        >
          <MemoryCard story={story} previewUrl={previewUrl} />
          <div className="actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => void copyStory()}
            >
              <span className="btn__icon" aria-hidden>
                {copied ? "✓" : "⧉"}
              </span>
              {copied ? "Copied!" : "Copy story"}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => void shareStory()}
            >
              <span className="btn__icon" aria-hidden>
                ⇪
              </span>
              Share
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={downloadStory}
            >
              <span className="btn__icon" aria-hidden>
                ↓
              </span>
              Save text
            </button>
            <button
              type="button"
              className="btn btn--soft"
              onClick={chooseAnotherReceipt}
            >
              <span className="btn__icon" aria-hidden>
                ↻
              </span>
              Another receipt
            </button>
          </div>
        </section>
      ) : null}

      {history.length > 0 ? (
        <section className="memory-journal" aria-label="Recent memory journal">
          <div className="memory-journal__header">
            <div>
              <p className="eyebrow">Recent journal</p>
              <h2>Saved in this browser</h2>
            </div>
            <div className="memory-journal__tools">
              <span>{history.length}/{HISTORY_LIMIT}</span>
              <button type="button" className="link-btn" onClick={clearHistory}>
                Clear
              </button>
            </div>
          </div>
          <div className="memory-journal__list">
            {history.map((memory) => (
              <button
                type="button"
                className="memory-journal__item"
                key={memory.id}
                onClick={() => restoreMemory(memory)}
              >
                <span aria-hidden>{memory.story.emoji}</span>
                <strong>{memory.story.merchant}</strong>
                <small>{formatSavedAt(memory.savedAt)}</small>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <footer className="footer-note">
        <span>Built for hackathon demos</span>
        <span>Powered by vision AI</span>
      </footer>

      {toast ? <div className="toast" role="status">{toast}</div> : null}
    </main>
  );
}
