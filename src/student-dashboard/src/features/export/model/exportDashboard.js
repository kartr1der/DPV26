import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'

export function exportDashboardToExcel(detailRows) {
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['Факультет', 'Сокращение', 'Семестр', 'Средний балл', 'Студентов', 'Динамика (%)', 'Оценка'],
    ...detailRows.map((row) => [
      row.facultyName,
      row.shortName,
      row.semester,
      row.averageScore,
      row.studentsCount,
      Number(row.trend.toFixed(1)),
      row.scoreLabel,
    ]),
  ])

  worksheet['!cols'] = [
    { wch: 36 },
    { wch: 12 },
    { wch: 10 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
    { wch: 20 },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Динамика')
  XLSX.writeFile(workbook, `dashboard_faculties_${todayStamp()}.xlsx`)
}

export async function exportDashboardToPdf(canvasElement) {
  if (!canvasElement) return

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  await doc.html(canvasElement, {
    x: 8,
    y: 8,
    width: 281,
    windowWidth: canvasElement.scrollWidth,
    html2canvas: {
      scale: 0.32,
      backgroundColor: '#f8fbff',
      useCORS: true,
    },
  })

  doc.save(`dashboard_faculties_${todayStamp()}.pdf`)
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10)
}
