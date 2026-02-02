import express from 'express';
import { getAbono, addAbono, removeAbono, uploadDocument, downloadDocument } from '../controllers/abonoController.js';

const router = express.Router();

router.get('/workday/:workdayId', getAbono);
router.post('/', addAbono);
router.post('/:id/upload', uploadDocument);
router.get('/workday/:workdayId/download', downloadDocument);
router.delete('/:id', removeAbono);

export default router;
