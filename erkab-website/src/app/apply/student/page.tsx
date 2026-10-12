import { Metadata } from 'next';
import { Suspense } from 'react';
import { Container } from '@/components/layout/Container';
import { PageHero } from '@/components/ui/PageHero';
import { StudentApplicationForm } from '@/features/applications/components/StudentApplicationForm';

export const metadata: Metadata = {
  title: 'Student Scholarship Application | Erkab Skills Training Organization',
  description:
    'Complete your student application for Erkab tuition-free vocational scholarship cohorts in Gondar, Ethiopia.',
};

export default function StudentApplyPage() {
  return (
    <>
      <PageHero
        badge="STUDENT ADMISSIONS"
        title="Student Scholarship Application"
        description="Please fill out all steps carefully. Ensure you have your Education Certificate, National ID, and One-Page Project Idea Proposal ready to upload."
      />

      <section className="section-py section-bg-white pt-0">
        <Container>
          <Suspense fallback={<div className="text-center py-5">Loading application form...</div>}>
            <StudentApplicationForm />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
