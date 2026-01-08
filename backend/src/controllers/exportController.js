import { generatePDFTimecard, generateExcelTimecard } from '../services/exportService.js';

/**
 * Export timecard as PDF
 */
export async function exportPDF(req, res) {
    try {
        const { employeeId, month } = req.params;
        const [year, monthNum] = month.split('-').map(Number);

        const pdfBuffer = await generatePDFTimecard(employeeId, year, monthNum);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=timecard-${employeeId}-${month}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Export PDF error:', error);
        res.status(500).json({ error: error.message });
    }
}

/**
 * Export timecard as Excel
 */
export async function exportExcel(req, res) {
    try {
        const { employeeId, month } = req.params;
        const [year, monthNum] = month.split('-').map(Number);

        const excelBuffer = await generateExcelTimecard(employeeId, year, monthNum);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=timecard-${employeeId}-${month}.xlsx`);
        res.send(excelBuffer);
    } catch (error) {
        console.error('Export Excel error:', error);
        res.status(500).json({ error: error.message });
    }
}
