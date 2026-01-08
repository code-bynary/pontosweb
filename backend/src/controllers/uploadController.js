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

        // Generate workdays for all affected employees
        // This is a simplified version - in production you'd want to do this more efficiently
        res.json(result);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
}
