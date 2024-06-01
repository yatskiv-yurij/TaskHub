import Router from 'express';

import userRouter from './userRouter.js';
import boardRouter from './boardRouter.js';
import uploadRouter from './uploadRouter.js';
import emailRouter from './emailRouter.js';
import attachmentRouter from './attachmentRouter.js';
import labelsRouter from './labelsRouter.js';
import projectsRouter from './projectsRouter.js';
import sprintsRouter from './sprintsRouter.js';
import taskRouter from './tasksRouter.js';
import commentsRouter from './commentsRouter.js';
import priorityRouter from './priorityRouter.js'

const router = new Router();

router.use('/user', userRouter);
router.use('/board', boardRouter);
router.use('/files', uploadRouter);
router.use('/email', emailRouter);
router.use('/attachment', attachmentRouter);
router.use('/labels', labelsRouter);
router.use('/projects', projectsRouter);
router.use('/sprint', sprintsRouter);
router.use('/tasks', taskRouter);
router.use('/comments', commentsRouter);
router.use('/priority', priorityRouter);

export default router;