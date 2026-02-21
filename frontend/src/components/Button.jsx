import { Link } from 'react-router-dom';

const variants = {
  primary:
    'px-4 py-2 bg-primary text-white rounded font-medium hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
  secondary:
    'px-4 py-2 border border-gray-300 rounded font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
  danger:
    'px-4 py-2 bg-error text-white rounded font-medium hover:opacity-90',
};

/**
 * Button or link styled as a button. Use `to` for navigation, `onClick` for actions.
 * @param {'primary' | 'secondary' | 'danger'} [variant='primary']
 * @param {string} [to] - If set, renders a React Router Link
 * @param {() => void} [onClick]
 * @param {'button' | 'submit'} [type='button'] - For native button only
 * @param {boolean} [disabled]
 * @param {React.ReactNode} children
 */
export default function Button({
  variant = 'primary',
  to,
  onClick,
  type = 'button',
  disabled = false,
  children,
  className: classNameProp,
  ...rest
}) {
  const baseClass = variants[variant] ?? variants.primary;
  const className = classNameProp ? `${baseClass} ${classNameProp}` : baseClass;

  if (to != null && to !== '') {
    return (
      <Link to={to} className={className} {...rest}>
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
      {...rest}
    >
      {children}
    </button>
  );
}
