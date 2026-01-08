import express from 'express';
import { getAllEmployees, getEmployee, updateEmployeeSchedule } from '../controllers/employeeController.js';

const router = express.Router();

// GET /api/employees
router.get('/', getAllEmployees);

// GET /api/employees/:id
router.get('/:id', getEmployee);

// PUT /api/employees/:id/schedule
router.put('/:id/schedule', updateEmployeeSchedule);

export default router;
