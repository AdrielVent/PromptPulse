import type { AnalyzeInput, ScoreBreakdown } from "../types";

const scoreCap = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const containsAny = (source: string, words: string[]) => words.some((word) => source.includes(word));

const countMatches = (source: string, words: string[]) =>
  words.reduce((count, word) => count + (source.includes(word) ? 1 : 0), 0);

const splitTools = (tools: string) =>
  tools
    .split(/[,|/]/)
    .map((tool) => tool.trim())
    .filter(Boolean);

export function analyzePost(input: AnalyzeInput): ScoreBreakdown {
  const title = input.title.trim();
  const body = input.body.trim();
  const tools = splitTools(input.tools);
  const combined = `${title} ${input.category} ${input.projectType} ${input.tools} ${body}`.toLowerCase();
  const wordCount = body.split(/\s+/).filter(Boolean).length;
  const sentenceCount = body.split(/[.!?]/).filter((sentence) => sentence.trim().length > 0).length;

  const clarity = scoreCap(
    34 +
      Math.min(24, title.length * 0.7) +
      Math.min(18, wordCount * 0.35) +
      (sentenceCount >= 2 ? 8 : 0) +
      (containsAny(combined, ["built", "made", "created", "launched"]) ? 8 : 0) +
      (containsAny(combined, ["helps", "for", "so they", "problem", "goal"]) ? 8 : 0)
  );

  const usefulness = scoreCap(
    30 +
      countMatches(combined, ["student", "builder", "developer", "founder", "team", "users"]) * 8 +
      countMatches(combined, ["helps", "rank", "track", "analyze", "deploy", "auth", "dashboard", "resource"]) * 7 +
      (body.length > 140 ? 10 : 0) +
      (tools.length > 1 ? 6 : 0)
  );

  const wowFactor = scoreCap(
    26 +
      countMatches(combined, ["interactive", "cinematic", "real-time", "ai", "robot", "digital twin", "telemetry", "vision"]) * 9 +
      Math.min(18, tools.length * 5) +
      (containsAny(combined, ["demo", "terminal", "solver", "command center"]) ? 10 : 0)
  );

  const commentPotential = scoreCap(
    28 +
      (body.includes("?") ? 18 : 0) +
      countMatches(combined, ["what would", "feedback", "thoughts", "compare", "would you", "should i"]) * 10 +
      countMatches(combined, ["demo", "interactive", "technical", "real", "built"]) * 5 +
      (title.length > 18 ? 7 : 0)
  );

  const founderAppeal = scoreCap(
    30 +
      countMatches(combined, ["founder", "builder", "launch", "marketplace", "backend", "auth", "deployment", "analytics", "saas"]) * 8 +
      (containsAny(combined, ["resource", "workflow", "platform", "dashboard"]) ? 9 : 0) +
      (input.timeSpent ? 4 : 0) +
      (tools.length >= 3 ? 7 : 0)
  );

  const overall = scoreCap(
    clarity * 0.24 +
      usefulness * 0.22 +
      wowFactor * 0.18 +
      commentPotential * 0.18 +
      founderAppeal * 0.18
  );

  const suggestions: string[] = [];
  const strengths: string[] = [];
  const helped: string[] = [];
  const hurt: string[] = [];
  const fixes: string[] = [];

  if (!containsAny(combined, ["helps", "student", "builder", "founder", "developer", "users", "problem"])) {
    const fix = "Explain who the project helps and what problem it solves.";
    suggestions.push(fix);
    fixes.push(fix);
  }

  if (!body.includes("?")) {
    const fix = "End with a sharper question that invites specific feedback or replies.";
    suggestions.push("End with a sharper question that invites specific feedback.");
    fixes.push(fix);
    hurt.push("No direct ending question yet, so comment momentum depends on readers inventing their own reply angle.");
  }

  if (tools.length < 2) {
    const fix = "List the tools or stack so technical builders can anchor their comments.";
    suggestions.push(fix);
    fixes.push(fix);
    hurt.push("The stack is too light to pull in technical builders who like implementation detail.");
  }

  if (wordCount < 35) {
    const fix = "Add a short build story: the problem, the key feature, and the result.";
    suggestions.push(fix);
    fixes.push(fix);
    hurt.push("The draft is short, so the build story may not feel earned yet.");
  }

  if (!containsAny(combined, ["demo", "screenshot", "video", "interactive", "real-time"])) {
    const fix = "Mention the visible demo moment so the post feels concrete.";
    suggestions.push(fix);
    fixes.push(fix);
    hurt.push("The post does not point to a visible demo moment, which can make the build feel less screenshot-worthy.");
  }

  if (clarity >= 78) {
    const strength = "The post has a clear project frame and enough context to understand quickly.";
    strengths.push(strength);
    helped.push(strength);
  }

  if (usefulness >= 78) {
    const strength = "The value proposition is practical, which usually helps likes convert.";
    strengths.push(strength);
    helped.push(strength);
  }

  if (wowFactor >= 72) {
    const strength = "The concept has a visible demo angle that can earn curiosity comments.";
    strengths.push(strength);
    helped.push(strength);
  }

  if (founderAppeal >= 78) {
    const strength = "The framing connects to builder or founder pain, which gives it platform relevance.";
    strengths.push(strength);
    helped.push(strength);
  }

  if (commentPotential >= 72) {
    helped.push("The draft has enough Prompted-specific tension to invite feedback, comparisons, or feature requests.");
  } else if (!hurt.some((item) => item.includes("ending question"))) {
    hurt.push("The reply path could be clearer; readers need a specific question to answer.");
  }

  if (tools.length >= 3) {
    helped.push("The stack context is specific enough for builders to understand how the project was made.");
  }

  if (fixes.length === 0) {
    fixes.push("Add one concrete question at the end so replies cluster around a specific decision.");
    fixes.push("Call out the strongest demo moment in one sentence before the tags.");
  } else if (fixes.length === 1) {
    fixes.push("Call out the strongest demo moment in one sentence before the tags.");
  }

  if (hurt.length === 0) {
    hurt.push("The main risk is polish without a reply hook: it may get likes without starting a useful thread.");
  }

  return {
    clarity,
    usefulness,
    wowFactor,
    commentPotential,
    founderAppeal,
    overall,
    suggestions: suggestions.slice(0, 5),
    strengths: strengths.length ? strengths : ["The draft has a usable starting point for a clearer Prompted post."],
    helped: helped.length ? helped.slice(0, 4) : ["The draft has a usable starting point for a clearer Prompted post."],
    hurt: hurt.slice(0, 3),
    fixes: fixes.slice(0, 4)
  };
}

export const sampleDraft: AnalyzeInput = {
  title: "Built PromptPulse, an AI growth studio for Prompted builders",
  category: "builder tools",
  tools: "React, TypeScript, local scoring model, markdown export",
  projectType: "Analytics product",
  timeSpent: "1 week",
  body:
    "I built PromptPulse to help builders understand why some Prompted posts get more likes, comments, and useful feedback. You paste a draft, add the category and tools, then it scores clarity, usefulness, wow factor, comment potential, and founder appeal. It also rewrites the post into professional, community, and technical versions so the final share feels sharper without losing the builder's voice."
};
