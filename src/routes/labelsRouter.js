import Router from 'express';

import labelsController from '../controllers/labelsController.js';

const router = new Router();

router.post('/create', labelsController.create);
router.get('/get-all', labelsController.getAll);
router.patch('/update/:id', labelsController.update);
router.delete('/delete/:id', labelsController.delete);

export default router;