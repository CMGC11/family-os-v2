import type { ReactNode } from 'react';

type PageShellProps = {
  children: ReactNode;
};

export default function PageShell({ children }: PageShellProps) {
  return <section className="pageSection">{children}</section>;
}