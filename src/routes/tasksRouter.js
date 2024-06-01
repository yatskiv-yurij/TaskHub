import Router from 'express';

import tasksController from '../controllers/tasksController.js';

const router = new Router();

router.get('/get-all/', tasksController.getAll);
router.get('/get-work/', tasksController.getWork);
router.get('/get-one/', tasksController.getOne);
router.get('/get-search/', tasksController.tasksSearch);

export default router;