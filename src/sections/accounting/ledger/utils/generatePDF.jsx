import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { fNumber } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';
import logo from '../../../../assets/logos/techno.png'


export const generatePDF = (filteredData, ledger, dateRange) => {
  const { startDate, endDate } = dateRange || {};

  // Determine financial year dates if no date range is selected
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const financialStartDate = new Date(currentDate.getMonth() >= 3 ? `${currentYear}-04-01` : `${currentYear - 1}-04-01`);
  const financialEndDate = new Date(financialStartDate);
  financialEndDate.setFullYear(financialStartDate.getFullYear() + 1);
  financialEndDate.setDate(financialEndDate.getDate() - 1);

    // Filter data within the financial year
    const financialYearData = filteredData.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= financialStartDate && itemDate <= financialEndDate;
    });

    const notInFinancialYearData = filteredData.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate < financialStartDate || itemDate > financialEndDate;
    });
  

  // Display either the selected date range or the financial year range
  const dateRangeText = startDate && endDate
    ? `${fDate(startDate)} to ${fDate(endDate)}`
    : `${fDate(financialStartDate)} to ${fDate(financialEndDate)}`;
  // eslint-disable-next-line new-cap
  const doc = new jsPDF();

  let pageNumber = 1; // Initialize page number

  // Helper function to add page header and footer
  const addPageHeaderFooter = (pageNo) => {
    doc.setFontSize(10);
    doc.text(`RG Techno`, 30, 10, { align: 'right' });
    doc.line(10, 282, 200, 282); // Divider
    doc.text(`Page No: ${pageNo}`, 200, 10, { align: 'right' });
    if (pageNo > 0) {
      doc.setDrawColor(0);
      doc.setLineWidth(0.2);
      doc.line(10, 282, 200, 282); // Divider
      doc.text('Continued on next page...', 105, 290, { align: 'center' });
    }
  };

    // Add Financial Year Data
if (financialYearData.length > 0) {
  // Header Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.addImage(logo, 'PNG', 10, 5, 20, 20);
  // doc.text('Sandbox Data', 105, 10, { align: 'center' });
  doc.setFontSize(10);
  // doc.text('A', 105, 15, { align: 'center' });
  // doc.text('Bangalore', 105, 20, { align: 'center' });
  doc.text(ledger.party, 105, 15, { align: 'center' });
  // doc.text(ledger.alias || "Alias No Not found", 105, 20, { align: 'center' });
  // doc.text('Email: abhishek.amsn@gmail.com', 105, 35, { align: 'center' });
  // doc.text(`Ledger Account: A   B   C`, 105, 40, { align: 'center' });
  // doc.text(`01-Apr-2024 to 31-Mar-2025`, 105, 25, { align: 'center' });
  doc.text(dateRangeText, 105, 25, { align: 'center' });
  
  const headers = [['Date', 'Particulars', 'Vch Type', 'Vch No.', 'Debit', 'Credit']];
  const data = financialYearData.map((item) => [
    item.date,
    item.ledger,
    item.voucherType,
    item.voucherNo,
    `Rs: ${fNumber(item.debitAmount)}`,
    `Rs: ${fNumber(item.creditAmount)}`,
  ]);

  doc.autoTable({
    head: headers,
    body: data,
    startY: 30,
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
  })
}

    // Add Financial Year Data
    if (notInFinancialYearData.length > 0) {
      const startY = doc.previousAutoTable ? doc.previousAutoTable.finalY + 20 : 40;
      // Header Section
      doc.setFontSize(12);
      doc.text('Non-Financial Year Data', 105, startY, { align: 'center' });
      
      const headers = [['Date', 'Particulars', 'Vch Type', 'Vch No.', 'Debit', 'Credit']];
      const data = notInFinancialYearData.map((item) => [
        item.date,
        item.ledger,
        item.voucherType,
        item.voucherNo,
        `Rs: ${fNumber(item.debitAmount)}`,
        `Rs: ${fNumber(item.creditAmount)}`,
      ]);
    
      doc.autoTable({
        head: headers,
        body: data,
        startY: startY + 10,
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
        didDrawCell: (cellData) => {
          if (cellData.section === 'head') {
            const { cell } = cellData;
            const { x, y, width } = cell;
            doc.setLineWidth(0.1);
            doc.line(x, y, x + width, y);
            doc.line(x, y + cell.height, x + width, y + cell.height);
          }
        },
      })
    }

  const totalDebit = filteredData.reduce((total, item) => total + item.debitAmount, 0);
  const totalCredit = filteredData.reduce((total, item) => total + item.creditAmount, 0);
  const finalY = doc.previousAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const paddingY = 4;
  const textY = finalY + paddingY;

  doc.setLineWidth(0.5);
  doc.line(10, textY - paddingY - 1, 200, textY - paddingY - 1);
  doc.text('By', 20, textY);
  doc.text('Closing Balance', 50, textY);
  doc.text(`Rs: ${fNumber(totalDebit)}`, 150, textY, { align: 'center' });
  doc.text(`Rs: ${fNumber(totalCredit)}`, 190, textY, { align: 'center' });
  doc.line(10, textY + paddingY - 2, 200, textY + paddingY - 2);

  doc.save('ledger_statement.pdf');
};


