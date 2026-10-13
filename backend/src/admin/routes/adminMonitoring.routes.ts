import { Router } from 'express';
import { AdminMonitoringController } from '../controllers/adminMonitoring.controller';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

router.use(adminAuth);

// System health
router.get('/health', AdminMonitoringController.getHealth);

// Security events & audit logs
router.get('/security/events', AdminMonitoringController.getEvents);

// Support tickets
router.get('/support/tickets', AdminMonitoringController.getTickets);
router.patch('/support/tickets/:id', AdminMonitoringController.updateTicket);

// Maintenance tools
router.post('/maintenance/action', AdminMonitoringController.triggerMaintenance);

export default router;
