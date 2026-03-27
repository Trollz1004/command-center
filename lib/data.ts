// ── AI SOURCES (the only ones that create content) ────────────
export interface AiSource {
  id: string; label: string; icon: string; color: string; url: string;
}

export const AI_SOURCES: AiSource[] = [
  { id: "opus", label: "Claude (Opus)", icon: "\u26A1", color: "#a78bfa", url: "https://claude.ai" },
  { id: "gemini", label: "Gemini", icon: "\u2726", color: "#34d399", url: "https://aistudio.google.com" },
  { id: "perplexity", label: "Perplexity", icon: "\u25CE", color: "#f59e0b", url: "https://www.perplexity.ai" },
  { id: "grok", label: "Grok", icon: "\u2B21", color: "#00ccff", url: "https://x.com/i/grok" },
  { id: "manus", label: "Manus", icon: "\u2666", color: "#34d399", url: "https://manus.space" },
];

// ── TARGET PLATFORMS (where content gets posted TO) ───────────
export interface TargetPlatform {
  id: string; label: string; icon: string; color: string; url: string;
}

export const TARGET_PLATFORMS: TargetPlatform[] = [
  { id: "youtube", label: "YouTube", icon: "\u25B6", color: "#FF0000", url: "https://studio.youtube.com" },
  { id: "instagram", label: "Instagram", icon: "\u25C8", color: "#E1306C", url: "https://www.instagram.com" },
  { id: "tiktok", label: "TikTok", icon: "\u266A", color: "#69C9D0", url: "https://www.tiktok.com/creator-center" },
  { id: "twitter", label: "X / Twitter", icon: "\u2715", color: "#1DA1F2", url: "https://x.com/compose/post" },
  { id: "linkedin", label: "LinkedIn", icon: "in", color: "#0A66C2", url: "https://www.linkedin.com/feed/" },
  { id: "reddit", label: "Reddit", icon: "\u25CF", color: "#FF4500", url: "https://www.reddit.com/submit" },
  { id: "pinterest", label: "Pinterest", icon: "P", color: "#E60023", url: "https://www.pinterest.com/pin-creation-tool/" },
  { id: "facebook", label: "Facebook", icon: "f", color: "#1877F2", url: "https://business.facebook.com" },
  { id: "ebay", label: "eBay", icon: "e", color: "#e53238", url: "https://www.ebay.com/sh/overview" },
];

// ── CONTENT ITEM (what flows through the approval desk) ───────
export type ContentStatus = "inbox" | "approved" | "rejected" | "sent";

export interface ContentItem {
  id: string;
  title: string;
  body: string;
  imageUrl: string;        // URL or local path to generated image
  source: string;          // AI source id
  targets: string[];       // platform ids — default is ALL
  tags: string[];
  status: ContentStatus;
  created: string;         // ISO date
  approvedAt: string;      // ISO date or empty
  sentAt: string;          // ISO date or empty
  notes: string;           // Josh's notes/edits
}

export function createItem(partial: Partial<ContentItem>): ContentItem {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title: "",
    body: "",
    imageUrl: "",
    source: "",
    targets: TARGET_PLATFORMS.map(p => p.id), // all by default
    tags: [],
    status: "inbox",
    created: new Date().toISOString().split("T")[0],
    approvedAt: "",
    sentAt: "",
    notes: "",
    ...partial,
  };
}
