import Router from 'express';
import multer from 'multer';

import {storage, saveFiles, deleteFiles, downloadFile} from '../utils/files.js';

const upload = multer({storage});   

const router = new Router();

router.post('/upload', upload.any(), saveFiles);
router.delete('/upload', deleteFiles);
router.get('/upload', downloadFile);

export default router;