import { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { PageHero } from '@/components/ui/PageHero';
import { TutorApplicationForm } from '@/features/applications/components/TutorApplicationForm';

export const metadata: Metadata = {
  title: 'Apply as an Academic Tutor | Erkab Skills Training Organization',
  description:
    'Join the Erkab Academic Tutoring Network to mentor elementary, high school, and university students in Gondar or online.',
};

export default function TutorApplyPage() {
  return (
    <>
      <PageHero
        badge="ACADEMIC MENTOR NETWORK"
        title="Become an Erkab Academic Tutor"
        description="Share your academic expertise with ambitious students across Gondar. We connect qualified subject experts with motivated learners for in-person and online tutoring."
      />

      <section className="section-py section-bg-white pt-0">
        <Container>
          <TutorApplicationForm />
        </Container>
      </section>
    </>
  );
}
