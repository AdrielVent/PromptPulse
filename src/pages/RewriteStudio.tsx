import { ClipboardCheck, FileText, Hash, Loader2, MessageSquareQuote, WandSparkles } from "lucide-react";
import { useState } from "react";
import Button from "../components/Button";
import CopyButton from "../components/CopyButton";
import Panel from "../components/Panel";
import { TextArea, TextField } from "../components/TextField";
import { generateRewriteSuite } from "../lib/rewriter";
import type { AnalyzeInput, RewriteSuite } from "../types";

interface RewriteStudioProps {
  draft: AnalyzeInput;
  suite: RewriteSuite;
  onDraftChange: (draft: AnalyzeInput) => void;
}

export default function RewriteStudio({ draft, onDraftChange, suite }: RewriteStudioProps) {
  const [localSuite, setLocalSuite] = useState(suite);
  const [activeVariant, setActiveVariant] = useState(0);
  const [loading, setLoading] = useState(false);
  const selectedVariant = localSuite.versions[activeVariant] ?? localSuite.versions[0];

  const update = (key: keyof AnalyzeInput, value: string) => onDraftChange({ ...draft, [key]: value });

  const generate = () => {
    setLoading(true);
    window.setTimeout(() => {
      setLocalSuite(generateRewriteSuite(draft));
      setActiveVariant(0);
      setLoading(false);
    }, 560);
  };

  return (
    <div className="page-grid rewrite-grid">
      <Panel eyebrow="Source" title="Rewrite Studio" className="span-5">
        <div className="form-grid">
          <TextField label="Title" value={draft.title} onChange={(event) => update("title", event.target.value)} />
          <TextField label="Category" value={draft.category} onChange={(event) => update("category", event.target.value)} />
          <TextField label="Tools used" value={draft.tools} onChange={(event) => update("tools", event.target.value)} />
          <TextField label="Project type" value={draft.projectType} onChange={(event) => update("projectType", event.target.value)} />
          <TextArea label="Post draft" value={draft.body} onChange={(event) => update("body", event.target.value)} />
        </div>
        <Button icon={loading ? <Loader2 className="spin" size={16} /> : <WandSparkles size={16} />} onClick={generate} disabled={loading}>
          {loading ? "Generating" : "Generate rewrites"}
        </Button>
      </Panel>

      <div className="span-7 rewrite-output">
        <Panel eyebrow="Variants" title="Three Improved Versions">
          <div className="rewrite-tabs" role="tablist" aria-label="Rewrite variants">
            {localSuite.versions.map((version, index) => (
              <button
                aria-selected={activeVariant === index}
                className={activeVariant === index ? "is-active" : ""}
                key={version.name}
                onClick={() => setActiveVariant(index)}
                role="tab"
                type="button"
              >
                {version.name}
              </button>
            ))}
          </div>

          {selectedVariant && (
            <article className="rewrite-card rewrite-card-wide">
              <div className="rewrite-card-top">
                <div>
                  <h3>{selectedVariant.name}</h3>
                  <p>{selectedVariant.description}</p>
                </div>
                <CopyButton value={selectedVariant.body} />
              </div>
              <div className="rewrite-body">
                {selectedVariant.body.split("\n\n").map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          )}
        </Panel>

        <Panel eyebrow="Post Assets" title="Titles, Hooks, and Tags">
          <div className="asset-grid">
            <div className="asset-list">
              <h3>
                <FileText size={16} />
                Better titles
              </h3>
              {localSuite.titles.map((title) => (
                <div className="asset-row" key={title}>
                  <span>{title}</span>
                  <CopyButton value={title} label="Copy" />
                </div>
              ))}
            </div>
            <div className="asset-list">
              <h3>
                <MessageSquareQuote size={16} />
                Opening hooks
              </h3>
              {localSuite.hooks.map((hook) => (
                <div className="asset-row" key={hook}>
                  <span>{hook}</span>
                  <CopyButton value={hook} label="Copy" />
                </div>
              ))}
            </div>
          </div>
          <div className="tag-row">
            <Hash size={16} />
            {localSuite.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        </Panel>

        <Panel
          eyebrow="Ready Draft"
          title="Final Prompted-ready Post"
          action={<CopyButton value={localSuite.finalPost} label="Copy post" />}
        >
          <pre className="final-post">{localSuite.finalPost}</pre>
          <div className="micro-note">
            <ClipboardCheck size={16} />
            Uses manual inputs only. You choose what to paste.
          </div>
        </Panel>
      </div>
    </div>
  );
}
