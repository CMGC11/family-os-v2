import type { ReactNode } from 'react';
import { useCreateAction } from '../../app/CreateActionContext';
import { familyMembers } from '../../data/mockFamilyData';

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  right?: ReactNode;
};

export default function PageHeader({ eyebrow, title, subtitle, right }: PageHeaderProps) {
  const { openCreateSheet } = useCreateAction();

  return (
    <header className="pageHeader">
      <div className="headerTop">
        <div className="avatarStack" aria-label="Family members">
          {familyMembers.map((member) => (
            <div key={member.name} className={`avatar ${member.color}`} title={`${member.name} · ${member.role}`}>
              {member.name[0]}
            </div>
          ))}
        </div>

        {right ?? (
          <button type="button" className="addButton" onClick={openCreateSheet}>
            + Add
          </button>
        )}
      </div>

      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="subtitle">{subtitle}</p>
    </header>
  );
}