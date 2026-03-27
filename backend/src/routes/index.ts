import { Router } from 'express';
import authRoutes from './auth';
import { authMiddleware } from '../middleware/auth';
import quizRoutes from './quizzes';
import sessionRoutes from './sessions';

const router = Router();

router.use('/auth', authRoutes);
router.use('/quizzes', authMiddleware, quizRoutes);
router.use('/sessions', authMiddleware, sessionRoutes);

export default router;
