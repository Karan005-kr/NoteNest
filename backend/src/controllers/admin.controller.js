const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');
const { slugify } = require('../utils/slugify');
const { getPagination, paginationMeta } = require('../utils/pagination');
const { writeAudit } = require('../services/audit.service');
const { publicUrlFor, relativePathFor, removeStoredFile } = require('../services/storage/localStorage.service');

function id(value, name = 'id') {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) throw new ApiError(400, `Invalid ${name}.`);
  return parsed;
}

function duplicateTo409(error, label) {
  if (error && error.code === 'ER_DUP_ENTRY') throw new ApiError(409, `${label} already exists.`);
  throw error;
}

async function dashboard(_req, res) {
  const [[u], [c], [uc], [s], [m], [pub], [unpub], [types]] = await Promise.all([
    pool.query('SELECT COUNT(*) total FROM universities'),
    pool.query('SELECT COUNT(*) total FROM courses'),
    pool.query('SELECT COUNT(*) total FROM university_courses'),
    pool.query('SELECT COUNT(*) total FROM subjects'),
    pool.query('SELECT COUNT(*) total FROM materials'),
    pool.query('SELECT COUNT(*) total FROM materials WHERE is_published = 1'),
    pool.query('SELECT COUNT(*) total FROM materials WHERE is_published = 0'),
    pool.query(`SELECT
      SUM(material_type = 'SYLLABUS') syllabusCount,
      SUM(material_type = 'NOTES') notesCount,
      SUM(material_type = 'PYQ') pyqCount FROM materials`),
  ]);
  const [recent] = await pool.query(
    `SELECT m.id, m.title, m.material_type, m.is_published, m.created_at, s.name subject_name
     FROM materials m JOIN subjects s ON s.id=m.subject_id ORDER BY m.created_at DESC LIMIT 10`
  );
  res.json({ success: true, message: 'Dashboard fetched.', data: {
    totalUniversities: u[0].total, totalCourses: c[0].total, totalUniversityCourses: uc[0].total,
    totalSubjects: s[0].total, totalMaterials: m[0].total, publishedMaterials: pub[0].total,
    unpublishedMaterials: unpub[0].total, syllabusCount: Number(types[0].syllabusCount || 0),
    notesCount: Number(types[0].notesCount || 0), pyqCount: Number(types[0].pyqCount || 0), recentMaterials: recent,
  }});
}

async function listUniversities(_req, res) {
  const [rows] = await pool.query('SELECT * FROM universities ORDER BY name ASC');
  res.json({ success: true, message: 'Universities fetched.', data: rows });
}

async function createUniversity(req, res) {
  const d = req.body; const slug = slugify(d.slug || d.name);
  try {
    const [result] = await pool.execute(
      `INSERT INTO universities (name, short_name, slug, location, website, is_active) VALUES (?, ?, ?, ?, ?, ?)`,
      [d.name, d.short_name, slug, d.location || null, d.website || null, d.is_active ?? true]
    );
    await writeAudit({ adminId: req.admin.id, entityType: 'UNIVERSITY', entityId: result.insertId, action: 'CREATE' });
    res.status(201).json({ success: true, message: 'University created.', data: { id: result.insertId, ...d, slug } });
  } catch (e) { duplicateTo409(e, 'University slug'); }
}

async function updateUniversity(req, res) {
  const universityId = id(req.params.id); const d = req.body; const slug = slugify(d.slug || d.name);
  try {
    const [result] = await pool.execute(
      `UPDATE universities SET name=?, short_name=?, slug=?, location=?, website=?, is_active=? WHERE id=?`,
      [d.name, d.short_name, slug, d.location || null, d.website || null, d.is_active ?? true, universityId]
    );
    if (!result.affectedRows) throw new ApiError(404, 'University not found.');
    await writeAudit({ adminId: req.admin.id, entityType: 'UNIVERSITY', entityId: universityId, action: 'UPDATE' });
    res.json({ success: true, message: 'University updated.' });
  } catch (e) { duplicateTo409(e, 'University slug'); }
}

async function setUniversityStatus(req, res) {
  const universityId = id(req.params.id);
  const [r] = await pool.execute('UPDATE universities SET is_active=? WHERE id=?', [req.body.is_active, universityId]);
  if (!r.affectedRows) throw new ApiError(404, 'University not found.');
  await writeAudit({ adminId: req.admin.id, entityType: 'UNIVERSITY', entityId: universityId, action: req.body.is_active ? 'ENABLE' : 'DISABLE' });
  res.json({ success: true, message: 'University status updated.' });
}

async function deleteUniversity(req, res) {
  // Safe behavior: soft-disable instead of cascading academic history.
  req.body = { is_active: false };
  return setUniversityStatus(req, res);
}

async function listCourses(_req, res) {
  const [rows] = await pool.query('SELECT * FROM courses ORDER BY name ASC');
  res.json({ success: true, message: 'Courses fetched.', data: rows });
}

async function createCourse(req, res) {
  const d=req.body, slug=slugify(d.slug || d.name);
  try {
    const [r]=await pool.execute(`INSERT INTO courses (name, short_name, slug, default_semesters, is_active) VALUES (?,?,?,?,?)`, [d.name,d.short_name,slug,d.default_semesters,d.is_active??true]);
    await writeAudit({adminId:req.admin.id,entityType:'COURSE',entityId:r.insertId,action:'CREATE'});
    res.status(201).json({success:true,message:'Course created.',data:{id:r.insertId,...d,slug}});
  } catch(e){duplicateTo409(e,'Course slug');}
}

async function updateCourse(req,res){
  const courseId=id(req.params.id),d=req.body,slug=slugify(d.slug||d.name);
  try{
    const [r]=await pool.execute(`UPDATE courses SET name=?,short_name=?,slug=?,default_semesters=?,is_active=? WHERE id=?`,[d.name,d.short_name,slug,d.default_semesters,d.is_active??true,courseId]);
    if(!r.affectedRows) throw new ApiError(404,'Course not found.');
    await writeAudit({adminId:req.admin.id,entityType:'COURSE',entityId:courseId,action:'UPDATE'});
    res.json({success:true,message:'Course updated.'});
  }catch(e){duplicateTo409(e,'Course slug');}
}

async function setCourseStatus(req,res){const courseId=id(req.params.id);const [r]=await pool.execute('UPDATE courses SET is_active=? WHERE id=?',[req.body.is_active,courseId]);if(!r.affectedRows)throw new ApiError(404,'Course not found.');await writeAudit({adminId:req.admin.id,entityType:'COURSE',entityId:courseId,action:req.body.is_active?'ENABLE':'DISABLE'});res.json({success:true,message:'Course status updated.'});}
async function deleteCourse(req,res){req.body={is_active:false};return setCourseStatus(req,res);}

async function listUniversityCourses(_req,res){const [rows]=await pool.query(`SELECT uc.*,u.name university_name,u.short_name university_short_name,c.name course_name,c.short_name course_short_name FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id ORDER BY u.name,c.name`);res.json({success:true,message:'University-course mappings fetched.',data:rows});}

async function createUniversityCourse(req,res){const d=req.body;try{const [r]=await pool.execute(`INSERT INTO university_courses (university_id,course_id,total_semesters,is_active) VALUES (?,?,?,?)`,[d.university_id,d.course_id,d.total_semesters,d.is_active??true]);await writeAudit({adminId:req.admin.id,entityType:'UNIVERSITY_COURSE',entityId:r.insertId,action:'CREATE'});res.status(201).json({success:true,message:'University-course mapping created.',data:{id:r.insertId,...d}});}catch(e){duplicateTo409(e,'University-course mapping');}}

async function updateUniversityCourse(req,res){const mappingId=id(req.params.id),d=req.body;try{const [r]=await pool.execute(`UPDATE university_courses SET university_id=?,course_id=?,total_semesters=?,is_active=? WHERE id=?`,[d.university_id,d.course_id,d.total_semesters,d.is_active??true,mappingId]);if(!r.affectedRows)throw new ApiError(404,'Mapping not found.');await writeAudit({adminId:req.admin.id,entityType:'UNIVERSITY_COURSE',entityId:mappingId,action:'UPDATE'});res.json({success:true,message:'University-course mapping updated.'});}catch(e){duplicateTo409(e,'University-course mapping');}}

async function deleteUniversityCourse(req,res){const mappingId=id(req.params.id);const [r]=await pool.execute('UPDATE university_courses SET is_active=0 WHERE id=?',[mappingId]);if(!r.affectedRows)throw new ApiError(404,'Mapping not found.');await writeAudit({adminId:req.admin.id,entityType:'UNIVERSITY_COURSE',entityId:mappingId,action:'DISABLE'});res.json({success:true,message:'University-course mapping disabled.'});}

async function listSpecializations(_req,res){const [rows]=await pool.query(`SELECT sp.*,c.name course_name,u.name university_name FROM specializations sp JOIN university_courses uc ON uc.id=sp.university_course_id JOIN courses c ON c.id=uc.course_id JOIN universities u ON u.id=uc.university_id ORDER BY u.name,c.name,sp.name`);res.json({success:true,message:'Specializations fetched.',data:rows});}
async function createSpecialization(req,res){const d=req.body,slug=slugify(d.slug||d.name);try{const [r]=await pool.execute(`INSERT INTO specializations (university_course_id,name,short_name,slug,is_active) VALUES (?,?,?,?,?)`,[d.university_course_id,d.name,d.short_name,slug,d.is_active??true]);await writeAudit({adminId:req.admin.id,entityType:'SPECIALIZATION',entityId:r.insertId,action:'CREATE'});res.status(201).json({success:true,message:'Specialization created.',data:{id:r.insertId,...d,slug}});}catch(e){duplicateTo409(e,'Specialization');}}
async function updateSpecialization(req,res){const specId=id(req.params.id),d=req.body,slug=slugify(d.slug||d.name);try{const [r]=await pool.execute(`UPDATE specializations SET university_course_id=?,name=?,short_name=?,slug=?,is_active=? WHERE id=?`,[d.university_course_id,d.name,d.short_name,slug,d.is_active??true,specId]);if(!r.affectedRows)throw new ApiError(404,'Specialization not found.');await writeAudit({adminId:req.admin.id,entityType:'SPECIALIZATION',entityId:specId,action:'UPDATE'});res.json({success:true,message:'Specialization updated.'});}catch(e){duplicateTo409(e,'Specialization');}}
async function deleteSpecialization(req,res){const specId=id(req.params.id);const [r]=await pool.execute('UPDATE specializations SET is_active=0 WHERE id=?',[specId]);if(!r.affectedRows)throw new ApiError(404,'Specialization not found.');await writeAudit({adminId:req.admin.id,entityType:'SPECIALIZATION',entityId:specId,action:'DISABLE'});res.json({success:true,message:'Specialization disabled.'});}

async function listSubjects(req,res){const {page,limit,offset}=getPagination(req.query);const where=[];const params=[];if(req.query.university_course_id){where.push('s.university_course_id=?');params.push(id(req.query.university_course_id));}if(req.query.semester){where.push('s.semester_number=?');params.push(id(req.query.semester,'semester'));}if(req.query.search){where.push('(s.name LIKE ? OR s.subject_code LIKE ?)');const like=`%${req.query.search}%`;params.push(like,like);}const clause=where.length?`WHERE ${where.join(' AND ')}`:'';const [[countRow]] = await pool.execute(`SELECT COUNT(*) total FROM subjects s ${clause}`,params);const [rows]=await pool.execute(`SELECT s.*,sp.name specialization_name,u.name university_name,c.name course_name FROM subjects s JOIN university_courses uc ON uc.id=s.university_course_id JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id LEFT JOIN specializations sp ON sp.id=s.specialization_id ${clause} ORDER BY u.name,c.name,s.semester_number,s.display_order,s.name LIMIT ? OFFSET ?`,[...params,limit,offset]);res.json({success:true,message:'Subjects fetched.',data:rows,pagination:paginationMeta(page,limit,countRow.total)});}

async function validateSubjectSemester(universityCourseId, semester, specializationId){const [rows]=await pool.execute('SELECT total_semesters FROM university_courses WHERE id=? LIMIT 1',[universityCourseId]);if(!rows[0])throw new ApiError(404,'University-course mapping not found.');if(semester>rows[0].total_semesters)throw new ApiError(422,`semester_number cannot exceed ${rows[0].total_semesters}.`);if(specializationId){const [sp]=await pool.execute('SELECT id FROM specializations WHERE id=? AND university_course_id=? LIMIT 1',[specializationId,universityCourseId]);if(!sp[0])throw new ApiError(422,'specialization_id does not belong to this university course.');}}

async function createSubject(req,res){const d=req.body;await validateSubjectSemester(d.university_course_id,d.semester_number,d.specialization_id||null);const slug=slugify(d.slug||d.name);try{const [r]=await pool.execute(`INSERT INTO subjects (university_course_id,specialization_id,semester_number,name,subject_code,slug,description,is_active,display_order) VALUES (?,?,?,?,?,?,?,?,?)`,[d.university_course_id,d.specialization_id||null,d.semester_number,d.name,d.subject_code,slug,d.description||null,d.is_active??true,d.display_order??0]);await writeAudit({adminId:req.admin.id,entityType:'SUBJECT',entityId:r.insertId,action:'CREATE'});res.status(201).json({success:true,message:'Subject created.',data:{id:r.insertId,...d,slug}});}catch(e){duplicateTo409(e,'Subject code in this course/semester');}}

async function updateSubject(req,res){const subjectId=id(req.params.id),d=req.body;await validateSubjectSemester(d.university_course_id,d.semester_number,d.specialization_id||null);const slug=slugify(d.slug||d.name);try{const [r]=await pool.execute(`UPDATE subjects SET university_course_id=?,specialization_id=?,semester_number=?,name=?,subject_code=?,slug=?,description=?,is_active=?,display_order=? WHERE id=?`,[d.university_course_id,d.specialization_id||null,d.semester_number,d.name,d.subject_code,slug,d.description||null,d.is_active??true,d.display_order??0,subjectId]);if(!r.affectedRows)throw new ApiError(404,'Subject not found.');await writeAudit({adminId:req.admin.id,entityType:'SUBJECT',entityId:subjectId,action:'UPDATE'});res.json({success:true,message:'Subject updated.'});}catch(e){duplicateTo409(e,'Subject code in this course/semester');}}

async function setSubjectStatus(req,res){const subjectId=id(req.params.id);const [r]=await pool.execute('UPDATE subjects SET is_active=? WHERE id=?',[req.body.is_active,subjectId]);if(!r.affectedRows)throw new ApiError(404,'Subject not found.');await writeAudit({adminId:req.admin.id,entityType:'SUBJECT',entityId:subjectId,action:req.body.is_active?'ENABLE':'DISABLE'});res.json({success:true,message:'Subject status updated.'});}
async function deleteSubject(req,res){req.body={is_active:false};return setSubjectStatus(req,res);}

async function listMaterials(req,res){const {page,limit,offset}=getPagination(req.query);const where=[];const params=[];if(req.query.subject_id){where.push('m.subject_id=?');params.push(id(req.query.subject_id));}if(req.query.type){where.push('m.material_type=?');params.push(String(req.query.type).toUpperCase());}if(req.query.published!==undefined){where.push('m.is_published=?');params.push(['1','true',true].includes(req.query.published)?1:0);}if(req.query.search){where.push('(m.title LIKE ? OR s.name LIKE ?)');const like=`%${req.query.search}%`;params.push(like,like);}if(req.query.semester){where.push('s.semester_number=?');params.push(id(req.query.semester,'semester'));}if(req.query.university_id){where.push('uc.university_id=?');params.push(id(req.query.university_id));}if(req.query.course_id){where.push('uc.course_id=?');params.push(id(req.query.course_id));}const clause=where.length?`WHERE ${where.join(' AND ')}`:'';const [[countRow]]=await pool.execute(`SELECT COUNT(*) total FROM materials m JOIN subjects s ON s.id=m.subject_id JOIN university_courses uc ON uc.id=s.university_course_id ${clause}`,params);const [rows]=await pool.execute(`SELECT m.*,s.name subject_name,s.subject_code,s.semester_number,u.name university_name,c.name course_name FROM materials m JOIN subjects s ON s.id=m.subject_id JOIN university_courses uc ON uc.id=s.university_course_id JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id ${clause} ORDER BY m.created_at DESC LIMIT ? OFFSET ?`,[...params,limit,offset]);res.json({success:true,message:'Materials fetched.',data:rows,pagination:paginationMeta(page,limit,countRow.total)});}

async function createMaterial(req,res){const d=req.body;if(!d.file_path&&!d.file_url)throw new ApiError(422,'Provide file_path or file_url.');const [r]=await pool.execute(`INSERT INTO materials (subject_id,title,description,material_type,unit_number,exam_year,file_path,file_url,is_published,display_order,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,[d.subject_id,d.title,d.description||null,d.material_type,d.unit_number||null,d.exam_year||null,d.file_path||null,d.file_url||null,d.is_published??false,d.display_order??0,req.admin.id]);await writeAudit({adminId:req.admin.id,entityType:'MATERIAL',entityId:r.insertId,action:'CREATE'});res.status(201).json({success:true,message:'Material created.',data:{id:r.insertId,...d}});}

async function uploadMaterial(req,res){if(!req.file)throw new ApiError(400,'A file is required in multipart field named "file".');let d;try{d=JSON.parse(req.body.metadata||'{}');}catch(_e){await removeStoredFile(relativePathFor(req.file.filename));throw new ApiError(400,'metadata must be valid JSON.');}d={...d,subject_id:Number(d.subject_id),unit_number:d.unit_number?Number(d.unit_number):null,exam_year:d.exam_year?Number(d.exam_year):null,display_order:d.display_order?Number(d.display_order):0,is_published:String(d.is_published)==='true'||d.is_published===true};if(!Number.isInteger(d.subject_id)||!d.title||!['SYLLABUS','NOTES','PYQ'].includes(d.material_type)){await removeStoredFile(relativePathFor(req.file.filename));throw new ApiError(422,'metadata requires subject_id, title and valid material_type.');}if(d.material_type==='PYQ'&&!d.exam_year){await removeStoredFile(relativePathFor(req.file.filename));throw new ApiError(422,'PYQ requires exam_year.');}const filePath=relativePathFor(req.file.filename);const fileUrl=publicUrlFor(req.file.filename);const [r]=await pool.execute(`INSERT INTO materials (subject_id,title,description,material_type,unit_number,exam_year,file_path,file_url,original_file_name,mime_type,file_size,is_published,display_order,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[d.subject_id,d.title,d.description||null,d.material_type,d.unit_number||null,d.exam_year||null,filePath,fileUrl,req.file.originalname,req.file.mimetype,req.file.size,d.is_published,d.display_order,req.admin.id]);await writeAudit({adminId:req.admin.id,entityType:'MATERIAL',entityId:r.insertId,action:'UPLOAD'});res.status(201).json({success:true,message:'Material uploaded.',data:{id:r.insertId,file_url:fileUrl,file_path:filePath}});}

async function updateMaterial(req,res){const materialId=id(req.params.id),d=req.body;if(!d.file_path&&!d.file_url)throw new ApiError(422,'Provide file_path or file_url.');const [r]=await pool.execute(`UPDATE materials SET subject_id=?,title=?,description=?,material_type=?,unit_number=?,exam_year=?,file_path=?,file_url=?,is_published=?,display_order=? WHERE id=?`,[d.subject_id,d.title,d.description||null,d.material_type,d.unit_number||null,d.exam_year||null,d.file_path||null,d.file_url||null,d.is_published??false,d.display_order??0,materialId]);if(!r.affectedRows)throw new ApiError(404,'Material not found.');await writeAudit({adminId:req.admin.id,entityType:'MATERIAL',entityId:materialId,action:'UPDATE'});res.json({success:true,message:'Material updated.'});}

async function publishMaterial(req,res){return setMaterialPublished(req,res,true);}
async function unpublishMaterial(req,res){return setMaterialPublished(req,res,false);}
async function setMaterialPublished(req,res,value){const materialId=id(req.params.id);const [r]=await pool.execute('UPDATE materials SET is_published=? WHERE id=?',[value,materialId]);if(!r.affectedRows)throw new ApiError(404,'Material not found.');await writeAudit({adminId:req.admin.id,entityType:'MATERIAL',entityId:materialId,action:value?'PUBLISH':'UNPUBLISH'});res.json({success:true,message:value?'Material published.':'Material unpublished.'});}

async function deleteMaterial(req,res){const materialId=id(req.params.id);const [rows]=await pool.execute('SELECT file_path,file_url FROM materials WHERE id=? LIMIT 1',[materialId]);if(!rows[0])throw new ApiError(404,'Material not found.');await pool.execute('DELETE FROM materials WHERE id=?',[materialId]);if(rows[0].file_path && rows[0].file_url && rows[0].file_url.startsWith('/uploads/')) await removeStoredFile(rows[0].file_path);await writeAudit({adminId:req.admin.id,entityType:'MATERIAL',entityId:materialId,action:'DELETE'});res.json({success:true,message:'Material deleted.'});}

module.exports={dashboard,listUniversities,createUniversity,updateUniversity,setUniversityStatus,deleteUniversity,listCourses,createCourse,updateCourse,setCourseStatus,deleteCourse,listUniversityCourses,createUniversityCourse,updateUniversityCourse,deleteUniversityCourse,listSpecializations,createSpecialization,updateSpecialization,deleteSpecialization,listSubjects,createSubject,updateSubject,setSubjectStatus,deleteSubject,listMaterials,createMaterial,uploadMaterial,updateMaterial,publishMaterial,unpublishMaterial,deleteMaterial};
