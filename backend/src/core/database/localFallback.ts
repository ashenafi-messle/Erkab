import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { logger } from '../logging/logger';
import { hashPassword } from '../utils/authSecurity';

// Persistent SQLite database file for reliable local degraded/offline operations
const dbPath = path.resolve(process.cwd(), 'dev.sqlite');
export const localDb = new DatabaseSync(dbPath);

try {
  localDb.exec('PRAGMA journal_mode = WAL;');
  localDb.exec('PRAGMA busy_timeout = 5000;');
} catch {
  // Ignore pragma setup errors in memory-only or restricted modes
}

// Register PostgreSQL compatibility functions
localDb.function('NOW', () => new Date().toISOString());
localDb.function('now', () => new Date().toISOString());

// Initialize schema
export function initializeLocalSchema() {
  localDb.exec(`
    CREATE TABLE IF NOT EXISTS TrainingProgram (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE,
      title TEXT,
      category TEXT,
      duration TEXT,
      delivery TEXT,
      scholarship INTEGER DEFAULT 1,
      image TEXT,
      imageAlt TEXT,
      summary TEXT,
      description TEXT,
      skills TEXT,
      modules TEXT,
      careerPaths TEXT,
      prerequisites TEXT,
      isPublished INTEGER DEFAULT 1,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS StudentApplication (
      id TEXT PRIMARY KEY,
      referenceNumber TEXT UNIQUE,
      fullName TEXT,
      gender TEXT,
      age INTEGER,
      classCompletionYear TEXT,
      telegramPhone TEXT,
      email TEXT,
      status TEXT DEFAULT 'PENDING',
      programId TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS TrainerApplication (
      id TEXT PRIMARY KEY,
      referenceNumber TEXT UNIQUE,
      fullName TEXT,
      email TEXT,
      telegramPhone TEXT,
      expertiseTrack TEXT,
      yearsOfExperience TEXT,
      portfolioUrl TEXT,
      teachingStatement TEXT,
      status TEXT DEFAULT 'PENDING',
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS TutorApplication (
      id TEXT PRIMARY KEY,
      referenceNumber TEXT UNIQUE,
      studentOrApplicantName TEXT,
      parentOrContactPhone TEXT,
      email TEXT,
      gradeLevel TEXT,
      subjects TEXT,
      deliveryPreference TEXT,
      locationDetails TEXT,
      qualifications TEXT,
      experience TEXT,
      hourlyRate TEXT,
      status TEXT DEFAULT 'PENDING',
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS TutoringPayment (
      id TEXT PRIMARY KEY,
      paymentReference TEXT UNIQUE,
      tutorApplicationId TEXT,
      amount INTEGER,
      currency TEXT DEFAULT 'ETB',
      status TEXT DEFAULT 'PENDING',
      paymentMode TEXT DEFAULT 'DEMO',
      transactionId TEXT UNIQUE,
      receiptUrl TEXT,
      receiptSubmittedAt TEXT,
      verifiedBy TEXT,
      verifiedByName TEXT,
      verifiedAt TEXT,
      rejectionReason TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS ApplicationDocument (
      id TEXT PRIMARY KEY,
      category TEXT,
      originalFilename TEXT,
      fileType TEXT,
      fileSize INTEGER,
      cloudinaryPublicId TEXT,
      cloudinarySecureUrl TEXT,
      cloudinaryResourceType TEXT DEFAULT 'raw',
      cloudinaryDeliveryType TEXT DEFAULT 'authenticated',
      studentApplicationId TEXT,
      trainerApplicationId TEXT,
      tutorApplicationId TEXT,
      partnershipRequestId TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS ApplicationReview (
      id TEXT PRIMARY KEY,
      reviewerId TEXT,
      reviewerName TEXT,
      decision TEXT,
      notes TEXT,
      studentApplicationId TEXT,
      trainerApplicationId TEXT,
      tutorApplicationId TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS PartnershipRequest (
      id TEXT PRIMARY KEY,
      reference TEXT UNIQUE,
      organizationName TEXT,
      organizationType TEXT,
      contactPerson TEXT,
      email TEXT,
      phone TEXT,
      country TEXT,
      city TEXT,
      partnershipType TEXT,
      proposal TEXT,
      status TEXT DEFAULT 'PENDING',
      reviewNotes TEXT,
      reviewedBy TEXT,
      reviewedAt TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS DonationCampaign (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE,
      title TEXT,
      description TEXT,
      imageAssetId TEXT,
      imageUrl TEXT,
      goalAmountMinor INTEGER,
      currency TEXT DEFAULT 'ETB',
      isPublished INTEGER DEFAULT 1,
      startsAt TEXT,
      endsAt TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS Donation (
      id TEXT PRIMARY KEY,
      reference TEXT UNIQUE,
      campaignId TEXT,
      donorName TEXT,
      email TEXT,
      phone TEXT,
      isAnonymous INTEGER DEFAULT 0,
      amountMinor INTEGER,
      currency TEXT DEFAULT 'ETB',
      message TEXT,
      status TEXT DEFAULT 'PENDING_PAYMENT',
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS DonationPayment (
      id TEXT PRIMARY KEY,
      reference TEXT UNIQUE,
      donationId TEXT,
      provider TEXT DEFAULT 'DEMO',
      mode TEXT DEFAULT 'DEMO',
      amountMinor INTEGER,
      currency TEXT DEFAULT 'ETB',
      status TEXT DEFAULT 'PENDING',
      idempotencyKey TEXT UNIQUE,
      providerTransactionId TEXT UNIQUE,
      failureCode TEXT,
      failureMessage TEXT,
      verifiedAt TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS NewsArticle (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE,
      title TEXT,
      excerpt TEXT,
      content TEXT,
      coverImageAssetId TEXT,
      coverImageUrl TEXT,
      category TEXT DEFAULT 'General',
      status TEXT DEFAULT 'DRAFT',
      publishedAt TEXT,
      authorName TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS NewsArticleImage (
      id TEXT PRIMARY KEY,
      articleId TEXT NOT NULL,
      imageUrl TEXT NOT NULL,
      cloudinaryPublicId TEXT,
      caption TEXT,
      displayOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT,
      FOREIGN KEY (articleId) REFERENCES NewsArticle(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS AdminUser (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      passwordHash TEXT,
      name TEXT,
      role TEXT DEFAULT 'SUB_ADMIN',
      permissions TEXT DEFAULT '[]',
      status TEXT DEFAULT 'ACTIVE',
      lastLoginAt TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS AdminAuditLog (
      id TEXT PRIMARY KEY,
      adminUserId TEXT,
      adminName TEXT,
      action TEXT,
      resource TEXT,
      details TEXT,
      ipAddress TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS SupportTicket (
      id TEXT PRIMARY KEY,
      ticketNumber TEXT UNIQUE,
      requesterName TEXT,
      email TEXT,
      category TEXT DEFAULT 'GENERAL',
      subject TEXT,
      message TEXT,
      status TEXT DEFAULT 'OPEN',
      priority TEXT DEFAULT 'NORMAL',
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS SystemIncident (
      id TEXT PRIMARY KEY,
      title TEXT,
      service TEXT,
      severity TEXT DEFAULT 'MEDIUM',
      status TEXT DEFAULT 'INVESTIGATING',
      description TEXT,
      resolvedAt TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS ApplicationNotification (
      id TEXT PRIMARY KEY,
      applicationType TEXT NOT NULL,
      applicationId TEXT NOT NULL,
      referenceNumber TEXT NOT NULL,
      recipientName TEXT NOT NULL,
      recipientEmail TEXT NOT NULL,
      decision TEXT NOT NULL,
      notificationType TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      attempts INTEGER NOT NULL DEFAULT 0,
      maxAttempts INTEGER NOT NULL DEFAULT 3,
      lastAttemptAt TEXT,
      sentAt TEXT,
      errorMessage TEXT,
      idempotencyKey TEXT UNIQUE,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS ContactMessage (
      id TEXT PRIMARY KEY,
      referenceCode TEXT UNIQUE NOT NULL,
      fullName TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'GENERAL_INQUIRY',
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'NEW',
      priority TEXT NOT NULL DEFAULT 'NORMAL',
      assignedAdminId TEXT,
      internalNotes TEXT,
      readAt TEXT,
      resolvedAt TEXT,
      resolvedByAdminId TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_contact_ref ON ContactMessage(referenceCode);
    CREATE INDEX IF NOT EXISTS idx_contact_status ON ContactMessage(status);
    CREATE INDEX IF NOT EXISTS idx_contact_created ON ContactMessage(createdAt);

  `);

  seedInitialDataIfEmpty();
}

function seedInitialDataIfEmpty() {
  // 1. Seed Donation Campaigns
  const campaignCountStmt = localDb.prepare('SELECT COUNT(*) as count FROM DonationCampaign');
  const campaignCount = (campaignCountStmt.get() as any)?.count || 0;
  if (campaignCount === 0) {
    const insertCampaign = localDb.prepare(`
      INSERT INTO DonationCampaign (id, slug, title, description, goalAmountMinor, currency, imageUrl, isPublished, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
    `);
    const CAMPAIGNS = [
      {
        id: 'camp-1',
        slug: 'student-scholarship-fund',
        title: 'Student Tech Scholarship Fund',
        description: 'Fund full tuition, learning laptops, and daily stipends for high-potential youth across Ethiopia.',
        goalAmountMinor: 10000000,
        currency: 'ETB',
        imageUrl: '/images/donations/scholarship.jpg',
      },
      {
        id: 'camp-2',
        slug: 'computer-lab-hardware',
        title: 'Computer Lab & Hardware Equipment',
        description: 'Equip our dedicated physical computer labs with modern workstations, high-speed networking, and prototyping hardware.',
        goalAmountMinor: 25000000,
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
      insertCampaign.run(c.id, c.slug, c.title, c.description, c.goalAmountMinor, c.currency, c.imageUrl);
    }
  }

  // 2. Seed News Articles
  const newsCountStmt = localDb.prepare('SELECT COUNT(*) as count FROM NewsArticle');
  const newsCount = (newsCountStmt.get() as any)?.count || 0;
  if (newsCount === 0) {
    const insertNews = localDb.prepare(`
      INSERT INTO NewsArticle (id, slug, title, excerpt, content, category, coverImageUrl, status, publishedAt, authorName, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'Erkab Editorial Team', NOW(), NOW())
    `);
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
      insertNews.run(n.id, n.slug, n.title, n.excerpt, n.content, n.category, n.coverImageUrl, n.status);
    }
  }

  // 3. Seed Programs
  const progCountStmt = localDb.prepare('SELECT COUNT(*) as count FROM TrainingProgram');
  const progCount = (progCountStmt.get() as any)?.count || 0;
  if (progCount === 0) {
    const insertProg = localDb.prepare(`
      INSERT INTO TrainingProgram (id, slug, title, category, duration, delivery, scholarship, image, imageAlt, summary, description, skills, modules, careerPaths, prerequisites, isPublished, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
    `);
    const PROGRAMS = [
      { id: 'prog-1', slug: 'web-development', title: 'Full-Stack Web Development', category: 'Software & Technology', duration: '12 Weeks (Full-Time)', delivery: 'In-Person & Lab', image: '/images/programs/web-development.jpg', imageAlt: 'Web developer', summary: 'Build modern web applications', description: 'Web development program', skills: JSON.stringify(['JavaScript', 'React', 'Node.js']), modules: JSON.stringify(['Core Web', 'React', 'Backend']), careerPaths: JSON.stringify(['Full-Stack Developer']), prerequisites: 'Basic computer literacy' },
      { id: 'prog-2', slug: 'mobile-development', title: 'Full-Stack Mobile Application Development', category: 'Software & Technology', duration: '12 Weeks (Full-Time)', delivery: 'In-Person & Lab', image: '/images/programs/mobile-development.jpg', imageAlt: 'Mobile developer', summary: 'Design mobile apps', description: 'Mobile app program', skills: JSON.stringify(['React Native', 'Mobile UI']), modules: JSON.stringify(['Mobile Basics', 'Advanced Mobile']), careerPaths: JSON.stringify(['Mobile Developer']), prerequisites: 'Basic programming' },
      { id: 'prog-3', slug: 'data-science', title: 'Data Science & Analytics', category: 'Data & AI', duration: '12 Weeks (Full-Time)', delivery: 'In-Person & Lab', image: '/images/programs/data-science.jpg', imageAlt: 'Data science', summary: 'Analyze complex datasets', description: 'Data analytics program', skills: JSON.stringify(['Python', 'SQL']), modules: JSON.stringify(['Data Analysis', 'ML Basics']), careerPaths: JSON.stringify(['Data Analyst']), prerequisites: 'High school math' },
      { id: 'prog-4', slug: 'ai-machine-learning', title: 'Artificial Intelligence & Machine Learning', category: 'Data & AI', duration: '12 Weeks (Full-Time)', delivery: 'In-Person & Lab', image: '/images/programs/ai-machine-learning.jpg', imageAlt: 'AI and ML', summary: 'Build predictive ML models', description: 'AI program', skills: JSON.stringify(['Python', 'PyTorch']), modules: JSON.stringify(['Neural Networks', 'LLMs']), careerPaths: JSON.stringify(['AI Engineer']), prerequisites: 'Python proficiency' },
      { id: 'prog-5', slug: 'cybersecurity', title: 'Cybersecurity & Infrastructure Defense', category: 'Infrastructure & Security', duration: '12 Weeks (Full-Time)', delivery: 'In-Person & Lab', image: '/images/programs/cybersecurity.jpg', imageAlt: 'Cybersecurity', summary: 'Protect networks and data', description: 'Cybersecurity defense program', skills: JSON.stringify(['Linux', 'Network Defense']), modules: JSON.stringify(['Securing Networks', 'Ethical Hacking']), careerPaths: JSON.stringify(['Security Analyst']), prerequisites: 'Networking basics' },
      { id: 'prog-6', slug: 'remote-work-prep', title: 'Remote Work & Global Freelancing', category: 'Business & Employment', duration: '6 Weeks (Intensive)', delivery: 'Hybrid', image: '/images/programs/remote-work.jpg', imageAlt: 'Remote worker', summary: 'Succeed in international remote careers', description: 'Remote work program', skills: JSON.stringify(['Client Communication', 'Upwork/Fiverr']), modules: JSON.stringify(['Global Portfolios', 'Client Contracts']), careerPaths: JSON.stringify(['Global Freelancer']), prerequisites: 'Fluent English' },
      { id: 'prog-7', slug: 'entrepreneurship', title: 'Digital Entrepreneurship & Incubation', category: 'Business & Employment', duration: '10 Weeks (Venture Track)', delivery: 'In-Person & Mentorship', image: '/images/programs/entrepreneurship.jpg', imageAlt: 'Entrepreneur', summary: 'Launch sustainable ventures', description: 'Incubation program', skills: JSON.stringify(['Business Model Canvas', 'Financial Projections']), modules: JSON.stringify(['Ideation', 'Go-to-Market']), careerPaths: JSON.stringify(['Startup Founder']), prerequisites: 'Viable business idea' },
      { id: 'prog-8', slug: 'urban-agriculture', title: 'Modern Urban Agriculture & Agri-Tech', category: 'Vocational & Applied', duration: '10 Weeks (Field & Greenhouse)', delivery: 'In-Person & Field', image: '/images/programs/urban-agriculture.jpg', imageAlt: 'Urban farm', summary: 'Implement hydroponics and smart farming', description: 'Agri-tech program', skills: JSON.stringify(['Hydroponics', 'Sensor Automation']), modules: JSON.stringify(['Soil Science', 'Automated Irrigation']), careerPaths: JSON.stringify(['Agri-Tech Manager']), prerequisites: 'Passion for agriculture' },
      { id: 'prog-9', slug: 'manufacturing', title: 'Light Manufacturing & Assembly', category: 'Vocational & Applied', duration: '12 Weeks (Workshop & Lab)', delivery: 'In-Person & Lab', image: '/images/programs/manufacturing.jpg', imageAlt: 'Assembly worker', summary: 'Electronics assembly and prototyping', description: 'Manufacturing program', skills: JSON.stringify(['Soldering', 'Quality Control']), modules: JSON.stringify(['Electronics Basics', 'Quality Testing']), careerPaths: JSON.stringify(['Assembly Technician']), prerequisites: 'Technical aptitude' },
      { id: 'prog-10', slug: 'content-creation', title: 'Content Creation & Digital Storytelling', category: 'Business & Employment', duration: '8 Weeks (Studio & Lab)', delivery: 'Hybrid', image: '/images/programs/content-creation.jpg', imageAlt: 'Content creator', summary: 'Produce media and video content', description: 'Digital media program', skills: JSON.stringify(['Video Editing', 'Podcasting']), modules: JSON.stringify(['Scriptwriting', 'Editing']), careerPaths: JSON.stringify(['Content Creator']), prerequisites: 'Storytelling interest' },
    ];
    for (const p of PROGRAMS) {
      insertProg.run(p.id, p.slug, p.title, p.category, p.duration, p.delivery, p.image, p.imageAlt, p.summary, p.description, p.skills, p.modules, p.careerPaths, p.prerequisites);
    }
  }

  // 4. Seed Admin Users (Super Admin and Sub Admin)
  const adminCountStmt = localDb.prepare('SELECT COUNT(*) as count FROM AdminUser');
  const adminCount = (adminCountStmt.get() as any)?.count || 0;
  if (adminCount === 0) {
    const insertAdmin = localDb.prepare(`
      INSERT INTO AdminUser (id, email, passwordHash, name, role, permissions, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', NOW(), NOW())
    `);

    // Super Admin: superadmin@erkab.org / Erkab@SuperAdmin2026!
    const superAdminHash = hashPassword('Erkab@SuperAdmin2026!');
    insertAdmin.run(
      'usr-super-admin-01',
      'superadmin@erkab.org',
      superAdminHash,
      'Erkab Executive Director',
      'SUPER_ADMIN',
      JSON.stringify(['*'])
    );

    // Development Super Admin: superadmin@erkab.local / Erkab@DevSuper2026!
    const devSuperHash = hashPassword('Erkab@DevSuper2026!');
    insertAdmin.run(
      'usr-dev-superadmin',
      'superadmin@erkab.local',
      devSuperHash,
      'Erkab Super Administrator (Local)',
      'SUPER_ADMIN',
      JSON.stringify(['*'])
    );

    // Sub Admin: subadmin@erkab.org / Erkab@SubAdmin2026!
    const subAdminHash = hashPassword('Erkab@SubAdmin2026!');
    insertAdmin.run(
      'usr-sub-admin-01',
      'subadmin@erkab.org',
      subAdminHash,
      'Erkab Operations Specialist',
      'SUB_ADMIN',
      JSON.stringify([
        'security:read',
        'support:read',
        'support:write',
        'monitoring:read',
        'maintenance:read',
        'applications:read'
      ])
    );

    // Development Sub Admin: subadmin@erkab.local / Erkab@DevSub2026!
    const devSubHash = hashPassword('Erkab@DevSub2026!');
    insertAdmin.run(
      'usr-dev-subadmin',
      'subadmin@erkab.local',
      devSubHash,
      'Erkab Operations Specialist (Local)',
      'SUB_ADMIN',
      JSON.stringify([
        'security:read',
        'support:read',
        'support:write',
        'monitoring:read',
        'maintenance:read',
        'applications:read'
      ])
    );
  }

  // 5. Seed Support Tickets
  const ticketCountStmt = localDb.prepare('SELECT COUNT(*) as count FROM SupportTicket');
  const ticketCount = (ticketCountStmt.get() as any)?.count || 0;
  if (ticketCount === 0) {
    const insertTicket = localDb.prepare(`
      INSERT INTO SupportTicket (id, ticketNumber, requesterName, email, category, subject, message, status, priority, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `);
    insertTicket.run(
      'tkt-001',
      'TKT-2026-001',
      'Bethlehem Tadesse',
      'bethlehem.t@gmail.com',
      'ADMISSIONS',
      'Inquiry on Web Development Lab Requirements',
      'Hello, I would like to confirm if personal laptops are required on the first week of in-person training in Gondar.',
      'OPEN',
      'NORMAL'
    );
    insertTicket.run(
      'tkt-002',
      'TKT-2026-002',
      'Dawit Alemu',
      'dawit.alemu@org.et',
      'TECHNICAL',
      'Assistance with Certificate Upload',
      'I encountered a file format notice while uploading my high school leaving certificate PDF. Please advise.',
      'IN_PROGRESS',
      'HIGH'
    );
  }

  // 6. Seed System Incidents
  const incidentCountStmt = localDb.prepare('SELECT COUNT(*) as count FROM SystemIncident');
  const incidentCount = (incidentCountStmt.get() as any)?.count || 0;
  if (incidentCount === 0) {
    const insertIncident = localDb.prepare(`
      INSERT INTO SystemIncident (id, title, service, severity, status, description, resolvedAt, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `);
    insertIncident.run(
      'inc-001',
      'Scheduled Neon DB Connection Pool Maintenance',
      'PostgreSQL Database',
      'LOW',
      'RESOLVED',
      'Routine failover verification completed with 100% operational uptime preserved via local resilient engine.',
      new Date().toISOString()
    );
  }

  // 7. Seed Initial Audit Logs
  const auditCountStmt = localDb.prepare('SELECT COUNT(*) as count FROM AdminAuditLog');
  const auditCount = (auditCountStmt.get() as any)?.count || 0;
  if (auditCount === 0) {
    const insertAudit = localDb.prepare(`
      INSERT INTO AdminAuditLog (id, adminUserId, adminName, action, resource, details, ipAddress, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `);
    insertAudit.run(
      'aud-001',
      'usr-super-admin-01',
      'System Provisioning',
      'INITIALIZE_SYSTEM',
      'AuthEngine',
      'Default security roles (SUPER_ADMIN, SUB_ADMIN) provisioned.',
      '127.0.0.1'
    );
  }
}

// Convert PostgreSQL query to SQLite query
function normalizeSql(sql: string): string {
  return sql
    .replace(/"public"\./g, '')
    .replace(/\$(\d+)/g, '?$1')
    .replace(/\bILIKE\b/gi, 'LIKE')
    .replace(/\btrue\b/gi, '1')
    .replace(/\bfalse\b/gi, '0');
}

function normalizeParams(params?: any[]): any[] {
  if (!params) return [];
  return params.map((p) => {
    if (p === undefined) return null;
    if (typeof p === 'boolean') return p ? 1 : 0;
    return p;
  });
}

function normalizeRow(row: any): any {
  if (!row) return row;
  const res: any = { ...row };
  for (const key of ['isPublished', 'scholarship', 'isAnonymous']) {
    if (key in res) {
      res[key] = Boolean(res[key]);
    }
  }
  return res;
}

export function localQuery<T = any>(sql: string, params?: any[]): T[] {
  const cleanSql = normalizeSql(sql);
  const cleanParams = normalizeParams(params);
  const trimmed = cleanSql.trim().toUpperCase();

  try {
    if (trimmed.startsWith('SELECT')) {
      const stmt = localDb.prepare(cleanSql);
      const rows = stmt.all(...cleanParams) as any[];
      return rows.map(normalizeRow) as T[];
    } else {
      const stmt = localDb.prepare(cleanSql);
      stmt.run(...cleanParams);
      return [] as T[];
    }
  } catch (err: any) {
    logger.error({ err: err.message, cleanSql, cleanParams }, 'Local fallback SQLite query error');
    throw err;
  }
}

export function localQueryOne<T = any>(sql: string, params?: any[]): T | null {
  const rows = localQuery<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function localTransaction<T>(
  callback: (client: { query: (text: string, params?: any[]) => Promise<any> }) => Promise<T>
): Promise<T> {
  localDb.exec('BEGIN TRANSACTION');
  try {
    const mockClient = {
      query: async (text: string, params?: any[]) => {
        const rows = localQuery(text, params);
        return { rows, rowCount: rows.length };
      },
    };
    const result = await callback(mockClient);
    localDb.exec('COMMIT');
    return result;
  } catch (err) {
    try {
      localDb.exec('ROLLBACK');
    } catch {}
    throw err;
  }
}

// Initialize tables on import
initializeLocalSchema();
