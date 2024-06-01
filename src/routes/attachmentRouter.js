import Router from 'express';

import attachmentController from '../controllers/attachmentController.js';

const router = new Router();

router.post('/create', attachmentController.create);
router.get('/get-all', attachmentController.getAll);
router.patch('/update/:id', attachmentController.update);
router.delete('/delete/:id', attachmentController.delete);

export default router;