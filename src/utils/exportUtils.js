import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCSV(data, filename) {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : JSON.stringify(value);
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadPDF(data, title, filename) {
  if (!data || !data.length) return;
  
  const doc = new jsPDF();
  const headers = Object.keys(data[0]);
  const rows = data.map(row => Object.values(row).map(val => 
    typeof val === 'object' ? JSON.stringify(val) : String(val)
  ));

  doc.text(title, 14, 15);
  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 20,
    styles: { fontSize: 8 },
    theme: 'grid'
  });

  doc.save(`${filename}_${new Date().toISOString()}.pdf`);
}