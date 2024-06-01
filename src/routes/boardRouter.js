import Router from "express";

import boardController from "../controllers/boardController.js";
import { checkAccess } from '../utils/checkAccess.js';

const router = new Router();

router.post('/create', checkAccess, boardController.create);
router.get('/get-all', checkAccess,  boardController.getAll);
router.get('/get-one', boardController.getOneBoard);
router.get('/get-all-project', checkAccess,  boardController.getAllForProject);
router.patch('/update/:id', checkAccess, boardController.updateBoard);
router.delete('/delete/:id', checkAccess, boardController.deleteBoard);
router.patch('/leave/:id', checkAccess, boardController.leaveBoard);
router.patch('/new-member/:id', checkAccess, boardController.addUserToBoard);
router.get('/is-user-board', checkAccess, boardController.isUserProject);

export default router;