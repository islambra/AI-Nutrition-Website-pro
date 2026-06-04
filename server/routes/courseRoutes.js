import express from 'express';
import { protect } from '../middleware/auth.js';
import uploadPdf from '../middleware/multerPdf.js';
import {
  createCourse,
  getAllCourses,
  getCoursesByLevel,
  deleteCourse
} from '../controllers/courseControllers.js';

const router = express.Router();

router.use(protect);

router.post('/', uploadPdf.single('pdfFile'), createCourse);
router.get('/', getAllCourses);
router.get('/level/:level', getCoursesByLevel);
router.delete('/:id', deleteCourse);

export default router;
