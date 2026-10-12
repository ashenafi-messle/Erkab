import { Container } from '@/components/layout/Container';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

export default function Loading() {
  return (
    <div className="section-py">
      <Container>
        <div className="mx-auto" style={{ maxWidth: '800px' }}>
          <LoadingSkeleton rows={5} />
        </div>
      </Container>
    </div>
  );
}
