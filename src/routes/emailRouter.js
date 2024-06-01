import Router from 'express';

import sendMail from '../utils/sendMail.js';

const router = new Router();

router.post('/send', sendMail);

export default router;