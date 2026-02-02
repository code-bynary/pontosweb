import { generatePDFTimecard, generateExcelTimecard } from '../services/exportService.js';
import prisma from '../utils/prisma.js';

/**
 * Export timecard as PDF
 */
export async function exportPDF(req, res) {
    try {
        const { employeeId, month } = req.params;
        const [year, monthNum] = month.split('-').map(Number);

        const pdfBuffer = await generatePDFTimecard(employeeId, year, monthNum);

        const employee = await prisma.employee.findUnique({
            where: { id: parseInt(employeeId) }
        });
        const employeeName = employee ? employee.name.replace(/\s+/g, '_') : 'Funcionario';
        const fileName = `Cartao_Ponto_${employeeName}_${month}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
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

        const employee = await prisma.employee.findUnique({
            where: { id: parseInt(employeeId) }
        });
        const employeeName = employee ? employee.name.replace(/\s+/g, '_') : 'Funcionario';
        const fileName = `Cartao_Ponto_${employeeName}_${month}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.send(excelBuffer);
    } catch (error) {
        console.error('Export Excel error:', error);
        res.status(500).json({ error: error.message });
    }
}
