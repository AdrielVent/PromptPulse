# PromptPulse

PromptPulse is a local demo growth studio for Prompted builders. It helps users manually analyze Prompted-style project drafts, improve hooks and titles, estimate interaction potential, rewrite posts, and generate new build ideas using local demo data.

## Live Demo

Recommended GitHub Pages URL format:

```text
https://USERNAME.github.io/PromptPulse/
```

After deployment, the standalone app runs at the root URL and the compact embed demo runs at:

```text
https://USERNAME.github.io/PromptPulse/#/embed
```

## What It Is

PromptPulse is an independent companion demo for builder workflows around Prompted-style posts. It is designed to be safe to review publicly and possible to adopt later only if the Prompted team explicitly chooses to integrate it.

## Why I Built It

I built PromptPulse because better project posts create better previews, clearer prompts, more useful feedback, and more reasons for builders to keep coming back before each launch.

## Core Features

- Public landing dashboard with local sample analytics
- Analyze Post workflow with clarity, usefulness, wow factor, comment potential, founder appeal, and overall scoring
- Screenshot-ready analysis output with helped, hurt, and fix sections
- Rewrite Studio with clean professional, community hype, and technical builder versions
- Prompted Opportunity Engine with Jack Mode, predicted likes/comments, founder appeal, builder usefulness, visual wow, comment magnet, and build briefs
- Explore Insights with Prompted-style engagement patterns
- Integration Plan page for safe future adoption paths
- Compact `#/embed` analyzer mode for sandboxed iframe review
- Copy-to-clipboard controls and markdown export

## Privacy and Safety Boundary

PromptPulse is an independent demo project inspired by Prompted builder workflows. It is not officially affiliated with Prompted unless the Prompted team chooses to adopt or integrate it. The app does not scrape Prompted, does not use Prompted account data, and does not call private Prompted APIs.

PromptPulse v1:

- uses local JSON demo data
- supports manual paste/import only
- does not require login
- does not use cookies by default
- does not include analytics tracking
- does not upload pasted drafts to a backend
- does not call `prmpted.com`

## Safe Prompted Integration Plan

PromptPulse includes an Integration Plan page with three safe future options:

- Link-out integration: Prompted could open PromptPulse in a new tab without sharing account data.
- Sandboxed iframe embed: Prompted could iframe a limited analyzer panel with strict sandbox attributes.
- Official API integration: only if Prompted provides an official API or approved data contract.

No future integration should use scraping, hidden endpoints, private account data, cookies, browser storage from Prompted, or unofficial APIs.

## Embed Mode

The compact embed demo is available at:

```text
#/embed
```

It includes:

- PromptPulse title
- draft textarea
- Analyze button
- compact score result
- top fixes
- Copy improved hook button
- privacy badge

It does not include login, tracking, full dashboards, external calls, or any Prompted account access.

## Tech Stack

- React
- TypeScript
- Vite
- Vitest
- GitHub Pages
- Local JSON demo data

## Local Development

```bash
npm install
npm run dev
```

## Testing

```bash
npm test
npm run build
```

## GitHub Pages Deployment

1. Create a GitHub repository named `PromptPulse`.
2. Push this code to the repository.
3. In GitHub, open repository settings.
4. Go to **Pages**.
5. Set **Build and deployment** source to **GitHub Actions**.
6. Push to the `main` branch or run the deploy workflow manually.
7. GitHub Actions will run:
   - `npm ci`
   - `npm test`
   - `npm run build`
   - deploy `dist` to GitHub Pages
8. Open:

```text
https://USERNAME.github.io/PromptPulse/
```

The Vite build uses relative asset paths so it can work under `/PromptPulse/` and can later support a custom domain. Navigation uses hash routes, which keeps refreshes safe on GitHub Pages.

## Future Roadmap

- Optional official Prompted API integration if approved
- More sample post categories
- Stronger post rewrite heuristics
- More detailed benchmark comparisons
- Exportable launch reports
- Sandboxed embed review package

## Disclaimer

PromptPulse is an independent demo project inspired by Prompted builder workflows. It is not officially affiliated with Prompted unless the Prompted team chooses to adopt or integrate it. The app does not scrape Prompted, does not use Prompted account data, and does not call private Prompted APIs.
