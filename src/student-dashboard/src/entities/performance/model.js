export function normalizePerformance(row) {
  return {
    id: Number(row.id),
    facultyId: Number(row.faculty_id),
    averageScore: Number(row.average_score),
    studentsCount: Number(row.students_count),
    semester: Number(row.semester),
    year: Number(row.year),
    createdAt: row.created_at,
  }
}
