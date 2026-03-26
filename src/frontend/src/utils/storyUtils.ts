import { Mood } from "../backend";

export interface ParsedScene {
  id: string;
  title: string;
  text: string;
  mood: Mood;
  sceneNumber: number;
}

const MOOD_KEYWORDS: Record<Mood, string[]> = {
  [Mood.dramatic]: [
    "death",
    "dark",
    "tragedy",
    "fell",
    "destroy",
    "ruin",
    "doom",
    "lost",
    "broken",
    "shattered",
  ],
  [Mood.romantic]: [
    "love",
    "heart",
    "kiss",
    "embrace",
    "tender",
    "beautiful",
    "adore",
    "together",
    "forever",
    "cherish",
  ],
  [Mood.action]: [
    "fight",
    "battle",
    "war",
    "attack",
    "explode",
    "rush",
    "chase",
    "speed",
    "danger",
    "weapon",
    "strike",
  ],
  [Mood.mystery]: [
    "mystery",
    "secret",
    "hidden",
    "clue",
    "shadow",
    "unknown",
    "strange",
    "whisper",
    "vanish",
    "puzzle",
  ],
  [Mood.sad]: [
    "cry",
    "sad",
    "tears",
    "sorrow",
    "grief",
    "mourn",
    "pain",
    "hurt",
    "alone",
    "despair",
    "weep",
  ],
  [Mood.happy]: [
    "laugh",
    "joy",
    "happy",
    "smile",
    "celebrate",
    "cheer",
    "delight",
    "wonderful",
    "bright",
    "hope",
  ],
  [Mood.suspense]: [
    "suddenly",
    "silent",
    "waited",
    "crept",
    "watched",
    "heard",
    "tension",
    "froze",
    "trembling",
    "slowly",
  ],
  [Mood.neutral]: [],
};

export function detectMood(text: string): Mood {
  const lower = text.toLowerCase();
  const scores: Record<Mood, number> = {
    [Mood.dramatic]: 0,
    [Mood.romantic]: 0,
    [Mood.action]: 0,
    [Mood.mystery]: 0,
    [Mood.sad]: 0,
    [Mood.happy]: 0,
    [Mood.suspense]: 0,
    [Mood.neutral]: 0,
  };
  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) scores[mood as Mood]++;
    }
  }
  let best: Mood = Mood.suspense;
  let bestScore = -1;
  for (const [mood, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      best = mood as Mood;
    }
  }
  return bestScore === 0 ? Mood.suspense : best;
}

export function splitIntoScenes(storyText: string): ParsedScene[] {
  const raw = storyText.trim();
  if (!raw) return [];
  // Split by double newlines first
  let paragraphs = raw
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  // If no double newlines, split by single newlines
  if (paragraphs.length <= 1) {
    paragraphs = raw
      .split(/\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }
  // Merge short paragraphs together (~150-200 words per scene)
  const scenes: string[] = [];
  let current = "";
  for (const para of paragraphs) {
    const combined = current ? `${current} ${para}` : para;
    const wordCount = combined.split(/\s+/).length;
    if (wordCount > 180 && current) {
      scenes.push(current.trim());
      current = para;
    } else {
      current = combined;
    }
  }
  if (current.trim()) scenes.push(current.trim());
  return scenes.map((text, i) => ({
    id: `scene-${i}`,
    sceneNumber: i + 1,
    title: `Scene ${i + 1}`,
    text,
    mood: detectMood(text),
  }));
}

export const MOOD_CONFIG: Record<
  Mood,
  { label: string; gradient: string; color: string; particleColor: string }
> = {
  [Mood.happy]: {
    label: "Happy",
    gradient: "linear-gradient(135deg, #1a1200 0%, #2d2000 40%, #1a1500 100%)",
    color: "#F5C542",
    particleColor: "rgba(245,197,66,0.4)",
  },
  [Mood.sad]: {
    label: "Sad",
    gradient: "linear-gradient(135deg, #050d1a 0%, #0a1628 40%, #060e1c 100%)",
    color: "#6AAEDC",
    particleColor: "rgba(106,174,220,0.4)",
  },
  [Mood.suspense]: {
    label: "Suspense",
    gradient: "linear-gradient(135deg, #0d0618 0%, #160928 40%, #0a0514 100%)",
    color: "#9B7FFF",
    particleColor: "rgba(155,127,255,0.4)",
  },
  [Mood.romantic]: {
    label: "Romantic",
    gradient: "linear-gradient(135deg, #1a0510 0%, #2a0a18 40%, #1a0610 100%)",
    color: "#FF7BAC",
    particleColor: "rgba(255,123,172,0.4)",
  },
  [Mood.action]: {
    label: "Action",
    gradient: "linear-gradient(135deg, #1a0800 0%, #2d1200 40%, #1a0a00 100%)",
    color: "#FF7A30",
    particleColor: "rgba(255,122,48,0.4)",
  },
  [Mood.mystery]: {
    label: "Mystery",
    gradient: "linear-gradient(135deg, #001510 0%, #002018 40%, #001510 100%)",
    color: "#3DCCAA",
    particleColor: "rgba(61,204,170,0.4)",
  },
  [Mood.dramatic]: {
    label: "Dramatic",
    gradient: "linear-gradient(135deg, #130006 0%, #200008 40%, #130006 100%)",
    color: "#DC3A5C",
    particleColor: "rgba(220,58,92,0.4)",
  },
  [Mood.neutral]: {
    label: "Neutral",
    gradient: "linear-gradient(135deg, #0d0d12 0%, #141420 40%, #0d0d12 100%)",
    color: "#A8B0C0",
    particleColor: "rgba(168,176,192,0.4)",
  },
};

export const STYLE_PRESETS = [
  { id: "cinematic-noir", label: "Cinematic Noir", palette: "noir" },
  { id: "sci-fi", label: "Sci-Fi", palette: "scifi" },
  { id: "anime-drama", label: "Anime Drama", palette: "anime" },
  { id: "romantic", label: "Romantic", palette: "romantic" },
  { id: "mystery", label: "Mystery", palette: "mystery" },
  { id: "action-thriller", label: "Action Thriller", palette: "action" },
];

export function generateStoryTitle(text: string): string {
  const words = text.trim().split(/\s+/).slice(0, 5);
  return words.join(" ") + (text.trim().split(/\s+/).length > 5 ? "..." : "");
}
