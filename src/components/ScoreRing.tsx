import type { CSSProperties } from "react";

interface ScoreRingProps {
  label: string;
  score: number;
  tone?: "cyan" | "green" | "amber" | "rose" | "violet";
}

export default function ScoreRing({ label, score, tone = "cyan" }: ScoreRingProps) {
  const percentage = Math.max(0, Math.min(100, score));

  return (
    <div className={`score-ring tone-${tone}`} style={{ "--score": `${percentage}%` } as CSSProperties}>
      <div className="score-visual">
        <span>{score}</span>
      </div>
      <p>{label}</p>
    </div>
  );
}
