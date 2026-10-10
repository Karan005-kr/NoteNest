const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');

function asId(value, label = 'id') {
  const id = Number.parseInt(value, 10);
  if (!Number.isInteger(id) || id < 1) throw new ApiError(400, `Invalid ${label}.`);
  return id;
}

async function health(_req, res) {
  await pool.query('SELECT 1');
  res.json({ success: true, message: 'StudyVault API is healthy.', database: 'connected' });
}

async function getUniversities(_req, res) {
  const [rows] = await pool.query(
    `SELECT id, name, short_name, slug, location, website
     FROM universities WHERE is_active = 1 ORDER BY name ASC`
  );
  res.json({ success: true, message: 'Universities fetched successfully.', data: rows });
}

async function getUniversity(req, res) {
  const value = req.params.idOrSlug;
  const numeric = /^\d+$/.test(value);
  const [rows] = numeric
    ? await pool.execute(`SELECT id, name, short_name, slug, location, website FROM universities WHERE id = ? AND is_active = 1 LIMIT 1`, [Number(value)])
    : await pool.execute(`SELECT id, name, short_name, slug, location, website FROM universities WHERE slug = ? AND is_active = 1 LIMIT 1`, [value]);
  if (!rows[0]) throw new ApiError(404, 'University not found.');
  res.json({ success: true, message: 'University fetched successfully.', data: rows[0] });
}

async function getUniversityCourses(req, res) {
  const value = req.params.idOrSlug;
  const numeric = /^\d+$/.test(value);
  const condition = numeric ? 'u.id = ?' : 'u.slug = ?';
  const parameter = numeric ? Number(value) : value;
  const [rows] = await pool.execute(
    `SELECT uc.id AS university_course_id, c.id AS course_id, c.name, c.short_name, c.slug,
            uc.total_semesters
     FROM university_courses uc
     JOIN universities u ON u.id = uc.university_id
     JOIN courses c ON c.id = uc.course_id
     WHERE ${condition} AND u.is_active = 1 AND c.is_active = 1 AND uc.is_active = 1
     ORDER BY c.name ASC`,
    [parameter]
  );
  res.json({ success: true, message: 'University courses fetched successfully.', data: rows });
}

async function getCourses(_req, res) {
  const [rows] = await pool.query(
    `SELECT id, name, short_name, slug, default_semesters FROM courses WHERE is_active = 1 ORDER BY name ASC`
  );
  res.json({ success: true, message: 'Courses fetched successfully.', data: rows });
}

async function getCourse(req, res) {
  const id = asId(req.params.id);
  const [rows] = await pool.execute(
    `SELECT id, name, short_name, slug, default_semesters FROM courses WHERE id = ? AND is_active = 1 LIMIT 1`,
    [id]
  );
  if (!rows[0]) throw new ApiError(404, 'Course not found.');
  res.json({ success: true, message: 'Course fetched successfully.', data: rows[0] });
}

async function getUniversityCourse(req, res) {
  const id = asId(req.params.id);
  const [rows] = await pool.execute(
    `SELECT uc.id, uc.total_semesters,
            u.id AS university_id, u.name AS university_name, u.short_name AS university_short_name, u.slug AS university_slug,
            c.id AS course_id, c.name AS course_name, c.short_name AS course_short_name, c.slug AS course_slug
     FROM university_courses uc
     JOIN universities u ON u.id = uc.university_id
     JOIN courses c ON c.id = uc.course_id
     WHERE uc.id = ? AND uc.is_active = 1 AND u.is_active = 1 AND c.is_active = 1 LIMIT 1`,
    [id]
  );
  if (!rows[0]) throw new ApiError(404, 'University-course mapping not found.');
  res.json({ success: true, message: 'University course fetched successfully.', data: rows[0] });
}

async function getSemesters(req, res) {
  const id = asId(req.params.id);
  const [rows] = await pool.execute(
    'SELECT total_semesters FROM university_courses WHERE id = ? AND is_active = 1 LIMIT 1',
    [id]
  );
  if (!rows[0]) throw new ApiError(404, 'University-course mapping not found.');
  const data = Array.from({ length: rows[0].total_semesters }, (_, index) => ({
    number: index + 1,
    label: `Semester ${index + 1}`,
  }));
  res.json({ success: true, message: 'Semesters fetched successfully.', data });
}

async function getSpecializations(req, res) {
  const id = asId(req.params.id);
  const [rows] = await pool.execute(
    `SELECT id, name, short_name, slug FROM specializations
     WHERE university_course_id = ? AND is_active = 1 ORDER BY name ASC`,
    [id]
  );
  res.json({ success: true, message: 'Specializations fetched successfully.', data: rows });
}

async function getSubjects(req, res) {
  const id = asId(req.params.id, 'university course id');
  const semester = asId(req.params.semester, 'semester');
  const specializationId = req.query.specialization_id ? asId(req.query.specialization_id, 'specialization id') : null;

  const [uc] = await pool.execute('SELECT total_semesters FROM university_courses WHERE id = ? AND is_active = 1 LIMIT 1', [id]);
  if (!uc[0]) throw new ApiError(404, 'University-course mapping not found.');
  if (semester > uc[0].total_semesters) throw new ApiError(400, `Semester must be between 1 and ${uc[0].total_semesters}.`);

  let sql = `SELECT s.id, s.name, s.subject_code, s.slug, s.description, s.semester_number,
                    s.specialization_id, sp.name AS specialization_name
             FROM subjects s
             LEFT JOIN specializations sp ON sp.id = s.specialization_id
             WHERE s.university_course_id = ? AND s.semester_number = ? AND s.is_active = 1`;
  const params = [id, semester];
  if (specializationId) {
    sql += ' AND (s.specialization_id = ? OR s.specialization_id IS NULL)';
    params.push(specializationId);
  } else {
    sql += ' AND s.specialization_id IS NULL';
  }
  sql += ' ORDER BY s.display_order ASC, s.name ASC';

  const [rows] = await pool.execute(sql, params);
  res.json({ success: true, message: 'Subjects fetched successfully.', data: rows });
}

async function getSubject(req, res) {
  const id = asId(req.params.id);
  const [rows] = await pool.execute(
    `SELECT s.id, s.name, s.subject_code, s.slug, s.description, s.semester_number,
            s.university_course_id, s.specialization_id, sp.name AS specialization_name,
            c.name AS course_name, c.short_name AS course_short_name,
            u.name AS university_name, u.short_name AS university_short_name
     FROM subjects s
     JOIN university_courses uc ON uc.id = s.university_course_id
     JOIN universities u ON u.id = uc.university_id
     JOIN courses c ON c.id = uc.course_id
     LEFT JOIN specializations sp ON sp.id = s.specialization_id
     WHERE s.id = ? AND s.is_active = 1 LIMIT 1`,
    [id]
  );
  if (!rows[0]) throw new ApiError(404, 'Subject not found.');
  res.json({ success: true, message: 'Subject fetched successfully.', data: rows[0] });
}

async function getMaterials(req, res) {
  const subjectId = asId(req.params.id, 'subject id');
  const filters = ['m.subject_id = ?', 'm.is_published = 1'];
  const params = [subjectId];
  if (req.query.type) {
    const type = String(req.query.type).toUpperCase();
    if (!['SYLLABUS', 'NOTES', 'PYQ'].includes(type)) throw new ApiError(400, 'Invalid material type.');
    filters.push('m.material_type = ?'); params.push(type);
  }
  if (req.query.unit) { filters.push('m.unit_number = ?'); params.push(asId(req.query.unit, 'unit')); }
  if (req.query.year) { filters.push('m.exam_year = ?'); params.push(asId(req.query.year, 'year')); }

  const [rows] = await pool.execute(
    `SELECT m.id, m.title, m.description, m.material_type, m.unit_number, m.exam_year,
            m.file_path, m.file_url, m.original_file_name, m.mime_type, m.file_size,
            m.created_at, m.updated_at
     FROM materials m
     WHERE ${filters.join(' AND ')}
     ORDER BY m.display_order ASC, COALESCE(m.exam_year, 0) DESC, COALESCE(m.unit_number, 0) ASC, m.created_at DESC`,
    params
  );
  res.json({ success: true, message: 'Materials fetched successfully.', data: rows });
}

async function getSubjectContent(req, res) {
  const subjectId = asId(req.params.id, 'subject id');
  const [subjects] = await pool.execute(
    `SELECT id, name, subject_code, slug, description, semester_number FROM subjects WHERE id = ? AND is_active = 1 LIMIT 1`,
    [subjectId]
  );
  if (!subjects[0]) throw new ApiError(404, 'Subject not found.');
  const [materials] = await pool.execute(
    `SELECT id, title, description, material_type, unit_number, exam_year, file_path, file_url,
            original_file_name, mime_type, file_size, created_at
     FROM materials WHERE subject_id = ? AND is_published = 1
     ORDER BY display_order ASC, COALESCE(exam_year, 0) DESC, COALESCE(unit_number, 0) ASC, created_at DESC`,
    [subjectId]
  );
  const grouped = { syllabus: [], notes: [], pyq: [] };
  for (const material of materials) {
    if (material.material_type === 'SYLLABUS') grouped.syllabus.push(material);
    else if (material.material_type === 'NOTES') grouped.notes.push(material);
    else if (material.material_type === 'PYQ') grouped.pyq.push(material);
  }
  res.json({ success: true, message: 'Subject content fetched successfully.', data: { subject: subjects[0], materials: grouped } });
}

async function getMaterial(req, res) {
  const id = asId(req.params.id);
  const [rows] = await pool.execute(
    `SELECT m.id, m.subject_id, m.title, m.description, m.material_type, m.unit_number, m.exam_year,
            m.file_path, m.file_url, m.original_file_name, m.mime_type, m.file_size, m.created_at, m.updated_at,
            s.name AS subject_name, s.subject_code
     FROM materials m JOIN subjects s ON s.id = m.subject_id
     WHERE m.id = ? AND m.is_published = 1 LIMIT 1`,
    [id]
  );
  if (!rows[0]) throw new ApiError(404, 'Material not found.');
  res.json({ success: true, message: 'Material fetched successfully.', data: rows[0] });
}

async function search(req, res) {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) throw new ApiError(400, 'Search query must contain at least 2 characters.');
  const like = `%${q}%`;
  const [rows] = await pool.execute(
    `SELECT DISTINCT m.id AS material_id, m.title AS material_title, m.material_type,
            s.id AS subject_id, s.name AS subject_name, s.subject_code, s.semester_number,
            c.id AS course_id, c.name AS course_name,
            u.id AS university_id, u.name AS university_name, u.short_name AS university_short_name
     FROM subjects s
     JOIN university_courses uc ON uc.id = s.university_course_id
     JOIN universities u ON u.id = uc.university_id
     JOIN courses c ON c.id = uc.course_id
     LEFT JOIN materials m ON m.subject_id = s.id AND m.is_published = 1
     WHERE u.is_active = 1 AND c.is_active = 1 AND uc.is_active = 1 AND s.is_active = 1
       AND (u.name LIKE ? OR u.short_name LIKE ? OR c.name LIKE ? OR c.short_name LIKE ?
            OR s.name LIKE ? OR s.subject_code LIKE ? OR m.title LIKE ?)
     ORDER BY u.name, c.name, s.semester_number, s.name
     LIMIT 100`,
    [like, like, like, like, like, like, like]
  );
  res.json({ success: true, message: 'Search completed.', data: rows });
}

module.exports = {
  health, getUniversities, getUniversity, getUniversityCourses, getCourses, getCourse,
  getUniversityCourse, getSemesters, getSpecializations, getSubjects, getSubject,
  getMaterials, getSubjectContent, getMaterial, search,
};
