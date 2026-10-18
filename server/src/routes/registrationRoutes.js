import express from 'express';
import {
  validateSelection,
  confirmRegistration,
  getMyRegistrations,
  getRegistrationById,
  cancelRegistration,
} from '../controllers/registrationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/validate', validateSelection);
router.post('/confirm', confirmRegistration);
router.get('/me', getMyRegistrations);
router.get('/:id', getRegistrationById);
router.post('/:id/cancel', cancelRegistration);

export default router;
