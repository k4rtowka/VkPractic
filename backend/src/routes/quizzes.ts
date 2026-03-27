import { Router } from 'express';
import { quizController } from '../controllers/quizController';

const router = Router();

router.get('/', quizController.listMyQuizzes.bind(quizController));
router.post('/', quizController.createWithSession.bind(quizController));

export default router;
