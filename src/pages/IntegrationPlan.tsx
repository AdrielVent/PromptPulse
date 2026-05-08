import { ExternalLink, FileCode2, LockKeyhole, ShieldCheck, Sparkles, Users } from "lucide-react";
import CopyButton from "../components/CopyButton";
import Panel from "../components/Panel";
import { integrationPlanCopy } from "../lib/integration";

const promptedGains = [
  "better project descriptions",
  "clearer prompts",
  "stronger project previews",
  "more useful comments",
  "more builders returning before launch",
  "better post quality without changing the core Prompted experience"
];

const userGains = [
  "stronger title",
  "stronger hook",
  "clearer feature explanation",
  "better ending question",
  "estimated interaction potential",
  "exportable Prompted-ready post"
];

const reviewChecklist = [
  "UI quality",
  "post scoring logic",
  "privacy boundary",
  "embed mode",
  "GitHub code",
  "README",
  "no scraping claims",
  "no hidden data collection"
];

export default function IntegrationPlan() {
  return (
    <div className="page-grid integration-grid">
      <section className="integration-hero span-12">
        <div>
          <p className="eyebrow">Integration Ready</p>
          <h2>Safe companion demo, not a Prompted integration.</h2>
          <p>
            PromptPulse is built to be reviewed as a standalone GitHub-hosted companion. It does not connect to
            prmpted.com, read sessions, use private APIs, or claim live Prompted analytics.
          </p>
        </div>
        <div className="integration-status">
          <ShieldCheck size={18} />
          Standalone local demo
        </div>
      </section>

      <Panel eyebrow="Current Mode" title="Standalone Local Demo" className="span-6">
        <p className="safe-copy">{integrationPlanCopy.currentMode}</p>
      </Panel>

      <Panel eyebrow="Data Boundary" title="What PromptPulse Will Not Do" className="span-6">
        <div className="boundary-list">
          {integrationPlanCopy.dataBoundary.map((item) => (
            <span key={item}>
              <LockKeyhole size={14} />
              {item}
            </span>
          ))}
        </div>
      </Panel>

      <Panel eyebrow="Option A" title="Link-out Integration" className="span-4">
        <div className="integration-option">
          <ExternalLink size={18} />
          <p>
            Prompted could add a button like <strong>Improve this post in PromptPulse</strong>. It opens PromptPulse in
            a new tab with no account data shared.
          </p>
        </div>
      </Panel>

      <Panel eyebrow="Option B" title="Sandboxed Iframe Embed" className="span-4">
        <div className="integration-option">
          <FileCode2 size={18} />
          <p>
            Prompted could embed a limited analyzer panel in a sandboxed iframe with no cookies, no storage access, and
            no automatic Prompted data access.
          </p>
        </div>
        <pre className="iframe-example">{integrationPlanCopy.iframeExample}</pre>
        <CopyButton value={integrationPlanCopy.iframeExample} label="Copy iframe" />
      </Panel>

      <Panel eyebrow="Option C" title="Official API Integration" className="span-4">
        <div className="integration-option">
          <ShieldCheck size={18} />
          <p>{integrationPlanCopy.officialApi}</p>
        </div>
      </Panel>

      <Panel eyebrow="Platform Value" title="What the platform would gain" className="span-6">
        <ul className="review-list">
          {promptedGains.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Panel>

      <Panel eyebrow="Builder Value" title="What Users Would Gain" className="span-6">
        <ul className="review-list">
          {userGains.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Panel>

      <Panel eyebrow="Review Checklist" title="What reviewers can verify" className="span-12">
        <div className="review-checklist">
          {reviewChecklist.map((item) => (
            <span key={item}>
              <Sparkles size={14} />
              {item}
            </span>
          ))}
        </div>
        <div className="integration-note">
          <Users size={18} />
          <p>
            Future integration should be user-initiated, permissioned, documented, and based only on an official
            Prompted API or approved data contract.
          </p>
        </div>
      </Panel>
    </div>
  );
}
