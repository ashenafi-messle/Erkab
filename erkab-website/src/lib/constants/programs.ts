export interface Program {
  id: string;
  slug: string;
  title: string;
  category: 'Software & Technology' | 'Data & AI' | 'Business & Employment' | 'Vocational & Applied';
  duration: string;
  delivery: 'In-Person & Lab' | 'Hybrid' | 'Online & Interactive';
  scholarship: boolean;
  image: string;
  imageAlt: string;
  summary: string;
  description: string;
  skills: string[];
  modules: string[];
  careerPaths: string[];
  prerequisites: string;
}

export const PROGRAMS: Program[] = [
  {
    id: 'prog-1',
    slug: 'web-development',
    title: 'Full-Stack Web Development',
    category: 'Software & Technology',
    duration: '12 Weeks (Full-Time)',
    delivery: 'In-Person & Lab',
    scholarship: true,
    image: '/images/programs/web-development.jpg',
    imageAlt: 'Full-Stack web developer coding responsive web applications on multiple monitors with cyan code overlays in Gondar computer lab',
    summary: 'Build modern, responsive, database-driven web applications using modern web standards, JavaScript/TypeScript, and modern backend frameworks.',
    description: 'The Full-Stack Web Development program at Erkab provides rigorous, project-driven training designed to take students from core computer programming to deploying enterprise-ready web applications. Students work in hands-on computer labs located in Gondar, mastering both frontend interactivity and backend architecture.',
    skills: ['HTML5 & CSS3', 'JavaScript / TypeScript', 'React', 'Node.js & Express', 'REST APIs', 'PostgreSQL', 'Git & CI/CD'],
    modules: [
      'Foundations of Modern Web & Responsive Design',
      'Advanced JavaScript & Asynchronous Programming',
      'Client-Side Architecture with React',
      'Server-Side Engineering with Node.js & Databases',
      'Security, Authentication, and Cloud Deployment',
      'Capstone Project & Portfolio Defense'
    ],
    careerPaths: ['Junior Full-Stack Developer', 'Frontend Engineer', 'Backend API Specialist', 'Web Solutions Freelancer'],
    prerequisites: 'Basic computer literacy and logical problem-solving aptitude. Passing score on introductory logic assessment.'
  },
  {
    id: 'prog-2',
    slug: 'mobile-development',
    title: 'Full-Stack Mobile Application Development',
    category: 'Software & Technology',
    duration: '12 Weeks (Full-Time)',
    delivery: 'In-Person & Lab',
    scholarship: true,
    image: '/images/programs/mobile-development.jpg',
    imageAlt: 'Mobile app developer building and testing modern cross-platform mobile apps on smartphones with cyan UI wireframes',
    summary: 'Design and deploy native-quality mobile applications for Android and iOS using cross-platform frameworks and robust cloud services.',
    description: 'Mobile devices are the primary bridge to the digital economy across Africa. This program equips young developers to engineer performant, offline-capable mobile applications that solve tangible problems across healthcare, agriculture, fintech, and education.',
    skills: ['React Native', 'Flutter / Dart basics', 'Mobile UI/UX Design', 'Offline Storage', 'REST & GraphQL APIs', 'App Store Deployment'],
    modules: [
      'Mobile Platform Architecture & UI Principles',
      'State Management & Navigation Patterns',
      'Hardware Sensors, Geolocation, and Camera APIs',
      'Local Storage, Offline Sync, and Data Persistence',
      'Backend Integration & Push Notifications',
      'App Store Optimization & Production Release'
    ],
    careerPaths: ['Mobile App Developer', 'Android Specialist', 'Cross-Platform App Engineer'],
    prerequisites: 'Foundational programming knowledge in JavaScript or an object-oriented language.'
  },
  {
    id: 'prog-3',
    slug: 'ai-machine-learning',
    title: 'Artificial Intelligence and Machine Learning',
    category: 'Data & AI',
    duration: '14 Weeks (Full-Time)',
    delivery: 'Hybrid',
    scholarship: true,
    image: '/images/programs/ai-machine-learning.jpg',
    imageAlt: 'AI engineer analyzing interactive 3D deep learning neural network models and tensor graphs with glowing cyan holographic interfaces',
    summary: 'Harness machine learning algorithms, deep learning models, and modern AI tools to build intelligent automated systems.',
    description: 'Learn the mathematical foundations and software implementation of modern AI. Students learn to preprocess real-world data, train classification and prediction models, evaluate model fairness, and deploy AI APIs for production applications.',
    skills: ['Python', 'NumPy & Pandas', 'Scikit-Learn', 'PyTorch / TensorFlow', 'Natural Language Processing', 'Model Deployment'],
    modules: [
      'Applied Mathematics & Python for Machine Learning',
      'Supervised and Unsupervised Learning Algorithms',
      'Neural Networks & Deep Learning Architectures',
      'Natural Language Processing & Language Models',
      'Computer Vision Foundations',
      'AI Ethics, Fairness, and API Deployment'
    ],
    careerPaths: ['Junior ML Engineer', 'AI Solutions Associate', 'Data Intelligence Assistant'],
    prerequisites: 'Comfort with basic linear algebra, statistics, and prior Python coding experience.'
  },
  {
    id: 'prog-4',
    slug: 'data-science',
    title: 'Data Science',
    category: 'Data & AI',
    duration: '12 Weeks (Full-Time)',
    delivery: 'In-Person & Lab',
    scholarship: true,
    image: '/images/programs/data-science.jpg',
    imageAlt: 'Data science practitioner examining statistical scatter plots and business intelligence dashboards across multi-screen monitors',
    summary: 'Transform raw data into strategic insights through statistical analysis, business intelligence, data wrangling, and predictive modeling.',
    description: 'Organizations thrive on evidence-based decision-making. The Erkab Data Science track trains students to collect, clean, analyze, and visualize complex datasets to answer critical development, business, and policy questions.',
    skills: ['SQL & Relational Databases', 'Python & Pandas', 'Data Visualization (PowerBI / Tableau)', 'Exploratory Data Analysis', 'Statistical Inference'],
    modules: [
      'Data Extraction, Cleaning, and Transformation',
      'Advanced SQL Querying & Relational Modeling',
      'Statistical Analysis & Hypothesis Testing',
      'Interactive Dashboards & Data Storytelling',
      'Predictive Analytics for Business Applications',
      'Applied Data Science Industry Capstone'
    ],
    careerPaths: ['Data Analyst', 'Business Intelligence Specialist', 'Research Data Officer'],
    prerequisites: 'Basic math and spreadsheet proficiency; familiarity with programming is an advantage.'
  },
  {
    id: 'prog-5',
    slug: 'cybersecurity',
    title: 'Cybersecurity',
    category: 'Software & Technology',
    duration: '12 Weeks (Full-Time)',
    delivery: 'In-Person & Lab',
    scholarship: true,
    image: '/images/programs/cybersecurity.jpg',
    imageAlt: 'Security analyst monitoring network topologies and firewall defense shields in security operations center with cyan display panels',
    summary: 'Defend systems, networks, and applications against modern digital threats through practical security auditing and defensive engineering.',
    description: 'As Ethiopia expands its digital infrastructure, the demand for cybersecurity practitioners is paramount. Students train in virtual cyber ranges to discover vulnerabilities, implement defensive perimeters, and protect vital organizational assets.',
    skills: ['Network Fundamentals', 'Linux System Administration', 'Vulnerability Assessment', 'Threat Detection', 'Ethical Hacking Principles', 'Security Compliance'],
    modules: [
      'Computer Networking & Protocol Analysis',
      'Operating System Hardening (Linux & Windows)',
      'Threat Modeling & Vulnerability Scanning',
      'Web Application Security & OWASP Top 10',
      'Incident Response & Digital Forensics Basics',
      'Enterprise Security Operations'
    ],
    careerPaths: ['Junior Security Analyst', 'SOC Level 1 Analyst', 'Network Security Associate'],
    prerequisites: 'Basic understanding of computer networks and operating systems.'
  },
  {
    id: 'prog-6',
    slug: 'remote-work',
    title: 'Remote Work and Digital Employment',
    category: 'Business & Employment',
    duration: '8 Weeks (Hybrid)',
    delivery: 'Hybrid',
    scholarship: true,
    image: '/images/programs/remote-work.jpg',
    imageAlt: 'Ethiopian remote work specialist wearing headset collaborating with global cross-functional team in sunlit Gondar co-working hub',
    summary: 'Master the tools, professional communication, freelance platforms, and productivity practices needed for global remote digital careers.',
    description: 'Talent is everywhere, but opportunity has historically been localized. This intensive curriculum bridges the gap between technical skills and global remote employment, guiding learners through international contract negotiation, asynchronous collaboration, and client acquisition.',
    skills: ['Asynchronous Communication', 'Remote Project Tools (Jira, Slack, Notion)', 'Upwork / Freelance Strategy', 'Time Management', 'Digital Portfolios'],
    modules: [
      'Remote Workplace Norms & Cross-Cultural Communication',
      'Profile Building, Portfolios, and Talent Marketplaces',
      'Pitching, Proposal Writing, and Client Interviews',
      'Global Payment Systems, Invoicing, and Tax Compliance',
      'Sustained Productivity and Remote Work Well-being'
    ],
    careerPaths: ['Remote Digital Contractor', 'Virtual Operations Associate', 'Global Freelance Specialist'],
    prerequisites: 'Demonstrated proficiency in at least one technical or digital skill.'
  },
  {
    id: 'prog-7',
    slug: 'entrepreneurship',
    title: 'Business English and Digital Entrepreneurship',
    category: 'Business & Employment',
    duration: '10 Weeks (In-Person)',
    delivery: 'In-Person & Lab',
    scholarship: true,
    image: '/images/programs/digital-entrepreneurship.jpg',
    imageAlt: 'Young Ethiopian entrepreneurs presenting tech business model canvas and financial growth projections around boardroom table',
    summary: 'Develop fluent professional English, business model generation, startup pitching, and the operational skills needed to launch ventures.',
    description: 'Empowering youth to transition from job seekers to venture creators. Students refine high-stakes business communication in English while designing, validating, and testing sustainable micro-enterprises and tech-enabled startups.',
    skills: ['Professional English Fluency', 'Business Model Canvas', 'Financial Projections', 'Pitch Deck Creation', 'Digital Marketing'],
    modules: [
      'High-Impact Business English & Presentation Skills',
      'Opportunity Identification & Customer Discovery',
      'Lean Startup Methodology & Rapid Prototyping',
      'Unit Economics, Budgeting, and Seed Funding',
      'Venture Pitching & Demo Day Presentation'
    ],
    careerPaths: ['Startup Founder', 'Business Development Officer', 'Project Coordinator'],
    prerequisites: 'Intermediate English comprehension and an entrepreneurial mindset.'
  },
  {
    id: 'prog-8',
    slug: 'urban-agriculture',
    title: 'Climate-Smart Urban Agriculture',
    category: 'Vocational & Applied',
    duration: '10 Weeks (Hands-On)',
    delivery: 'In-Person & Lab',
    scholarship: true,
    image: '/images/programs/climate-smart-agriculture.jpg',
    imageAlt: 'Agricultural students in greenhouse monitoring smart vertical hydroponic crops using digital sensor tablet in Gondar',
    summary: 'Apply modern climate-resilient farming techniques, hydroponics, micro-irrigation, and urban space optimization for food security.',
    description: 'Gondar and the Amhara region have tremendous agricultural potential. This course introduces youth to climate-smart agricultural technologies, precision irrigation, vertical farming, and commercial nursery management.',
    skills: ['Hydroponic Systems', 'Drip & Micro-Irrigation', 'Soil Health & Organic Composting', 'Urban Greenhouse Management', 'Agri-Business Distribution'],
    modules: [
      'Principles of Climate-Smart & Regenerative Farming',
      'Soil Management, Composting, and Bio-Fertilizers',
      'Closed-Loop Water Management & Drip Irrigation',
      'Greenhouse & Vertical Urban Farming Design',
      'Produce Storage, Packaging, and Market Linkages'
    ],
    careerPaths: ['Urban Agriculture Manager', 'Agri-Tech Extension Worker', 'Produce Enterprise Operator'],
    prerequisites: 'Open to all motivated youth interested in sustainable agriculture.'
  },
  {
    id: 'prog-9',
    slug: 'manufacturing',
    title: 'Small-Scale Manufacturing',
    category: 'Vocational & Applied',
    duration: '12 Weeks (Workshop)',
    delivery: 'In-Person & Lab',
    scholarship: true,
    image: '/images/programs/small-scale-manufacturing.jpg',
    imageAlt: 'Vocational trainees wearing protective goggles fabricating mechanical assemblies and 3D printing prototypes with CAD blueprint overlays',
    summary: 'Master hands-on mechanical tooling, fabrication, quality control, and scalable production methods for local goods and equipment.',
    description: 'Industrial capacity starts with high-quality local fabrication. Students gain direct workshop experience in precision fabrication, machinery maintenance, quality control standards, and small batch industrial manufacturing.',
    skills: ['Workshop Safety & Blueprint Reading', 'Metal & Wood Fabrication', 'Machinery Operation & Maintenance', 'Quality Assurance', 'Production Costing'],
    modules: [
      'Industrial Safety Protocols & Technical Drafting',
      'Material Selection, Cutting, and Joining Techniques',
      'Precision Measurement & Quality Standards',
      'Equipment Maintenance & Trouble-Shooting',
      'Batch Manufacturing & Small-Scale Workshop Setup'
    ],
    careerPaths: ['Workshop Technician', 'Fabrication Specialist', 'Manufacturing Production Associate'],
    prerequisites: 'Passionate about hands-on craftsmanship and technical problem solving.'
  },
  {
    id: 'prog-10',
    slug: 'content-creation',
    title: 'Content Creation',
    category: 'Business & Employment',
    duration: '8 Weeks (Studio & Lab)',
    delivery: 'Hybrid',
    scholarship: true,
    image: '/images/programs/content-creation.jpg',
    imageAlt: 'Digital content producer in studio with studio microphone, 4K camera, and dual monitors editing video waveforms with cyan audio meters',
    summary: 'Produce professional digital media, video storytelling, audio podcasting, and strategic brand content for digital channels.',
    description: 'Digital narrative is the currency of the modern creative economy. Students develop hands-on skills in video shooting, editing, sound design, graphic communication, and multi-channel storytelling.',
    skills: ['Video Editing (Premiere / DaVinci)', 'Visual Design & Typography', 'Audio Production & Podcasting', 'Social Media Strategy', 'Digital Copyright & Ethics'],
    modules: [
      'Visual Storytelling & Script Development',
      'Camera Operation, Lighting, and Audio Capture',
      'Non-Linear Video Editing & Color Correction',
      'Graphic Design for Social & Web Media',
      'Channel Distribution, Audience Analytics, and Monetization'
    ],
    careerPaths: ['Digital Content Producer', 'Video Editor', 'Social Media Strategist', 'Multimedia Specialist'],
    prerequisites: 'Creative flair, storytelling interest, and basic computer skills.'
  }
];

import { Locale } from '@/lib/i18n/config';
import { AMHARIC_PROGRAM_DATA, AMHARIC_CATEGORY_MAP, AMHARIC_DELIVERY_MAP } from './programsAmharic';

export function getLocalizedProgram(program: Program, locale: Locale): Program {
  if (locale !== 'am') {
    return program;
  }
  const am = AMHARIC_PROGRAM_DATA[program.slug];
  if (!am) {
    return program;
  }
  return {
    ...program,
    ...am,
    category: (AMHARIC_CATEGORY_MAP[program.category] || program.category) as any,
    delivery: (AMHARIC_DELIVERY_MAP[program.delivery] || program.delivery) as any,
  };
}

export function getLocalizedPrograms(programs: Program[], locale: Locale): Program[] {
  return programs.map((p) => getLocalizedProgram(p, locale));
}
