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
                    lastPunch: lastPunch?.dateTime || null,
                    workStart1: emp.workStart1,
                    workEnd1: emp.workEnd1,
                    workStart2: emp.workStart2,
                    workEnd2: emp.workEnd2,
                    isTreated: emp.isTreated
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
                },
                salaryHistory: {
                    orderBy: { changeDate: 'desc' }
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

/**
 * Toggle employee treatment status
 */
export async function toggleEmployeeTreatment(req, res) {
    try {
        const { id } = req.params;

        const employee = await prisma.employee.findUnique({
            where: { id: parseInt(id) },
            select: { isTreated: true }
        });

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const updated = await prisma.employee.update({
            where: { id: parseInt(id) },
            data: { isTreated: !employee.isTreated }
        });

        res.json({ success: true, isTreated: updated.isTreated });
    } catch (error) {
        console.error('Toggle treatment error:', error);
        res.status(500).json({ error: error.message });
    }
}

/**
 * Reset all employees treatment status
 */
export async function resetAllTreatment(req, res) {
    try {
        await prisma.employee.updateMany({
            data: { isTreated: false }
        });

        res.json({ success: true, message: 'Conferência resetada com sucesso' });
    } catch (error) {
        console.error('Reset treatment error:', error);
        res.status(500).json({ error: error.message });
    }
}

/**
 * Create a new employee manually
 */
export async function createEmployee(req, res) {
    try {
        const { enNo, name, workStart1, workEnd1, workStart2, workEnd2 } = req.body;

        if (!enNo || !name) {
            return res.status(400).json({ error: 'Matrícula e Nome são obrigatórios.' });
        }

        // Check if enNo already exists
        const existing = await prisma.employee.findUnique({
            where: { enNo }
        });

        if (existing) {
            return res.status(400).json({ error: 'Já existe um colaborador com esta matrícula.' });
        }

        const employee = await prisma.employee.create({
            data: {
                enNo,
                name,
                workStart1,
                workEnd1,
                workStart2,
                workEnd2
            }
        });

        res.status(201).json(employee);
    } catch (error) {
        console.error('Create employee error:', error);
        res.status(500).json({ error: error.message });
    }
}

/**
 * Update full employee profile
 */
export async function updateEmployeeProfile(req, res) {
    try {
        const { id } = req.params;
        const data = req.body;

        // Current employee to check salary change
        const current = await prisma.employee.findUnique({
            where: { id: parseInt(id) },
            select: { salary: true }
        });

        // 1. Prepare Update Data
        const updateData = {
            name: data.name,
            jobTitle: data.jobTitle,
            salary: data.salary ? parseFloat(data.salary) : null,
            startDate: data.startDate ? new Date(data.startDate) : null,
            regDate: data.regDate ? new Date(data.regDate) : null,
            cep: data.cep,
            address: data.address,
            number: data.number,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
            phone: data.phone,
            cpf: data.cpf,
            rg: data.rg,
            pis: data.pis,
            reservista: data.reservista,
            titulo: data.titulo,
            cnh: data.cnh,
            education: data.education,
            maritalStatus: data.maritalStatus,
            fatherName: data.fatherName,
            motherName: data.motherName,
            childrenInfo: data.childrenInfo || []
        };

        // 2. Wrap in transaction to handle salary history
        const updated = await prisma.$transaction(async (tx) => {
            const emp = await tx.employee.update({
                where: { id: parseInt(id) },
                data: updateData
            });

            // If salary changed, record history
            if (current && data.salary && parseFloat(current.salary) !== parseFloat(data.salary)) {
                await tx.salaryHistory.create({
                    data: {
                        employeeId: emp.id,
                        amount: parseFloat(data.salary),
                        reason: data.salaryReason || 'Alteração cadastral'
                    }
                });
            }

            return emp;
        });

        res.json(updated);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: error.message });
    }
}
