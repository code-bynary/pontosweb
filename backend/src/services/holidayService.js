import prisma from '../utils/prisma.js';

/**
 * Get all holidays
 */
export async function getAllHolidays() {
    return await prisma.holiday.findMany({
        orderBy: {
            date: 'asc'
        }
    });
}

/**
 * Get holidays for a specific year
 */
export async function getHolidaysByYear(year) {
    const startDate = new Date(Date.UTC(year, 0, 1));
    const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

    return await prisma.holiday.findMany({
        where: {
            date: {
                gte: startDate,
                lte: endDate
            }
        },
        orderBy: {
            date: 'asc'
        }
    });
}

/**
 * Check if a specific date is a holiday
 */
export async function isHoliday(date) {
    const d = new Date(date);
    const dateOnly = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

    const holiday = await prisma.holiday.findUnique({
        where: {
            date: dateOnly
        }
    });

    return holiday !== null;
}

/**
 * Create a new holiday
 */
export async function createHoliday(data) {
    const { date, name, type, description } = data;

    // Ensure date is stored as UTC date only
    const d = new Date(date);
    const dateOnly = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

    return await prisma.holiday.create({
        data: {
            date: dateOnly,
            name,
            type,
            description
        }
    });
}

/**
 * Delete a holiday
 */
export async function deleteHoliday(id) {
    return await prisma.holiday.delete({
        where: {
            id: parseInt(id)
        }
    });
}
