import { getCompanyMonthlyReport } from '../services/workdayService.js';
import { generateCompanyReportExcel } from '../services/exportService.js';

/**
 * Get company-wide monthly report data
 */
export async function getMonthlyCompanyReport(req, res) {
    try {
        const { month } = req.params; // YYYY-MM
        const [year, monthNum] = month.split('-').map(Number);

        const report = await getCompanyMonthlyReport(year, monthNum);
        res.json(report);
    } catch (error) {
        console.error('Company report error:', error);
        res.status(500).json({ error: error.message });
    }
}

/**
 * Export company-wide report as Excel
 */
export async function exportCompanyExcel(req, res) {
    try {
        const { month } = req.params;
        const [year, monthNum] = month.split('-').map(Number);

        const excelBuffer = await generateCompanyReportExcel(year, monthNum);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Relatorio_Gerencial_${month}.xlsx`);
        res.send(excelBuffer);
    } catch (error) {
        console.error('Export Company Excel error:', error);
        res.status(500).json({ error: error.message });
    }
}
