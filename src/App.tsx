import {
  Activity,
  BarChart3,
  Compass,
  Lightbulb,
  PenLine,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import posts from "./data/posts.json";
import { analyzePost, sampleDraft } from "./lib/analyzer";
import { getDashboardStats } from "./lib/analytics";
import { generateRewriteSuite } from "./lib/rewriter";
import type { AnalyzeInput, ScoreBreakdown } from "./types";
import type { PromptedPost } from "./types";
import AnalyzePost from "./pages/AnalyzePost";
import Dashboard from "./pages/Dashboard";
import EmbedMode from "./pages/EmbedMode";
import ExploreInsights from "./pages/ExploreInsights";
import IdeaGenerator from "./pages/IdeaGenerator";
import IntegrationPlan from "./pages/IntegrationPlan";
import RewriteStudio from "./pages/RewriteStudio";

type PageId = "dashboard" | "analyze" | "rewrite" | "insights" | "ideas" | "integration";
type RouteId = PageId | "embed";

const navItems: Array<{ id: PageId; label: string; icon: typeof BarChart3 }> = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "analyze", label: "Analyze", icon: Activity },
  { id: "rewrite", label: "Rewrite", icon: PenLine },
  { id: "insights", label: "Insights", icon: Compass },
  { id: "ideas", label: "Ideas", icon: Lightbulb },
  { id: "integration", label: "Integration", icon: ShieldCheck }
];

function getRouteFromHash(): RouteId {
  if (typeof window === "undefined") return "dashboard";
  const route = window.location.hash.replace(/^#\/?/, "");
  if (route === "embed") return "embed";
  if (navItems.some((item) => item.id === route)) return route as PageId;
  return "dashboard";
}

export default function App() {
  const [activeRoute, setActiveRoute] = useState<RouteId>(() => getRouteFromHash());
  const [draft, setDraft] = useState<AnalyzeInput>(sampleDraft);
  const [analysis, setAnalysis] = useState<ScoreBreakdown | null>(null);
  const samplePosts = posts as PromptedPost[];
  const stats = useMemo(() => getDashboardStats(samplePosts), [samplePosts]);
  const rewriteSuite = useMemo(() => generateRewriteSuite(draft), [draft]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [activeRoute]);

  useEffect(() => {
    const syncRoute = () => setActiveRoute(getRouteFromHash());
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  const navigate = (route: RouteId) => {
    setActiveRoute(route);
    window.location.hash = route === "dashboard" ? "#/" : `#/${route}`;
  };

  const runAnalysis = (input: AnalyzeInput) => {
    const next = analyzePost(input);
    setDraft(input);
    setAnalysis(next);
    return next;
  };

  if (activeRoute === "embed") {
    return <EmbedMode />;
  }

  const activePage = activeRoute as PageId;
  const page = {
    dashboard: (
      <Dashboard
        stats={stats}
        posts={samplePosts}
        onAnalyze={() => navigate("analyze")}
        onIdeas={() => navigate("ideas")}
        onIntegration={() => navigate("integration")}
      />
    ),
    analyze: <AnalyzePost draft={draft} analysis={analysis} onDraftChange={setDraft} onAnalyze={runAnalysis} />,
    rewrite: <RewriteStudio draft={draft} suite={rewriteSuite} onDraftChange={setDraft} />,
    insights: <ExploreInsights posts={samplePosts} />,
    ideas: <IdeaGenerator />,
    integration: <IntegrationPlan />
  }[activePage];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" type="button" onClick={() => navigate("dashboard")}>
          <span className="brand-mark">
            <Sparkles size={18} />
          </span>
          <span>
            <strong>PromptPulse</strong>
            <small>AI growth studio</small>
          </span>
        </button>

        <nav aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={`nav-item ${activePage === item.id ? "is-active" : ""}`}
                key={item.id}
                aria-label={item.label}
                type="button"
                onClick={() => navigate(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="privacy-card">
          <ShieldCheck size={18} />
          <p>Privacy note: v1 uses demo data and manual paste/import. No login required.</p>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Prompted builder analytics</p>
            <h1>{navItems.find((item) => item.id === activePage)?.label}</h1>
          </div>
          <div className="pulse-status">
            <span />
            Local demo mode
          </div>
        </header>
        {page}
      </main>
    </div>
  );
}
