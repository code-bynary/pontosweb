import prisma from '../utils/prisma.js';

/**
 * Get all employees
 */
export async function getAllEmployees(req, res) {
    try {
        const employees = await prisma.employee.findMany({
            include: {
                _count: {
                    select: { punches: true, workdays: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        // Get last punch for each employee
        const employeesWithLastPunch = await Promise.all(
            employees.map(async (emp) => {
                const lastPunch = await prisma.punch.findFirst({
                    where: { employeeId: emp.id },
                    orderBy: { dateTime: 'desc' }
                });

                return {
                    id: emp.id,
                    enNo: emp.enNo,
                    name: emp.name,
                    punchCount: emp._count.punches,
                    workdayCount: emp._count.workdays,
                    lastPunch: lastPunch?.dateTime || null
                };
            })
        );

        res.json(employeesWithLastPunch);
    } catch (error) {
        console.error('Get employees error:', error);
        res.status(500).json({ error: error.message });
    }
}

/**
 * Get single employee
 */
export async function getEmployee(req, res) {
    try {
        const { id } = req.params;

        const employee = await prisma.employee.findUnique({
            where: { id: parseInt(id) },
            include: {
                _count: {
                    select: { punches: true, workdays: true }
                }
            }
        });

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.json(employee);
    } catch (error) {
        console.error('Get employee error:', error);
        res.status(500).json({ error: error.message });
    }
}

/**
 * Update employee work schedule
 */
export async function updateEmployeeSchedule(req, res) {
    try {
        const { id } = req.params;
        const { workStart1, workEnd1, workStart2, workEnd2 } = req.body;

        // Validation (simple HH:mm check)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        const validateTime = (t) => !t || timeRegex.test(t);

        if (!validateTime(workStart1) || !validateTime(workEnd1) ||
            !validateTime(workStart2) || !validateTime(workEnd2)) {
            return res.status(400).json({ error: 'Formato de hora inválido (use HH:MM)' });
        }

        const employee = await prisma.employee.update({
            where: { id: parseInt(id) },
            data: {
                workStart1,
                workEnd1,
                workStart2,
                workEnd2
            }
        });

        res.json({ success: true, employee });
    } catch (error) {
        console.error('Update schedule error:', error);
        res.status(500).json({ error: error.message });
    }
}
