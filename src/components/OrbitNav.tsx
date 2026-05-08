import { Activity, BarChart3, Compass, Lightbulb, PenLine, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { navigationItems } from "../lib/navigation";
import type { PageId } from "../lib/navigation";

const icons = {
  dashboard: BarChart3,
  analyze: Activity,
  rewrite: PenLine,
  insights: Compass,
  ideas: Lightbulb,
  integration: ShieldCheck
};

interface OrbitNavProps {
  activePage: PageId;
  onSelect: (page: PageId) => void;
}

export default function OrbitNav({ activePage, onSelect }: OrbitNavProps) {
  const [docked, setDocked] = useState(false);
  const dockTimer = useRef<number | null>(null);
  const activeItem = useMemo(
    () => navigationItems.find((item) => item.id === activePage) ?? navigationItems[0],
    [activePage]
  );

  useEffect(() => {
    return () => {
      if (dockTimer.current) window.clearTimeout(dockTimer.current);
    };
  }, []);

  const scheduleDock = () => {
    if (dockTimer.current) window.clearTimeout(dockTimer.current);
    dockTimer.current = window.setTimeout(() => setDocked(true), 760);
  };

  const selectPage = (page: PageId) => {
    setDocked(false);
    onSelect(page);
    scheduleDock();
  };

  const expand = () => {
    if (dockTimer.current) window.clearTimeout(dockTimer.current);
    setDocked(false);
  };

  const collapse = () => {
    if (docked) return;
    scheduleDock();
  };

  return (
    <>
      <nav
        aria-label="Section orbit"
        className={`orbit-nav ${docked ? "is-docked" : ""}`}
        onFocus={expand}
        onMouseEnter={expand}
        onMouseLeave={collapse}
        style={{ "--active-angle": `${activeItem.angle}deg` } as CSSProperties}
      >
        <div className="orbit-status">
          <span />
          Local demo
        </div>
        <div className="orbit-wheel">
          <div className="orbit-ring" aria-hidden="true" />
          <div className="orbit-sweep" aria-hidden="true" />
          <div className="orbit-marker" aria-hidden="true" />

          <button className="orbit-center" type="button" onClick={expand} aria-label="Change section">
            <Sparkles size={18} />
            <strong>{activeItem.centerLabel}</strong>
            <span>{docked ? "Sections" : "Growth signal"}</span>
          </button>

          {navigationItems.map((item) => {
            const Icon = icons[item.id];
            const active = item.id === activePage;
            return (
              <button
                aria-current={active ? "page" : undefined}
                aria-label={`Open ${item.label}`}
                className={`orbit-node ${active ? "is-active" : ""}`}
                key={item.id}
                onClick={() => selectPage(item.id)}
                style={{ "--orbit-angle": `${item.angle}deg` } as CSSProperties}
                type="button"
              >
                <Icon size={16} />
                <span>{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>
      <button
        className={`orbit-dock-handle ${docked ? "is-visible" : ""}`}
        type="button"
        onClick={expand}
        aria-label="Change section"
      >
        Sections
      </button>
    </>
  );
}
