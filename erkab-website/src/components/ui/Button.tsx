import React from 'react';
import Link from 'next/link';

export type ButtonVariant = 'lime' | 'primary' | 'white' | 'outline-white' | 'outline-blue';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  href?: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function Button({
  variant = 'lime',
  href,
  children,
  className = '',
  icon,
  ...props
}: ButtonProps) {
  const variantClass = `btn-erkab-${variant}`;
  const classes = `btn-erkab ${variantClass} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
        {icon && <span className="ms-1 d-inline-flex align-items-center">{icon}</span>}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
      {icon && <span className="ms-1 d-inline-flex align-items-center">{icon}</span>}
    </button>
  );
}
