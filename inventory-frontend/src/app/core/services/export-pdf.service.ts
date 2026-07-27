import { Injectable } from '@angular/core';

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

    return this.generatePrintWindow(headers, rows, reportTitle, generatedAt, isRtl);
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
    return normalized.includes('actions') || 
           normalized.includes('إجراءات') || 
           normalized.includes('اجراءات');
  }

  private isUiStateText(text: string): boolean {
    const normalized = text.toLowerCase();
    return normalized.includes('loading') || 
           normalized.includes('no ') || 
           normalized.includes('لا يوجد');
  }

  private escapeHtml(value: string): string {
    const container = document.createElement('div');
    container.textContent = value;
    return container.innerHTML;
  }

  private generatePrintWindow(headers: string[], rows: string[][], title: string, generatedAt: string, isRtl: boolean): Promise<void> {
    return new Promise((resolve) => {
      const printWindow = window.open('', '_blank', 'height=800,width=1200,scrollbars=yes,status=yes');
      
      if (!printWindow) {
        alert('Please allow popups to generate the PDF report.');
        return resolve();
      }

      const dir = isRtl ? 'rtl' : 'ltr';
      const align = isRtl ? 'right' : 'left';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html dir="${dir}">
        <head>
          <meta charset="UTF-8">
          <title>${this.escapeHtml(title)}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;800&family=Inter:wght@400;600;800&display=swap');
            
            @page {
              size: A4 landscape;
              margin: 15mm;
            }
            
            body {
              font-family: ${isRtl ? "'Cairo', sans-serif" : "'Inter', sans-serif"};
              color: #111827;
              background: #fff;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .header-banner {
              background: #111827;
              color: #fff;
              border-radius: 12px;
              padding: 24px 30px;
              margin-bottom: 24px;
              position: relative;
              overflow: hidden;
              display: flex;
              align-items: center;
              justify-content: space-between;
              page-break-inside: avoid;
            }
            
            .header-banner::after {
              content: '';
              position: absolute;
              ${isRtl ? 'left: 0;' : 'right: 0;'}
              top: 0;
              bottom: 0;
              width: 8px;
              background: #d2593b;
            }
            
            h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 800;
              line-height: 1.2;
            }
            
            .app-name {
              margin: 8px 0 0;
              color: #9ca3af;
              font-size: 14px;
              font-weight: 600;
            }
            
            .stats-box {
              background: #fff7ed;
              color: #111827;
              border-radius: 10px;
              padding: 10px 20px;
              text-align: center;
            }
            
            .stats-label {
              color: #d2593b;
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .stats-value {
              font-size: 24px;
              font-weight: 800;
              color: #1e293b;
              margin-top: 4px;
              line-height: 1;
            }
            
            .meta-info {
              color: #6b7280;
              font-size: 12px;
              margin-bottom: 16px;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
              font-size: 12px;
            }
            
            th {
              background: #f9fafb;
              color: #374151;
              padding: 12px;
              text-align: ${align};
              font-weight: 800;
              border-bottom: 2px solid #e5e7eb;
            }
            
            td {
              padding: 10px 12px;
              border-bottom: 1px solid #f3f4f6;
              color: #1f2937;
              vertical-align: top;
            }
            
            tbody tr:nth-child(even) td {
              background: #fdfdfd;
            }
            
            /* Status coloring */
            .text-green { color: #059669; font-weight: 600; }
            .text-red { color: #dc2626; font-weight: 600; }
            .text-orange { color: #d97706; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div>
              <h1>${this.escapeHtml(title)}</h1>
              <p class="app-name">StockMaster ERP</p>
            </div>
            <div class="stats-box">
              <div class="stats-label">${isRtl ? 'إجمالي السجلات' : 'Total Records'}</div>
              <div class="stats-value">${rows.length}</div>
            </div>
          </div>
          
          <div class="meta-info">
            ${isRtl ? 'تم التوليد في' : 'Generated At'}: ${this.escapeHtml(generatedAt)}
          </div>
          
          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${this.escapeHtml(header)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.map(row => `
                <tr>
                  ${row.map(cell => {
                    const text = this.escapeHtml(cell);
                    const lower = text.toLowerCase();
                    let colorClass = '';
                    if (lower.includes('active') || lower.includes('in stock') || lower.includes('نشط') || lower.includes('متوفر')) colorClass = 'text-green';
                    else if (lower.includes('inactive') || lower.includes('out') || lower.includes('غير نشط') || lower.includes('نفذ')) colorClass = 'text-red';
                    else if (lower.includes('low') || lower.includes('منخفض')) colorClass = 'text-orange';
                    
                    return `<td class="${colorClass}">${text}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        resolve();
      }, 500);
    });
  }
}
