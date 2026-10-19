import { Router } from 'express';
import { AdminMonitoringController } from '../controllers/adminMonitoring.controller';
import { adminAuth, requireRole } from '../middleware/adminAuth';

const router = Router();

router.use(adminAuth);

// System health & metrics
router.get('/health', AdminMonitoringController.getHealth);
router.get('/metrics', AdminMonitoringController.getMetrics);

// Security events & audit logs (accessible by authorized administrators)
router.get('/audit-logs', requireRole('SUPER_ADMIN', 'SUB_ADMIN'), AdminMonitoringController.getAuditLogs);
router.get('/security-events', requireRole('SUPER_ADMIN', 'SUB_ADMIN'), AdminMonitoringController.getAuditLogs);
router.get('/security/events', requireRole('SUPER_ADMIN', 'SUB_ADMIN'), AdminMonitoringController.getEvents);

// Support tickets
router.get('/support/tickets', AdminMonitoringController.getTickets);
router.get('/support-tickets', AdminMonitoringController.getTickets);
router.patch('/support/tickets/:id', AdminMonitoringController.updateTicket);
router.patch('/support-tickets/:id', AdminMonitoringController.updateTicket);

// Maintenance tools
router.post('/maintenance/action', AdminMonitoringController.triggerMaintenance);

// System incidents
router.get('/incidents', AdminMonitoringController.getIncidents);
router.post('/incidents', AdminMonitoringController.createIncident);
router.patch('/incidents/:id', AdminMonitoringController.updateIncident);

export default router;
