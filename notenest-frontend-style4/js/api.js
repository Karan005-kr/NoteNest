(function () {
  const cfg = window.STUDYVAULT_CONFIG;
  const API = cfg.API_BASE_URL.replace(/\/$/, '');

  async function parseResponse(response) {
    let body;
    try { body = await response.json(); }
    catch (_error) { body = { success: false, message: `Server returned ${response.status}.` }; }
    if (!response.ok) {
      const error = new Error(body.message || 'Request failed.');
      error.status = response.status;
      error.errors = body.errors || [];
      throw error;
    }
    return body;
  }

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, options);
    return parseResponse(response);
  }

  function authHeaders(extra = {}) {
    const token = localStorage.getItem('studyvault_admin_token');
    return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  }

  async function adminRequest(path, options = {}) {
    const isFormData = options.body instanceof FormData;
    return request(`/admin${path}`, {
      ...options,
      headers: authHeaders({ ...(isFormData ? {} : { 'Content-Type': 'application/json' }), ...(options.headers || {}) })
    });
  }

  window.StudyVaultAPI = {
    health: () => request('/health'),
    getUniversities: () => request('/universities'),
    getUniversity: (idOrSlug) => request(`/universities/${encodeURIComponent(idOrSlug)}`),
    getUniversityCourses: (idOrSlug) => request(`/universities/${encodeURIComponent(idOrSlug)}/courses`),
    getCourses: () => request('/courses'),
    getUniversityCourse: (id) => request(`/university-courses/${id}`),
    getSemesters: (id) => request(`/university-courses/${id}/semesters`),
    getSpecializations: (id) => request(`/university-courses/${id}/specializations`),
    getSubjects: (id, semester, specializationId) => request(`/university-courses/${id}/semesters/${semester}/subjects${specializationId ? `?specialization_id=${specializationId}` : ''}`),
    getSubject: (id) => request(`/subjects/${id}`),
    getSubjectContent: (id) => request(`/subjects/${id}/content`),
    getMaterials: (id, query = '') => request(`/subjects/${id}/materials${query ? `?${query}` : ''}`),
    search: (q) => request(`/search?q=${encodeURIComponent(q)}`),

    login: (email, password) => request('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }),
    me: () => request('/auth/me', { headers: authHeaders() }),
    logout: () => request('/auth/logout', { method: 'POST', headers: authHeaders() }),

    adminDashboard: () => adminRequest('/dashboard'),
    adminUniversities: () => adminRequest('/universities'),
    createUniversity: (data) => adminRequest('/universities', { method: 'POST', body: JSON.stringify(data) }),
    adminCourses: () => adminRequest('/courses'),
    createCourse: (data) => adminRequest('/courses', { method: 'POST', body: JSON.stringify(data) }),
    adminMappings: () => adminRequest('/university-courses'),
    createMapping: (data) => adminRequest('/university-courses', { method: 'POST', body: JSON.stringify(data) }),
    adminSpecializations: () => adminRequest('/specializations'),
    createSpecialization: (data) => adminRequest('/specializations', { method: 'POST', body: JSON.stringify(data) }),
    adminSubjects: (query = '') => adminRequest(`/subjects${query ? `?${query}` : ''}`),
    createSubject: (data) => adminRequest('/subjects', { method: 'POST', body: JSON.stringify(data) }),
    updateSubject: (id, data) => adminRequest(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    setSubjectStatus: (id, isActive) => adminRequest(`/subjects/${id}/status`, { method: 'PATCH', body: JSON.stringify({ is_active: isActive }) }),
    adminMaterials: (query = '') => adminRequest(`/materials${query ? `?${query}` : ''}`),
    createMaterial: (data) => adminRequest('/materials', { method: 'POST', body: JSON.stringify(data) }),
    uploadMaterial: (formData) => adminRequest('/materials/upload', { method: 'POST', body: formData }),
    publishMaterial: (id) => adminRequest(`/materials/${id}/publish`, { method: 'PATCH' }),
    unpublishMaterial: (id) => adminRequest(`/materials/${id}/unpublish`, { method: 'PATCH' }),
    deleteMaterial: (id) => adminRequest(`/materials/${id}`, { method: 'DELETE' })
  };
})();
