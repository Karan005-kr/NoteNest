const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { authenticateAdmin } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validation.middleware');
const { uploadMaterialFile } = require('../middleware/upload.middleware');
const s = require('../validators/schemas');
const c = require('../controllers/admin.controller');

router.use(authenticateAdmin);
router.get('/dashboard', asyncHandler(c.dashboard));

router.get('/universities', asyncHandler(c.listUniversities));
router.post('/universities', validate(s.universitySchema), asyncHandler(c.createUniversity));
router.put('/universities/:id', validate(s.universitySchema), asyncHandler(c.updateUniversity));
router.patch('/universities/:id/status', validate(s.statusSchema), asyncHandler(c.setUniversityStatus));
router.delete('/universities/:id', requireRole('SUPER_ADMIN','ADMIN'), asyncHandler(c.deleteUniversity));

router.get('/courses', asyncHandler(c.listCourses));
router.post('/courses', validate(s.courseSchema), asyncHandler(c.createCourse));
router.put('/courses/:id', validate(s.courseSchema), asyncHandler(c.updateCourse));
router.patch('/courses/:id/status', validate(s.statusSchema), asyncHandler(c.setCourseStatus));
router.delete('/courses/:id', requireRole('SUPER_ADMIN','ADMIN'), asyncHandler(c.deleteCourse));

router.get('/university-courses', asyncHandler(c.listUniversityCourses));
router.post('/university-courses', validate(s.universityCourseSchema), asyncHandler(c.createUniversityCourse));
router.put('/university-courses/:id', validate(s.universityCourseSchema), asyncHandler(c.updateUniversityCourse));
router.delete('/university-courses/:id', asyncHandler(c.deleteUniversityCourse));

router.get('/specializations', asyncHandler(c.listSpecializations));
router.post('/specializations', validate(s.specializationSchema), asyncHandler(c.createSpecialization));
router.put('/specializations/:id', validate(s.specializationSchema), asyncHandler(c.updateSpecialization));
router.delete('/specializations/:id', asyncHandler(c.deleteSpecialization));

router.get('/subjects', asyncHandler(c.listSubjects));
router.post('/subjects', validate(s.subjectSchema), asyncHandler(c.createSubject));
router.put('/subjects/:id', validate(s.subjectSchema), asyncHandler(c.updateSubject));
router.patch('/subjects/:id/status', validate(s.statusSchema), asyncHandler(c.setSubjectStatus));
router.delete('/subjects/:id', asyncHandler(c.deleteSubject));

router.get('/materials', asyncHandler(c.listMaterials));
router.post('/materials', validate(s.materialSchema), asyncHandler(c.createMaterial));
router.post('/materials/upload', uploadMaterialFile, asyncHandler(c.uploadMaterial));
router.put('/materials/:id', validate(s.materialSchema), asyncHandler(c.updateMaterial));
router.patch('/materials/:id/publish', asyncHandler(c.publishMaterial));
router.patch('/materials/:id/unpublish', asyncHandler(c.unpublishMaterial));
router.delete('/materials/:id', asyncHandler(c.deleteMaterial));

module.exports = router;
