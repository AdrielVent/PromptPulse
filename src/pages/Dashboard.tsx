import { ArrowRight, Flame, Lightbulb, MessageCircle, MousePointer2, Sparkles, ThumbsUp, Trophy } from "lucide-react";
import Button from "../components/Button";
import MetricCard from "../components/MetricCard";
import Panel from "../components/Panel";
import type { DashboardStats, PromptedPost } from "../types";

interface DashboardProps {
  stats: DashboardStats;
  posts: PromptedPost[];
  onAnalyze: () => void;
  onIdeas: () => void;
  onIntegration: () => void;
}

export default function Dashboard({ onAnalyze, onIdeas, onIntegration, posts, stats }: DashboardProps) {
  const bestType = stats.postTypePerformance[0];

  return (
    <div className="page-grid dashboard-grid">
      <section className="hero-band">
        <div>
          <p className="eyebrow">Manual data only • no scraping • no login • local demo mode</p>
          <h2>Analyze your Prompted draft before you post it.</h2>
          <p>
            PromptPulse helps builders improve titles, hooks, clarity, usefulness, wow factor, founder appeal, and
            comment potential using local Prompted-style demo data.
          </p>
          <div className="trust-badge">Manual data only • No scraping • No login • Local demo mode</div>
          <p className="hero-disclaimer">
            PromptPulse is an independent demo project. It is not officially connected to Prompted unless the Prompted
            team chooses to integrate it.
          </p>
        </div>
        <div className="hero-actions">
          <Button icon={<ArrowRight size={17} />} onClick={onAnalyze}>
            Try the Analyzer
          </Button>
          <Button icon={<Lightbulb size={17} />} onClick={onIdeas} variant="secondary">
            Open Opportunity Engine
          </Button>
          <Button icon={<Sparkles size={17} />} onClick={onIntegration} variant="secondary">
            View Integration Plan
          </Button>
        </div>
      </section>

      <div className="metrics-grid">
        <MetricCard icon={<MousePointer2 size={18} />} label="Analyzed posts" value={stats.totalPosts} detail="local samples" />
        <MetricCard icon={<ThumbsUp size={18} />} label="Average likes" value={stats.averageLikes} detail="per sample post" />
        <MetricCard icon={<MessageCircle size={18} />} label="Average comments" value={stats.averageComments} detail="conversation signal" />
        <MetricCard icon={<Trophy size={18} />} label="Best post type" value={bestType.label} detail={`${bestType.averageScore} avg engagement index`} />
      </div>

      <Panel className="span-12 builder-help-card">
        <div>
          <Lightbulb size={18} />
          <div>
            <strong>Why this helps builders</strong>
            <p>
              PromptPulse turns rough project drafts into clearer posts, sharper hooks, stronger feedback questions, and
              better launch-ready previews.
            </p>
          </div>
        </div>
      </Panel>

      <Panel eyebrow="Leaderboard" title="Top 5 Posts by Engagement Index" className="span-7">
        <div className="rank-list">
          {stats.topPosts.map((post, index) => (
            <article className="rank-row" key={post.id}>
              <span className="rank-number">{index + 1}</span>
              <div>
                <strong>{post.title}</strong>
                <small>
                  {post.likes} likes · {post.comments} comments · {post.category}
                </small>
              </div>
              <span className="score-pill" aria-label={`Engagement Index ${post.engagementScore}`}>
                <small>Index</small>
                {post.engagementScore}
              </span>
            </article>
          ))}
        </div>
      </Panel>

      <Panel eyebrow="Patterns" title="Top Engagement Patterns" className="span-5">
        <div className="pattern-stack">
          {stats.topPatterns.map((pattern) => (
            <div className="pattern-row" key={pattern.name}>
              <span>{pattern.name}</span>
              <div className="bar-track">
                <div style={{ width: `${Math.max(18, (pattern.count / posts.length) * 100)}%` }} />
              </div>
              <strong>{pattern.count}</strong>
            </div>
          ))}
        </div>
      </Panel>

      <Panel eyebrow="Categories" title="Top Categories" className="span-5">
        <div className="category-cloud">
          {stats.topCategories.map((category) => (
            <span key={category.name}>
              <Sparkles size={14} />
              {category.name}
              <strong>{category.averageEngagement}</strong>
            </span>
          ))}
        </div>
      </Panel>

      <Panel eyebrow="Post Types" title="Which Formats Perform Best" className="span-7">
        <div className="type-chart">
          {stats.postTypePerformance.map((type) => (
            <div className="type-row" key={type.label}>
              <span>{type.label}</span>
              <div className="bar-track">
                <div style={{ width: `${Math.max(24, type.averageScore)}%` }} />
              </div>
              <strong>{type.averageScore} index</strong>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="span-12 signal-strip">
        <div>
          <Flame size={18} />
          <strong>Highest signal in the sample:</strong>
          <span>real functionality plus clear founder or student usefulness.</span>
        </div>
      </Panel>
    </div>
  );
}
