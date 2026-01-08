import prisma from '../utils/prisma.js';
import { parsePunchFile } from '../utils/helpers.js';

/**
 * Import punch records from TXT file
 */
export async function importPunchFile(fileContent) {
    const { records, errors } = parsePunchFile(fileContent);

    let processedCount = 0;
    const importErrors = [...errors];
    const affectedEmployees = new Set();
    let minDate = null;
    let maxDate = null;

    for (const record of records) {
        try {
            // Find or create employee
            let employee = await prisma.employee.findUnique({
                where: { enNo: record.enNo }
            });

            if (!employee) {
                employee = await prisma.employee.create({
                    data: {
                        enNo: record.enNo,
                        name: record.name,
                        mode: record.mode
                    }
                });
            } else if (record.mode !== null && employee.mode !== record.mode) {
                // Update mode if it changed
                employee = await prisma.employee.update({
                    where: { id: employee.id },
                    data: { mode: record.mode }
                });
            }

            // Track affected employee
            affectedEmployees.add(employee.id);

            // Track date range
            if (!minDate || record.dateTime < minDate) minDate = record.dateTime;
            if (!maxDate || record.dateTime > maxDate) maxDate = record.dateTime;

            // Create punch record (idempotent check)
            const existingPunch = await prisma.punch.findFirst({
                where: {
                    employeeId: employee.id,
                    dateTime: record.dateTime
                }
            });

            if (!existingPunch) {
                await prisma.punch.create({
                    data: {
                        employeeId: employee.id,
                        ioMode: record.ioMode,
                        dateTime: record.dateTime,
                        imported: true
                    }
                });
                processedCount++;
            }
        } catch (error) {
            importErrors.push({
                record: record.enNo,
                error: error.message
            });
        }
    }

    return {
        success: true,
        processed: processedCount,
        total: records.length,
        errors: importErrors,
        meta: {
            affectedEmployees: Array.from(affectedEmployees),
            minDate,
            maxDate
        }
    };
}

/**
 * Generate workday records from punches
 */
export async function generateWorkdays(employeeId, startDate, endDate) {
    // Get all punches for employee in date range
    const punches = await prisma.punch.findMany({
        where: {
            employeeId,
            dateTime: {
                gte: startDate,
                lte: endDate
            }
        },
        orderBy: {
            dateTime: 'asc'
        }
    });

    // Group by date
    const punchesByDate = {};
    punches.forEach(punch => {
        const date = punch.dateTime.toISOString().split('T')[0];
        if (!punchesByDate[date]) {
            punchesByDate[date] = [];
        }
        punchesByDate[date].push(punch);
    });

    // Generate workday for each date
    const workdays = [];
    for (const [date, dayPunches] of Object.entries(punchesByDate)) {
        const workday = await createWorkdayFromPunches(employeeId, date, dayPunches);
        workdays.push(workday);
    }

    return workdays;
}

/**
 * Create or update workday from punch records
 */
async function createWorkdayFromPunches(employeeId, date, punches) {
    // Deduplicate punches by timestamp (down to the second)
    const uniqueMap = new Map();
    punches.forEach(p => {
        const timeKey = p.dateTime.getTime();
        if (!uniqueMap.has(timeKey)) {
            uniqueMap.set(timeKey, p);
        }
    });

    const uniquePunches = Array.from(uniqueMap.values());

    // Sort punches by time
    const sorted = uniquePunches.sort((a, b) => a.dateTime - b.dateTime);

    // Extract times (taking first 4 unique punches)
    const entrada1 = sorted[0] ? sorted[0].dateTime : null;
    const saida1 = sorted[1] ? sorted[1].dateTime : null;
    const entrada2 = sorted[2] ? sorted[2].dateTime : null;
    const saida2 = sorted[3] ? sorted[3].dateTime : null;

    // Calculate worked minutes
    let workedMinutes = 0;
    if (entrada1 && saida1) {
        workedMinutes += Math.floor((saida1 - entrada1) / 60000);
    }
    if (entrada2 && saida2) {
        workedMinutes += Math.floor((saida2 - entrada2) / 60000);
    }

    // Get employee schedule for calculations
    const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { workStart1: true, workEnd1: true, workStart2: true, workEnd2: true }
    });

    // Calculate expected minutes from schedule
    let expectedMinutes = 0;
    const parseTimeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    if (employee) {
        const s1 = parseTimeToMinutes(employee.workStart1);
        const e1 = parseTimeToMinutes(employee.workEnd1);
        const s2 = parseTimeToMinutes(employee.workStart2);
        const e2 = parseTimeToMinutes(employee.workEnd2);

        if (e1 > s1) expectedMinutes += (e1 - s1);
        if (e2 > s2) expectedMinutes += (e2 - s2);
    }

    // Calculate balance and extra
    // Simple logic: if worked > expected, the difference is extra. 
    // Balance is always worked - expected.
    const balanceMinutes = workedMinutes - expectedMinutes;
    const extraMinutes = balanceMinutes > 0 ? balanceMinutes : 0;

    // Determine status
    let status = 'INCOMPLETE';
    if (sorted.length >= 4 && entrada1 && saida1 && entrada2 && saida2) {
        status = 'OK';
    }

    // Create or update workday
    const workdayDate = new Date(date + 'T00:00:00Z');

    // Check if workday exists and is manually edited
    const existingWorkday = await prisma.workday.findUnique({
        where: {
            employeeId_date: {
                employeeId,
                date: workdayDate
            }
        }
    });

    if (existingWorkday && existingWorkday.status === 'EDITED') {
        // Skip updating times for manually edited records to preserve user changes
        return existingWorkday;
    }

    const workday = await prisma.workday.upsert({
        where: {
            employeeId_date: {
                employeeId,
                date: workdayDate
            }
        },
        update: {
            entrada1,
            saida1,
            entrada2,
            saida2,
            workedMinutes,
            expectedMinutes,
            extraMinutes,
            balanceMinutes,
            status
        },
        create: {
            employeeId,
            date: workdayDate,
            entrada1,
            saida1,
            entrada2,
            saida2,
            workedMinutes,
            expectedMinutes,
            extraMinutes,
            balanceMinutes,
            status
        }
    });

    return workday;
}
