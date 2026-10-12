import { Pool } from 'pg';
import 'dotenv/config';

const PROGRAMS_DATA = [
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
    skills: JSON.stringify(['HTML5 & CSS3', 'JavaScript / TypeScript', 'React', 'Node.js & Express', 'REST APIs', 'PostgreSQL', 'Git & CI/CD']),
    modules: JSON.stringify([
      'Foundations of Modern Web & Responsive Design',
      'Advanced JavaScript & Asynchronous Programming',
      'Client-Side Architecture with React',
      'Server-Side Engineering with Node.js & Databases',
      'Security, Authentication, and Cloud Deployment',
      'Capstone Project & Portfolio Defense'
    ]),
    careerPaths: JSON.stringify(['Junior Full-Stack Developer', 'Frontend Engineer', 'Backend API Specialist', 'Web Solutions Freelancer']),
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
    skills: JSON.stringify(['React Native', 'Flutter / Dart basics', 'Mobile UI/UX Design', 'Offline Storage', 'REST & GraphQL APIs', 'App Store Deployment']),
    modules: JSON.stringify([
      'Mobile Platform Architecture & UI Principles',
      'State Management & Navigation Patterns',
      'Hardware Sensors, Geolocation, and Camera APIs',
      'Cloud Synchronization & Offline-First Persistence',
      'Testing, Performance Profiling, and Publishing',
      'Mobile Capstone Defense'
    ]),
    careerPaths: JSON.stringify(['Cross-Platform Mobile Engineer', 'Android / iOS App Developer', 'Mobile Solutions Contractor']),
    prerequisites: 'Prior familiarity with JavaScript or object-oriented programming concepts.'
  },
  {
    id: 'prog-3',
    slug: 'data-science',
    title: 'Data Science & Analytics',
    category: 'Data & AI',
    duration: '12 Weeks (Full-Time)',
    delivery: 'In-Person & Lab',
    scholarship: true,
    image: '/images/programs/data-science.jpg',
    imageAlt: 'Data science student analyzing data visual dashboards, statistical charts, and machine learning pipelines with cyan visual overlays',
    summary: 'Analyze complex datasets, generate predictive business intelligence, and construct actionable visual dashboards using Python and SQL.',
    description: 'Organizations and public institutions are overwhelmed with data but starved for actionable intelligence. This program trains analytical thinkers to extract truth from messy data, automate reporting, and forecast trends using statistical modeling.',
    skills: JSON.stringify(['Python (Pandas, NumPy)', 'Advanced SQL Queries', 'Data Visualization (PowerBI / Seaborn)', 'Exploratory Data Analysis', 'Statistical Inference', 'Predictive Modeling']),
    modules: JSON.stringify([
      'Data Extraction, Cleaning, and Wrangling with Python',
      'Relational Database Modeling & Advanced SQL',
      'Exploratory Analysis & Business Storytelling',
      'Introduction to Machine Learning & Forecasting',
      'Automated Data Pipelines & Dashboard Deployment',
      'Applied Industry Analytics Defense'
    ]),
    careerPaths: JSON.stringify(['Junior Data Analyst', 'Business Intelligence Specialist', 'Data Operations Associate']),
    prerequisites: 'High school mathematics proficiency and analytical mindset.'
  },
  {
    id: 'prog-4',
    slug: 'ai-machine-learning',
    title: 'Artificial Intelligence & Machine Learning',
    category: 'Data & AI',
    duration: '12 Weeks (Full-Time)',
    delivery: 'In-Person & Lab',
    scholarship: true,
    image: '/images/programs/ai-machine-learning.jpg',
    imageAlt: 'AI student working on neural network model graphs and computational graphs with futuristic cyan nodes in modern technology laboratory',
    summary: 'Develop, fine-tune, and deploy intelligent machine learning models and computer vision pipelines to solve local societal challenges.',
    description: 'Artificial Intelligence is revolutionizing every industry. This advanced track trains engineers in the math, tools, and ethical frameworks required to build computer vision, natural language, and predictive systems tailored to Ethiopian contexts.',
    skills: JSON.stringify(['Machine Learning Algorithms', 'Deep Learning & Neural Networks', 'PyTorch / TensorFlow', 'Computer Vision Basics', 'Model Evaluation & MLOps', 'Ethical AI Principles']),
    modules: JSON.stringify([
      'Foundations of Linear Algebra & Probability for AI',
      'Supervised & Unsupervised Learning Algorithms',
      'Deep Neural Networks & Representation Learning',
      'Computer Vision & Practical Audio/Text Processing',
      'Model Optimization, Quantization, and Edge Deployment',
      'Applied AI Capstone Project'
    ]),
    careerPaths: JSON.stringify(['Machine Learning Engineer Intern', 'AI Solutions Developer', 'Computer Vision Specialist']),
    prerequisites: 'Strong mathematical foundation (algebra/calculus) and prior Python programming proficiency.'
  },
  {
    id: 'prog-5',
    slug: 'cybersecurity',
    title: 'Cybersecurity Fundamentals',
    category: 'Software & Technology',
    duration: '10 Weeks (Full-Time)',
    delivery: 'In-Person & Lab',
    scholarship: true,
    image: '/images/programs/cybersecurity.jpg',
    imageAlt: 'Cybersecurity student monitoring security operations center with network threat maps and encrypted digital locks with cyan security shield',
    summary: 'Defend organizational networks, assess vulnerabilities, and master modern security hygiene across infrastructure and web platforms.',
    description: 'As Ethiopia expands digital banking, government portals, and connected businesses, protecting sensitive infrastructure is vital. This program trains defensive cybersecurity technicians who can safeguard critical systems against real-world threats.',
    skills: JSON.stringify(['Network Protocols & Routing', 'Linux System Administration', 'Threat Detection & SIEM', 'Vulnerability Assessment', 'Cryptography Fundamentals', 'Incident Response']),
    modules: JSON.stringify([
      'TCP/IP Networking & Packet Inspection',
      'Hardening Linux & Windows Operating Systems',
      'Identity Management, Access Control, and Encryption',
      'Web Application Vulnerability Scanning (OWASP Top 10)',
      'Security Operations, Incident Handling, and Forensics',
      'Defensive Lab Simulation Defense'
    ]),
    careerPaths: JSON.stringify(['Junior SOC Analyst', 'Network Security Specialist', 'Information Security Administrator']),
    prerequisites: 'Foundational computer hardware and operating system understanding.'
  },
  {
    id: 'prog-6',
    slug: 'remote-work-freelancing',
    title: 'Remote Work & Freelancing Mastery',
    category: 'Business & Employment',
    duration: '8 Weeks (Full-Time)',
    delivery: 'In-Person & Lab',
    scholarship: true,
    image: '/images/programs/remote-work.jpg',
    imageAlt: 'Young Ethiopian remote professional collaborating with international team over video call with global world map in bright modern workstation',
    summary: 'Master the technical workflows, international client communication, and digital platforms needed to secure high-paying global remote roles.',
    description: 'Geography should never limit economic opportunity. This intensive program bridges local talent into global employment, teaching students how to optimize freelance portfolios, negotiate contracts, navigate international payment rails, and communicate effectively with global clients.',
    skills: JSON.stringify(['Global Freelance Marketplaces (Upwork/Fiverr)', 'Remote Communication & Collaboration Tools', 'Proposal Writing & Client Pitching', 'Cross-Cultural Professional Etiquette', 'Tax, Invoicing, and International Payments', 'Personal Portfolio Branding']),
    modules: JSON.stringify([
      'Navigating the Global Remote Economy',
      'Building High-Converting Freelance Profiles & Portfolios',
      'Client Outreach, Proposal Crafting, and Negotiation',
      'Asynchronous Communication & Project Management',
      'Financial Management, Invoicing, and FX Compliances',
      'Live Client Acquisition Challenge'
    ]),
    careerPaths: JSON.stringify(['International Freelancer', 'Virtual Project Assistant', 'Remote Operations Coordinator']),
    prerequisites: 'Demonstrated proficiency in at least one digital skill (design, writing, coding, or data entry) and fluent professional English.'
  },
  {
    id: 'prog-7',
    slug: 'entrepreneurship',
    title: 'Entrepreneurship & Innovation',
    category: 'Business & Employment',
    duration: '10 Weeks (Full-Time)',
    delivery: 'In-Person & Lab',
    scholarship: true,
    image: '/images/programs/entrepreneurship.jpg',
    imageAlt: 'Young tech entrepreneurs pitching startup concept in incubator conference room with investor presentation on whiteboard',
    summary: 'Transform innovative ideas into sustainable ventures through market validation, financial modeling, and venture pitching.',
    description: 'Erkab believes in empowering youth to become job creators, not just job seekers. This incubator-style course guides aspiring founders through customer discovery, minimum viable product (MVP) design, financial forecasting, and pitching to investors.',
    skills: JSON.stringify(['Lean Startup Methodology', 'Customer Discovery & Market Sizing', 'Financial Modeling & Unit Economics', 'Business Model Canvas', 'Investor Pitch Deck Presentation', 'Legal Registration & Compliance in Ethiopia']),
    modules: JSON.stringify([
      'Problem Identification & Human-Centered Design',
      'Market Validation & Rapid Prototyping (MVP)',
      'Pricing Strategies, Revenue Models, and Unit Economics',
      'Marketing Channels & Customer Acquisition Strategy',
      'Legal Structures, Tax Compliance, and Operations',
      'Erkab Demo Day & Venture Pitch Defense'
    ]),
    careerPaths: JSON.stringify(['Startup Founder', 'Small Business Owner', 'Venture Development Associate']),
    prerequisites: 'A concrete innovative idea or demonstrable commitment to launching an enterprise.'
  },
  {
    id: 'prog-8',
    slug: 'urban-agriculture',
    title: 'Climate-Smart Urban Agriculture',
    category: 'Vocational & Applied',
    duration: '10 Weeks (Field & Lab)',
    delivery: 'In-Person & Lab',
    scholarship: true,
    image: '/images/programs/urban-agriculture.jpg',
    imageAlt: 'Agricultural technician examining smart vertical hydroponic farming setup and greenhouse sensor data with lush green crops',
    summary: 'Implement modern vertical farming, hydroponics, and water-efficient greenhouse techniques for urban food resilience.',
    description: 'Combining agricultural traditions with technological innovation, this applied course equips youth to build climate-resilient micro-farms, hydroponic arrays, and soil-less cultivation setups in urban and peri-urban Gondar.',
    skills: JSON.stringify(['Hydroponic & Aeroponic System Assembly', 'Nutrient Solution Chemistry', 'Drip Irrigation Automation', 'Greenhouse Climate Optimization', 'Pest Management & Organic Certification', 'Agri-Business Value Chain Linking']),
    modules: JSON.stringify([
      'Introduction to Controlled Environment Agriculture',
      'Hydroponic Mechanics, Pumps, and Sensor Monitoring',
      'Crop Selection, Seedling Propagation, and Plant Health',
      'Post-Harvest Handling, Packaging, and Food Safety',
      'Urban Farm Financial Feasibility & Direct-to-Consumer Sales',
      'Greenhouse Prototype Defense'
    ]),
    careerPaths: JSON.stringify(['Urban Farm Manager', 'Hydroponic System Technician', 'Agri-Tech Enterprise Operator']),
    prerequisites: 'Interest in applied environmental sciences, plant biology, or commercial food production.'
  },
  {
    id: 'prog-9',
    slug: 'manufacturing-assembly',
    title: 'Light Manufacturing & Assembly',
    category: 'Vocational & Applied',
    duration: '12 Weeks (Workshop & Lab)',
    delivery: 'In-Person & Lab',
    scholarship: true,
    image: '/images/programs/manufacturing.jpg',
    imageAlt: 'Technical manufacturing student assembling precision electronic components with soldering station and safety equipment',
    summary: 'Gain practical expertise in electronics assembly, fabrication tools, quality assurance, and workshop safety standards.',
    description: 'Industrial development starts with hands-on precision. This hands-on workshop training prepares technicians in component assembly, mechanical prototyping, electrical soldering, and industrial quality control standards.',
    skills: JSON.stringify(['Electronics Soldering & Circuit Testing', 'CAD Modeling for Prototyping', 'Precision Measuring & Tolerance Inspection', 'Workshop Safety & Equipment Maintenance', 'Quality Assurance & ISO Workflow Basics', 'Assembly Line Coordination']),
    modules: JSON.stringify([
      'Occupational Health, Safety, and Workshop Standards',
      'Reading Engineering Schematics & Technical Blueprints',
      'Electronic Component Soldering & Diagnostic Testing',
      'Mechanical Assembly & Fastening Techniques',
      'Quality Control, Defect Tracking, and Batch Testing',
      'Functional Assembly Capstone Defense'
    ]),
    careerPaths: JSON.stringify(['Assembly Technician', 'Quality Control Inspector', 'Light Manufacturing Supervisor']),
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
    skills: JSON.stringify(['Video Editing (Premiere / DaVinci)', 'Visual Design & Typography', 'Audio Production & Podcasting', 'Social Media Strategy', 'Digital Copyright & Ethics']),
    modules: JSON.stringify([
      'Visual Storytelling & Script Development',
      'Camera Operation, Lighting, and Audio Capture',
      'Non-Linear Video Editing & Color Correction',
      'Graphic Design for Social & Web Media',
      'Channel Distribution, Audience Analytics, and Monetization'
    ]),
    careerPaths: JSON.stringify(['Digital Content Producer', 'Video Editor', 'Social Media Strategist', 'Multimedia Specialist']),
    prerequisites: 'Creative flair, storytelling interest, and basic computer skills.'
  }
];

export async function seedPrograms() {
  const pool = new Pool({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Seeding training programs into database...');
    for (const prog of PROGRAMS_DATA) {
      await pool.query(
        `INSERT INTO "public"."TrainingProgram" (
          "id", "slug", "title", "category", "duration", "delivery", "scholarship",
          "image", "imageAlt", "summary", "description", "skills", "modules",
          "careerPaths", "prerequisites", "isPublished", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW()
        ) ON CONFLICT ("id") DO UPDATE SET
          "slug" = EXCLUDED."slug",
          "title" = EXCLUDED."title",
          "category" = EXCLUDED."category",
          "duration" = EXCLUDED."duration",
          "delivery" = EXCLUDED."delivery",
          "scholarship" = EXCLUDED."scholarship",
          "image" = EXCLUDED."image",
          "imageAlt" = EXCLUDED."imageAlt",
          "summary" = EXCLUDED."summary",
          "description" = EXCLUDED."description",
          "skills" = EXCLUDED."skills",
          "modules" = EXCLUDED."modules",
          "careerPaths" = EXCLUDED."careerPaths",
          "prerequisites" = EXCLUDED."prerequisites",
          "isPublished" = EXCLUDED."isPublished",
          "updatedAt" = NOW();`,
        [
          prog.id,
          prog.slug,
          prog.title,
          prog.category,
          prog.duration,
          prog.delivery,
          prog.scholarship,
          prog.image,
          prog.imageAlt,
          prog.summary,
          prog.description,
          prog.skills,
          prog.modules,
          prog.careerPaths,
          prog.prerequisites,
          true
        ]
      );
    }
    console.log(`Successfully seeded ${PROGRAMS_DATA.length} training programs.`);

    // Seed default donation campaigns
    console.log('Seeding donation campaigns...');
    const CAMPAIGNS = [
      {
        id: 'camp-1',
        slug: 'scholarships',
        title: 'Student Scholarships Fund',
        description: 'Fund 12-week intensive bootcamps for disadvantaged youth in Gondar, covering 100% full tuition, lab access, and project supplies.',
        goalAmountMinor: 25000000,
        currency: 'ETB',
        imageUrl: '/images/donations/scholarships.jpg',
      },
      {
        id: 'camp-2',
        slug: 'hardware-labs',
        title: 'Computer Lab Hardware & Workstations',
        description: 'Equip workstations with capable developer laptops, dual monitors, high-speed networking, and essential peripherals.',
        goalAmountMinor: 50000000,
        currency: 'ETB',
        imageUrl: '/images/donations/hardware.jpg',
      },
      {
        id: 'camp-3',
        slug: 'solar-connectivity',
        title: 'Solar Power Backup & Connectivity',
        description: 'Ensure 24/7 learning uptime during local grid interruptions with dedicated solar battery backup and dedicated fiber internet.',
        goalAmountMinor: 15000000,
        currency: 'ETB',
        imageUrl: '/images/donations/solar.jpg',
      },
    ];

    for (const c of CAMPAIGNS) {
      await pool.query(
        `INSERT INTO "public"."DonationCampaign" (
          "id", "slug", "title", "description", "goalAmountMinor", "currency", "imageUrl", "isPublished", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
        ON CONFLICT ("id") DO UPDATE SET
          "slug" = EXCLUDED."slug",
          "title" = EXCLUDED."title",
          "description" = EXCLUDED."description",
          "goalAmountMinor" = EXCLUDED."goalAmountMinor",
          "currency" = EXCLUDED."currency",
          "imageUrl" = EXCLUDED."imageUrl",
          "isPublished" = true,
          "updatedAt" = NOW();`,
        [c.id, c.slug, c.title, c.description, c.goalAmountMinor, c.currency, c.imageUrl]
      );
    }
    console.log(`Successfully seeded ${CAMPAIGNS.length} donation campaigns.`);

    // Seed published news articles
    console.log('Seeding published news articles...');
    const NEWS = [
      {
        id: 'news-1',
        slug: 'scholarship-cohort-1-announcement',
        title: 'Applications Open for Inaugural 12-Week Vocational Cohorts',
        category: 'Admissions',
        excerpt: 'Erkab Skills Training Organization announces the commencement of student scholarship applications across all 10 training tracks in Gondar.',
        content: `Erkab Skills Training Organization is thrilled to open admissions for our inaugural scholarship cohort in Gondar, Ethiopia. 

Aspiring learners can apply for 10 comprehensive, tuition-free vocational tracks ranging from Full-Stack Web Development, Mobile Development, and Artificial Intelligence, to Urban Agriculture and Small-Scale Manufacturing.

All accepted scholarship students receive full tuition coverage, dedicated workstation access in our Gondar tech laboratory, and personalized mentorship from experienced industry practitioners.`,
        coverImageUrl: '/images/news/cohort-1.jpg',
        status: 'PUBLISHED',
      },
      {
        id: 'news-2',
        slug: 'gondar-tech-lab-expansion',
        title: 'Erkab Expands Dedicated Hands-On Computer Laboratory in Gondar',
        category: 'Campus',
        excerpt: 'New developer workstations, solar backup power, and fiber connectivity installed to provide continuous technical learning.',
        content: `To ensure uninterrupted learning regardless of local power fluctuations, Erkab has expanded its flagship training facility in Gondar with modern solar battery storage and high-speed dedicated connectivity.

Each workstation is configured with modern development tooling, dual-monitor setups, and collaborative pair-programming stations designed to replicate professional software engineering environments.`,
        coverImageUrl: '/images/news/lab-expansion.jpg',
        status: 'PUBLISHED',
      },
    ];

    for (const n of NEWS) {
      await pool.query(
        `INSERT INTO "public"."NewsArticle" (
          "id", "slug", "title", "excerpt", "content", "category", "coverImageUrl", "status", "publishedAt", "authorName", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), 'Erkab Editorial Team', NOW(), NOW())
        ON CONFLICT ("id") DO UPDATE SET
          "slug" = EXCLUDED."slug",
          "title" = EXCLUDED."title",
          "excerpt" = EXCLUDED."excerpt",
          "content" = EXCLUDED."content",
          "category" = EXCLUDED."category",
          "coverImageUrl" = EXCLUDED."coverImageUrl",
          "status" = EXCLUDED."status",
          "updatedAt" = NOW();`,
        [n.id, n.slug, n.title, n.excerpt, n.content, n.category, n.coverImageUrl, n.status]
      );
    }
    console.log(`Successfully seeded ${NEWS.length} news articles.`);
  } catch (err: any) {
    console.error('Seed error:', err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

if (require.main === module || process.argv[1]?.endsWith('seed.ts')) {
  seedPrograms()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
