import { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { PageHero } from '@/components/ui/PageHero';
import { TrainerApplicationForm } from '@/features/applications/components/TrainerApplicationForm';

export const metadata: Metadata = {
  title: 'Become a Trainer / Mentor | Erkab Skills Training Organization',
  description:
    'Apply to join Erkab Skills Training Organization as an instructor or industry mentor in Gondar, Ethiopia.',
};

export default function TrainerApplyPage() {
  return (
    <>
      <PageHero
        badge="INSTRUCTOR RECRUITMENT"
        title="Become an Erkab Trainer & Mentor"
        description="Inspire and guide the next generation of Ethiopian engineers, data analysts, and craftsmen. We value practical engineering experience and passion for youth empowerment."
      />

      <section className="section-py section-bg-white pt-0">
        <Container>
          <TrainerApplicationForm />
        </Container>
      </section>
    </>
  );
}
