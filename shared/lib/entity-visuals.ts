const ENTITY_COLOR_PALETTE = [
  {
    bubble: "bg-rose-500 text-white",
    hero: "from-rose-500 to-rose-700 text-white",
  },
  {
    bubble: "bg-orange-500 text-white",
    hero: "from-orange-500 to-orange-700 text-white",
  },
  {
    bubble: "bg-amber-500 text-white",
    hero: "from-amber-500 to-amber-700 text-white",
  },
  {
    bubble: "bg-emerald-500 text-white",
    hero: "from-emerald-500 to-emerald-700 text-white",
  },
  {
    bubble: "bg-teal-500 text-white",
    hero: "from-teal-500 to-teal-700 text-white",
  },
  {
    bubble: "bg-sky-500 text-white",
    hero: "from-sky-500 to-sky-700 text-white",
  },
  {
    bubble: "bg-blue-500 text-white",
    hero: "from-blue-500 to-blue-700 text-white",
  },
  {
    bubble: "bg-indigo-500 text-white",
    hero: "from-indigo-500 to-indigo-700 text-white",
  },
  {
    bubble: "bg-violet-500 text-white",
    hero: "from-violet-500 to-violet-700 text-white",
  },
  {
    bubble: "bg-pink-500 text-white",
    hero: "from-pink-500 to-pink-700 text-white",
  },
] as const;

export type EntityColor = (typeof ENTITY_COLOR_PALETTE)[number];

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

export function pickEntityColor(seed: string, fallback: string): EntityColor {
  const key = `${seed}|${fallback}`;
  return ENTITY_COLOR_PALETTE[hashString(key) % ENTITY_COLOR_PALETTE.length];
}

export function buildEntityInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return "?";
  }
  const tokens = trimmed.split(/\s+/).slice(0, 2);
  if (tokens.length === 1) {
    return tokens[0].slice(0, 2).toUpperCase();
  }
  return tokens.map((token) => token[0] ?? "").join("").toUpperCase();
}
