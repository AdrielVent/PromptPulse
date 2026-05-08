import {
  ArrowDownWideNarrow,
  BarChart3,
  BrainCircuit,
  Eye,
  Gauge,
  Lightbulb,
  Loader2,
  MessageCircle,
  Rocket,
  Sparkle,
  Target,
  Tags,
  Trophy,
  Users,
  Zap
} from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../components/Button";
import CopyButton from "../components/CopyButton";
import EmptyState from "../components/EmptyState";
import Panel from "../components/Panel";
import { calculateOpportunityScore, generateBuildBrief, generateIdeas, getBeatVerdict, sortIdeas } from "../lib/ideas";
import type { IdeaSort } from "../lib/ideas";

const sortOptions: Array<{ id: IdeaSort; label: string; icon: typeof Trophy }> = [
  { id: "overall", label: "Opportunity Score", icon: Trophy },
  { id: "founder", label: "Highest Founder Appeal", icon: Users },
  { id: "comments", label: "Most Comments Potential", icon: MessageCircle },
  { id: "useful", label: "Most Useful", icon: Target },
  { id: "visual", label: "Most Visual", icon: Eye },
  { id: "easy", label: "Easiest to Build", icon: Gauge }
];

export default function IdeaGenerator() {
  const [sort, setSort] = useState<IdeaSort>("overall");
  const [platformSignalMode, setPlatformSignalMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const ideas = useMemo(() => sortIdeas(generateIdeas(), sort), [sort]);

  const regenerate = () => {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
    }, 520);
  };

  return (
    <div className="page-grid ideas-grid">
      <Panel
        eyebrow="Idea Engine"
        title="Prompted Opportunity Engine"
        className="span-12"
        action={
          <Button icon={loading ? <Loader2 className="spin" size={16} /> : <Sparkle size={16} />} onClick={regenerate} disabled={loading}>
            {loading ? "Scanning" : "Rescan signal"}
          </Button>
        }
      >
        <div className="opportunity-intro">
          <div>
            <BrainCircuit size={22} />
            <p>
              PromptPulse studies what makes Prompted posts get likes, comments, saves, and replies, then turns those
              patterns into build ideas with clear interaction potential.
            </p>
          </div>
          <label className="platform-signal-toggle">
            <input
              checked={platformSignalMode}
              onChange={(event) => setPlatformSignalMode(event.target.checked)}
              type="checkbox"
            />
            <span>
              Platform Signal Mode
              <small>Shows how each idea could improve post quality, replies, shared prompts, and project previews.</small>
            </span>
          </label>
        </div>

        <div className="sort-toolbar" aria-label="Sort opportunities">
          <span>
            <ArrowDownWideNarrow size={16} />
            Sort by
          </span>
          {sortOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                className={sort === option.id ? "is-active" : ""}
                key={option.id}
                onClick={() => setSort(option.id)}
                type="button"
              >
                <Icon size={15} />
                {option.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <EmptyState
            icon={<Loader2 className="spin" size={24} />}
            title="Scanning Prompted signal"
            body="Ranking ideas by founder appeal, reply potential, usefulness, visual wow, and build effort."
          />
        ) : ideas.length === 0 ? (
          <EmptyState
            icon={<Lightbulb size={24} />}
            title="No opportunities loaded"
            body="Add local idea data to turn Prompted engagement patterns into build briefs."
          />
        ) : (
          <div className="idea-grid opportunity-grid">
            {ideas.map((idea) => {
              const opportunityScore = calculateOpportunityScore(idea);
              const buildBrief = generateBuildBrief(idea);

              return (
                <article className={`idea-card opportunity-card ${idea.spotlightLabel ? "top-opportunity" : ""}`} key={idea.projectName}>
                  <div className="idea-card-head opportunity-head">
                    <div className="idea-icon">
                      <Lightbulb size={20} />
                    </div>
                    <div>
                      <div className="opportunity-title-row">
                        <h3>{idea.projectName}</h3>
                        {idea.spotlightLabel && (
                          <span className="spotlight-label">
                            <Sparkle size={14} />
                            {idea.spotlightLabel}
                          </span>
                        )}
                      </div>
                      <p>{idea.hook}</p>
                    </div>
                  </div>

                  <div className="prediction-strip">
                    <span>
                      <Zap size={15} />
                      {idea.predictedLikesRange.min}-{idea.predictedLikesRange.max} likes
                    </span>
                    <span>
                      <MessageCircle size={15} />
                      {idea.predictedCommentsRange.min}-{idea.predictedCommentsRange.max} comments
                    </span>
                    <span>
                      <BarChart3 size={15} />
                      {opportunityScore} opportunity
                    </span>
                  </div>

                  <div className="opportunity-scores">
                    <span>
                      <strong>{idea.scores.founderAppeal}</strong>
                      Founder appeal
                    </span>
                    <span>
                      <strong>{idea.scores.builderUsefulness}</strong>
                      Builder usefulness
                    </span>
                    <span>
                      <strong>{idea.scores.visualWow}</strong>
                      Visual wow
                    </span>
                    <span>
                      <strong>{idea.scores.commentMagnet}</strong>
                      Comment magnet
                    </span>
                  </div>

                  <div className="opportunity-reasons">
                    <section>
                      <h4>Why it could get likes</h4>
                      <p>{idea.whyLikes}</p>
                    </section>
                    <section>
                      <h4>Why it could get comments</h4>
                      <p>{idea.whyComments}</p>
                    </section>
                    <section>
                      <h4>Why this matters for Prompted-style builders</h4>
                      <p>{idea.whyPromptedCare}</p>
                    </section>
                  </div>

                  {platformSignalMode && (
                    <div className="platform-loop">
                      <h4>
                        <Rocket size={15} />
                        How this improves the builder loop
                      </h4>
                      <p>{idea.platformLoop}</p>
                    </div>
                  )}

                  <div className="idea-section compact-list">
                    <strong>Core features</strong>
                    <ul>
                      {idea.coreFeatures.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="tool-stack">
                    <strong>Suggested tools</strong>
                    <div>
                      {idea.suggestedTools.map((tool) => (
                        <span key={tool}>{tool}</span>
                      ))}
                    </div>
                  </div>

                  <div className="idea-meta">
                    <span>
                      <Gauge size={15} />
                      {idea.difficulty}
                    </span>
                    <span>
                      <Tags size={15} />
                      {idea.suggestedTags.join(", ")}
                    </span>
                  </div>

                  <div className="build-verdict">
                    <strong>Beat my last build?</strong>
                    <p>{getBeatVerdict(idea)}</p>
                  </div>

                  <div className="suggested-title opportunity-copy-block">
                    <div>
                      <strong>Suggested Prompted post title</strong>
                      <span>{idea.suggestedTitle}</span>
                    </div>
                    <CopyButton value={idea.suggestedTitle} label="Copy title" />
                  </div>

                  <div className="ending-question">
                    <strong>Suggested ending question</strong>
                    <p>{idea.endingQuestion}</p>
                  </div>

                  <CopyButton value={buildBrief} label="Copy Full Build Brief" />
                </article>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}
