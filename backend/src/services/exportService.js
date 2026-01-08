import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { getMonthlyTimecard } from './workdayService.js';

/**
 * Generate PDF timecard
 */
export async function generatePDFTimecard(employeeId, year, month) {
    const data = await getMonthlyTimecard(employeeId, year, month);

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(20).text('Cartão de Ponto', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Funcionário: ${data.employee.name} (${data.employee.enNo})`);
        doc.text(`Período: ${data.month}`);
        doc.moveDown();

        // Table header
        const tableTop = doc.y;
        const colWidths = [80, 60, 60, 60, 60, 60];
        const headers = ['Data', 'Entrada 1', 'Saída 1', 'Entrada 2', 'Saída 2', 'Total'];

        let x = 50;
        headers.forEach((header, i) => {
            doc.fontSize(10).font('Helvetica-Bold').text(header, x, tableTop, { width: colWidths[i] });
            x += colWidths[i];
        });

        // Table rows
        let y = tableTop + 20;
        doc.font('Helvetica');

        data.workdays.forEach(wd => {
            x = 50;
            const row = [
                wd.date,
                wd.entrada1 || '-',
                wd.saida1 || '-',
                wd.entrada2 || '-',
                wd.saida2 || '-',
                wd.totalHours
            ];

            row.forEach((cell, i) => {
                doc.fontSize(9).text(cell, x, y, { width: colWidths[i] });
                x += colWidths[i];
            });

            y += 20;

            // New page if needed
            if (y > 700) {
                doc.addPage();
                y = 50;
            }
        });

        // Total
        doc.moveDown();
        doc.fontSize(12).font('Helvetica-Bold').text(`Total do Mês: ${data.totalHours}h`, { align: 'right' });

        doc.end();
    });
}

/**
 * Generate Excel timecard
 */
export async function generateExcelTimecard(employeeId, year, month) {
    const data = await getMonthlyTimecard(employeeId, year, month);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Cartão de Ponto');

    // Header
    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = 'Cartão de Ponto';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.getCell('A2').value = `Funcionário: ${data.employee.name} (${data.employee.enNo})`;
    worksheet.getCell('A3').value = `Período: ${data.month}`;

    // Table headers
    worksheet.getRow(5).values = ['Data', 'Entrada 1', 'Saída 1', 'Entrada 2', 'Saída 2', 'Total'];
    worksheet.getRow(5).font = { bold: true };

    // Data rows
    data.workdays.forEach((wd, index) => {
        const row = worksheet.getRow(6 + index);
        row.values = [
            wd.date,
            wd.entrada1 || '-',
            wd.saida1 || '-',
            wd.entrada2 || '-',
            wd.saida2 || '-',
            wd.totalHours
        ];
    });

    // Total row
    const totalRow = worksheet.getRow(6 + data.workdays.length + 1);
    totalRow.getCell(5).value = 'Total:';
    totalRow.getCell(5).font = { bold: true };
    totalRow.getCell(6).value = `${data.totalHours}h`;
    totalRow.getCell(6).font = { bold: true };

    // Column widths
    worksheet.columns = [
        { width: 15 },
        { width: 12 },
        { width: 12 },
        { width: 12 },
        { width: 12 },
        { width: 12 }
    ];

    return await workbook.xlsx.writeBuffer();
}
