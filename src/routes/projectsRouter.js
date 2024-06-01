import Router from 'express';

import projectsController from '../controllers/projectsController.js';
import { checkAccess } from '../utils/checkAccess.js';

const router = new Router();

router.post('/create', checkAccess,  projectsController.create);
router.get('/get-all', checkAccess, projectsController.getAll);
router.patch('/update/:id', projectsController.update);
router.delete('/delete/:id', projectsController.delete);
router.patch('/new-member/:id', projectsController.addUserToProject);
router.patch('/leave/:id', projectsController.leaveProject);

export default router;