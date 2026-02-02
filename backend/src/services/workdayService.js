import prisma from '../utils/prisma.js';
import { calculateTotalMinutes, timeStringToDate, formatTime } from '../utils/helpers.js';

/**
 * Get monthly timecard for an employee
 */
export async function getMonthlyTimecard(employeeId, year, month) {
    const employee = await prisma.employee.findUnique({
        where: { id: parseInt(employeeId) }
    });

    if (!employee) {
        throw new Error('Employee not found');
    }

    // Get all workdays for the month (robust range)
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    const workdays = await prisma.workday.findMany({
        where: {
            employeeId: parseInt(employeeId),
            date: {
                gte: startDate,
                lte: endDate
            }
        },
        orderBy: {
            date: 'asc'
        }
    });

    // Calculate total hours
    const workedMinutes = workdays.reduce((sum, wd) => sum + wd.workedMinutes, 0);
    const totalHours = Math.floor(workedMinutes / 60);
    const totalMins = workedMinutes % 60;

    return {
        employee: {
            id: employee.id,
            enNo: employee.enNo,
            name: employee.name
        },
        month: `${year}-${String(month).padStart(2, '0')}`,
        workdays: workdays.map(wd => ({
            id: wd.id,
            date: wd.date.toISOString().split('T')[0],
            entrada1: formatTime(wd.entrada1),
            saida1: formatTime(wd.saida1),
            entrada2: formatTime(wd.entrada2),
            saida2: formatTime(wd.saida2),
            workedMinutes: wd.workedMinutes,
            expectedMinutes: wd.expectedMinutes,
            extraMinutes: wd.extraMinutes,
            balanceMinutes: wd.balanceMinutes,
            totalHours: `${Math.floor(wd.workedMinutes / 60)}:${String(wd.workedMinutes % 60).padStart(2, '0')}`,
            status: wd.status
        })),
        totalMinutes: workedMinutes,
        totalHours: `${totalHours}:${String(totalMins).padStart(2, '0')}`
    };
}

/**
 * Update workday with manual adjustments
 */
export async function updateWorkday(workdayId, updates, reason = null, createdBy = null) {
    const workday = await prisma.workday.findUnique({
        where: { id: parseInt(workdayId) }
    });

    if (!workday) {
        throw new Error('Workday not found');
    }

    // Create adjustment records for each changed field
    const adjustments = [];
    const updateData = {};

    for (const [field, newValue] of Object.entries(updates)) {
        if (['entrada1', 'saida1', 'entrada2', 'saida2'].includes(field)) {
            const oldValue = formatTime(workday[field]);

            if (oldValue !== newValue) {
                adjustments.push({
                    workdayId: workday.id,
                    field,
                    oldValue,
                    newValue,
                    reason,
                    createdBy
                });

                updateData[field] = newValue ? timeStringToDate(newValue) : null;
            }
        }
    }

    // Recalculate total minutes
    const entrada1 = updateData.entrada1 !== undefined ? formatTime(updateData.entrada1) : formatTime(workday.entrada1);
    const saida1 = updateData.saida1 !== undefined ? formatTime(updateData.saida1) : formatTime(workday.saida1);
    const entrada2 = updateData.entrada2 !== undefined ? formatTime(updateData.entrada2) : formatTime(workday.entrada2);
    const saida2 = updateData.saida2 !== undefined ? formatTime(updateData.saida2) : formatTime(workday.saida2);

    updateData.workedMinutes = calculateTotalMinutes(entrada1, saida1, entrada2, saida2);
    updateData.status = 'EDITED';

    // Update workday and create adjustments in transaction
    const result = await prisma.$transaction(async (tx) => {
        // Create adjustment records
        if (adjustments.length > 0) {
            await tx.adjustment.createMany({
                data: adjustments
            });
        }

        // Update workday
        const updated = await tx.workday.update({
            where: { id: workday.id },
            data: updateData
        });

        return updated;
    });

    return result;
}

/**
 * Get adjustment history for a workday
 */
export async function getWorkdayHistory(workdayId) {
    const adjustments = await prisma.adjustment.findMany({
        where: { workdayId: parseInt(workdayId) },
        orderBy: { createdAt: 'desc' }
    });

    return adjustments;
}
