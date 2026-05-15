import facultiesCsv from '../../../../faculties.csv?raw'
import performanceCsv from '../../../../performance.csv?raw'
import usersCsv from '../../../../users.csv?raw'
import { normalizeFaculty } from '../../faculty/model.js'
import { normalizePerformance } from '../../performance/model.js'
import { normalizeUser } from '../../user/model.js'
import { parseSemicolonCsv } from '../../../shared/csv/parseCsv.js'

export function getDashboardDataset() {
  return {
    faculties: parseSemicolonCsv(facultiesCsv).map(normalizeFaculty),
    performance: parseSemicolonCsv(performanceCsv).map(normalizePerformance),
    users: parseSemicolonCsv(usersCsv).map(normalizeUser),
  }
}
