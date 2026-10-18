import express from 'express';
import {
  getMyProfile,
  getAllStudents,
  getStudentById,
  updateAcademicRecord,
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/me', getMyProfile);
router.get('/', authorize('admin'), getAllStudents);
router.get('/:id', authorize('admin'), getStudentById);
router.patch('/:id/academic-record', authorize('admin'), updateAcademicRecord);

export default router;
