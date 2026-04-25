import type { ReactNode } from 'react';

type ActionCardProps = {
  label: string;
  value: string;
  detail: string;
  variant?: 'dark' | 'light';
  onClick?: () => void;
  children?: ReactNode;
};

export default function ActionCard({
  label,
  value,
  detail,
  variant = 'light',
  onClick,
  children,
}: ActionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={variant === 'dark' ? 'darkActionCard' : 'lightActionCard'}
    >
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
      {children}
    </button>
  );
}