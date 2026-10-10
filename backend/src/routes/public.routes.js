const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const c = require('../controllers/public.controller');

router.get('/universities', asyncHandler(c.getUniversities));
router.get('/universities/:idOrSlug', asyncHandler(c.getUniversity));
router.get('/universities/:idOrSlug/courses', asyncHandler(c.getUniversityCourses));
router.get('/courses', asyncHandler(c.getCourses));
router.get('/courses/:id', asyncHandler(c.getCourse));
router.get('/university-courses/:id', asyncHandler(c.getUniversityCourse));
router.get('/university-courses/:id/semesters', asyncHandler(c.getSemesters));
router.get('/university-courses/:id/specializations', asyncHandler(c.getSpecializations));
router.get('/university-courses/:id/semesters/:semester/subjects', asyncHandler(c.getSubjects));
router.get('/subjects/:id', asyncHandler(c.getSubject));
router.get('/subjects/:id/materials', asyncHandler(c.getMaterials));
router.get('/subjects/:id/content', asyncHandler(c.getSubjectContent));
router.get('/materials/:id', asyncHandler(c.getMaterial));
router.get('/search', asyncHandler(c.search));

module.exports = router;
