import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  detail?: string;
  icon?: ReactNode;
}

export default function MetricCard({ detail, icon, label, value }: MetricCardProps) {
  return (
    <article className="metric-card">
      <div className="metric-head">
        <span>{label}</span>
        {icon}
      </div>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </article>
  );
}
