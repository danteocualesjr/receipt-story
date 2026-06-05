import type { MemoryStory } from "./types";

export const DEMO_STORIES: MemoryStory[] = [
  {
    merchant: "Midnight Ramen Co.",
    amount: "$24.50",
    date: "Tuesday, Mar 12",
    category: "Food & friends",
    emoji: "🍜",
    storyLine:
      "Tuesday night: ramen with Alex after the bad meeting — the kind of meal that fixes nothing official but everything else.",
    demo: true,
  },
  {
    merchant: "Maple Street Books",
    amount: "$18.99",
    date: "Saturday, Apr 6",
    category: "Quiet discoveries",
    emoji: "📚",
    storyLine:
      "Saturday afternoon: a book bought for the train ride home turned into the reason the trip felt like a tiny retreat.",
    demo: true,
  },
  {
    merchant: "Sunset Pier Parking",
    amount: "$7.00",
    date: "Friday, May 17",
    category: "Little escapes",
    emoji: "🌅",
    storyLine:
      "Friday evening: seven dollars bought just enough time by the water to remember the day was bigger than the inbox.",
    demo: true,
  },
];

export function getDemoStory(index?: number): MemoryStory {
  const fallbackIndex = Math.floor(Math.random() * DEMO_STORIES.length);
  const requestedIndex =
    typeof index === "number" && Number.isInteger(index) ? index : fallbackIndex;
  const safeIndex = requestedIndex % DEMO_STORIES.length;
  return DEMO_STORIES[safeIndex < 0 ? safeIndex + DEMO_STORIES.length : safeIndex];
}
