import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class ExportPdfService {

  constructor() { }

  export(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`ExportPdfService: Element with ID '${elementId}' not found.`);
      return Promise.reject(`Element with ID '${elementId}' not found.`);
    }

    const table = element instanceof HTMLTableElement
      ? element
      : element.querySelector('table');

    if (!table) {
      console.error(`ExportPdfService: Element with ID '${elementId}' does not contain a table.`);
      return Promise.reject(`Element with ID '${elementId}' does not contain a table.`);
    }

    const isRtl = document.documentElement.dir === 'rtl';
    const reportTitle = filename.replace(/_/g, ' ');
    const generatedAt = new Date().toLocaleString(isRtl ? 'ar-JO' : undefined);
    const { headers, rows } = this.extractTableData(table);

    if (!headers.length || !rows.length) {
      return Promise.reject('No table data available to export.');
    }

    if (isRtl) {
      return this.exportRtlCanvasReport(headers, rows, reportTitle, generatedAt, filename);
    }

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;
    const accent: [number, number, number] = [210, 89, 59];
    const ink: [number, number, number] = [17, 24, 39];
    const muted: [number, number, number] = [107, 114, 128];

    pdf.setFillColor(17, 24, 39);
    pdf.rect(0, 0, pageWidth, 36, 'F');
    pdf.setFillColor(...accent);
    pdf.rect(isRtl ? pageWidth - 5 : 0, 0, 5, 36, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.text(reportTitle, isRtl ? pageWidth - margin : margin, 17, { align: isRtl ? 'right' : 'left' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(229, 231, 235);
    pdf.text('StockMaster ERP', isRtl ? pageWidth - margin : margin, 27, { align: isRtl ? 'right' : 'left' });

    const metaX = isRtl ? margin : pageWidth - 76;
    pdf.setFillColor(255, 247, 237);
    pdf.roundedRect(metaX, 9, 62, 18, 3, 3, 'F');
    pdf.setTextColor(...accent);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text(isRtl ? 'Records' : 'Records', metaX + 31, 15, { align: 'center' });
    pdf.setTextColor(...ink);
    pdf.setFontSize(12);
    pdf.text(String(rows.length), metaX + 31, 23, { align: 'center' });

    pdf.setTextColor(...muted);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(
      `${isRtl ? 'Generated' : 'Generated'}: ${generatedAt}`,
      isRtl ? pageWidth - margin : margin,
      45,
      { align: isRtl ? 'right' : 'left' }
    );

    autoTable(pdf, {
      head: [isRtl ? [...headers].reverse() : headers],
      body: rows.map(row => isRtl ? [...row].reverse() : row) as RowInput[],
      startY: 52,
      margin: { left: margin, right: margin, bottom: 16 },
      theme: 'grid',
      tableLineColor: [229, 231, 235],
      tableLineWidth: 0.15,
      styles: {
        font: 'helvetica',
        fontSize: 8.2,
        cellPadding: { top: 3, right: 2.8, bottom: 3, left: 2.8 },
        textColor: ink,
        lineColor: [229, 231, 235],
        overflow: 'linebreak',
        halign: isRtl ? 'right' : 'left',
        valign: 'middle',
        minCellHeight: 8
      },
      headStyles: {
        fillColor: accent,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: isRtl ? 'right' : 'left',
        minCellHeight: 10
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      columnStyles: this.getColumnStyles(headers.length),
      didParseCell: (data) => {
        if (data.section !== 'body') return;

        const rawText = String(data.cell.raw ?? '').toLowerCase();
        if (rawText.includes('active') || rawText.includes('in stock') || rawText.includes('add')) {
          data.cell.styles.textColor = [5, 150, 105];
          data.cell.styles.fontStyle = 'bold';
        } else if (rawText.includes('inactive') || rawText.includes('out') || rawText.includes('sell')) {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        } else if (rawText.includes('low') || rawText.includes('adjust')) {
          data.cell.styles.textColor = [217, 119, 6];
          data.cell.styles.fontStyle = 'bold';
        }
      },
      didDrawPage: () => {
        const pageNumber = pdf.getNumberOfPages();
        pdf.setDrawColor(229, 231, 235);
        pdf.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(...muted);
        pdf.text(`${isRtl ? 'Page' : 'Page'} ${pageNumber}`, pageWidth / 2, pageHeight - 6, { align: 'center' });
      }
    });

    pdf.save(`${filename}.pdf`);
    return Promise.resolve();
  }

  private extractTableData(table: HTMLTableElement): { headers: string[]; rows: string[][] } {
    const headerCells = Array.from(table.querySelectorAll('thead th'));
    const exportableIndexes = headerCells
      .map((th, index) => ({ text: this.cleanText(th.textContent), index }))
      .filter(column => column.text && !this.isActionColumn(column.text));

    const headers = exportableIndexes.map(column => column.text);
    const rows = Array.from(table.querySelectorAll('tbody tr'))
      .map(row => exportableIndexes.map(column => this.cleanText(row.children[column.index]?.textContent)))
      .filter(row => row.some(cell => cell && !this.isUiStateText(cell)));

    return { headers, rows };
  }

  private cleanText(value: string | null | undefined): string {
    return (value ?? '').replace(/\s+/g, ' ').trim();
  }

  private isActionColumn(text: string): boolean {
    const normalized = text.toLowerCase();
    return normalized.includes('actions') || normalized.includes('اجراءات') || normalized.includes('إجراءات');
  }

  private isUiStateText(text: string): boolean {
    const normalized = text.toLowerCase();
    return normalized.includes('loading') || normalized.includes('no ') || normalized.includes('لا توجد');
  }

  private getColumnStyles(columnCount: number): { [key: string]: { cellWidth: number } } {
    if (columnCount <= 6) return {};

    return {
      0: { cellWidth: 18 },
      1: { cellWidth: 40 },
      [columnCount - 1]: { cellWidth: 45 }
    };
  }

  private exportRtlCanvasReport(headers: string[], rows: string[][], title: string, generatedAt: string, filename: string): Promise<void> {
    const report = document.createElement('div');
    report.dir = 'rtl';
    report.style.cssText = `
      width: 1120px;
      padding: 32px;
      background: #f8fafc;
      color: #111827;
      font-family: Cairo, Tahoma, Arial, sans-serif;
      position: fixed;
      left: -10000px;
      top: 0;
    `;

    report.innerHTML = `
      <div style="background:#111827;color:#fff;border-radius:18px;padding:26px 30px;margin-bottom:20px;position:relative;overflow:hidden;">
        <div style="position:absolute;right:0;top:0;bottom:0;width:8px;background:#d2593b;"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:20px;">
          <div>
            <h1 style="margin:0;font-size:30px;line-height:1.2;font-weight:800;">${this.escapeHtml(title)}</h1>
            <p style="margin:8px 0 0;color:#e5e7eb;font-size:14px;">StockMaster ERP</p>
          </div>
          <div style="background:#fff7ed;color:#111827;border-radius:14px;padding:12px 22px;display:flex;justify-content:space-between;align-items:flex-end;">
            <div style="color:#d2593b;font-size:12px;font-weight:800;">Total Records</div>
            <div style="font-size:24px;font-weight:800;color:#1e293b;line-height:1;">${rows.length}</div>
          </div>
        </div>
      </div>
      <div style="margin-bottom:18px;color:#6b7280;font-size:13px;">Generated At: ${this.escapeHtml(generatedAt)}</div>
      <table style="width:100%;border-collapse:separate;border-spacing:0;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;font-size:13px;">
        <thead>
          <tr>
            ${headers.map(header => `<th style="background:#d2593b;color:#fff;padding:12px 10px;text-align:right;font-weight:800;border-left:1px solid rgba(255,255,255,.22);">${this.escapeHtml(header)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row, rowIndex) => `
            <tr style="background:${rowIndex % 2 === 0 ? '#ffffff' : '#f9fafb'};">
              ${row.map(cell => `<td style="padding:11px 10px;border-top:1px solid #eef2f7;color:#1f2937;vertical-align:top;">${this.escapeHtml(cell)}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    document.body.appendChild(report);

    return html2canvas(report, {
      scale: 2,
      backgroundColor: '#f8fafc',
      useCORS: true
    }).then(canvas => {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        pdf.addPage();
        position = margin - (imgHeight - heightLeft);
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      pdf.save(`${filename}.pdf`);
    }).finally(() => {
      report.remove();
    });
  }

  private escapeHtml(value: string): string {
    const container = document.createElement('div');
    container.textContent = value;
    return container.innerHTML;
  }
}
