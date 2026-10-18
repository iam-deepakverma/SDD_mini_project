import express from 'express';
import {
  joinWaitlist,
  getMyWaitlists,
  leaveWaitlist,
  getAllWaitlists,
  offerSeat,
} from '../controllers/waitlistController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', joinWaitlist);
router.get('/me', getMyWaitlists);
router.delete('/:id', leaveWaitlist);

// Admin waitlist management
router.get('/admin', authorize('admin'), getAllWaitlists);
router.post('/admin/:id/offer', authorize('admin'), offerSeat);

export default router;
