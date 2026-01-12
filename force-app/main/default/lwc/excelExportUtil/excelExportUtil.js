import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const XLSX = window.XLSX; // Assuming you are loading XLSX library as a static resource

export function exportToExcel(data) {
    debugger;
    if (!XLSX) {
        console.error('XLSX library not loaded');
        return;
    }

    try {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Milestones');
        const excelFile = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

        // Save to file
        const blob = new Blob([s2ab(excelFile)], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'MilestoneData.xlsx';
        link.click();
    } catch (error) {
        console.error('Error during export:', error);
    }
}

function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
}