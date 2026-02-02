import express from 'express';
import { getAllEmployees, getEmployee, updateEmployeeSchedule, toggleEmployeeTreatment, resetAllTreatment } from '../controllers/employeeController.js';

const router = express.Router();

// GET /api/employees
router.get('/', getAllEmployees);

// POST /api/employees/reset-treatment (antes de :id para não confundir)
router.post('/reset-treatment', resetAllTreatment);

// GET /api/employees/:id
router.get('/:id', getEmployee);

// PUT /api/employees/:id/schedule
router.put('/:id/schedule', updateEmployeeSchedule);

// PATCH /api/employees/:id/toggle-treatment
router.patch('/:id/toggle-treatment', toggleEmployeeTreatment);

export default router;
