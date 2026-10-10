const { z } = require('zod');

const positiveId = z.coerce.number().int().positive();
const boolish = z.union([z.boolean(), z.literal(0), z.literal(1)]).transform(Boolean);

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(200),
});

const universitySchema = z.object({
  name: z.string().trim().min(2).max(255),
  short_name: z.string().trim().min(1).max(50),
  slug: z.string().trim().min(1).max(180).optional(),
  location: z.string().trim().max(255).optional().nullable(),
  website: z.string().trim().url().optional().nullable().or(z.literal('')),
  is_active: boolish.optional(),
});

const courseSchema = z.object({
  name: z.string().trim().min(1).max(120),
  short_name: z.string().trim().min(1).max(50),
  slug: z.string().trim().min(1).max(180).optional(),
  default_semesters: z.coerce.number().int().min(1).max(20),
  is_active: boolish.optional(),
});

const universityCourseSchema = z.object({
  university_id: positiveId,
  course_id: positiveId,
  total_semesters: z.coerce.number().int().min(1).max(20),
  is_active: boolish.optional(),
});

const specializationSchema = z.object({
  university_course_id: positiveId,
  name: z.string().trim().min(1).max(150),
  short_name: z.string().trim().min(1).max(50),
  slug: z.string().trim().min(1).max(180).optional(),
  is_active: boolish.optional(),
});

const subjectSchema = z.object({
  university_course_id: positiveId,
  specialization_id: z.union([positiveId, z.null()]).optional(),
  semester_number: z.coerce.number().int().min(1).max(20),
  name: z.string().trim().min(1).max(255),
  subject_code: z.string().trim().min(1).max(80),
  slug: z.string().trim().min(1).max(180).optional(),
  description: z.string().trim().max(5000).optional().nullable(),
  display_order: z.coerce.number().int().min(0).max(10000).optional(),
  is_active: boolish.optional(),
});

const materialSchema = z.object({
  subject_id: positiveId,
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).optional().nullable(),
  material_type: z.enum(['SYLLABUS', 'NOTES', 'PYQ']),
  unit_number: z.coerce.number().int().positive().optional().nullable(),
  exam_year: z.coerce.number().int().min(1900).max(2200).optional().nullable(),
  file_path: z.string().trim().max(1000).optional().nullable(),
  file_url: z.string().trim().max(2000).optional().nullable(),
  is_published: boolish.optional(),
  display_order: z.coerce.number().int().min(0).max(10000).optional(),
}).superRefine((data, ctx) => {
  if (data.material_type === 'PYQ' && !data.exam_year) {
    ctx.addIssue({ code: 'custom', path: ['exam_year'], message: 'exam_year is required for PYQ.' });
  }
});

const statusSchema = z.object({ is_active: boolish });

module.exports = {
  loginSchema,
  universitySchema,
  courseSchema,
  universityCourseSchema,
  specializationSchema,
  subjectSchema,
  materialSchema,
  statusSchema,
};
