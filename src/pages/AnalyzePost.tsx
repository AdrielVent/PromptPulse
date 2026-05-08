import { AlertTriangle, CheckCircle2, Download, Loader2, RotateCcw, Sparkles, Wrench, Wand2 } from "lucide-react";
import { useState } from "react";
import Button from "../components/Button";
import CopyButton from "../components/CopyButton";
import EmptyState from "../components/EmptyState";
import Panel from "../components/Panel";
import ScoreRing from "../components/ScoreRing";
import { TextArea, TextField } from "../components/TextField";
import { sampleDraft } from "../lib/analyzer";
import { exportAnalysisToMarkdown } from "../lib/export";
import type { AnalyzeInput, ScoreBreakdown } from "../types";

interface AnalyzePostProps {
  draft: AnalyzeInput;
  analysis: ScoreBreakdown | null;
  onDraftChange: (draft: AnalyzeInput) => void;
  onAnalyze: (draft: AnalyzeInput) => ScoreBreakdown;
}

export default function AnalyzePost({ analysis, draft, onAnalyze, onDraftChange }: AnalyzePostProps) {
  const [loading, setLoading] = useState(false);

  const update = (key: keyof AnalyzeInput, value: string) => {
    onDraftChange({ ...draft, [key]: value });
  };

  const analyze = () => {
    setLoading(true);
    window.setTimeout(() => {
      onAnalyze(draft);
      setLoading(false);
    }, 620);
  };

  const loadStrongSample = () => {
    onDraftChange(sampleDraft);
    onAnalyze(sampleDraft);
  };

  const readoutLabel = analysis?.readoutLabel ?? "Screenshot-ready readout";

  const markdown = analysis ? exportAnalysisToMarkdown(draft.title, analysis) : "";

  const exportMarkdown = () => {
    if (!analysis) return;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "promptpulse-analysis.md";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-grid analyze-grid">
      <Panel eyebrow="Draft Input" title="Analyze Post" className="span-6">
        <div className="form-grid">
          <TextField label="Title" value={draft.title} onChange={(event) => update("title", event.target.value)} />
          <TextField label="Category" value={draft.category} onChange={(event) => update("category", event.target.value)} />
          <TextField label="Tools used" value={draft.tools} onChange={(event) => update("tools", event.target.value)} />
          <TextField label="Project type" value={draft.projectType} onChange={(event) => update("projectType", event.target.value)} />
          <TextField label="Time spent" value={draft.timeSpent ?? ""} onChange={(event) => update("timeSpent", event.target.value)} />
          <TextArea label="Post draft" value={draft.body} onChange={(event) => update("body", event.target.value)} />
        </div>
        <div className="button-row">
          <Button icon={loading ? <Loader2 className="spin" size={16} /> : <Wand2 size={16} />} onClick={analyze} disabled={loading}>
            {loading ? "Analyzing" : "Analyze post"}
          </Button>
          <Button icon={<RotateCcw size={16} />} onClick={() => onDraftChange(sampleDraft)} variant="secondary">
            Sample post
          </Button>
        </div>
      </Panel>

      <Panel
        eyebrow="Score Model"
        title="PromptPulse Score"
        className="span-6"
        action={
          analysis ? (
            <div className="button-row compact">
              <CopyButton value={markdown} label="Copy markdown" />
              <Button icon={<Download size={16} />} onClick={exportMarkdown} variant="secondary">
                Export
              </Button>
            </div>
          ) : null
        }
      >
        {analysis ? (
          <>
            {analysis.warning && (
              <div className="analysis-warning-card">
                <div>
                  <AlertTriangle size={18} />
                  <div>
                    <h3>{analysis.warning.title}</h3>
                    <p>{analysis.warning.body}</p>
                  </div>
                </div>
                <Button onClick={loadStrongSample} variant="secondary">
                  Load strong sample
                </Button>
              </div>
            )}

            <div className={`analysis-hero ${analysis.warning ? "is-warning" : ""}`}>
              <div>
                <p className="eyebrow">{readoutLabel}</p>
                <strong>{analysis.overall}</strong>
                <span>PromptPulse Score</span>
              </div>
              <div>
                <h3>{analysis.status}</h3>
                <p>
                  {analysis.contamination.hasContamination
                    ? "Clean up the draft before using the score as a publish-ready signal."
                    : analysis.warning
                    ? "The draft body needs enough project detail before PromptPulse can make a credible engagement estimate."
                    : "Manual scoring estimates whether the post will be clear, useful, visually interesting, worth replying to, and relevant to Prompted builders."}
                </p>
              </div>
            </div>
            <div className="analysis-score-cards">
              <div>
                <strong>{analysis.clarity}</strong>
                <span>Clarity</span>
              </div>
              <div>
                <strong>{analysis.usefulness}</strong>
                <span>Usefulness</span>
              </div>
              <div>
                <strong>{analysis.wowFactor}</strong>
                <span>Wow factor</span>
              </div>
              <div>
                <strong>{analysis.commentPotential}</strong>
                <span>Comment pull</span>
              </div>
              <div>
                <strong>{analysis.founderAppeal}</strong>
                <span>Founder appeal</span>
              </div>
            </div>

            <div className="analysis-reason-grid">
              <section className="analysis-reason-card helped">
                <h3>
                  <CheckCircle2 size={16} />
                  Helped
                </h3>
                <ul>
                  {analysis.helped.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
              <section className="analysis-reason-card hurt">
                <h3>
                  <AlertTriangle size={16} />
                  Hurt
                </h3>
                <ul>
                  {analysis.hurt.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
              <section className="analysis-reason-card fix">
                <h3>
                  <Wrench size={16} />
                  Fix next
                </h3>
                <ul>
                  {analysis.fixes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="score-grid compact-rings">
              <ScoreRing label="Clarity" score={analysis.clarity} />
              <ScoreRing label="Usefulness" score={analysis.usefulness} tone="green" />
              <ScoreRing label="Wow factor" score={analysis.wowFactor} tone="violet" />
              <ScoreRing label="Comments" score={analysis.commentPotential} tone="amber" />
              <ScoreRing label="Founder appeal" score={analysis.founderAppeal} tone="rose" />
            </div>
          </>
        ) : (
          <EmptyState
            icon={<Sparkles size={24} />}
            title="No analysis yet"
            body="Paste or load a draft, then run the local scoring model."
            action={<Button onClick={analyze}>Analyze sample</Button>}
          />
        )}
      </Panel>
    </div>
  );
}
