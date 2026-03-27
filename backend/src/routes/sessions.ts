import { Router } from 'express';
import { sessionController } from '../controllers/sessionController';

const router = Router();

router.post('/join', sessionController.joinByRoomCode.bind(sessionController));
router.get(
  '/:sessionId',
  sessionController.getHostSession.bind(sessionController),
);
router.get(
  '/:sessionId/results',
  sessionController.getSessionResults.bind(sessionController),
);

export default router;
