import type { ReactNode } from 'react';

type SectionHeaderProps = {
  title: string;
  action?: ReactNode;
};

export default function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="sectionHeader">
      <h3>{title}</h3>
      {action}
    </div>
  );
}