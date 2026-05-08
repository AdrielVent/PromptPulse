import ideas from "../data/ideas.json";
import type { Difficulty, ProjectIdea } from "../types";

export type IdeaSort = "overall" | "founder" | "comments" | "useful" | "visual" | "easy";

export function generateIdeas(): ProjectIdea[] {
  return sortIdeas(ideas as ProjectIdea[], "overall");
}

export function calculateOpportunityScore(idea: ProjectIdea): number {
  return Math.round(
    idea.scores.founderAppeal * 0.3 +
      idea.scores.builderUsefulness * 0.25 +
      idea.scores.commentMagnet * 0.25 +
      idea.scores.visualWow * 0.15 +
      Math.min(100, idea.predictedLikesRange.max * 2) * 0.05
  );
}

function difficultyRank(difficulty: Difficulty): number {
  return {
    Approachable: 3,
    Intermediate: 2,
    Advanced: 1
  }[difficulty];
}

export function sortIdeas(items: ProjectIdea[], sort: IdeaSort): ProjectIdea[] {
  const scoreFor = (idea: ProjectIdea) => {
    if (sort === "founder") return idea.scores.founderAppeal;
    if (sort === "comments") return idea.scores.commentMagnet;
    if (sort === "useful") return idea.scores.builderUsefulness;
    if (sort === "visual") return idea.scores.visualWow;
    if (sort === "easy") return difficultyRank(idea.difficulty) * 100 + calculateOpportunityScore(idea) / 100;
    return calculateOpportunityScore(idea);
  };

  return [...items].sort((a, b) => scoreFor(b) - scoreFor(a));
}

export function getBeatVerdict(idea: ProjectIdea): string {
  const jarvis = { name: "Project J.A.R.V.I.S.", likes: 17, comments: 8 };
  const twin = { name: "Mechanical Engineering Digital Twin Terminal", likes: 15, comments: 8 };
  const beatsJarvis = idea.predictedLikesRange.min > jarvis.likes && idea.predictedCommentsRange.min >= jarvis.comments;
  const beatsTwin = idea.predictedLikesRange.min > twin.likes && idea.predictedCommentsRange.min >= twin.comments;
  const matchesReplyDepth = idea.predictedCommentsRange.min >= Math.max(jarvis.comments, twin.comments);

  if (beatsJarvis && beatsTwin) {
    return `Likely beats both benchmarks: ${jarvis.name} (${jarvis.likes} likes, ${jarvis.comments} comments) and ${twin.name} (${twin.likes} likes, ${twin.comments} comments).`;
  }

  if (matchesReplyDepth) {
    return `Matches or beats the reply depth of ${jarvis.name} and ${twin.name}, with stronger upside if the demo preview is clear.`;
  }

  return `Likely trails the 8-comment benchmark unless the post ends with a sharper reply question.`;
}

const list = (items: string[]) => items.map((item) => `- ${item}`).join("\n");

export function generateBuildBrief(idea: ProjectIdea): string {
  return `Build a polished web app called ${idea.projectName}.

Product goal:
${idea.buildBrief.productGoal}

Prompted opportunity:
- Predicted likes: ${idea.predictedLikesRange.min}-${idea.predictedLikesRange.max}
- Predicted comments: ${idea.predictedCommentsRange.min}-${idea.predictedCommentsRange.max}
- Founder appeal: ${idea.scores.founderAppeal}/100
- Builder usefulness: ${idea.scores.builderUsefulness}/100
- Visual wow: ${idea.scores.visualWow}/100
- Comment magnet: ${idea.scores.commentMagnet}/100

Pages:
${list(idea.buildBrief.pages)}

Components:
${list(idea.buildBrief.components)}

Scoring logic:
${list(idea.buildBrief.scoringLogic)}

Sample data:
${list(idea.buildBrief.sampleData)}

Design direction:
${idea.buildBrief.designDirection}

Export features:
${list(idea.buildBrief.exportFeatures)}

README requirements:
${list(idea.buildBrief.readmeRequirements)}

Suggested tools:
${list(idea.suggestedTools)}

Suggested Prompted post title:
${idea.suggestedTitle}

Suggested ending question:
${idea.endingQuestion}
`;
}
