import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export class ExportHelper {
  /**
   * Export an array of data objects to an Excel file.
   */
  static toExcel(data: any[], filename: string) {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }

  /**
   * Export an HTML element (like a table) to a PDF file.
   */
  static toPdf(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`ExportHelper: Element with ID '${elementId}' not found.`);
      return Promise.reject(`Element with ID '${elementId}' not found.`);
    }

    // Temporarily hide columns that shouldn't be in the PDF (e.g. Actions)
    const hiddenElements: HTMLElement[] = [];
    const actionHeaders = element.querySelectorAll('th');
    actionHeaders.forEach(th => {
      if (th.textContent?.trim().toLowerCase().includes('actions') || th.textContent?.trim() === 'إجراءات') {
        const idx = Array.from(th.parentNode!.children).indexOf(th);
        th.style.display = 'none';
        hiddenElements.push(th);
        const rows = element.querySelectorAll('tbody tr');
        rows.forEach(row => {
          const td = row.children[idx] as HTMLElement;
          if (td) {
            td.style.display = 'none';
            hiddenElements.push(td);
          }
        });
      }
    });

    // Temporarily apply inline styles if needed, or render the canvas as is
    return html2canvas(element, {
      scale: 3, // Increased scale for crisper text
      useCORS: true,
      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim() || '#ffffff'
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Calculate dimensions for A4 paper (210mm x 297mm)
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190; // margin 10mm left/right
      const pageHeight = 277; // margin 10mm top/bottom (297 - 20)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10; // top margin

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        pdf.addPage();
        position = 10 - (imgHeight - heightLeft);
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`${filename}.pdf`);
    }).finally(() => {
      // Restore hidden elements
      hiddenElements.forEach(el => el.style.display = '');
    });
  }
}
