import { Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import OrbitNav from "./components/OrbitNav";
import PageTransition from "./components/PageTransition";
import posts from "./data/posts.json";
import { analyzePost, sampleDraft } from "./lib/analyzer";
import { getDashboardStats } from "./lib/analytics";
import { getHashForRoute, getRouteFromHash, navigationItems, shouldStartInOrbitIntro } from "./lib/navigation";
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
import type { PageId, RouteId } from "./lib/navigation";

export default function App() {
  const [activeRoute, setActiveRoute] = useState<RouteId>(() =>
    typeof window === "undefined" ? "dashboard" : getRouteFromHash(window.location.hash)
  );
  const [hasEnteredApp, setHasEnteredApp] = useState(() =>
    typeof window === "undefined" ? true : !shouldStartInOrbitIntro(window.location.hash)
  );
  const [draft, setDraft] = useState<AnalyzeInput>(sampleDraft);
  const [analysis, setAnalysis] = useState<ScoreBreakdown | null>(null);
  const samplePosts = posts as PromptedPost[];
  const stats = useMemo(() => getDashboardStats(samplePosts), [samplePosts]);
  const rewriteSuite = useMemo(() => generateRewriteSuite(draft), [draft]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [activeRoute]);

  useEffect(() => {
    const syncRoute = () => setActiveRoute(getRouteFromHash(window.location.hash));
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  const navigate = (route: RouteId) => {
    setActiveRoute(route);
    window.location.hash = getHashForRoute(route);
  };

  const selectPageFromOrbit = (pageId: PageId) => {
    setHasEnteredApp(true);
    navigate(pageId);
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
  const activeNavigationItem = navigationItems.find((item) => item.id === activePage) ?? navigationItems[0];
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
    <div className={`app-shell ${hasEnteredApp ? "" : "is-orbit-intro"}`}>
      <OrbitNav activePage={activePage} introMode={!hasEnteredApp} onSelect={selectPageFromOrbit} />

      {hasEnteredApp && (
        <main className="main-panel">
          <header className="topbar app-topbar">
            <button className="brand topbar-brand" type="button" onClick={() => navigate("dashboard")}>
              <span className="brand-mark">
                <Sparkles size={18} />
              </span>
              <span>
                <strong>PromptPulse</strong>
                <small>Local growth studio</small>
              </span>
            </button>
            <div className="topbar-heading">
              <p className="eyebrow">Prompted builder analytics</p>
              <h1>{activeNavigationItem.label}</h1>
            </div>
            <div className="pulse-status">
              <span />
              Local demo mode
            </div>
          </header>
          <PageTransition key={activePage} pageKey={activePage}>
            {page}
          </PageTransition>
        </main>
      )}
    </div>
  );
}
