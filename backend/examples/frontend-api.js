const API_BASE = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const body = await response.json();
  if (!response.ok) throw new Error(body.message || 'API request failed');
  return body;
}

export const getUniversities = () => request('/universities');
export const getUniversityCourses = (universityIdOrSlug) => request(`/universities/${universityIdOrSlug}/courses`);
export const getSemesters = (universityCourseId) => request(`/university-courses/${universityCourseId}/semesters`);
export const getSpecializations = (universityCourseId) => request(`/university-courses/${universityCourseId}/specializations`);
export const getSubjects = (universityCourseId, semester, specializationId = null) => {
  const query = specializationId ? `?specialization_id=${specializationId}` : '';
  return request(`/university-courses/${universityCourseId}/semesters/${semester}/subjects${query}`);
};
export const getSubjectContent = (subjectId) => request(`/subjects/${subjectId}/content`);

export async function adminLogin(email, password) {
  return request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function adminRequest(path, token, options = {}) {
  return request(`/admin${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
}

export const createSubject = (token, data) => adminRequest('/subjects', token, { method: 'POST', body: JSON.stringify(data) });
export const createMaterial = (token, data) => adminRequest('/materials', token, { method: 'POST', body: JSON.stringify(data) });

export function uploadMaterial(token, file, metadata) {
  const form = new FormData();
  form.append('file', file);
  form.append('metadata', JSON.stringify(metadata));
  return adminRequest('/materials/upload', token, { method: 'POST', body: form });
}
