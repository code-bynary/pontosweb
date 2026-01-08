import { importPunchFile, generateWorkdays } from '../services/punchService.js';

/**
 * Handle file upload and import
 */
export async function uploadFile(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileContent = req.file.buffer.toString('utf-8');
        const result = await importPunchFile(fileContent);

        // Automatically generate workdays for all affected employees in the date range
        if (result.success && result.meta.affectedEmployees.length > 0) {
            console.log(`Generating workdays for ${result.meta.affectedEmployees.length} employees...`);

            // Sequential generation to avoid heavy concurrent DB pressure, 
            // though for small imports Promise.all would also work.
            for (const empId of result.meta.affectedEmployees) {
                await generateWorkdays(empId, result.meta.minDate, result.meta.maxDate);
            }

            console.log('Workday generation completed.');
        }

        res.json(result);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
}
