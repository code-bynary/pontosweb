import { getAllHolidays, getHolidaysByYear, createHoliday, deleteHoliday } from '../services/holidayService.js';

/**
 * Get all holidays or holidays for a specific year
 */
export async function getHolidays(req, res) {
    try {
        const { year } = req.query;

        let holidays;
        if (year) {
            holidays = await getHolidaysByYear(parseInt(year));
        } else {
            holidays = await getAllHolidays();
        }

        res.json(holidays);
    } catch (error) {
        console.error('Error fetching holidays:', error);
        res.status(500).json({ error: 'Failed to fetch holidays' });
    }
}

/**
 * Create a new holiday
 */
export async function addHoliday(req, res) {
    try {
        const { date, name, type, description } = req.body;

        if (!date || !name || !type) {
            return res.status(400).json({ error: 'Date, name, and type are required' });
        }

        const holiday = await createHoliday({ date, name, type, description });

        res.status(201).json(holiday);
    } catch (error) {
        console.error('Error creating holiday:', error);

        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'A holiday already exists for this date' });
        }

        res.status(500).json({ error: 'Failed to create holiday' });
    }
}

/**
 * Delete a holiday
 */
export async function removeHoliday(req, res) {
    try {
        const { id } = req.params;

        await deleteHoliday(id);

        res.json({ message: 'Holiday deleted successfully' });
    } catch (error) {
        console.error('Error deleting holiday:', error);

        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Holiday not found' });
        }

        res.status(500).json({ error: 'Failed to delete holiday' });
    }
}
