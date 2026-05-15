export function parseSemicolonCsv(rawCsv) {
  const lines = rawCsv
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (!lines.length) return []

  const headers = splitSemicolonLine(lines[0]).map((header) => header.trim())

  return lines.slice(1).map((line) => {
    const cells = splitSemicolonLine(line)

    return headers.reduce((row, header, index) => {
      row[header] = (cells[index] || '').trim()
      return row
    }, {})
  })
}

function splitSemicolonLine(line) {
  const cells = []
  let cell = ''
  let insideQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const nextChar = line[index + 1]

    if (char === '"' && nextChar === '"') {
      cell += '"'
      index += 1
      continue
    }

    if (char === '"') {
      insideQuotes = !insideQuotes
      continue
    }

    if (char === ';' && !insideQuotes) {
      cells.push(cell)
      cell = ''
      continue
    }

    cell += char
  }

  cells.push(cell)
  return cells
}
