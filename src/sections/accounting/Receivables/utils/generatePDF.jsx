import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { fNumber } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';
import logo from '../../../../assets/logos/techno.png'

export const generatePDF = (filteredData, receivable, dateRange) => {

  const { startDate, endDate } = dateRange || {};

  // Display either the selected date range or default text
  const dateRangeText = startDate && endDate
    ? `${fDate(startDate)} to ${fDate(endDate)}`
    : '';

  // eslint-disable-next-line new-cap
  const doc = new jsPDF();

  let pageNumber = 1; // Initialize page number

  // Helper function to add page header and footer
  const addPageHeaderFooter = (pageNo) => {
    doc.setFontSize(10);
    doc.text(`Intecomart`, 30, 10, { align: 'right' });

    doc.text(`Page No: ${pageNo}`, 200, 10, { align: 'right' });
    if (pageNo > 0) {
      doc.setDrawColor(0);
      doc.setLineWidth(0.2);
      doc.line(10, 282, 200, 282); // Divider
      doc.text('Continued on next page...', 105, 290, { align: 'center' });
    }
  };

  // Add Header Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  // doc.text('Sandbox Data', 105, 10, { align: 'center' });
    doc.addImage(logo, 'PNG', 10, 5, 20, 20);
  doc.setFontSize(10);
  doc.text(receivable.customerName, 105, 15, { align: 'center' });
  // doc.text(receivable.closingBalance, 105, 20, { align: 'center' });
  doc.text(dateRangeText, 105, 20, { align: 'center' });
  // Table headers
  const headers = [
    ['Tally Invoice No', 'Tally Order ID', 'Bill Date','Credit Period', 'Opening Balance', 'Closing Balance'],
  ];

  // Data mapping for the table
  const data = filteredData.map((item) => [
    item.tallyInvNo,
    item.tallyOrdId,
    fDate(item.billDate) || "-",
    item.creditPeriod,
    `Rs: ${fNumber(item.openingBalance)}`,
    `Rs: ${fNumber(item.closingBalance)}`,
  ]);

  // Generate the table
  doc.autoTable({
    head: headers,
    body: data,
    startY: 24,
    theme: 'plain',
    margin: { left: 10, right: 10 },
    styles: { fontSize: 9, cellPadding: 1.5 },
    headStyles: {
      fontStyle: 'bold',
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      halign: 'center',
      valign: 'middle',
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 32, overflow: 'linebreak' },
      1: { halign: 'center', cellWidth: 32, overflow: 'linebreak' },
      2: { halign: 'center', cellWidth: 32, overflow: 'linebreak' },
      3: { halign: 'center', cellWidth: 32, overflow: 'linebreak' },
      4: { halign: 'center', cellWidth: 32, overflow: 'linebreak' },
      5: { halign: 'center', cellWidth: 32, overflow: 'linebreak' },
    },
    didDrawPage: (pageData) => {
      addPageHeaderFooter(pageNumber);
      pageNumber += 1;
    },
    didDrawCell: (cellData) => {
      if (cellData.section === 'head') {
        const { cell } = cellData;
        const { x, y, width } = cell;
        doc.setLineWidth(0.1);
        doc.line(x, y, x + width, y);
        doc.line(x, y + cell.height, x + width, y + cell.height);
      }
    },
  });

  const totalDebit = filteredData.reduce((total, item) => total + item.openingBalance, 0);
  const totalCredit = filteredData.reduce((total, item) => total + item.closingBalance, 0);
  const finalY = doc.previousAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const paddingY = 4;
  const textY = finalY + paddingY;

  doc.setLineWidth(0.5);
  doc.line(10, textY - paddingY - 1, 200, textY - paddingY - 1);
  doc.text('By', 20, textY);
  doc.text('Total Balance', 50, textY);
  doc.text(`Rs: ${fNumber(totalDebit)}`, 150, textY, { align: 'center' });
  doc.text(`Rs: ${fNumber(totalCredit)}`, 185, textY, { align: 'center' });
  doc.line(10, textY + paddingY - 2, 200, textY + paddingY - 2);

  doc.save('receivable_statement.pdf');
};
