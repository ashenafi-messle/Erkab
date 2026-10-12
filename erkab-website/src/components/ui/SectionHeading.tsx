import React from 'react';

interface SectionHeadingProps {
  tag?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'start';
  className?: string;
  tagColor?: 'lime' | 'blue' | 'cyan';
}

export function SectionHeading({
  tag,
  title,
  subtitle,
  align = 'center',
  className = '',
  tagColor = 'blue',
}: SectionHeadingProps) {
  const badgeClass =
    tagColor === 'lime' ? 'badge-lime' : tagColor === 'cyan' ? 'badge-cyan' : 'badge-blue';

  return (
    <div className={`section-header ${align === 'start' ? 'text-start' : ''} ${className}`}>
      {tag && <span className={`erkab-badge ${badgeClass}`}>{tag}</span>}
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
}
