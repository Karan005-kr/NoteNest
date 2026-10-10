module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'StudyVault API',
    version: '1.0.0',
    description: 'Reusable REST API for university → course → semester → subject → syllabus/notes/PYQ.',
  },
  servers: [{ url: 'http://localhost:5000' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  paths: {
    '/api/health': { get: { summary: 'Health check', responses: { 200: { description: 'Healthy' } } } },
    '/api/universities': { get: { summary: 'List active universities', responses: { 200: { description: 'University list' } } } },
    '/api/universities/{idOrSlug}/courses': {
      get: {
        summary: 'List courses offered by a university',
        parameters: [{ in: 'path', name: 'idOrSlug', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Course mappings' } },
      },
    },
    '/api/university-courses/{id}/semesters': {
      get: {
        summary: 'Generate semester list from total_semesters',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Semesters' } },
      },
    },
    '/api/university-courses/{id}/semesters/{semester}/subjects': {
      get: {
        summary: 'List subjects for a semester',
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
          { in: 'path', name: 'semester', required: true, schema: { type: 'integer' } },
          { in: 'query', name: 'specialization_id', required: false, schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Subjects' } },
      },
    },
    '/api/subjects/{id}/content': {
      get: {
        summary: 'Subject plus grouped Syllabus, Notes and PYQ',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Grouped content' } },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Admin login',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email','password'], properties: { email: { type: 'string' }, password: { type: 'string' } } } } } },
        responses: { 200: { description: 'JWT returned' }, 401: { description: 'Invalid credentials' } },
      },
    },
    '/api/admin/dashboard': {
      get: { summary: 'Admin stats', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Dashboard stats' } } },
    },
    '/api/admin/materials/upload': {
      post: {
        summary: 'Upload a material document',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' }, metadata: { type: 'string', example: '{"subject_id":1,"title":"Unit 1 Notes","material_type":"NOTES","unit_number":1}' } } } } },
        },
        responses: { 201: { description: 'Uploaded' } },
      },
    },
  },
};
