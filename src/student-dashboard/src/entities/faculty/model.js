const facultyAliases = {
  'Информатика и вычислительная техника': 'ИВТ',
  'Нефтегазовое дело': 'НГД',
  'Экономика и управление': 'ЭиУ',
  Машиностроение: 'МШ',
  Строительство: 'СТР',
  Энергетика: 'ЭН',
  Геология: 'ГЕО',
  'Химическая технология': 'ХТ',
}

export function normalizeFaculty(row) {
  return {
    facultyId: Number(row.faculty_id),
    faculty: row.faculty,
    year: Number(row.year),
    createdAt: row.created_at,
  }
}

export function getFacultyShortName(facultyName) {
  if (facultyAliases[facultyName]) return facultyAliases[facultyName]

  return facultyName
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .map((word) => word[0])
    .join('')
    .slice(0, 4)
    .toUpperCase()
}

export function getFacultyCompactName(facultyName) {
  return facultyName
}
