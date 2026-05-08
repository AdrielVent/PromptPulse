import type { AnalyzeInput, RewriteSuite, RewriteVersion } from "../types";

const clean = (value: string, fallback: string) => value.trim() || fallback;

const toolList = (tools: string) =>
  tools
    .split(/[,|/]/)
    .map((tool) => tool.trim())
    .filter(Boolean);

function inferAudience(input: AnalyzeInput): string {
  const source = `${input.category} ${input.projectType} ${input.body}`.toLowerCase();
  if (source.includes("student")) return "students";
  if (source.includes("builder") || source.includes("developer") || source.includes("github") || source.includes("backend")) {
    return "builders";
  }
  if (source.includes("founder") || source.includes("marketplace") || source.includes("saas")) return "founders";
  return "Prompted builders";
}

function withoutBuildVerb(title: string): string {
  return title.replace(/^(i\s+)?(built|building|launched|launching|created|made)\s+/i, "").trim();
}

function articleFor(noun: string): string {
  return /^[aeiou]/i.test(noun.trim()) ? "an" : "a";
}

export function generateRewriteSuite(input: AnalyzeInput): RewriteSuite {
  const title = clean(input.title, "Untitled builder project");
  const projectName = withoutBuildVerb(title) || title;
  const category = clean(input.category, "builder tools");
  const projectType = clean(input.projectType, "project").toLowerCase();
  const article = articleFor(projectType);
  const tools = toolList(input.tools);
  const stack = tools.length ? tools.join(", ") : "a focused no-backend prototype";
  const audience = inferAudience(input);
  const coreBody = clean(
    input.body,
    "I built a project that turns a rough workflow into a clearer, more useful product experience."
  );

  const versions: RewriteVersion[] = [
    {
      name: "Clean Professional",
      description: "Founder-facing, clear, and product-minded.",
      body: `I built ${projectName}, ${article} ${projectType} for ${audience}.\n\nThe goal is simple: make the workflow easier to understand, use, and discuss. The project focuses on ${category}, uses ${stack}, and turns the core idea into a working demo instead of just a concept.\n\nThe part I care about most is whether the value is clear in the first few seconds. What would you tighten before sharing it more widely?`
    },
    {
      name: "Community Hype",
      description: "More energetic and comment-friendly without becoming noisy.",
      body: `I just built ${projectName}, and the fun part is that it feels instantly useful for ${audience}.\n\nInstead of only showing a polished screen, I wanted the post to make the problem obvious, show the working interaction, and give people something specific to react to. Built with ${stack}.\n\nWould you use this, remix it, or take the idea in a different direction?`
    },
    {
      name: "Technical Builder",
      description: "Stack-aware and useful for people who want implementation detail.",
      body: `Technical breakdown: ${projectName} is ${article} ${projectType} built around ${category}.\n\nStack: ${stack}.\n\nThe main flow takes the raw user input, turns it into a clearer decision or output, and keeps the demo focused on real functionality. The original draft was: "${coreBody.slice(0, 180)}${coreBody.length > 180 ? "..." : ""}"\n\nWhat implementation detail would you want me to share next?`
    }
  ];

  const titles = [
    `Built ${projectName} to help ${audience} move faster`,
    `${projectName}: a ${category} experiment for Prompted builders`,
    `Turning ${projectType} pain into a working demo`,
    `I built ${projectName} and scored the demo for interaction potential`
  ];

  const hooks = [
    `I built ${projectName} because the hard part is not just shipping; it is making the value obvious.`,
    `This started as a simple ${projectType}, but the demo became much more useful once I framed the problem clearly.`,
    `I wanted to see if a ${category} project could feel both practical and worth commenting on.`
  ];

  const tags = Array.from(
    new Set([
      category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      projectType.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      ...tools.slice(0, 3).map((tool) => tool.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")),
      audience === "students" ? "student-tools" : "builder-tools",
      "prompted"
    ].filter(Boolean)
    )
  );

  const promptedOpening =
    "I built PromptPulse because I wanted to understand why some Prompted builds get more likes, comments, and useful feedback than others.";

  const finalPost =
    projectName.toLowerCase().includes("promptpulse")
      ? `${promptedOpening}\n\nIt is a local demo analytics studio for Prompted builders. You paste a project draft, add the category, tools, and project type, then PromptPulse scores the post across clarity, usefulness, wow factor, comment potential, and founder appeal.\n\nThe app also has a Rewrite Studio that turns the same draft into three versions: clean professional, community hype, and technical builder. The Opportunity Engine uses local Prompted-style sample data to suggest new project ideas with estimated likes, estimated comments, founder appeal, builder usefulness, visual wow, and a \"Beat my last build?\" verdict.\n\nI also added an Integration Plan showing how PromptPulse could safely work with Prompted in the future through link-outs, sandboxed embeds, or an official API if the Prompted team ever wanted that. No scraping, no hidden endpoints, no account data.\n\nImportant privacy boundary: v1 does not scrape Prompted, does not require login, and does not upload anything. It only uses manual paste/import and local demo data.\n\nI built this because better project posts create better previews, clearer prompts, more useful feedback, and more reasons for builders to keep coming back before each launch.\n\nWhat would make this more useful for Prompted builders: stronger scoring, better rewrites, or deeper project idea analysis?\n\nTags: ${tags
          .map((tag) => `#${tag}`)
          .join(" ")}`
      : `${hooks[0]}\n\n${versions[0].body
          .split("\n\n")
          .slice(1)
          .join("\n\n")}\n\nWhat would you add, cut, or ask me to explain next?\n\nTags: ${tags
    .map((tag) => `#${tag}`)
    .join(" ")}`;

  return {
    versions,
    titles,
    hooks,
    tags,
    finalPost
  };
}
