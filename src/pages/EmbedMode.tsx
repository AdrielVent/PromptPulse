import { Copy, ShieldCheck, Wand2 } from "lucide-react";
import { useState } from "react";
import Button from "../components/Button";
import CopyButton from "../components/CopyButton";
import { analyzeEmbedDraft, embedPrivacyBadge, getImprovedEmbedHook } from "../lib/embed";
import type { ScoreBreakdown } from "../types";

const defaultEmbedDraft =
  "I built a project dashboard that helps builders improve their Prompted posts before launch. It scores the draft and suggests better hooks.";

export default function EmbedMode() {
  const [body, setBody] = useState(defaultEmbedDraft);
  const [analysis, setAnalysis] = useState<ScoreBreakdown | null>(null);
  const improvedHook = getImprovedEmbedHook(body);
  const fixes = analysis?.fixes.slice(0, 3) ?? [];

  return (
    <main className="embed-shell">
      <section className="embed-card">
        <header className="embed-header">
          <div className="brand-mark">
            <Wand2 size={17} />
          </div>
          <div>
            <strong>PromptPulse</strong>
            <span>Embed demo mode. Manual input only.</span>
          </div>
        </header>

        <label className="field embed-field">
          <span>Prompted draft</span>
          <textarea value={body} onChange={(event) => setBody(event.target.value)} />
        </label>

        <div className="embed-actions">
          <Button icon={<Wand2 size={16} />} onClick={() => setAnalysis(analyzeEmbedDraft(body))}>
            Analyze
          </Button>
          <CopyButton value={improvedHook} label="Copy improved hook" />
        </div>

        {analysis && (
          <div className="embed-result">
            <div>
              <strong>{analysis.overall}</strong>
              <span>PromptPulse score</span>
            </div>
            <ul>
              {fixes.map((fix) => (
                <li key={fix}>{fix}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="embed-privacy">
          <ShieldCheck size={15} />
          {embedPrivacyBadge}
        </div>
        <div className="embed-privacy">
          <Copy size={15} />
          No login, no scraping, no prmpted.com calls.
        </div>
      </section>
    </main>
  );
}
