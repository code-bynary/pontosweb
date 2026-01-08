import express from 'express';
import { exportPDF, exportExcel } from '../controllers/exportController.js';

const router = express.Router();

// GET /api/export/pdf/:employeeId/:month
router.get('/pdf/:employeeId/:month', exportPDF);

// GET /api/export/excel/:employeeId/:month
router.get('/excel/:employeeId/:month', exportExcel);

export default router;
