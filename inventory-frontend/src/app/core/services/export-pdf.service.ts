import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class ExportPdfService {

  constructor() { }

  /**
   * Export an HTML element (like a table) to a perfectly styled PDF report.
   */
  export(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`ExportPdfService: Element with ID '${elementId}' not found.`);
      return Promise.reject(`Element with ID '${elementId}' not found.`);
    }

    // Temporarily hide action columns
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

    return html2canvas(element, {
      scale: 3, 
      useCORS: true,
      backgroundColor: '#ffffff', // Force white background on canvas
      onclone: (documentClone) => {
        const clonedElement = documentClone.getElementById(elementId);
        if (clonedElement) {
          // Add a nice header title to the cloned element so it's captured in the image with native fonts
          const titleWrapper = documentClone.createElement('div');
          titleWrapper.style.marginBottom = '24px';
          titleWrapper.style.textAlign = 'center';
          
          const title = documentClone.createElement('h2');
          title.textContent = filename.replace(/_/g, ' ');
          title.style.color = '#111827';
          title.style.fontFamily = 'system-ui, -apple-system, sans-serif';
          title.style.fontSize = '24px';
          title.style.fontWeight = 'bold';
          title.style.margin = '0 0 8px 0';
          
          const dateSub = documentClone.createElement('p');
          dateSub.textContent = new Date().toLocaleString();
          dateSub.style.color = '#6b7280';
          dateSub.style.fontSize = '12px';
          dateSub.style.margin = '0';
          
          titleWrapper.appendChild(title);
          titleWrapper.appendChild(dateSub);
          clonedElement.insertBefore(titleWrapper, clonedElement.firstChild);

          // Force the table to look like a professional light-mode document
          clonedElement.style.color = '#000000';
          clonedElement.style.backgroundColor = '#ffffff';
          clonedElement.style.padding = '20px';
          
          const allElements = clonedElement.querySelectorAll('*');
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            htmlEl.style.color = '#111827';
            htmlEl.style.borderColor = '#e5e7eb';
          });
          
          // Header specific styling
          const headers = clonedElement.querySelectorAll('th');
          headers.forEach(th => {
            th.style.backgroundColor = '#f9fafb';
            th.style.color = '#374151';
            th.style.fontWeight = 'bold';
            th.style.borderBottom = '2px solid #d1d5db';
            th.style.padding = '12px 16px';
          });
          
          // Row styling
          const tds = clonedElement.querySelectorAll('td');
          tds.forEach(td => {
            td.style.borderBottom = '1px solid #f3f4f6';
            td.style.padding = '12px 16px';
            td.style.color = '#4b5563';
          });
        }
      }
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const pageHeight = 277;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

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
      hiddenElements.forEach(el => el.style.display = '');
    });
  }
}
