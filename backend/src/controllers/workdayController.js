import { getMonthlyTimecard, updateWorkday, getWorkdayHistory } from '../services/workdayService.js';
import { generateWorkdays } from '../services/punchService.js';

/**
 * Get monthly timecard for employee
 */
export async function getMonthlyTimecardController(req, res) {
    try {
        const { employeeId, month } = req.params;

        // Parse month (format: YYYY-MM)
        const [year, monthNum] = month.split('-').map(Number);

        if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
            return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
        }

        const timecard = await getMonthlyTimecard(employeeId, year, monthNum);
        res.json(timecard);
    } catch (error) {
        console.error('Get timecard error:', error);
        res.status(500).json({ error: error.message });
    }
}

/**
 * Generate workdays from punches
 */
export async function generateWorkdaysController(req, res) {
    try {
        const { employeeId } = req.params;
        const { startDate, endDate } = req.body;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'startDate and endDate are required' });
        }

        const workdays = await generateWorkdays(
            parseInt(employeeId),
            new Date(startDate),
            new Date(endDate)
        );

        res.json({ success: true, workdays });
    } catch (error) {
        console.error('Generate workdays error:', error);
        res.status(500).json({ error: error.message });
    }
}

/**
 * Update workday
 */
export async function updateWorkdayController(req, res) {
    try {
        const { id } = req.params;
        const { entrada1, saida1, entrada2, saida2, reason, createdBy } = req.body;

        const updates = {};
        if (entrada1 !== undefined) updates.entrada1 = entrada1;
        if (saida1 !== undefined) updates.saida1 = saida1;
        if (entrada2 !== undefined) updates.entrada2 = entrada2;
        if (saida2 !== undefined) updates.saida2 = saida2;

        const workday = await updateWorkday(id, updates, reason, createdBy);
        res.json({ success: true, workday });
    } catch (error) {
        console.error('Update workday error:', error);
        res.status(500).json({ error: error.message });
    }
}

/**
 * Get workday adjustment history
 */
export async function getWorkdayHistoryController(req, res) {
    try {
        const { id } = req.params;
        const history = await getWorkdayHistory(id);
        res.json(history);
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: error.message });
    }
}
