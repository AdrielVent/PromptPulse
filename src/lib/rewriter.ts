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

const tagify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function generateRewriteSuite(input: AnalyzeInput): RewriteSuite {
  const title = clean(input.title, "Untitled builder project");
  const isPromptPulse = `${input.title} ${input.body}`.toLowerCase().includes("promptpulse");
  const projectName = isPromptPulse ? "PromptPulse" : withoutBuildVerb(title) || title;
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
  const promptedOpening =
    "I built PromptPulse because I wanted to understand why some Prompted builds get more likes, comments, and useful feedback than others.";

  if (isPromptPulse) {
    const tags = [
      "prompted",
      "builder-tools",
      "growth",
      "react",
      "typescript",
      "analytics",
      "project-feedback",
      "local-demo"
    ];

    const titles = [
      "I built PromptPulse — a local growth studio for Prompted builders",
      "I built a tool that scores Prompted drafts before you post them",
      "PromptPulse helps builders improve hooks, clarity, and comment potential",
      "I built an Opportunity Engine for better Prompted project posts",
      "I analyzed what gets interaction on Prompted, then built a tool around it"
    ];

    const hooks = [
      "I wanted to understand why some Prompted builds get comments immediately while others get ignored.",
      "Posting a build is not just about shipping it — it is about making the value obvious fast.",
      "PromptPulse started as a question: can you improve a project post before it goes live?",
      "I built this to help builders turn rough project descriptions into posts people actually reply to."
    ];

    const versions: RewriteVersion[] = [
      {
        name: "Clean Professional",
        description: "Clear, founder-facing, and grounded in the actual PromptPulse product.",
        body: `${promptedOpening}\n\nPromptPulse lets a builder paste a Prompted draft, add the category, tools, and project type, then score the post across clarity, usefulness, wow factor, comment potential, and founder appeal.\n\nIt includes a Rewrite Studio for cleaner versions, an Opportunity Engine for project ideas, and local Prompted-style demo data so the app can be reviewed without scraping Prompted or using account data.\n\nThe privacy boundary matters: v1 is manual paste/import only, uses local demo data, and does not scrape Prompted. What would make this more useful for builders before they post?`
      },
      {
        name: "Community Hype",
        description: "Energetic, direct, and built to invite replies without fake hype.",
        body: `${promptedOpening}\n\nThe interesting part is that it turns a rough project description into something you can actually improve before posting: better title, clearer hook, stronger feature explanation, comment potential, and a Prompted-ready final draft.\n\nI also added an Opportunity Engine that suggests build ideas based on local Prompted-style patterns, plus a clear no-scraping privacy boundary.\n\nWould you use this more for rewriting a post, checking the score, or finding the next project idea?`
      },
      {
        name: "Technical Builder",
        description: "Stack-aware and specific for builders who care how v1 works.",
        body: `Technical version: PromptPulse is a React + TypeScript + Vite app with local JSON sample data and a local rule-based scoring model.\n\nThere is no backend or API required for v1. The app handles draft analysis, rewrite variants, markdown export, copy buttons, hash routing for GitHub Pages, and a compact embed route for safe demo review.\n\nThe scoring model checks whether the draft describes a real project, names the audience, explains the problem, lists concrete features, includes a demo moment, and asks for feedback.\n\nWhat scoring signal would you add first: better project validation, stronger rewrite logic, or deeper comment prediction?`
      }
    ];

    const finalPost = `${promptedOpening}\n\nIt is a local demo analytics studio for Prompted builders. You paste a project draft, add the category, tools, and project type, then PromptPulse scores the post across clarity, usefulness, wow factor, comment potential, and founder appeal.\n\nThe app also has a Rewrite Studio that turns the same draft into three versions: clean professional, community hype, and technical builder. The Opportunity Engine uses local Prompted-style sample data to suggest new project ideas with estimated likes, estimated comments, founder appeal, builder usefulness, visual wow, and a "Beat my last build?" verdict.\n\nI also added an Integration Plan showing how PromptPulse could safely work with Prompted in the future through link-outs, sandboxed embeds, or an official API if the Prompted team ever wanted that. No scraping, no hidden endpoints, no account data.\n\nImportant privacy boundary: v1 does not scrape Prompted, does not require login, and does not upload anything. It only uses manual paste/import and local demo data.\n\nI built this because better project posts create better previews, clearer prompts, more useful feedback, and more reasons for builders to keep coming back before each launch.\n\nWhat would make this more useful for Prompted builders: stronger scoring, better rewrites, or deeper project idea analysis?\n\nTags: ${tags
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

  const versions: RewriteVersion[] = [
    {
      name: "Clean Professional",
      description: "Founder-facing, clear, and product-minded.",
      body: `I built ${projectName} for ${audience}.\n\nIt focuses on ${category}, uses ${stack}, and turns the draft into a clearer project story: what was built, who it helps, what it does, and what feedback would be useful.\n\nThe strongest version should make the value obvious in the first few seconds. What would you tighten before sharing it more widely?`
    },
    {
      name: "Community Hype",
      description: "More energetic and comment-friendly without becoming noisy.",
      body: `I just built ${projectName}, and I wanted the post to make the useful part obvious fast.\n\nThe build is for ${audience}, the stack is ${stack}, and the share should point people toward the actual feature, demo moment, and reply question instead of only saying it is finished.\n\nWould you use this, remix it, or take the idea in a different direction?`
    },
    {
      name: "Technical Builder",
      description: "Stack-aware and useful for people who want implementation detail.",
      body: `Technical breakdown: ${projectName} is ${article} ${projectType} focused on ${category}.\n\nStack: ${stack}.\n\nThe main flow should explain the input, the core feature, the output, and the user problem. The original draft was: "${coreBody.slice(0, 180)}${coreBody.length > 180 ? "..." : ""}"\n\nWhat implementation detail would you want me to share next?`
    }
  ];

  const titles = [
    `I built ${projectName} to solve a specific ${category} problem`,
    `${projectName}: a clearer project post for Prompted feedback`,
    `I built ${projectName} and want feedback on the core demo`,
    `${projectName} turns a rough idea into a working build`
  ];

  const hooks = [
    `I built ${projectName} because the hard part was making the value obvious quickly.`,
    `This started as a ${projectType}, but the post got stronger once I explained the user problem first.`,
    "I wanted to make the build easy to understand, easy to inspect, and easy to reply to."
  ];

  const tags = Array.from(
    new Set(
      [
        "prompted",
        audience === "students" ? "student-tools" : "builder-tools",
        tagify(category),
        ...tools.slice(0, 3).map(tagify)
      ].filter(Boolean)
    )
  );

  const finalPost = `${hooks[0]}\n\n${versions[0].body
    .split("\n\n")
    .slice(1)
    .join("\n\n")}\n\nWhat would you add, cut, or ask me to explain next?\n\nTags: ${tags.map((tag) => `#${tag}`).join(" ")}`;

  return {
    versions,
    titles,
    hooks,
    tags,
    finalPost
  };
}
