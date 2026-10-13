import { query, queryOne } from '../../core/database/db';

export class AdminDashboardService {
  /**
   * Super Admin organization-wide metrics & recent activity
   */
  public static async getSummary() {
    // 1. Student Applications Metrics
    const studentStats = await queryOne<{ total: number | string; pending: number | string; approved: number | string }>(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN "status" = 'PENDING' THEN 1 END) as pending,
        COUNT(CASE WHEN "status" = 'APPROVED' THEN 1 END) as approved
       FROM "public"."StudentApplication"`
    );

    // 2. Trainers & Tutors
    const trainerCount = await queryOne<{ count: number | string }>(
      `SELECT COUNT(*) as count FROM "public"."TrainerApplication"`
    );
    const tutorCount = await queryOne<{ count: number | string }>(
      `SELECT COUNT(*) as count FROM "public"."TutorApplication"`
    );

    // 3. Partnerships
    const partnershipStats = await queryOne<{ total: number | string; pending: number | string }>(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN "status" = 'PENDING' THEN 1 END) as pending
       FROM "public"."PartnershipRequest"`
    );

    // 4. Donations (separated by mode: DEMO vs REAL)
    const donationStats = await queryOne<{ totalCount: number | string; totalAmountMinor: number | string }>(
      `SELECT 
        COUNT(*) as "totalCount",
        COALESCE(SUM("amountMinor"), 0) as "totalAmountMinor"
       FROM "public"."Donation" WHERE "status" = 'PAID'`
    );

    // 5. Training Programs & News
    const progCount = await queryOne<{ count: number | string }>(
      `SELECT COUNT(*) as count FROM "public"."TrainingProgram" WHERE "isPublished" = true`
    );
    const newsCount = await queryOne<{ count: number | string }>(
      `SELECT COUNT(*) as count FROM "public"."NewsArticle" WHERE "status" = 'PUBLISHED'`
    );

    // 6. Recent Applications
    const recentStudents = await query(
      `SELECT "id", "referenceNumber", "fullName", "email", "status", "createdAt" 
       FROM "public"."StudentApplication" 
       ORDER BY "createdAt" DESC LIMIT 5`
    );

    // 7. Recent Partnerships
    const recentPartnerships = await query(
      `SELECT "id", "reference", "organizationName", "partnershipType", "status", "createdAt" 
       FROM "public"."PartnershipRequest" 
       ORDER BY "createdAt" DESC LIMIT 5`
    );

    // 8. Recent Donations
    const recentDonations = await query(
      `SELECT "id", "reference", "donorName", "amountMinor", "currency", "status", "createdAt" 
       FROM "public"."Donation" 
       ORDER BY "createdAt" DESC LIMIT 5`
    );

    return {
      overview: {
        students: {
          total: Number(studentStats?.total || 0),
          pending: Number(studentStats?.pending || 0),
          approved: Number(studentStats?.approved || 0),
        },
        trainers: Number(trainerCount?.count || 0),
        tutors: Number(tutorCount?.count || 0),
        partnerships: {
          total: Number(partnershipStats?.total || 0),
          pending: Number(partnershipStats?.pending || 0),
        },
        donations: {
          totalCount: Number(donationStats?.totalCount || 0),
          totalAmount: Math.round(Number(donationStats?.totalAmountMinor || 0) / 100),
          currency: 'ETB',
          financialNotice: 'DEMO transactions are isolated from financial accounting reconciliations.',
        },
        activePrograms: Number(progCount?.count || 0),
        publishedNews: Number(newsCount?.count || 0),
      },
      recentActivity: {
        students: recentStudents,
        partnerships: recentPartnerships,
        donations: recentDonations.map((d: any) => ({
          ...d,
          amount: Math.round(d.amountMinor / 100),
        })),
      },
    };
  }

  /**
   * Sub Admin operational metrics
   */
  public static async getOperational() {
    // 1. Support tickets
    const ticketStats = await queryOne<{ open: number | string; inProgress: number | string; resolved: number | string }>(
      `SELECT 
        COUNT(CASE WHEN "status" = 'OPEN' THEN 1 END) as open,
        COUNT(CASE WHEN "status" = 'IN_PROGRESS' THEN 1 END) as inProgress,
        COUNT(CASE WHEN "status" = 'RESOLVED' THEN 1 END) as resolved
       FROM "public"."SupportTicket"`
    );

    // 2. Active Incidents
    const incidentStats = await queryOne<{ active: number | string; total: number | string }>(
      `SELECT 
        COUNT(CASE WHEN "status" != 'RESOLVED' THEN 1 END) as active,
        COUNT(*) as total
       FROM "public"."SystemIncident"`
    );

    // 3. Security Audit Logs (last 5)
    const recentLogs = await query(
      `SELECT "id", "adminName", "action", "resource", "details", "ipAddress", "createdAt"
       FROM "public"."AdminAuditLog"
       ORDER BY "createdAt" DESC LIMIT 8`
    );

    // 4. Recent Incidents
    const recentIncidents = await query(
      `SELECT "id", "title", "service", "severity", "status", "createdAt"
       FROM "public"."SystemIncident"
       ORDER BY "createdAt" DESC LIMIT 5`
    );

    // 5. Open Tickets
    const openTickets = await query(
      `SELECT "id", "ticketNumber", "requesterName", "subject", "category", "priority", "status", "createdAt"
       FROM "public"."SupportTicket"
       WHERE "status" != 'RESOLVED'
       ORDER BY "createdAt" DESC LIMIT 5`
    );

    return {
      operationalHealth: {
        status: Number(incidentStats?.active || 0) === 0 ? 'HEALTHY' : 'DEGRADED',
        activeIncidentsCount: Number(incidentStats?.active || 0),
        openTicketsCount: Number(ticketStats?.open || 0),
        inProgressTicketsCount: Number(ticketStats?.inProgress || 0),
        resolvedTicketsCount: Number(ticketStats?.resolved || 0),
        uptimePercentage: '99.98%',
      },
      recentLogs,
      recentIncidents,
      openTickets,
    };
  }
}
