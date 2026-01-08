import prisma from '../utils/prisma.js';
import { parsePunchFile } from '../utils/helpers.js';

/**
 * Import punch records from TXT file
 */
export async function importPunchFile(fileContent) {
    const { records, errors } = parsePunchFile(fileContent);

    let processedCount = 0;
    const importErrors = [...errors];

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
                        name: record.name
                    }
                });
            }

            // Create punch record
            await prisma.punch.create({
                data: {
                    employeeId: employee.id,
                    ioMode: record.ioMode,
                    dateTime: record.dateTime,
                    imported: true
                }
            });

            processedCount++;
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
        errors: importErrors
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
    // Sort punches by time
    const sorted = punches.sort((a, b) => a.dateTime - b.dateTime);

    // Extract times
    const entrada1 = sorted[0] ? sorted[0].dateTime : null;
    const saida1 = sorted[1] ? sorted[1].dateTime : null;
    const entrada2 = sorted[2] ? sorted[2].dateTime : null;
    const saida2 = sorted[3] ? sorted[3].dateTime : null;

    // Calculate total minutes
    let totalMinutes = 0;
    if (entrada1 && saida1) {
        totalMinutes += Math.floor((saida1 - entrada1) / 60000);
    }
    if (entrada2 && saida2) {
        totalMinutes += Math.floor((saida2 - entrada2) / 60000);
    }

    // Determine status
    let status = 'INCOMPLETE';
    if (sorted.length >= 4 && entrada1 && saida1 && entrada2 && saida2) {
        status = 'OK';
    }

    // Create or update workday
    const workday = await prisma.workday.upsert({
        where: {
            employeeId_date: {
                employeeId,
                date: new Date(date)
            }
        },
        update: {
            entrada1,
            saida1,
            entrada2,
            saida2,
            totalMinutes,
            status
        },
        create: {
            employeeId,
            date: new Date(date),
            entrada1,
            saida1,
            entrada2,
            saida2,
            totalMinutes,
            status
        }
    });

    return workday;
}
