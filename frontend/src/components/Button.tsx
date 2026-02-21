import { Link } from 'react-router-dom';
import type { MouseEventHandler, ReactNode } from 'react';

const variants = {
  primary:
    'inline-flex items-center justify-center min-h-[44px] px-4 py-3 sm:py-2 bg-primary text-white rounded font-medium hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
  secondary:
    'inline-flex items-center justify-center min-h-[44px] px-4 py-3 sm:py-2 border border-gray-300 rounded font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
  danger:
    'inline-flex items-center justify-center min-h-[44px] px-4 py-3 sm:py-2 bg-error text-white rounded font-medium hover:opacity-90',
};

type ButtonVariant = keyof typeof variants;

interface ButtonProps {
  variant?: ButtonVariant;
  to?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

export default function Button({
  variant = 'primary',
  to,
  onClick,
  type = 'button',
  disabled = false,
  children,
  className: classNameProp,
}: ButtonProps) {
  const baseClass = variants[variant] ?? variants.primary;
  const className = classNameProp ? `${baseClass} ${classNameProp}` : baseClass;

  if (to != null && to !== '') {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
}
