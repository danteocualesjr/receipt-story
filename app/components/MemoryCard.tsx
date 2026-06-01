"use client";

import type { MemoryStory } from "@/lib/types";

type Props = {
  story: MemoryStory;
  previewUrl?: string | null;
};

export function MemoryCard({ story, previewUrl }: Props) {
  return (
    <article id="memory-card" className="memory-card">
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="Receipt"
          className="memory-card__image"
        />
      ) : (
        <div className="memory-card__placeholder" aria-hidden>
          <span>{story.emoji}</span>
          <small>Demo receipt</small>
        </div>
      )}
      <div className="memory-card__body">
        <div className="memory-card__meta">
          <span className="memory-card__emoji" aria-hidden>
            {story.emoji}
          </span>
          <div>
            <p className="memory-card__category">{story.category}</p>
            <p className="memory-card__merchant">{story.merchant}</p>
          </div>
        </div>
        <p className="memory-card__story">{story.storyLine}</p>
        <footer className="memory-card__footer">
          <span>{story.date}</span>
          <span className="memory-card__amount">{story.amount}</span>
        </footer>
        {story.demo ? (
          <p className="memory-card__demo">
            Demo memory — add OPENAI_API_KEY for real receipts
          </p>
        ) : null}
      </div>
    </article>
  );
}
