# Erkab Edtech Public Website (`erkab-public-website`)

The official public-facing website for **Erkab Skills Training Organization** located in Gondar, Amhara Region, Ethiopia.

- **Main Slogan:** From Skills to Opportunity.
- **Supporting Message:** Global Standards. Local Impact. Vocational Excellence.

The platform empowers young people through practical technology bootcamps, merit-based tuition-free scholarships, entrepreneurship, digital employment preparation, community tutoring, and strategic partnerships.

---

## 1. Technology Stack

- **Framework:** Next.js 16 (App Router)
- **UI & Logic:** React 19 & TypeScript
- **Styling:** Bootstrap 5.3 CSS + Custom Organized Brand CSS (`variables.css`, `layout.css`, `components.css`, `responsive.css`)
- **Icons:** Lucide React
- **Internationalization:** English & Amharic bilingual switch with preference persistence
- **Architecture:** Zero Tailwind CSS, centralized API client layer ready for Node.js + Express backend integration, accessible server & client components.

---

## 2. Getting Started

### Prerequisites

- Node.js 18.18+ or 20+
- npm 9+

### Installation

Clone the repository and install dependencies:

```bash
cd erkab-website
npm install
```

### Environment Configuration

Copy `.env.example` to create your local `.env.local`:

```bash
cp .env.example .env.local
```

Default configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Running Locally

To run the local development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

To build the optimized production bundle and verify TypeScript/ESLint compliance:

```bash
npm run build
```

To test the production build locally:

```bash
npm run start
```

---

## 3. Directory Structure

```text
erkab-website/
├── public/                 # Static assets, branding icons, and imagery
├── src/
│   ├── app/                # Next.js App Router routes
│   │   ├── about/          # Mission, Vision, and Institutional Values
│   │   ├── apply/          # Student & Trainer Application gateways
│   │   │   ├── student/    # Multi-step Student Scholarship application form
│   │   │   ├── trainer/    # Multi-step Trainer & Mentor recruitment form
│   │   │   └── success/    # Application confirmation & official reference
│   │   ├── donations/      # Philanthropic support & scholarship sponsorship
│   │   ├── news/           # Admissions announcements & cohort press
│   │   │   └── [slug]/     # Dynamic announcement article view
│   │   ├── partnerships/   # Corporate, equipment, and hiring linkages
│   │   ├── privacy/        # Privacy policy & data protection protocols
│   │   ├── programs/       # All 10 Vocational training tracks catalog
│   │   │   └── [slug]/     # Dynamic curriculum & prerequisite details
│   │   ├── terms/          # Terms of service & scholarship admissions policy
│   │   ├── tutoring/       # Academic support (Online & In-Person Gondar)
│   │   ├── globals.css     # Global layout and Bootstrap imports
│   │   ├── layout.tsx      # Root layout, Header, Footer, LanguageProvider
│   │   ├── page.tsx        # Homepage containing all 12 core sections
│   │   ├── not-found.tsx   # 404 page
│   │   ├── loading.tsx     # Loading skeleton
│   │   ├── error.tsx       # Error boundary
│   │   ├── robots.ts       # Search engine crawler policies
│   │   └── sitemap.ts      # Automated dynamic SEO sitemap
│   ├── components/
│   │   ├── forms/          # FormField, FileUploadField, FormProgress, ApplicationSummary
│   │   ├── home/           # HeroSection, PartnerStrip, MissionSection, WhyErkab, ImpactSection, HowItWorks, TutoringSection, CallToAction, AnnouncementPreview
│   │   ├── layout/         # SiteHeader, MobileNavigation, SiteFooter, Container
│   │   ├── programs/       # ProgramCard, ProgramGrid
│   │   └── ui/             # Button, SectionHeading, PageHero, LoadingSkeleton, EmptyState, ErrorState
│   ├── features/           # Feature service modules (applications, programs, tutoring, partnerships, donations, contact)
│   ├── lib/
│   │   ├── api/            # Centralized API client, endpoints, and error handling
│   │   ├── constants/      # Navigation links and detailed 10-program catalog
│   │   └── i18n/           # English and Amharic dictionaries & context
│   └── styles/
│       ├── variables.css   # Brand color tokens, radii, gradients, and shadows
│       ├── layout.css      # Header, drawer, containers, and footer
│       ├── components.css  # Buttons, cards, badges, and form elements
│       └── responsive.css  # Mobile-first overrides and touch optimizations
├── .env.example            # Environment template
└── README.md
```

---

## 4. Mobile Testing & Responsive Validation

The platform is engineered mobile-first to ensure accessibility on small Android devices and slower networks:

1. Open Chrome DevTools (`F12` or `Ctrl+Shift+I`).
2. Toggle the Device Toolbar (`Ctrl+Shift+M`).
3. Test against mandatory viewport widths:
   - **320px** (Ultra-compact screens)
   - **360px** (Standard Android / Galaxy)
   - **375px** (iPhone SE)
   - **390px** (iPhone 13/14/15)
   - **430px** (iPhone Pro Max)
   - **768px** (Tablets)
   - **1024px** (Laptops)
   - **1280px & 1440px** (Desktops)
4. Ensure:
   - Zero horizontal overflow (`overflow-x: hidden`).
   - Touch targets are at least 44px high.
   - File uploads allow mobile tap-to-browse.
   - Text remains high contrast and legible.
