export interface NavItem {
  key: string;
  label: string;
  href: string;
  children?: NavItem[];
}

export const MAIN_NAVIGATION: NavItem[] = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'about', label: 'About Us', href: '/about' },
  { key: 'programs', label: 'Training Programs', href: '/programs' },
  { key: 'tutoring', label: 'Tutoring', href: '/tutoring' },
  { key: 'trainer', label: 'Become a Trainer', href: '/apply/trainer' },
  {
    key: 'more',
    label: 'More',
    href: '#',
    children: [
      { key: 'partnerships', label: 'Partnerships', href: '/partnerships' },
      { key: 'donations', label: 'Donations', href: '/donations' },
      { key: 'news', label: 'News & Updates', href: '/news' },
      { key: 'contact', label: 'Contact', href: '/contact' },
    ],
  },
];

export interface FooterLink {
  label: string;
  labelAm: string;
  href: string;
}

export const FOOTER_PROGRAMS: FooterLink[] = [
  { label: 'Full-Stack Web Development', labelAm: 'ሙሉ-ስታክ ዌብ ዲቨሎፕመንት', href: '/programs/web-development' },
  { label: 'Full-Stack Mobile Apps', labelAm: 'ሙሉ-ስታክ ሞባይል አፕሊኬሽን', href: '/programs/mobile-development' },
  { label: 'AI & Machine Learning', labelAm: 'አርቴፊሻል ኢንተለጀንስ እና ማሽን ለርኒንግ', href: '/programs/ai-machine-learning' },
  { label: 'Data Science', labelAm: 'ዳታ ሳይንስ እና አናሊቲክስ', href: '/programs/data-science' },
  { label: 'Cybersecurity', labelAm: 'ሳይበር ሴኪዩሪቲ እና ሲስተምስ', href: '/programs/cybersecurity' },
  { label: 'Remote Work & Digital Jobs', labelAm: 'ሪሞት ስራ እና ዲጂታል ገበያ', href: '/programs/remote-work' },
];

export const FOOTER_ORGANIZATION: FooterLink[] = [
  { label: 'About Erkab', labelAm: 'ስለ እርካብ', href: '/about' },
  { label: 'How It Works', labelAm: 'የትግበራ ሂደት', href: '/#how-it-works' },
  { label: 'Tutoring Services', labelAm: 'የአጋዥ ትምህርት አገልግሎቶች', href: '/tutoring' },
  { label: 'Partner With Us', labelAm: 'አብረውን ይስሩ (አጋርነት)', href: '/partnerships' },
  { label: 'Support & Donations', labelAm: 'ድጋፍ እና ልገሳ', href: '/donations' },
  { label: 'Contact Us', labelAm: 'ያግኙን', href: '/contact' },
];

export const FOOTER_LEGAL: FooterLink[] = [
  { label: 'Privacy Policy', labelAm: 'የግላዊነት ፖሊሲ', href: '/privacy' },
  { label: 'Terms of Service', labelAm: 'የአገልግሎት ደንቦች', href: '/terms' },
];
