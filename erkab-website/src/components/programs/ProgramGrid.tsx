import React from 'react';
import { Program } from '@/lib/constants/programs';
import { ProgramCard } from './ProgramCard';

interface ProgramGridProps {
  programs: Program[];
}

export function ProgramGrid({ programs }: ProgramGridProps) {
  return (
    <div className="row g-4">
      {programs.map((program) => (
        <div key={program.id} className="col-12 col-md-6 col-lg-4">
          <ProgramCard program={program} />
        </div>
      ))}
    </div>
  );
}
