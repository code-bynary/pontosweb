import express from 'express';
import { getMonthlyCompanyReport, exportCompanyExcel } from '../controllers/reportController.js';

const router = express.Router();

// GET /api/reports/monthly/:month
router.get('/monthly/:month', getMonthlyCompanyReport);

// GET /api/reports/export/excel/:month
router.get('/export/excel/:month', exportCompanyExcel);

export default router;
