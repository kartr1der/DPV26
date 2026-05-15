export function normalizeUser(row) {
  return {
    studentId: Number(row.student_id),
    name: row.name,
    email: row.email,
    facultyId: Number(row.faculty_id),
    createdAt: row.created_at,
  }
}
