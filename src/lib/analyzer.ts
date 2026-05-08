import type { AnalyzeInput, ContaminationReport, ProjectDraftValidation, ScoreBreakdown } from "../types";

const scoreCap = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const containsAny = (source: string, words: string[]) => words.some((word) => source.includes(word));

const countMatches = (source: string, words: string[]) =>
  words.reduce((count, word) => count + (source.includes(word) ? 1 : 0), 0);

const uniqueMatches = (source: string, words: string[]) => words.filter((word) => source.includes(word));

const splitTools = (tools: string) =>
  tools
    .split(/[,|/]/)
    .map((tool) => tool.trim())
    .filter(Boolean);

const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "by",
  "for",
  "i",
  "in",
  "is",
  "it",
  "my",
  "of",
  "on",
  "or",
  "so",
  "that",
  "the",
  "this",
  "to",
  "was",
  "with"
]);

const projectSignals = [
  "built",
  "created",
  "made",
  "launched",
  "prototype",
  "app",
  "website",
  "tool",
  "dashboard",
  "system",
  "analyzer",
  "generator",
  "studio",
  "interface",
  "local",
  "export",
  "rewrite",
  "scores",
  "score",
  "analyzes",
  "analyze",
  "helps",
  "users",
  "demo",
  "react",
  "typescript",
  "api",
  "github",
  "prompted"
];

const projectNouns = [
  "app",
  "website",
  "tool",
  "dashboard",
  "system",
  "analyzer",
  "generator",
  "studio",
  "interface",
  "platform",
  "terminal",
  "planner",
  "solver",
  "kit",
  "board",
  "demo",
  "project"
];

const featureSignals = [
  "score",
  "scores",
  "scoring",
  "timer",
  "cards",
  "export",
  "exportable",
  "plan",
  "planner",
  "progress",
  "dashboard",
  "rewrite",
  "rewrites",
  "hooks",
  "tags",
  "copy",
  "markdown",
  "charts",
  "telemetry",
  "auth",
  "deployment",
  "priority",
  "deadline",
  "effort",
  "grade",
  "sample data",
  "local json",
  "versions",
  "paste"
];

const audienceSignals = [
  "students",
  "student",
  "builders",
  "builder",
  "developers",
  "developer",
  "founders",
  "founder",
  "users",
  "teams",
  "creators",
  "people",
  "prompted builders"
];

const problemSignals = [
  "because",
  "problem",
  "why",
  "wanted",
  "often",
  "pain",
  "struggle",
  "hard",
  "not what to do first",
  "goal",
  "so they",
  "useful feedback",
  "understand"
];

const demoSignals = [
  "demo",
  "screenshot",
  "video",
  "preview",
  "dashboard",
  "export",
  "exportable",
  "output",
  "cards",
  "terminal",
  "planner",
  "score",
  "scores",
  "markdown",
  "copy",
  "interactive",
  "real-time",
  "visible",
  "progress"
];

const feedbackSignals = ["?", "what would", "would you", "feedback", "thoughts", "should i", "feature would"];

const genericPhrases = [
  "hello",
  "my app is cool",
  "i built an app",
  "made a thing",
  "built a thing",
  "cool app"
];

const uiActionWords = [
  "analyze",
  "post",
  "sample",
  "copy",
  "markdown",
  "export",
  "hook",
  "final",
  "sort",
  "ideas",
  "toggle",
  "mode",
  "brief",
  "open",
  "integration",
  "page",
  "embed",
  "button",
  "click",
  "load"
];

const warning = {
  title: "Draft is too thin to score accurately",
  body:
    "PromptPulse needs a real project description to estimate clarity, usefulness, wow factor, comment potential, and founder appeal. Add what you built, who it helps, what it does, the visible demo moment, and what feedback you want."
};

const contaminationWarning = {
  title: "Draft contains off-topic or unprofessional text",
  body:
    "PromptPulse found language that does not belong in a public project post. Remove unrelated, offensive, or unprofessional phrases before scoring the draft as publish-ready."
};

const cleanContaminationReport: ContaminationReport = {
  hasContamination: false,
  contaminationTypes: [],
  contaminatedPhrases: [],
  severity: "none",
  explanation: "No off-topic or unprofessional text detected."
};

const inappropriateRegex = /\b(i love you|touch you|wanna touch|want to touch)\b/gi;
const allCapsSpamRegex = /\b(?:[A-Z]{3,}\s+){2,}[A-Z]{3,}\b/g;
const spamArtifactsRegex = /\b(click here|menu|nav|link)\s+\1\b/gi;
const unrelatedPersonalRegex = /\b(i like girls|i like boys|i hate everyone|nobody asked)\b/gi;
const offensiveLanguageTerms = [
  "dumbass",
  "idiot",
  "moron",
  "loser",
  "stupid",
  "trash",
  "garbage"
];

const cleanupHurt = [
  "The draft includes off-topic or unprofessional language.",
  "The inserted phrase distracts from the project explanation.",
  "This would make the post feel less credible to readers."
];

const cleanupFixes = [
  "Remove the unrelated or offensive phrase.",
  "Keep the opening focused on what you built and why.",
  "Re-run the analysis after cleanup."
];

function collectMatches(draft: string, regex: RegExp) {
  return Array.from(draft.matchAll(regex), (match) => match[0].trim()).filter(Boolean);
}

function collectTermMatches(draft: string, terms: string[]) {
  const source = draft.toLowerCase();
  return terms.filter((term) => new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(source));
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function highestSeverity(current: ContaminationReport["severity"], next: ContaminationReport["severity"]) {
  const rank = { none: 0, low: 1, medium: 2, high: 3 };
  return rank[next] > rank[current] ? next : current;
}

export function detectDraftContamination(draft: string): ContaminationReport {
  const contaminationTypes: string[] = [];
  const contaminatedPhrases: string[] = [];
  let severity: ContaminationReport["severity"] = "none";
  const words = tokenizeMeaningfulWords(draft);

  const inappropriateMatches = collectMatches(draft, inappropriateRegex);
  if (inappropriateMatches.length) {
    contaminationTypes.push("inappropriate/romantic");
    contaminatedPhrases.push(...inappropriateMatches);
    severity = highestSeverity(severity, "high");
  }

  const allCapsMatches = collectMatches(draft, allCapsSpamRegex);
  if (allCapsMatches.length) {
    contaminationTypes.push("all-caps interruption");
    contaminatedPhrases.push(...allCapsMatches);
    severity = highestSeverity(severity, "medium");
  }

  const spamArtifactMatches = collectMatches(draft, spamArtifactsRegex);
  if (spamArtifactMatches.length) {
    contaminationTypes.push("spam artifact");
    contaminatedPhrases.push(...spamArtifactMatches);
    severity = highestSeverity(severity, "low");
  }

  const offensiveMatches = collectTermMatches(draft, offensiveLanguageTerms);
  if (offensiveMatches.length) {
    contaminationTypes.push("offensive-language");
    contaminatedPhrases.push(...offensiveMatches);
    severity = highestSeverity(severity, "high");
  }

  const unrelatedPersonalMatches = collectMatches(draft, unrelatedPersonalRegex);
  if (unrelatedPersonalMatches.length) {
    contaminationTypes.push("unrelated personal statement");
    contaminatedPhrases.push(...unrelatedPersonalMatches);
    severity = highestSeverity(severity, "high");
  }

  if (isMostlyUiActionText(draft.toLowerCase(), words)) {
    contaminationTypes.push("ui/action text");
    contaminatedPhrases.push(draft.trim());
    severity = highestSeverity(severity, "medium");
  }

  const hasContamination = contaminatedPhrases.length > 0;

  return {
    hasContamination,
    contaminationTypes: unique(contaminationTypes),
    contaminatedPhrases: unique(contaminatedPhrases),
    severity,
    explanation: hasContamination
      ? "PromptPulse found off-topic or unprofessional text that should be removed before posting."
      : cleanContaminationReport.explanation
  };
}

export function stripContaminatedPhrases(draft: string): { body: string; report: ContaminationReport } {
  const report = detectDraftContamination(draft);
  if (!report.hasContamination) return { body: draft, report };

  const cleaned = report.contaminatedPhrases
    .sort((a, b) => b.length - a.length)
    .reduce((current, phrase) => current.split(phrase).join(" "), draft)
    .replace(/\s+([,.!?;:])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();

  return { body: cleaned, report };
}

function tokenizeMeaningfulWords(draft: string) {
  return draft
    .toLowerCase()
    .match(/[a-z0-9]+(?:'[a-z0-9]+)?/g)
    ?.filter((word) => !stopWords.has(word)) ?? [];
}

function isMostlyUiActionText(source: string, words: string[]) {
  if (words.length < 8) return false;
  const actionCount = words.filter((word) => uiActionWords.includes(word)).length;
  const hasStoryVerb = /\b(i|we)\s+(built|created|made|launched)\b/.test(source);
  return actionCount / words.length >= 0.48 && !hasStoryVerb;
}

function getScoreStatus(overall: number, validation: ProjectDraftValidation) {
  if (!validation.isSufficient) return "Insufficient project draft";
  if (overall <= 24) return "Insufficient project draft";
  if (overall <= 44) return "Needs a real build story";
  if (overall <= 64) return "Needs sharper framing";
  if (overall <= 79) return "Solid Prompted draft";
  if (overall <= 89) return "Strong Prompted post";
  return "Launch-ready";
}

export function validateProjectDraft(draft: string): ProjectDraftValidation {
  const source = draft.trim().toLowerCase();
  const words = tokenizeMeaningfulWords(draft);
  const detectedSignals = Array.from(new Set(uniqueMatches(source, projectSignals)));
  const featureCount = countMatches(source, featureSignals);
  const hasProjectNoun = containsAny(source, projectNouns);
  const hasFeatureDetail = featureCount >= 2 || /\b(has|with|includes|tracks|scores|rewrites|exports)\b/.test(source);
  const hasAudience = containsAny(source, audienceSignals) || /\bhelps\s+[a-z0-9-]+\b/.test(source);
  const hasProblem = containsAny(source, problemSignals);
  const hasDemoMoment = containsAny(source, demoSignals);
  const hasFeedbackQuestion = containsAny(source, feedbackSignals);
  const mostlyUiActionText = isMostlyUiActionText(source, words);
  const genericOnly = genericPhrases.includes(source) || /^(i\s+)?(built|made|created)\s+(an?\s+)?(app|thing|project)\.?$/.test(source);

  const missing: string[] = [];
  const reasons: string[] = [];

  if (words.length < 20) missing.push("meaningful project detail");
  if (!hasProjectNoun) missing.push("what was built");
  if (!hasFeatureDetail) missing.push("concrete features");
  if (!hasAudience) missing.push("user, audience, or use case");
  if (!hasProblem) missing.push("problem or why");
  if (!hasDemoMoment) missing.push("visible demo moment");
  if (!hasFeedbackQuestion) missing.push("specific feedback question");
  if (mostlyUiActionText) missing.push("real project story instead of UI action text");

  if (words.length >= 20) reasons.push("Has enough words to begin evaluating the project story.");
  if (hasProjectNoun) reasons.push("Names a project, product, or build surface.");
  if (hasFeatureDetail) reasons.push("Mentions concrete functionality.");
  if (hasAudience) reasons.push("Names who the project helps.");
  if (hasProblem) reasons.push("Explains why the project exists.");
  if (hasDemoMoment) reasons.push("Includes a concrete action, output, or demo moment.");
  if (hasFeedbackQuestion) reasons.push("Invites a specific reply.");

  const isSufficient =
    words.length >= 20 &&
    hasProjectNoun &&
    hasFeatureDetail &&
    hasAudience &&
    hasProblem &&
    !mostlyUiActionText &&
    !genericOnly;

  return {
    isSufficient,
    reasons,
    missing,
    meaningfulWordCount: words.length,
    detectedSignals
  };
}

function insufficientAnalysis(
  input: AnalyzeInput,
  validation: ProjectDraftValidation,
  contamination: ContaminationReport
): ScoreBreakdown {
  const body = input.body.trim().toLowerCase();
  const words = tokenizeMeaningfulWords(input.body);
  const mostlyUiActionText = isMostlyUiActionText(body, words);
  const hasTinyProjectClaim = /^(i\s+)?(built|made|created)\s+(an?\s+)?(app|thing|project)\.?$/.test(body);
  const hasProjectNoun = containsAny(body, projectNouns);
  const hasUnrelatedPersonalSentence = /^i\s+like\s+/.test(body);
  const isBareGreeting = words.length <= 2 && !hasProjectNoun;
  const isMostlyIrrelevant = isBareGreeting || hasUnrelatedPersonalSentence;
  const maxOverall = contamination.hasContamination && contamination.severity === "high"
    ? 15
    : isMostlyIrrelevant
      ? 15
      : mostlyUiActionText
        ? 20
        : hasTinyProjectClaim
          ? 25
          : 20;
  const draftSignalBonus = Math.min(8, validation.detectedSignals.length * 2);
  const overall = Math.min(maxOverall, isMostlyIrrelevant ? 12 : hasTinyProjectClaim ? 22 : 16 + draftSignalBonus);

  const helped = [
    "The title, category, or tools may provide some context, but the draft itself still needs a real project story."
  ];
  const hurt = [
    "The draft does not explain what was built.",
    "The draft does not name the user, problem, or use case.",
    "The draft does not describe concrete features.",
    "The draft does not include a visible demo moment.",
    "There is no specific feedback question."
  ];
  const fixes = [
    "Start with: ‘I built [project] because [problem].’",
    "Add 3–5 concrete features.",
    "Explain who it helps.",
    "Mention the most screenshot-worthy demo moment.",
    "End with a specific feedback question."
  ];

  if (contamination.hasContamination) {
    hurt.unshift(...cleanupHurt);
    fixes.unshift(...cleanupFixes);
  }

  return {
    clarity: Math.min(30, isMostlyIrrelevant ? 10 : hasTinyProjectClaim ? 24 : 18 + draftSignalBonus),
    usefulness: Math.min(25, isMostlyIrrelevant ? 8 : hasTinyProjectClaim ? 16 : 12 + draftSignalBonus),
    wowFactor: Math.min(20, isMostlyIrrelevant ? 6 : hasTinyProjectClaim ? 12 : 10 + draftSignalBonus),
    commentPotential: Math.min(20, input.body.includes("?") ? 18 : isMostlyIrrelevant ? 6 : 12),
    founderAppeal: Math.min(20, isMostlyIrrelevant ? 7 : hasTinyProjectClaim ? 14 : 10 + draftSignalBonus),
    overall,
    status: contamination.hasContamination ? "Needs cleanup before posting" : "Insufficient project draft",
    readoutLabel: contamination.hasContamination ? "Needs cleanup before posting" : "Needs more project detail",
    warning: contamination.hasContamination ? contaminationWarning : warning,
    validation,
    contamination,
    suggestions: fixes,
    strengths: [],
    helped,
    hurt,
    fixes
  };
}

export function analyzePost(input: AnalyzeInput): ScoreBreakdown {
  const title = input.title.trim();
  const body = input.body.trim();
  const tools = splitTools(input.tools);
  const bodyLower = body.toLowerCase();
  const context = `${title} ${input.category} ${input.projectType} ${input.tools}`.toLowerCase();
  const validation = validateProjectDraft(body);
  const contamination = detectDraftContamination(body);

  if (!validation.isSufficient) {
    return insufficientAnalysis(input, validation, contamination);
  }

  const wordCount = body.split(/\s+/).filter(Boolean).length;
  const sentenceCount = body.split(/[.!?]/).filter((sentence) => sentence.trim().length > 0).length;
  const bodyFeatureMatches = countMatches(bodyLower, featureSignals);
  const demoMatches = countMatches(bodyLower, demoSignals);
  const audienceMatches = countMatches(bodyLower, audienceSignals);
  const hasQuestion = body.includes("?");
  const hasProblem = containsAny(bodyLower, problemSignals);
  const hasPromptedContext = containsAny(`${bodyLower} ${context}`, ["prompted", "builder", "builders"]);

  const clarity = scoreCap(
    18 +
      Math.min(18, wordCount * 0.34) +
      Math.min(10, sentenceCount * 3) +
      (containsAny(bodyLower, projectNouns) ? 10 : 0) +
      (hasProblem ? 10 : 0) +
      Math.min(16, bodyFeatureMatches * 4) +
      (hasQuestion ? 6 : 0) +
      (title.length > 18 ? 4 : 0)
  );

  const usefulness = scoreCap(
    18 +
      Math.min(18, audienceMatches * 7 + (containsAny(bodyLower, ["helps", "useful"]) ? 8 : 0)) +
      (hasProblem ? 14 : 0) +
      Math.min(22, bodyFeatureMatches * 4) +
      (containsAny(bodyLower, ["export", "plan", "priority", "dashboard", "feedback", "organize"]) ? 8 : 0) +
      (body.length > 160 ? 6 : 0) +
      (tools.length > 1 ? 5 : 0)
  );

  const wowFactor = scoreCap(
    14 +
      Math.min(24, demoMatches * 4) +
      countMatches(bodyLower, ["interactive", "cinematic", "real-time", "ai", "robot", "digital twin", "telemetry", "terminal"]) * 7 +
      Math.min(10, tools.length * 3) +
      Math.min(12, bodyFeatureMatches * 2)
  );

  const commentPotential = scoreCap(
    16 +
      (hasQuestion ? 20 : 0) +
      countMatches(bodyLower, ["what would", "feedback", "thoughts", "compare", "would you", "should i", "feature would"]) * 9 +
      (hasProblem ? 8 : 0) +
      (containsAny(bodyLower, audienceSignals) ? 8 : 0) +
      Math.min(10, bodyFeatureMatches * 2) +
      (title.length > 18 ? 5 : 0) +
      (hasPromptedContext ? 5 : 0)
  );

  const founderAppeal = scoreCap(
    18 +
      countMatches(`${bodyLower} ${context}`, ["founder", "builder", "builders", "launch", "marketplace", "backend", "auth", "deployment", "analytics", "saas", "prompted"]) * 6 +
      (containsAny(bodyLower, ["workflow", "platform", "dashboard", "feedback", "posts", "post"]) ? 9 : 0) +
      (hasProblem ? 8 : 0) +
      (input.timeSpent ? 4 : 0) +
      (tools.length >= 3 ? 7 : 0) +
      (containsAny(bodyLower, ["students", "student", "users"]) ? 7 : 0)
  );

  let overall = scoreCap(
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

  if (validation.reasons.some((reason) => reason.includes("functionality"))) {
    const strength = "The draft names concrete features, so readers can understand what the build actually does.";
    strengths.push(strength);
    helped.push(strength);
  }

  if (validation.reasons.some((reason) => reason.includes("who"))) {
    const strength = "It names the audience, which makes the usefulness easier to judge.";
    strengths.push(strength);
    helped.push(strength);
  }

  if (hasProblem) {
    const strength = "The post explains why the project exists instead of only listing UI.";
    strengths.push(strength);
    helped.push(strength);
  }

  if (hasPromptedContext) {
    helped.push("The framing connects to Prompted builders, which gives the post platform relevance.");
  }

  if (!hasQuestion) {
    const fix = "End with a sharper question that invites specific feedback or replies.";
    suggestions.push("End with a sharper question that invites specific feedback.");
    fixes.push(fix);
    hurt.push("No direct ending question yet, so comment momentum depends on readers inventing their own reply angle.");
  }

  if (!containsAny(bodyLower, demoSignals)) {
    const fix = "Mention the most screenshot-worthy demo moment.";
    suggestions.push(fix);
    fixes.push(fix);
    hurt.push("The post does not point to a visible demo moment, which can make the build feel less screenshot-worthy.");
  }

  if (bodyFeatureMatches < 3) {
    const fix = "Add 3–5 concrete features.";
    suggestions.push(fix);
    fixes.push(fix);
    hurt.push("The feature list is still light, so readers may not know what to react to.");
  }

  if (!containsAny(bodyLower, ["students", "builders", "developers", "founders", "users", "people", "teams"])) {
    const fix = "Explain who it helps.";
    suggestions.push(fix);
    fixes.push(fix);
    hurt.push("The audience could be more explicit.");
  }

  if (tools.length < 2) {
    const fix = "List the tools or stack so technical builders can anchor their comments.";
    suggestions.push(fix);
    fixes.push(fix);
    hurt.push("The stack is too light to pull in technical builders who like implementation detail.");
  } else {
    helped.push("The stack context supports the project story after the draft explains the build.");
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

  let adjustedClarity = clarity;
  let adjustedUsefulness = usefulness;
  let adjustedWowFactor = wowFactor;
  let adjustedCommentPotential = commentPotential;
  let adjustedFounderAppeal = founderAppeal;
  let status = getScoreStatus(overall, validation);
  let analysisWarning = undefined;

  if (contamination.hasContamination) {
    hurt.unshift(...cleanupHurt);
    fixes.unshift(...cleanupFixes);
    suggestions.unshift("Remove unrelated or unprofessional language before posting.");
    analysisWarning = contaminationWarning;

    if (contamination.severity === "high") {
      adjustedClarity = Math.min(adjustedClarity, 55);
      adjustedUsefulness = Math.min(adjustedUsefulness, 55);
      adjustedWowFactor = Math.min(adjustedWowFactor, 45);
      adjustedCommentPotential = Math.min(adjustedCommentPotential, 35);
      adjustedFounderAppeal = Math.min(adjustedFounderAppeal, 35);
      overall = Math.min(overall, 40);
      status = "Needs cleanup before posting";
    } else if (contamination.severity === "medium") {
      overall = Math.min(overall, 55);
      status = "Needs cleanup before posting";
    } else if (contamination.severity === "low") {
      overall = scoreCap(overall - 12);
      status = getScoreStatus(overall, validation);
    }
  }

  return {
    clarity: adjustedClarity,
    usefulness: adjustedUsefulness,
    wowFactor: adjustedWowFactor,
    commentPotential: adjustedCommentPotential,
    founderAppeal: adjustedFounderAppeal,
    overall,
    status,
    readoutLabel: contamination.hasContamination ? "Needs cleanup before posting" : "Screenshot-ready readout",
    warning: analysisWarning,
    validation,
    contamination,
    suggestions: suggestions.slice(0, 5),
    strengths: strengths.length ? strengths.slice(0, 4) : ["The draft has a usable starting point for a clearer Prompted post."],
    helped: helped.length ? helped.slice(0, 4) : ["The draft has a usable starting point for a clearer Prompted post."],
    hurt: hurt.slice(0, 4),
    fixes: fixes.slice(0, 5)
  };
}

export const sampleDraft: AnalyzeInput = {
  title: "Built PromptPulse, an AI growth studio for Prompted builders",
  category: "builder tools",
  tools: "React, TypeScript, local scoring model, markdown export",
  projectType: "Analytics product",
  timeSpent: "1 week",
  body:
    "I built PromptPulse because I wanted to understand why some Prompted posts get more likes, comments, and useful feedback than others. You paste a draft, add the category and tools, then it scores clarity, usefulness, wow factor, comment potential, and founder appeal. It also rewrites the post into professional, community, and technical versions so the final share feels sharper without losing the builder's voice."
};
