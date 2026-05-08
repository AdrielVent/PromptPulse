export type PageId = "dashboard" | "analyze" | "rewrite" | "insights" | "ideas" | "integration";
export type RouteId = PageId | "embed";

export interface NavigationItem {
  id: PageId;
  label: string;
  shortLabel: string;
  centerLabel: string;
  hash: string;
  angle: number;
}

export const navigationItems: NavigationItem[] = [
  { id: "dashboard", label: "Dashboard", shortLabel: "Dash", centerLabel: "Dashboard", hash: "#/", angle: -90 },
  { id: "analyze", label: "Analyze", shortLabel: "Analyze", centerLabel: "Analyze", hash: "#/analyze", angle: -30 },
  { id: "rewrite", label: "Rewrite", shortLabel: "Rewrite", centerLabel: "Rewrite", hash: "#/rewrite", angle: 30 },
  { id: "insights", label: "Insights", shortLabel: "Signals", centerLabel: "Signals", hash: "#/insights", angle: 90 },
  { id: "ideas", label: "Ideas", shortLabel: "Ideas", centerLabel: "Opportunity Engine", hash: "#/ideas", angle: 150 },
  { id: "integration", label: "Integration", shortLabel: "Safety", centerLabel: "Integration", hash: "#/integration", angle: 210 }
];

export function getPageFromHash(hash: string): PageId {
  const route = hash.replace(/^#\/?/, "");
  const match = navigationItems.find((item) => item.id === route || (route === "" && item.id === "dashboard"));
  return match?.id ?? "dashboard";
}

export function getRouteFromHash(hash: string): RouteId {
  const route = hash.replace(/^#\/?/, "");
  if (route === "embed") return "embed";
  return getPageFromHash(hash);
}

export function getHashForRoute(route: RouteId): string {
  if (route === "embed") return "#/embed";
  return navigationItems.find((item) => item.id === route)?.hash ?? "#/";
}
