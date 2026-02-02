import prisma from '../utils/prisma.js';
import { parsePunchFile, calculateDailyExpectedMinutes } from '../utils/helpers.js';

// Antigravity: Início da refatoração do cálculo de horas (fix/calculation-and-recalc-logic)

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
    // Get all punches for employee in date range with 1 day buffer (just in case of midnight crossing, though we map to local day)
    const bufferStart = new Date(startDate);
    bufferStart.setDate(bufferStart.getDate() - 1);
    const bufferEnd = new Date(endDate);
    bufferEnd.setDate(bufferEnd.getDate() + 1);

    const allPunches = await prisma.punch.findMany({
        where: {
            employeeId,
            dateTime: {
                gte: bufferStart,
                lte: bufferEnd
            }
        },
        orderBy: {
            dateTime: 'asc'
        }
    });

    // 1. Group ALL punches by Local Date (YYYY-MM-DD)
    const punchesByDate = {};
    allPunches.forEach(punch => {
        const d = new Date(punch.dateTime);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;

        if (!punchesByDate[dateKey]) {
            punchesByDate[dateKey] = [];
        }
        punchesByDate[dateKey].push(punch);
    });

    // 2. Process each day in the requested range
    const resultWorkdays = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    const MIN_PUNCH_INTERVAL = 15 * 60 * 1000; // 15 minutes deduplication window

    while (current <= end) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;

        const rawDayPunches = punchesByDate[dateKey] || [];

        // Deduplicate punches for this specific day
        const dayPunches = [];
        rawDayPunches.forEach(punch => {
            const lastPunch = dayPunches[dayPunches.length - 1];
            // Only add if it's the first punch or sufficiently distant from the last one
            if (!lastPunch || (punch.dateTime.getTime() - lastPunch.dateTime.getTime()) > MIN_PUNCH_INTERVAL) {
                dayPunches.push(punch);
            }
        });

        // Update workday for this day specifically
        const workday = await updateWorkdayFromPunches(employeeId, dateKey, dayPunches);
        resultWorkdays.push(workday);

        current.setDate(current.getDate() + 1);
    }

    return resultWorkdays;
}

/**
 * Update or create workday from a list of punches
 */
async function updateWorkdayFromPunches(employeeId, date, dayPunches) {
    // 1. Group punches into pairs within the day
    const pairs = [];
    for (let i = 0; i < dayPunches.length; i += 2) {
        const inPunch = dayPunches[i];
        const outPunch = dayPunches[i + 1] || null;
        pairs.push({ inPunch, outPunch });
    }

    // Extract times (max 2 pairs mapped to entrada1/saida1, entrada2/saida2)
    const pair1 = pairs[0] || {};
    const pair2 = pairs[1] || {};

    const entrada1 = pair1.inPunch ? pair1.inPunch.dateTime : null;
    const saida1 = pair1.outPunch ? pair1.outPunch.dateTime : null;
    const entrada2 = pair2.inPunch ? pair2.inPunch.dateTime : null;
    const saida2 = pair2.outPunch ? pair2.outPunch.dateTime : null;

    // Calculate worked minutes
    let workedMinutes = 0;
    pairs.forEach(pair => {
        if (pair.inPunch && pair.outPunch) {
            workedMinutes += Math.floor((pair.outPunch.dateTime - pair.inPunch.dateTime) / 60000);
        }
    });

    const workdayDate = new Date(date + 'T00:00:00Z');

    // Get employee schedule for calculations
    const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { workStart1: true, workEnd1: true, workStart2: true, workEnd2: true }
    });

    // Calculate expected minutes
    const expectedMinutes = await calculateDailyExpectedMinutes(employee, workdayDate);

    // Calculate balance and extra
    const balanceMinutes = workedMinutes - expectedMinutes;
    const extraMinutes = balanceMinutes > 0 ? balanceMinutes : 0;

    // Determine status
    let status = 'INCOMPLETE';
    if (expectedMinutes === 0) {
        status = workedMinutes > 0 ? 'OK' : 'OK'; // Holidays/Weekends are OK even with 0 hours
    } else if (pairs.length >= 2 && entrada1 && saida1 && entrada2 && saida2) {
        status = 'OK';
    } else if (dayPunches.length === 2 && entrada1 && saida1) {
        // Simple case: 1 shift day
        if (workedMinutes >= expectedMinutes) status = 'OK';
    }

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
        // Antigravity: Even for EDITED days, we want to ensure expectedMinutes and balanceMinutes 
        // are consistent with current schedule and logic.
        const updatedBalance = existingWorkday.workedMinutes - expectedMinutes;
        const updatedExtra = updatedBalance > 0 ? updatedBalance : 0;

        return await prisma.workday.update({
            where: { id: existingWorkday.id },
            data: {
                expectedMinutes,
                balanceMinutes: updatedBalance,
                extraMinutes: updatedExtra
                // We DON'T update entrada/saida/workedMinutes/status because it's EDITED
            }
        });
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

/**
 * Recalculate workdays for an employee in a given range
 * This is useful after manual punch corrections or when bulk re-processing is needed
 */
export async function recalculateEmployeeWorkdays(employeeId, startDate, endDate) {
    const sDate = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const eDate = typeof endDate === 'string' ? new Date(endDate) : endDate;

    console.log(`Recalculating workdays for employee ${employeeId} from ${sDate.toISOString()} to ${eDate.toISOString()}`);

    return await generateWorkdays(employeeId, sDate, eDate);
}
