import { ShiftAssignment, TeamMember, RosterConfig } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export function exportRosterToCSV(
  assignments: ShiftAssignment[],
  members: TeamMember[],
  config: RosterConfig
) {
  const { daysInMonth, month, year } = config;

  // Header row: Employee Name, Day 1, Day 2, ... Day N, Total Mornings, Total Afternoons, Total Nights, Total Offs
  const headers = ['Employee Name', 'Role'];
  for (let day = 1; day <= daysInMonth; day++) {
    headers.push(`Day ${day}`);
  }
  headers.push('Total Mornings', 'Total Afternoons', 'Total Nights', 'Total Off/Leave');

  const rows: string[][] = [headers];

  members.forEach((m) => {
    const row: string[] = [m.name, m.role];
    let mCount = 0;
    let aCount = 0;
    let nCount = 0;
    let offCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const assign = assignments.find((a) => a.memberId === m.id && a.day === day);
      const shift = assign ? assign.shift : 'Off';
      row.push(shift);

      if (shift === 'Morning') mCount++;
      else if (shift === 'Afternoon') aCount++;
      else if (shift === 'Night') nCount++;
      else offCount++;
    }
    row.push(mCount.toString(), aCount.toString(), nCount.toString(), offCount.toString());
    rows.push(row);
  });

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    rows.map((e) => e.map((cell) => `"${cell}"`).join(',')).join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Mainframe_Console_Roster_${month}_${year}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportRosterToImage(elementId: string, config: RosterConfig) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const canvas = await html2canvas(element, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');
  
  const link = document.createElement('a');
  link.setAttribute('href', imgData);
  link.setAttribute('download', `Roster_${config.month}_${config.year}.png`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportRosterToPDF(elementId: string, config: RosterConfig) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const canvas = await html2canvas(element, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');
  
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`Roster_${config.month}_${config.year}.pdf`);
}
