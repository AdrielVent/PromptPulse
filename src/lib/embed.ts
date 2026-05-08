import type { AnalyzeInput } from "../types";
import { analyzePost } from "./analyzer";

export const embedPrivacyBadge = "Embed demo mode. Manual input only.";

export function createEmbedDraft(body: string): AnalyzeInput {
  return {
    title: "Prompted draft",
    category: "manual paste",
    tools: "manual input",
    projectType: "Prompted post",
    body
  };
}

export function analyzeEmbedDraft(body: string) {
  return analyzePost(createEmbedDraft(body));
}

export function getImprovedEmbedHook(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) {
    return "I built this because I wanted to turn a rough project idea into something people can understand and reply to.";
  }

  const firstSentence = trimmed.split(/[.!?]/).find(Boolean)?.trim() ?? "this project";
  return `I built this because ${firstSentence.charAt(0).toLowerCase()}${firstSentence.slice(1)}.`;
}
