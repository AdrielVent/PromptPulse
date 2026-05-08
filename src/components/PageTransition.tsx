import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  pageKey: string;
}

export default function PageTransition({ children, pageKey }: PageTransitionProps) {
  return (
    <div className="page-transition" data-page={pageKey}>
      {children}
    </div>
  );
}
