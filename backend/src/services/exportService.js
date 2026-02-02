import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { getMonthlyTimecard, getCompanyMonthlyReport } from './workdayService.js';

/**
 * Generate PDF timecard
 */
export async function generatePDFTimecard(employeeId, year, month) {
    const data = await getMonthlyTimecard(employeeId, year, month);

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 25 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(16).text('Cartão de Ponto', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).text(`Funcionário: ${data.employee.name} (${data.employee.enNo})`);
        doc.text(`Período: ${data.month}`);
        doc.moveDown(0.5);

        // Table header
        const tableTop = doc.y;
        const colWidths = [80, 50, 50, 50, 50, 50];
        const headers = ['Data', 'Entr 1', 'Saíd 1', 'Entr 2', 'Saíd 2', 'Total'];

        let x = 40;
        headers.forEach((header, i) => {
            doc.fontSize(9).font('Helvetica-Bold').text(header, x, tableTop, { width: colWidths[i] });
            x += colWidths[i];
        });

        // Table rows
        let y = tableTop + 15;
        doc.font('Helvetica');

        data.workdays.forEach(wd => {
            x = 40;
            const row = [
                wd.date,
                wd.entrada1 || '-',
                wd.saida1 || '-',
                wd.entrada2 || '-',
                wd.saida2 || '-',
                wd.totalHours
            ];

            row.forEach((cell, i) => {
                doc.fontSize(8).text(cell, x, y, { width: colWidths[i] });
                x += colWidths[i];
            });

            y += 13.5;

            // Page break only if truly necessary (A4 has ~842 points)
            if (y > 780) {
                doc.addPage();
                y = 30;
            }
        });

        // Total
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold').text(`Total do Mês: ${data.totalHours}h`, { align: 'right' });

        // Summary Stats (On the same page)
        doc.moveDown();
        const statsY = doc.y;

        doc.fontSize(12).font('Helvetica-Bold').text('Resumo Mensal', 40, statsY, { underline: true });
        doc.moveDown(0.5);

        const summaryX = 40;
        doc.fontSize(9).font('Helvetica-Bold');
        doc.text(`Total Esperado: `, summaryX, doc.y, { continued: true }).font('Helvetica').text(`${data.totalExpectedHours}h`);
        doc.font('Helvetica-Bold').text(`Total Trabalhado: `, { continued: true }).font('Helvetica').text(`${data.totalHours}h`);
        doc.font('Helvetica-Bold').text(`Total Abonado: `, { continued: true }).font('Helvetica').text(`${data.stats.totalAbonoHours}h`);

        doc.font('Helvetica-Bold').text(`Horas Extras: `, { continued: true }).font('Helvetica').fillColor('green').text(`${data.stats.totalExtraHours}h`).fillColor('black');
        doc.font('Helvetica-Bold').text(`Atrasos/Faltas: `, { continued: true }).font('Helvetica').fillColor('red').text(`${data.stats.totalDelayHours}h`).fillColor('black');

        doc.fontSize(11).font('Helvetica-Bold').text(`Saldo Final: `, { continued: true }).fillColor(data.totalBalanceMinutes >= 0 ? 'green' : 'red').text(`${data.totalBalanceHours}h`).fillColor('black');

        // Signature Area (Compact)
        doc.moveDown(2);
        const signatureY = doc.y + 20;
        doc.moveTo(40, signatureY).lineTo(220, signatureY).stroke();
        doc.moveTo(350, signatureY).lineTo(530, signatureY).stroke();

        doc.fontSize(8).font('Helvetica-Bold').text('Assinatura do Colaborador', 40, signatureY + 5, { width: 180, align: 'center' });
        doc.text('Assinatura do Responsável', 350, signatureY + 5, { width: 180, align: 'center' });

        doc.fontSize(7).font('Helvetica').text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')} | PontosWeb v1.4.0`, 40, doc.page.height - 25, { align: 'center' });

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
    const lastRow = 6 + data.workdays.length;

    worksheet.mergeCells(`A${lastRow + 2}:D${lastRow + 2}`);
    const summaryCell = worksheet.getCell(`A${lastRow + 2}`);
    summaryCell.value = 'RESUMO MENSAL DETALHADO';
    summaryCell.font = { bold: true, size: 12 };

    const statsStartRow = lastRow + 3;
    worksheet.getCell(`A${statsStartRow}`).value = 'Total Horas Extras:';
    worksheet.getCell(`B${statsStartRow}`).value = data.stats.totalExtraHours;
    worksheet.getCell(`A${statsStartRow + 1}`).value = 'Total Atrasos/Faltas:';
    worksheet.getCell(`B${statsStartRow + 1}`).value = data.stats.totalDelayHours;
    worksheet.getCell(`A${statsStartRow + 2}`).value = 'Total Abonado:';
    worksheet.getCell(`B${statsStartRow + 2}`).value = data.stats.totalAbonoHours;
    worksheet.getCell(`A${statsStartRow + 3}`).value = 'Saldo Final:';
    worksheet.getCell(`B${statsStartRow + 3}`).value = data.totalBalanceHours;
    worksheet.getCell(`B${statsStartRow + 3}`).font = { bold: true, color: { argb: data.totalBalanceMinutes >= 0 ? 'FF008000' : 'FFFF0000' } };

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

/**
 * Generate Company-wide Monthly Report Excel
 */
export async function generateCompanyReportExcel(year, month) {
    const reportData = await getCompanyMonthlyReport(year, month);
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Relatório Gerencial');

    // Header
    worksheet.mergeCells('A1:H1');
    worksheet.getCell('A1').value = `Relatório Gerencial Mensal - ${monthStr}`;
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    // Table headers
    worksheet.getRow(3).values = [
        'Matrícula',
        'Nome',
        'Esperado',
        'Trabalhado',
        'Abono',
        'Extras',
        'Atrasos/Faltas',
        'Saldo Final'
    ];
    worksheet.getRow(3).font = { bold: true };
    worksheet.getRow(3).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };

    // Data rows
    reportData.forEach((emp, index) => {
        const row = worksheet.getRow(4 + index);
        if (emp.error) {
            row.values = [emp.enNo, emp.name, 'ERRO AO CALCULAR'];
            return;
        }

        row.values = [
            emp.enNo,
            emp.name,
            emp.expectedHours,
            emp.workedHours,
            emp.abonoHours,
            emp.extraHours,
            emp.delayHours,
            emp.balanceHours
        ];

        // Color balance
        const balanceCell = row.getCell(8);
        balanceCell.font = {
            bold: true,
            color: { argb: emp.balanceMinutes >= 0 ? 'FF008000' : 'FFFF0000' }
        };
    });

    // Column widths
    worksheet.columns = [
        { width: 12 },
        { width: 30 },
        { width: 12 },
        { width: 12 },
        { width: 12 },
        { width: 12 },
        { width: 15 },
        { width: 12 }
    ];

    // Auto-filter
    worksheet.autoFilter = `A3:H${3 + reportData.length}`;

    return await workbook.xlsx.writeBuffer();
}
