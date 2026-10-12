import React from 'react';
import { Container } from '../layout/Container';

interface PageHeroProps {
  badge?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function PageHero({ badge, title, description, children }: PageHeroProps) {
  return (
    <section className="subpage-hero">
      <Container>
        <div className="row align-items-center">
          <div className="col-lg-8">
            {badge && <span className="erkab-badge badge-lime-on-dark">{badge}</span>}
            <h1 className="subpage-hero-title">{title}</h1>
            <p className="subpage-hero-desc">{description}</p>
            {children && <div className="mt-3">{children}</div>}
          </div>
        </div>
      </Container>
    </section>
  );
}
