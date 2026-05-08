import { describe, expect, test } from "vitest";
import { getDashboardStats } from "./analytics";
import { analyzePost, detectDraftContamination, sampleDraft } from "./analyzer";
import { exportAnalysisToMarkdown } from "./export";
import { githubPagesBase } from "./deployment";
import { analyzeEmbedDraft, embedPrivacyBadge, getImprovedEmbedHook } from "./embed";
import { getIntegrationSafetyText, integrationPlanCopy } from "./integration";
import { calculateOpportunityScore, generateBuildBrief, generateIdeas, getBeatVerdict, sortIdeas } from "./ideas";
import { getPageFromHash, navigationItems } from "./navigation";
import { generateRewriteSuite } from "./rewriter";
import samplePosts from "../data/posts.json";
import type { PromptedPost } from "../types";

const posts = samplePosts as PromptedPost[];
const flaggedTerm = "dumbass";

describe("PromptPulse analytics", () => {
  test("calculates aggregate dashboard stats from local Prompted-style posts", () => {
    const stats = getDashboardStats(posts);

    expect(stats.totalPosts).toBe(8);
    expect(stats.averageLikes).toBe(18.88);
    expect(stats.averageComments).toBe(7.88);
    expect(stats.topPosts[0].title).toBe("Service Marketplace Backend");
    expect(stats.topCategories[0].name).toBe("builder tools");
    expect(stats.postTypePerformance[0].label).toBe("Backend / platform");
  });
});

describe("PromptPulse scoring", () => {
  const baseDraft = {
    title: "Built PromptPulse",
    category: "builder tools",
    tools: "React, TypeScript, markdown export",
    projectType: "Analytics product"
  };

  test("treats hello as an insufficient project draft", () => {
    const analysis = analyzePost({ ...baseDraft, body: "hello" });

    expect(analysis.overall).toBeLessThanOrEqual(15);
    expect(analysis.status).toBe("Insufficient project draft");
    expect(analysis.warning?.title).toBe("Draft is too thin to score accurately");
  });

  test("caps generic app praise and asks for concrete features", () => {
    const analysis = analyzePost({ ...baseDraft, body: "my app is cool" });

    expect(analysis.overall).toBeLessThanOrEqual(20);
    expect(analysis.status).toBe("Insufficient project draft");
    expect(analysis.fixes).toContain("Add 3–5 concrete features.");
  });

  test("caps a build claim with no feature detail", () => {
    const analysis = analyzePost({ ...baseDraft, body: "I built an app" });

    expect(analysis.overall).toBeLessThanOrEqual(25);
    expect(analysis.status).toBe("Insufficient project draft");
    expect(analysis.hurt.join(" ")).toContain("does not describe concrete features");
  });

  test("treats unrelated personal text as irrelevant and avoids stack-only praise", () => {
    const analysis = analyzePost({ ...baseDraft, body: "I like girls" });

    expect(analysis.overall).toBeLessThanOrEqual(15);
    expect(analysis.status).toBe("Needs cleanup before posting");
    expect(analysis.helped.join(" ")).not.toMatch(/stack context/i);
  });

  test("treats repeated UI action text as cleanup contamination instead of a project post", () => {
    const analysis = analyzePost({
      ...baseDraft,
      body:
        "Analyze post Sample post Copy markdown Export Copy improved hook Copy final post Sort Ideas Toggle Platform Signal Mode Copy Full Build Brief Open Integration page Open Embed mode"
    });

    expect(analysis.overall).toBeLessThanOrEqual(20);
    expect(analysis.status).toBe("Needs cleanup before posting");
  });

  test("scores a strong student app draft as sufficient with useful analysis sections", () => {
    const analysis = analyzePost({
      title: "Assignment Priority Planner",
      category: "student apps",
      tools: "React, TypeScript, local JSON, markdown export",
      projectType: "Student productivity app",
      body:
        "I built a React app that helps students organize assignments by deadline, effort, and grade impact. It has a priority score, sprint timer, progress cards, and exportable study plan. I made it because students often know what is due but not what to do first. What feature would make this more useful?"
    });

    expect(analysis.overall).toBeGreaterThan(50);
    expect(analysis.status).not.toBe("Insufficient project draft");
    expect(analysis.helped.length).toBeGreaterThan(0);
    expect(analysis.hurt.length).toBeGreaterThan(0);
    expect(analysis.fixes.length).toBeGreaterThan(0);
  });

  test("title and tools cannot rescue a bad draft", () => {
    const analysis = analyzePost({
      title: "Built PromptPulse",
      category: "builder tools",
      tools: "React, TypeScript, markdown export",
      projectType: "Analytics product",
      body: "hello"
    });

    expect(analysis.overall).toBeLessThanOrEqual(15);
    expect(analysis.status).toBe("Insufficient project draft");
  });

  test("keeps the PromptPulse sample sufficient and screenshot-ready", () => {
    const analysis = analyzePost(sampleDraft);

    expect(analysis.overall).toBeGreaterThan(60);
    expect(analysis.status).not.toBe("Insufficient project draft");
    expect(analysis.warning).toBeUndefined();
  });

  test("caps contaminated but otherwise valid drafts and shows cleanup warning", () => {
    const contaminated = analyzePost({
      ...sampleDraft,
      body:
        "I built PromptPulse I LOVE YOU AND WANAN TOUCH YOU I wanted to understand why some Prompted posts get more likes, comments, and useful feedback than others. You paste a draft, add the category and tools, then it scores clarity, usefulness, wow factor, comment potential, and founder appeal. It also rewrites the post into professional, community, and technical versions so the final share feels sharper without losing the builder's voice."
    });

    expect(contaminated.overall).toBeLessThanOrEqual(40);
    expect(contaminated.status).toBe("Needs cleanup before posting");
    expect(contaminated.warning?.title).toBe("Draft contains off-topic or unprofessional text");
    expect(contaminated.contamination.hasContamination).toBe(true);
  });

  test("scores clean version at least 20 points higher than contaminated version", () => {
    const contaminated = analyzePost({
      ...sampleDraft,
      body: `${sampleDraft.body} I LOVE YOU AND WANNA TOUCH YOU`
    });
    const clean = analyzePost(sampleDraft);

    expect(clean.overall - contaminated.overall).toBeGreaterThanOrEqual(20);
    expect(clean.warning).toBeUndefined();
    expect(clean.contamination.hasContamination).toBe(false);
  });

  test("detects inappropriate phrase alone without giving project credit", () => {
    const analysis = analyzePost({
      title: "Untitled",
      category: "",
      tools: "",
      projectType: "",
      body: "I LOVE YOU AND WANAN TOUCH YOU"
    });

    expect(analysis.overall).toBeLessThanOrEqual(15);
    expect(["Insufficient project draft", "Needs cleanup before posting"]).toContain(analysis.status);
    expect(analysis.contamination.hasContamination).toBe(true);
  });

  test("detects contamination severity and matched phrases locally", () => {
    const report = detectDraftContamination("I built this dashboard. I LOVE YOU AND WANNA TOUCH YOU");

    expect(report.hasContamination).toBe(true);
    expect(report.severity).toBe("high");
    expect(report.contaminationTypes).toContain("inappropriate/romantic");
    expect(report.contaminatedPhrases.join(" ")).toMatch(/I LOVE YOU|WANNA TOUCH/i);
  });

  test("flags offensive terms inside otherwise project-like drafts with cleanup warning", () => {
    const analysis = analyzePost({
      ...sampleDraft,
      body: `${sampleDraft.body} This ${flaggedTerm} phrase should not be in the post.`
    });

    expect(analysis.status).toBe("Needs cleanup before posting");
    expect(analysis.overall).toBeLessThanOrEqual(40);
    expect(analysis.warning?.title).toBe("Draft contains off-topic or unprofessional text");
    expect(analysis.warning?.body).toContain("Remove unrelated, offensive, or unprofessional phrases");
    expect(analysis.warning?.title).not.toBe("Draft is too thin to score accurately");
    expect(analysis.hurt).toContain("The draft includes off-topic or unprofessional language.");
    expect(analysis.readoutLabel).toBe("Needs cleanup before posting");
  });

  test("cleanup warning wins when an offensive term appears in a thin draft", () => {
    const analysis = analyzePost({ ...baseDraft, body: `hello ${flaggedTerm}` });

    expect(analysis.status).toBe("Needs cleanup before posting");
    expect(analysis.overall).toBeLessThanOrEqual(25);
    expect(analysis.warning?.title).toBe("Draft contains off-topic or unprofessional text");
  });

  test("clean draft avoids cleanup status and scores higher than offensive contaminated version", () => {
    const contaminated = analyzePost({
      ...sampleDraft,
      body: `${sampleDraft.body} This ${flaggedTerm} phrase should not be in the post.`
    });
    const clean = analyzePost(sampleDraft);

    expect(clean.status).not.toBe("Needs cleanup before posting");
    expect(clean.warning?.title).not.toBe("Draft contains off-topic or unprofessional text");
    expect(clean.overall).toBeGreaterThan(contaminated.overall);
  });

  test("scores a detailed builder post higher than a vague post", () => {
    const strong = analyzePost({
      title: "Built a local laptop telemetry dashboard inspired by J.A.R.V.I.S.",
      category: "builder tools",
      tools: "React, TypeScript, local system telemetry, charts",
      projectType: "Dashboard",
      timeSpent: "2 weeks",
      body:
        "I built a real-time telemetry dashboard that turns local laptop performance into a cinematic command center. It tracks CPU, memory, storage, battery, and sessions, then explains what each signal means for students and builders shipping on older machines. The goal was to make system health useful, visual, and easy to discuss."
    });

    const weak = analyzePost({
      title: "My app",
      category: "misc",
      tools: "",
      projectType: "app",
      body: "Made a thing. Thoughts?"
    });

    expect(strong.overall).toBeGreaterThan(weak.overall);
    expect(strong.suggestions).toContain("End with a sharper question that invites specific feedback.");
    expect(weak.suggestions).toContain("Explain who it helps.");
  });

  test("explains what helped, hurt, and should be fixed for screenshot-ready analysis", () => {
    const analysis = analyzePost({
      title: "Built PromptPulse, an AI growth studio for Prompted builders",
      category: "builder tools",
      tools: "React, TypeScript, local scoring model, markdown export",
      projectType: "Analytics product",
      timeSpent: "1 week",
      body:
        "I built PromptPulse to help builders understand why some Prompted posts get more likes, comments, and useful feedback. You paste a draft, add the category and tools, then it scores clarity, usefulness, wow factor, comment potential, and founder appeal. It also rewrites the post into professional, community, and technical versions so the final share feels sharper without losing the builder's voice."
    });

    expect(analysis.helped.length).toBeGreaterThanOrEqual(2);
    expect(analysis.hurt.length).toBeGreaterThanOrEqual(1);
    expect(analysis.fixes.length).toBeGreaterThanOrEqual(2);
    expect(analysis.status).not.toBe("Insufficient project draft");
    expect([...analysis.helped, ...analysis.hurt, ...analysis.fixes].join(" ")).toMatch(/reply|question|demo|Prompted/i);
  });
});

describe("PromptPulse rewrite studio", () => {
  test("creates distinct post variants, hooks, titles, tags, and a final post", () => {
    const suite = generateRewriteSuite({
      title: "Assignment Priority Planner",
      category: "student apps",
      tools: "React, local storage",
      projectType: "Productivity app",
      body:
        "A planner that helps students rank assignments by urgency, effort, and impact so they can decide what to do first."
    });

    expect(suite.versions).toHaveLength(3);
    expect(suite.titles.length).toBeGreaterThanOrEqual(4);
    expect(suite.hooks[0]).toMatch(/built/i);
    expect(suite.tags).toContain("student-tools");
    expect(suite.finalPost).toContain("What would you add");
  });

  test("does not duplicate leading build verbs in generated copy", () => {
    const suite = generateRewriteSuite({
      title: "Built PromptPulse, an AI growth studio for Prompted builders",
      category: "builder tools",
      tools: "React, TypeScript",
      projectType: "Analytics product",
      body: "A scoring studio that helps builders improve posts before publishing."
    });

    const combined = [suite.finalPost, ...suite.titles, ...suite.versions.map((version) => version.body)].join("\n");

    expect(combined).not.toMatch(/Built Built/i);
    expect(combined).not.toMatch(/analytics product for builders/i);
  });

  test("removes banned generic rewrite phrases", () => {
    const suite = generateRewriteSuite({
      title: "Built PromptPulse, an AI growth studio for Prompted builders",
      category: "builder tools",
      tools: "React, TypeScript, Vite, local JSON sample data, markdown export",
      projectType: "Analytics product",
      body:
        "I built PromptPulse because I wanted to understand why some Prompted builds get more likes, comments, and useful feedback than others."
    });

    const combined = [suite.finalPost, ...suite.titles, ...suite.hooks, ...suite.versions.map((version) => version.body)].join("\n");

    expect(combined).not.toMatch(/analytics product for builders/i);
    expect(combined).not.toMatch(/Turning analytics product pain/i);
    expect(combined).not.toMatch(/builder tools experiment/i);
    expect(combined).not.toMatch(/make the workflow easier to understand/i);
  });

  test("sanitizes contaminated input before generating rewrite output", () => {
    const suite = generateRewriteSuite({
      title: "StudySprint OS",
      category: "student apps",
      tools: "React, TypeScript, local JSON",
      projectType: "Student productivity app",
      body:
        "I built a React app that helps students organize assignments by deadline and effort. I LOVE YOU AND WANNA TOUCH YOU It has a sprint timer, progress cards, and exportable study plan."
    });

    const combined = [suite.finalPost, ...suite.versions.map((version) => version.body)].join("\n");

    expect(combined).not.toMatch(/I LOVE YOU/i);
    expect(combined).not.toMatch(/WANNA TOUCH YOU/i);
    expect(suite.sanitizationNote).toBe("Note: Removed off-topic or unprofessional language from the rewrite to keep the post focused on your project.");
  });

  test("sanitizes offensive terms before generating rewrite output", () => {
    const suite = generateRewriteSuite({
      title: "StudySprint OS",
      category: "student apps",
      tools: "React, TypeScript, local JSON",
      projectType: "Student productivity app",
      body:
        `I built a React app that helps students organize assignments by deadline and effort. This ${flaggedTerm} phrase does not belong. It has a sprint timer, progress cards, and exportable study plan.`
    });

    const combined = [suite.finalPost, ...suite.versions.map((version) => version.body)].join("\n");

    expect(combined).not.toContain(flaggedTerm);
    expect(suite.sanitizationNote).toBe("Note: Removed off-topic or unprofessional language from the rewrite to keep the post focused on your project.");
  });

  test("final Prompted post opens like a real builder explaining PromptPulse", () => {
    const suite = generateRewriteSuite({
      title: "Built PromptPulse, an AI growth studio for Prompted builders",
      category: "builder tools",
      tools: "React, TypeScript, local scoring model, markdown export",
      projectType: "Analytics product",
      body:
        "I built PromptPulse to help builders understand why some Prompted posts get more likes, comments, and useful feedback."
    });

    expect(suite.finalPost.startsWith("I built PromptPulse because I wanted to understand why")).toBe(true);
    expect(suite.finalPost).toContain("some Prompted builds get more likes, comments, and useful feedback than others.");
    expect(suite.finalPost).toContain("does not scrape Prompted");
    expect(suite.finalPost).toContain("manual paste/import");
    expect(suite.finalPost).toContain("local demo data");
    expect(suite.finalPost).not.toMatch(/value proposition|move faster/i);
  });
});

describe("PromptPulse idea generator", () => {
  test("generates complete Prompted-ready project ideas", () => {
    const ideas = generateIdeas();

    expect(ideas.length).toBeGreaterThanOrEqual(10);
    expect(ideas.map((idea) => idea.projectName)).toEqual(
      expect.arrayContaining([
        "DemoCritic AI",
        "LaunchLens",
        "RepoRadar",
        "Prompted Post Doctor",
        "BuildReplay",
        "CampusTwin Terminal",
        "FounderAuth Kit",
        "StudySprint OS",
        "Prompt Arena Simulator",
        "Creator Signal Board"
      ])
    );
    expect(ideas[0].predictedLikesRange.min).toBeGreaterThanOrEqual(15);
    expect(ideas[0].scores.founderAppeal).toBeGreaterThanOrEqual(80);
    expect(ideas[0].whyPromptedCare).toMatch(/Prompted/i);
    expect(ideas[0].platformLoop).toMatch(/better posts|project previews|builders|previews|replies/i);
    expect(ideas[0].suggestedTools.length).toBeGreaterThanOrEqual(3);
    expect(ideas[0].endingQuestion).toMatch(/\?/);
  });

  test("sorts opportunities by founder appeal, comments, usefulness, visuals, and easiest build", () => {
    const ideas = generateIdeas();

    expect(sortIdeas(ideas, "founder")[0].scores.founderAppeal).toBeGreaterThanOrEqual(
      sortIdeas(ideas, "founder")[1].scores.founderAppeal
    );
    expect(sortIdeas(ideas, "comments")[0].scores.commentMagnet).toBeGreaterThanOrEqual(
      sortIdeas(ideas, "comments")[1].scores.commentMagnet
    );
    expect(sortIdeas(ideas, "useful")[0].scores.builderUsefulness).toBeGreaterThanOrEqual(
      sortIdeas(ideas, "useful")[1].scores.builderUsefulness
    );
    expect(sortIdeas(ideas, "visual")[0].scores.visualWow).toBeGreaterThanOrEqual(
      sortIdeas(ideas, "visual")[1].scores.visualWow
    );
    expect(sortIdeas(ideas, "easy")[0].difficulty).toBe("Approachable");
  });

  test("adds founder-facing opportunity labels, beat verdicts, and Codex-ready build briefs", () => {
    const ideas = generateIdeas();
    const labels = ideas.flatMap((idea) => idea.spotlightLabel ?? []);
    const critic = ideas.find((idea) => idea.projectName === "DemoCritic AI");

    expect(labels).toEqual(expect.arrayContaining(["Best Overall", "Most Likely to Get Comments", "Most Useful for Prompted"]));
    expect(critic).toBeDefined();
    expect(calculateOpportunityScore(critic!)).toBeGreaterThan(85);
    expect(getBeatVerdict(critic!)).toMatch(/beats|matches/i);

    const brief = generateBuildBrief(critic!);

    expect(brief).toContain("Product goal");
    expect(brief).toContain("Pages");
    expect(brief).toContain("Components");
    expect(brief).toContain("Scoring logic");
    expect(brief).toContain("Sample data");
    expect(brief).toContain("Design direction");
    expect(brief).toContain("Export features");
    expect(brief).toContain("README requirements");
  });
});

describe("PromptPulse markdown export", () => {
  test("exports an analysis with scores and suggestions", () => {
    const analysis = analyzePost({
      title: "RoboCube Rubik's Cube solver",
      category: "technical demos",
      tools: "Computer vision, robotics, React",
      projectType: "Robotics demo",
      body:
        "I built a RoboCube solver that scans a scrambled cube, plans the solve path, and shows each move with a visual control panel for builders."
    });

    const markdown = exportAnalysisToMarkdown("RoboCube Rubik's Cube solver", analysis);

    expect(markdown).toContain("# PromptPulse Analysis");
    expect(markdown).toContain("Overall PromptPulse Score");
    expect(markdown).toContain("- Clarity:");
  });

  test("exports contamination warning and cleanup checklist", () => {
    const analysis = analyzePost({
      ...sampleDraft,
      body: `${sampleDraft.body} I LOVE YOU AND WANNA TOUCH YOU`
    });

    const markdown = exportAnalysisToMarkdown(sampleDraft.title, analysis);

    expect(markdown).toContain("Draft contains off-topic or unprofessional text");
    expect(markdown).toContain("Cleanup Checklist");
    expect(markdown).toContain("Remove unrelated or offensive phrases");
  });

  test("exports offensive contamination status without repeating the flagged term", () => {
    const analysis = analyzePost({
      ...sampleDraft,
      body: `${sampleDraft.body} This ${flaggedTerm} phrase should not be in the post.`
    });

    const markdown = exportAnalysisToMarkdown(sampleDraft.title, analysis);

    expect(markdown).toContain("Needs cleanup before posting");
    expect(markdown).toContain("Cleanup Checklist");
    expect(markdown).toContain("Remove unrelated or offensive phrases");
    expect(markdown).not.toContain(flaggedTerm);
  });
});

describe("PromptPulse launch and deployment readiness", () => {
  test("navigation config includes every main page with compact orbit labels", () => {
    expect(navigationItems.map((item) => item.id)).toEqual([
      "dashboard",
      "analyze",
      "rewrite",
      "insights",
      "ideas",
      "integration"
    ]);
    expect(navigationItems.map((item) => item.shortLabel)).toEqual(["Dash", "Analyze", "Rewrite", "Signals", "Ideas", "Safety"]);
    expect(navigationItems.some((item) => /jack/i.test(`${item.label} ${item.shortLabel} ${item.centerLabel}`))).toBe(false);
  });

  test("hash routes map safely to pages for OrbitNav and GitHub Pages", () => {
    expect(getPageFromHash("#/analyze")).toBe("analyze");
    expect(getPageFromHash("#/rewrite")).toBe("rewrite");
    expect(getPageFromHash("#/ideas")).toBe("ideas");
    expect(getPageFromHash("#/integration")).toBe("integration");
    expect(getPageFromHash("#/missing")).toBe("dashboard");
  });

  test("platform copy avoids founder-specific UI labels", () => {
    const joinedIdeaCopy = generateIdeas()
      .map((idea) => `${idea.whyPromptedCare} ${idea.platformLoop}`)
      .join(" ");

    expect(joinedIdeaCopy).not.toMatch(/\bJack\b|Jack Mode|Why Jack|How this helps Prompted grow/i);
    expect(joinedIdeaCopy).toMatch(/builder|posts|previews|replies/i);
  });

  test("GitHub Pages build uses relative asset base for repo pages and custom domains", () => {
    expect(githubPagesBase).toBe("./");
  });

  test("embed mode scoring uses local logic and needs no backend or Prompted API", () => {
    const result = analyzeEmbedDraft("I built a project dashboard that helps builders rewrite their launch posts.");
    const hook = getImprovedEmbedHook("I built a project dashboard that helps builders rewrite their launch posts.");

    expect(result).toHaveProperty("clarity");
    expect(result).toHaveProperty("usefulness");
    expect(result).toHaveProperty("wowFactor");
    expect(result).toHaveProperty("commentPotential");
    expect(result).toHaveProperty("founderAppeal");
    expect(hook).toMatch(/^I built this because/i);
    expect(embedPrivacyBadge).toContain("Manual input only");
  });

  test("integration plan is explicit about no scraping and official API-only future integration", () => {
    const safetyText = getIntegrationSafetyText();

    expect(safetyText).toContain("no scraping");
    expect(safetyText).toContain("official API");
    expect(safetyText).toContain("no Prompted cookies");
    expect(integrationPlanCopy.iframeExample).toContain("sandbox=\"allow-scripts allow-forms allow-popups\"");
  });

  test("final Prompted post includes the safety and privacy boundary", () => {
    const suite = generateRewriteSuite({
      title: "Built PromptPulse, an AI growth studio for Prompted builders",
      category: "builder tools",
      tools: "React, TypeScript, local scoring model, markdown export",
      projectType: "Analytics product",
      body: "I built PromptPulse to help builders understand why some Prompted posts get more interaction."
    });

    expect(suite.finalPost).toContain("No scraping");
    expect(suite.finalPost).toMatch(/no login|does not require login/i);
    expect(suite.finalPost).toContain("manual paste/import");
  });
});
