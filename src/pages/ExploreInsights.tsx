import { BadgeCheck, Braces, Camera, MessagesSquare, Rocket, ScanSearch } from "lucide-react";
import type { CSSProperties } from "react";
import Panel from "../components/Panel";
import type { PromptedPost } from "../types";

const insights = [
  {
    icon: Braces,
    title: "Tools for builders get strong engagement",
    body: "Resource drops, auth kits, backend starters, and workflow tools create practical value that founders can reuse."
  },
  {
    icon: BadgeCheck,
    title: "Useful student and dev apps get likes",
    body: "Clear personal pain plus a small working product gives people an easy reason to support the post."
  },
  {
    icon: Camera,
    title: "Cinematic UI gets comments",
    body: "A terminal, dashboard, or HUD style can become a conversation starter when it still shows real product behavior."
  },
  {
    icon: ScanSearch,
    title: "Technical demos need real functionality",
    body: "Robotics, digital twins, and repo tools work best when the post explains the system, not only the visuals."
  },
  {
    icon: MessagesSquare,
    title: "Clear storytelling increases interaction",
    body: "Posts perform better when they quickly cover what was built, who it helps, and what feedback is wanted."
  }
];

interface ExploreInsightsProps {
  posts: PromptedPost[];
}

export default function ExploreInsights({ posts }: ExploreInsightsProps) {
  const comparisonPosts = posts.filter((post) => post.id === "jarvis-telemetry" || post.id === "mech-digital-twin");

  return (
    <div className="page-grid insights-grid">
      <Panel eyebrow="Sample Data" title="Prompted-style Engagement Patterns" className="span-7">
        <div className="insight-list">
          {insights.map((insight) => {
            const Icon = insight.icon;
            return (
              <article className="insight-card" key={insight.title}>
                <Icon size={20} />
                <div>
                  <h3>{insight.title}</h3>
                  <p>{insight.body}</p>
                </div>
              </article>
            );
          })}
        </div>
      </Panel>

      <Panel eyebrow="Previous Projects" title="Comparison Card" className="span-5">
        <div className="comparison-card">
          {comparisonPosts.map((post) => (
            <article key={post.id}>
              <div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </div>
              <div className="comparison-stats">
                <span>{post.likes} likes</span>
                <span>{post.comments} comments</span>
              </div>
            </article>
          ))}
        </div>
      </Panel>

      <Panel eyebrow="Signal Map" title="What PromptPulse Learns From the Samples" className="span-12">
        <div className="signal-map">
          {posts.map((post) => (
            <article key={post.id}>
              <div className="signal-score" style={{ "--x": `${post.usefulness}%`, "--y": `${post.visualAppeal}%` } as CSSProperties}>
                <span />
              </div>
              <h3>{post.title}</h3>
              <p>{post.patterns.slice(0, 3).join(" · ")}</p>
            </article>
          ))}
        </div>
      </Panel>

      <Panel className="span-12 signal-strip">
        <div>
          <Rocket size={18} />
          <strong>Best posting formula:</strong>
          <span>clear problem, visible demo moment, technical credibility, and one specific question.</span>
        </div>
      </Panel>
    </div>
  );
}
