import Router from 'express';

import sprintsController from '../controllers/sprintsController.js';

const router = new Router();

router.post('/create', sprintsController.create);
router.get('/get-all', sprintsController.getAll);
router.patch('/update/:id', sprintsController.update);
router.delete('/delete/:id', sprintsController.delete);

export default router;