import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
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

export function exportDashboardToPdf(viewModel) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  doc.setFont('helvetica')
  doc.setFontSize(16)
  doc.text('Student performance dashboard', 14, 16)
  doc.setFontSize(10)
  doc.text(`Date: ${new Date().toLocaleDateString('ru-RU')}`, 14, 24)
  doc.text(`Average score: ${viewModel.kpis.averageScore.value}`, 14, 31)
  doc.text(`Students: ${viewModel.kpis.students.value}`, 64, 31)
  doc.text(`Best faculty: ${viewModel.kpis.bestFaculty.value}`, 108, 31)

  autoTable(doc, {
    startY: 38,
    head: [['Faculty', 'Short', 'Semester', 'Score', 'Students', 'Trend', 'Status']],
    body: viewModel.detailRows.map((row) => [
      transliterate(row.facultyName),
      transliterate(row.shortName),
      row.semester.toString(),
      row.averageScore.toFixed(2),
      row.studentsCount.toString(),
      row.trendLabel,
      transliterate(row.scoreLabel),
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [31, 122, 236],
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 72 },
      1: { cellWidth: 18, halign: 'center' },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 24, halign: 'center' },
      5: { cellWidth: 24, halign: 'center' },
      6: { cellWidth: 40 },
    },
  })

  doc.save(`dashboard_faculties_${todayStamp()}.pdf`)
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10)
}

function transliterate(text) {
  const map = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'yo',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'c',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
  }

  return text
    .split('')
    .map((letter) => {
      const lower = letter.toLowerCase()
      const value = map[lower]
      if (value === undefined) return letter
      return letter === lower ? value : value.toUpperCase()
    })
    .join('')
}
