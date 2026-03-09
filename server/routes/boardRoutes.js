import { Router } from 'express';
import * as ctrl from '../controllers/boardController.js';

const router = Router();

router.get('/board', ctrl.getBoard);
router.post('/columns', ctrl.createColumn);
router.post('/tasks', ctrl.createTask);
router.patch('/tasks/:id/move', ctrl.updateTaskOrder);
router.post('/tasks/bulk-update', ctrl.bulkUpdateTaskOrder);
router.post('/columns/:columnId/reorder', ctrl.reorderColumnTasks);

export default router;