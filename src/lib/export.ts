import type { ScoreBreakdown } from "../types";

export function exportAnalysisToMarkdown(title: string, analysis: ScoreBreakdown): string {
  const suggestions = analysis.suggestions.map((suggestion) => `- ${suggestion}`).join("\n");
  const strengths = analysis.strengths.map((strength) => `- ${strength}`).join("\n");
  const helped = analysis.helped.map((item) => `- ${item}`).join("\n");
  const hurt = analysis.hurt.map((item) => `- ${item}`).join("\n");
  const fixes = analysis.fixes.map((item) => `- ${item}`).join("\n");
  const checklistTitle = analysis.contamination.hasContamination ? "Cleanup Checklist" : "Improvement Checklist";
  const warning = analysis.warning
    ? `\n## Warning\n\n**${analysis.warning.title}**\n\n${analysis.warning.body}\n\n## ${checklistTitle}\n\n${fixes}\n`
    : "";

  return `# PromptPulse Analysis

## ${title || "Untitled Post"}

**Overall PromptPulse Score:** ${analysis.overall}/100
**Status:** ${analysis.status}
${warning}

## Score Breakdown

- Clarity: ${analysis.clarity}/100
- Usefulness: ${analysis.usefulness}/100
- Wow Factor: ${analysis.wowFactor}/100
- Comment Potential: ${analysis.commentPotential}/100
- Founder Appeal: ${analysis.founderAppeal}/100

## Strengths

${strengths}

## Helped

${helped}

## Hurt

${hurt}

## Fix Next

${fixes}

## Suggestions

${suggestions}

## Privacy

PromptPulse v1 uses local demo data and manual paste/import. No login is required, and users control what they paste.
`;
}
