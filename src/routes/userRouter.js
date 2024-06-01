import Router from 'express';

import userController from '../controllers/userController.js';
import { registerValidation, loginValidation, updateValidation } from '../validations/auth.js';
import { checkAccess } from '../utils/checkAccess.js';

const router = new Router();

router.post('/check-user', userController.checkUser)
router.post('/register', registerValidation, userController.register);
router.post('/login', loginValidation, userController.login);
router.get('/get-me', checkAccess, userController.getMe);
router.post('/get-me-change-pass', userController.getMeForChangePass);
router.patch('/update-me', checkAccess, updateValidation, userController.updateMe);
router.post('/check-auth-google', userController.checkAuthGoogle);
router.post('/check-auth-github', userController.checkAuthGitHub);
router.patch('/change-pass', userController.newPass);
router.get('/check-pass', checkAccess, userController.checkPass);
router.post('/get-user-info', userController.getUserInfo);
router.delete('/delete', checkAccess, userController.deleteUser)
export default router;