export const integrationPlanCopy = {
  currentMode:
    "PromptPulse currently runs as a standalone web app. Users manually paste drafts, and all scoring uses local demo data. It does not scrape Prompted, access accounts, read cookies, or call private APIs.",
  iframeExample: `<iframe
  src="https://USERNAME.github.io/PromptPulse/#/embed"
  sandbox="allow-scripts allow-forms allow-popups"
  referrerpolicy="no-referrer"
  loading="lazy"
  title="PromptPulse Draft Analyzer">
</iframe>`,
  dataBoundary: [
    "no scraping",
    "no login",
    "no Prompted cookies",
    "no private API calls",
    "no background tracking",
    "no user-uploaded data stored in v1",
    "manual paste/import only"
  ],
  officialApi:
    "Only if Prompted provides an official API or approved data contract. No scraping, no hidden endpoints, and no private user data."
};

export function getIntegrationSafetyText(): string {
  return [
    integrationPlanCopy.currentMode,
    integrationPlanCopy.dataBoundary.join(", "),
    integrationPlanCopy.officialApi
  ].join(" ");
}
