import express from 'express';
import {
  getDashboardStats,
  getAllRegistrations,
  exportRegistrationsCSV,
  getSettings,
  updateSettings,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Settings can be read by public/students for registration window checks
router.get('/settings', getSettings);

// Protected admin endpoints
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/registrations', getAllRegistrations);
router.get('/reports/csv', exportRegistrationsCSV);
router.put('/settings', updateSettings);

export default router;
