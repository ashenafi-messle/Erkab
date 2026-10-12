import React from 'react';
import { Check } from 'lucide-react';

interface FormProgressProps {
  steps: string[];
  currentStep: number;
}

export function FormProgress({ steps, currentStep }: FormProgressProps) {
  return (
    <div className="step-progress-bar">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isCompleted = currentStep > stepNumber;
        const isActive = currentStep === stepNumber;

        return (
          <div key={label} className="step-progress-item">
            <div
              className={`step-circle ${
                isCompleted ? 'completed' : isActive ? 'active' : ''
              }`}
            >
              {isCompleted ? <Check size={18} /> : stepNumber}
            </div>
            <span className={`step-label ${isActive ? 'active' : ''}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
