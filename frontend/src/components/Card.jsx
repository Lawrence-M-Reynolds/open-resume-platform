/**
 * Card container with shared surface styling. Pass className for padding and layout.
 */
export default function Card({ className = '', children, ...rest }) {
  const baseClass = 'bg-surface rounded-lg border border-gray-200 shadow-sm';
  const combined = className ? `${baseClass} ${className}` : baseClass;
  return (
    <div className={combined} {...rest}>
      {children}
    </div>
  );
}
