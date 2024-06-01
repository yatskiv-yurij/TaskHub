import Router from 'express';

import priorityController from '../controllers/priorityController.js';

const router = new Router();

router.get('/get-all', priorityController.getAll);

export default router;