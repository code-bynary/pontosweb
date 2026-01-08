import express from 'express';
import { getAllEmployees, getEmployee } from '../controllers/employeeController.js';

const router = express.Router();

// GET /api/employees
router.get('/', getAllEmployees);

// GET /api/employees/:id
router.get('/:id', getEmployee);

export default router;
