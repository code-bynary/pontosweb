import express from 'express';
import {
    getMonthlyTimecardController,
    generateWorkdaysController,
    updateWorkdayController,
    getWorkdayHistoryController,
    recalculateWorkdaysController
} from '../controllers/workdayController.js';

const router = express.Router();

// GET /api/workday/:employeeId/:month
router.get('/:employeeId/:month', getMonthlyTimecardController);

// POST /api/workday/:employeeId/generate
router.post('/:employeeId/generate', generateWorkdaysController);

// PUT /api/workday/:id
router.put('/:id', updateWorkdayController);

// POST /api/workday/:employeeId/recalculate
router.post('/:employeeId/recalculate', recalculateWorkdaysController);

// GET /api/workday/:id/history
router.get('/:id/history', getWorkdayHistoryController);

export default router;
