import { HeroSection } from '@/components/home/HeroSection';
import { ImageShowcase3D } from '@/components/home/ImageShowcase3D';
import { MissionSection } from '@/components/home/MissionSection';
import { PartnerStrip } from '@/components/home/PartnerStrip';
import { ProgramPreview } from '@/components/home/ProgramPreview';
import { WhyErkab } from '@/components/home/WhyErkab';
import { HowItWorks } from '@/components/home/HowItWorks';
import { CommunityHighlights } from '@/components/home/CommunityHighlights';
import { AnnouncementPreview } from '@/components/home/AnnouncementPreview';

export default function HomePage() {
  return (
    <>
      {/* 1. Hero with Cinematic Photography & Actions */}
      <HeroSection />

      {/* 2. NEW: Automatic 3D image showcase */}
      <ImageShowcase3D />

      {/* 3. Existing Mission & Purpose section */}
      <MissionSection />

      {/* 4. Slim Partner & Community Strip */}
      <PartnerStrip />

      {/* 4. Featured Training Programs (Curated set + View All) */}
      <ProgramPreview />

      {/* 5. Compact Why Erkab Feature Row */}
      <WhyErkab />

      {/* 6. Brief Application Process */}
      <HowItWorks />

      {/* 7. Combined Tutoring, Partnerships, and Donation Highlights */}
      <CommunityHighlights />

      {/* 8. Recent Announcements */}
      <AnnouncementPreview />
    </>
  );
}
