import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: ReactNode;
}

export default function Card({ className = '', children, ...rest }: CardProps) {
  const baseClass = 'bg-surface rounded-lg border border-gray-200 shadow-sm';
  const combined = className ? `${baseClass} ${className}` : baseClass;
  return (
    <div className={combined} {...rest}>
      {children}
    </div>
  );
}
