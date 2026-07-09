import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'

export function exportDashboardToExcel(detailRows) {
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['Институт', 'Сокращение', 'Семестр', 'Средний балл', 'Студентов', 'Динамика (%)', 'Оценка'],
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

export function exportCategoryToExcel(categoryLabel, rows) {
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['Объект', 'Показатель', 'Категория', 'Период', 'Значение', 'Ед. изм.'],
    ...rows.map((row) => [row.entity, row.metricLabel, row.categoryLabel, row.period, row.value, row.unit || '']),
  ])

  worksheet['!cols'] = [{ wch: 30 }, { wch: 26 }, { wch: 30 }, { wch: 10 }, { wch: 16 }, { wch: 10 }]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, categoryLabel.slice(0, 31) || 'Показатели')
  XLSX.writeFile(workbook, `dashboard_${slugify(categoryLabel)}_${todayStamp()}.xlsx`)
}

export async function exportDashboardToPdf(canvasElement) {
  if (!canvasElement) return

  try {
    // Создаём canvas со всем содержимым дашборда (высокое разрешение)
    const canvas = await html2canvas(canvasElement, {
      scale: 3,               // чёткая графика и текст
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
      letterRendering: true,
    })

    const imgData = canvas.toDataURL('image/png')
    // A4 портретная ориентация: ширина 210 мм
    const imgWidth = 210
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    // Добавляем изображение на страницу
    doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    doc.save(`dashboard_faculties_${todayStamp()}.pdf`)
  } catch (error) {
    console.error('Ошибка экспорта PDF:', error)
    alert('Не удалось экспортировать PDF. Попробуйте снова или обновите страницу.')
  }
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10)
}

function slugify(text) {
  return (text || 'metrics')
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
}
