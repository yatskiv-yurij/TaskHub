import Router from 'express';

import commentsController from '../controllers/commentsController.js';

const router = new Router();

router.get('/get-all', commentsController.getAll);

export default router;