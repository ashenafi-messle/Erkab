import { Router } from 'express';
import adminAuthRoutes from './adminAuth.routes';
import adminDashboardRoutes from './adminDashboard.routes';
import adminUsersRoutes from './adminUsers.routes';
import adminMonitoringRoutes from './adminMonitoring.routes';
import adminProgramsRoutes from './adminPrograms.routes';
import adminApplicationsRoutes from './adminApplications.routes';
import adminPartnershipsRoutes from './adminPartnerships.routes';
import adminDonationsRoutes from './adminDonations.routes';
import adminNewsRoutes from './adminNews.routes';

const router = Router();

// Authentication
router.use('/auth', adminAuthRoutes);

// Dashboards
router.use('/dashboard', adminDashboardRoutes);

// Users & RBAC (Super Admin only)
router.use('/users', adminUsersRoutes);

// Monitoring, Security, Support, and Maintenance
router.use('/monitoring', adminMonitoringRoutes);

// Operational Program Management
router.use('/programs', adminProgramsRoutes);

// Core Business Management
router.use('/applications', adminApplicationsRoutes);
router.use('/partnerships', adminPartnershipsRoutes);
router.use('/donations', adminDonationsRoutes);
router.use('/news', adminNewsRoutes);

export default router;
