import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExportExcelService {

  constructor() { }

  export(data: any[], filename: string) {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    
    // Attempt to set RTL view if language is Arabic
    if (document.documentElement.dir === 'rtl') {
      if (!ws['!views']) ws['!views'] = [];
      ws['!views'].push({ rightToLeft: true, RTL: true });
    }
    
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }
}
