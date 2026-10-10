(function () {
  const API = window.StudyVaultAPI;
  const $ = (id) => document.getElementById(id);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const esc = (v) => String(v ?? '').replace(/[&<>'"]/g, (ch) => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[ch]));
  const toast = (m, e) => window.studyVaultToast(m, e);

  const cache = { universities: [], courses: [] };

  function setMessage(id, message, ok = false) { const el = $(id); el.textContent = message || ''; el.classList.toggle('success', ok); }
  function optionHtml(items, valueKey, label) { return `<option value="">Select</option>` + items.map((x) => `<option value="${esc(x[valueKey])}">${esc(label(x))}</option>`).join(''); }
  function token() { return localStorage.getItem('studyvault_admin_token'); }

  async function open() {
    if (!token()) { $('adminLoginPanel').hidden = false; $('adminPanel').hidden = true; return; }
    try {
      const me = await API.me();
      $('adminLoginPanel').hidden = true; $('adminPanel').hidden = false;
      $('adminName').textContent = me.data.name || me.data.email || 'Administrator';
      $('adminRole').textContent = me.data.role || 'ADMIN';
      await Promise.all([loadBaseOptions(), loadDashboard()]);
    } catch (_error) {
      localStorage.removeItem('studyvault_admin_token');
      $('adminLoginPanel').hidden = false; $('adminPanel').hidden = true;
    }
  }

  $('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    setMessage('loginMessage', 'Signing in...');
    try {
      const result = await API.login($('adminEmail').value.trim(), $('adminPassword').value);
      localStorage.setItem('studyvault_admin_token', result.data.token);
      setMessage('loginMessage', 'Login successful.', true);
      await open();
    } catch (error) { setMessage('loginMessage', error.message); }
  });

  $('adminLogout').addEventListener('click', async () => {
    try { await API.logout(); } catch (_e) {}
    localStorage.removeItem('studyvault_admin_token');
    $('adminPanel').hidden = true; $('adminLoginPanel').hidden = false;
    $('adminPassword').value = '';
  });

  $$('.admin-nav[data-admin-tab]').forEach((button) => button.addEventListener('click', async () => {
    $$('.admin-nav[data-admin-tab]').forEach((b) => b.classList.toggle('active', b === button));
    $$('.admin-tab').forEach((t) => t.classList.remove('active'));
    $(`admin${button.dataset.adminTab[0].toUpperCase()}${button.dataset.adminTab.slice(1)}Tab`).classList.add('active');
    if (button.dataset.adminTab === 'materials') await loadMaterials();
    if (button.dataset.adminTab === 'subjects') await refreshAdminSubjectList();
  }));

  async function loadBaseOptions() {
    const [universities, courses] = await Promise.all([API.getUniversities(), API.getCourses()]);
    cache.universities = universities.data; cache.courses = courses.data;
    ['uploadUniversity','subjectUniversity','mapUniversity','branchUniversity'].forEach((id) => { $(id).innerHTML = optionHtml(cache.universities, 'id', (u) => `${u.short_name || u.name} — ${u.name}`); });
    ['mapCourse'].forEach((id) => { $(id).innerHTML = optionHtml(cache.courses, 'id', (c) => `${c.short_name || c.name} — ${c.name}`); });
  }

  async function populateUniversityCourses(universitySelectId, courseSelectId) {
    const uid = $(universitySelectId).value;
    if (!uid) { $(courseSelectId).innerHTML = '<option value="">Select</option>'; return; }
    const result = await API.getUniversityCourses(uid);
    $(courseSelectId).innerHTML = optionHtml(result.data, 'university_course_id', (c) => `${c.short_name || c.name} — ${c.name}`);
  }

  async function populateCourseChildren(courseSelectId, specId, semesterId) {
    const ucid = $(courseSelectId).value;
    if (!ucid) return;
    const [specs, sems] = await Promise.all([API.getSpecializations(ucid), API.getSemesters(ucid)]);
    $(specId).innerHTML = '<option value="">Common / No branch</option>' + specs.data.map((s) => `<option value="${s.id}">${esc(s.short_name || s.name)} — ${esc(s.name)}</option>`).join('');
    $(semesterId).innerHTML = optionHtml(sems.data, 'number', (s) => s.label);
  }

  async function populateSubjects(courseId, specId, semesterId, subjectId) {
    const ucid = $(courseId).value, semester = $(semesterId).value;
    if (!ucid || !semester) { $(subjectId).innerHTML = '<option value="">Select</option>'; return []; }
    const result = await API.getSubjects(ucid, semester, $(specId).value || null);
    $(subjectId).innerHTML = optionHtml(result.data, 'id', (s) => `${s.subject_code || ''} — ${s.name}`);
    return result.data;
  }

  [['uploadUniversity','uploadCourse'],['subjectUniversity','subjectCourse'],['branchUniversity','branchCourse']].forEach(([u,c]) => $(u).addEventListener('change', async () => { await populateUniversityCourses(u,c); if (u === 'branchUniversity') return; const prefix = u === 'uploadUniversity' ? 'upload' : 'subject'; $(`${prefix}Specialization`).innerHTML = '<option value="">Common / No branch</option>'; $(`${prefix}Semester`).innerHTML = '<option value="">Select</option>'; }));
  $('uploadCourse').addEventListener('change', () => populateCourseChildren('uploadCourse','uploadSpecialization','uploadSemester'));
  $('subjectCourse').addEventListener('change', () => populateCourseChildren('subjectCourse','subjectSpecialization','subjectSemester'));
  $('uploadSemester').addEventListener('change', () => populateSubjects('uploadCourse','uploadSpecialization','uploadSemester','uploadSubject'));
  $('uploadSpecialization').addEventListener('change', () => populateSubjects('uploadCourse','uploadSpecialization','uploadSemester','uploadSubject'));
  $('subjectSemester').addEventListener('change', refreshAdminSubjectList);
  $('subjectSpecialization').addEventListener('change', refreshAdminSubjectList);

  async function loadDashboard() {
    try {
      const r = await API.adminDashboard();
      const d = r.data || {};
      const statMap = [
        ['Universities', d.totalUniversities ?? d.total_universities ?? 0],
        ['Courses', d.totalCourses ?? d.total_courses ?? 0],
        ['Subjects', d.totalSubjects ?? d.total_subjects ?? 0],
        ['Materials', d.totalMaterials ?? d.total_materials ?? 0],
        ['Published', d.publishedMaterials ?? d.published_materials ?? 0],
        ['Syllabus', d.syllabusCount ?? d.syllabus_count ?? 0],
        ['Notes', d.notesCount ?? d.notes_count ?? 0],
        ['PYQ', d.pyqCount ?? d.pyq_count ?? 0]
      ];
      $('adminStats').innerHTML = statMap.map(([label, value]) => `<article class="admin-stat"><strong>${esc(value)}</strong><span>${esc(label)}</span></article>`).join('');
      const recent = d.recentMaterials || d.recent_materials || [];
      $('recentMaterials').innerHTML = recent.length ? tableForMaterials(recent, false) : '<div class="empty-state"><strong>No recent material</strong><p>New material will appear here.</p></div>';
    } catch (e) { toast(e.message, true); }
  }
  $('refreshDashboard').addEventListener('click', loadDashboard);

  $('materialType').addEventListener('change', () => {
    const type = $('materialType').value;
    $('unitField').hidden = type !== 'NOTES';
    $('yearField').hidden = type !== 'PYQ';
  });
  $$('input[name="materialMethod"]').forEach((r) => r.addEventListener('change', () => {
    const upload = document.querySelector('input[name="materialMethod"]:checked').value === 'upload';
    $('fileInputWrap').hidden = !upload; $('urlInputWrap').hidden = upload;
  }));

  $('materialUploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    setMessage('uploadMessage','Saving...');
    const metadata = {
      subject_id: Number($('uploadSubject').value), title: $('materialTitle').value.trim(), description: $('materialDescription').value.trim(),
      material_type: $('materialType').value, unit_number: $('materialType').value === 'NOTES' && $('materialUnit').value ? Number($('materialUnit').value) : null,
      exam_year: $('materialType').value === 'PYQ' && $('materialYear').value ? Number($('materialYear').value) : null,
      is_published: $('materialPublished').checked, display_order: 0
    };
    try {
      const method = document.querySelector('input[name="materialMethod"]:checked').value;
      if (method === 'upload') {
        const file = $('materialFile').files[0]; if (!file) throw new Error('Select a document file.');
        const form = new FormData(); form.append('file', file); form.append('metadata', JSON.stringify(metadata));
        await API.uploadMaterial(form);
      } else {
        const value = $('materialUrl').value.trim(); if (!value) throw new Error('Enter a file URL or path.');
        if (/^https?:\/\//i.test(value)) metadata.file_url = value; else metadata.file_path = value;
        await API.createMaterial(metadata);
      }
      setMessage('uploadMessage','Material saved successfully.',true); toast('Material saved.');
      $('materialTitle').value = ''; $('materialDescription').value = ''; $('materialFile').value = ''; $('materialUrl').value = '';
      await loadDashboard();
    } catch (error) { setMessage('uploadMessage', error.message); }
  });

  async function loadMaterials() {
    const params = new URLSearchParams({ page:'1', limit:'50' });
    if ($('materialSearch').value.trim()) params.set('search',$('materialSearch').value.trim());
    if ($('materialFilterType').value) params.set('type',$('materialFilterType').value);
    if ($('materialFilterPublished').value) params.set('published',$('materialFilterPublished').value);
    $('adminMaterialsTable').innerHTML = '<div class="loading">Loading...</div>';
    try { const r = await API.adminMaterials(params.toString()); $('adminMaterialsTable').innerHTML = tableForMaterials(r.data, true); }
    catch (e) { $('adminMaterialsTable').innerHTML = `<div class="empty-state"><strong>Could not load materials</strong><p>${esc(e.message)}</p></div>`; }
  }
  $('refreshMaterials').addEventListener('click', loadMaterials);
  $('applyMaterialFilters').addEventListener('click', loadMaterials);

  function tableForMaterials(rows, actions) {
    if (!rows?.length) return '<div class="empty-state"><strong>No materials found</strong><p>Try another filter or add a new material.</p></div>';
    return `<table><thead><tr><th>Title</th><th>Subject</th><th>Type</th><th>Status</th>${actions ? '<th>Actions</th>' : ''}</tr></thead><tbody>${rows.map((m) => `<tr><td>${esc(m.title)}</td><td>${esc(m.subject_name || '')}<br><small>${esc(m.subject_code || '')}</small></td><td>${esc(m.material_type)}</td><td><span class="status ${m.is_published ? 'published' : 'unpublished'}">${m.is_published ? 'Published' : 'Hidden'}</span></td>${actions ? `<td><div class="table-actions"><button class="table-btn" data-material-action="${m.is_published ? 'unpublish' : 'publish'}" data-id="${m.id}">${m.is_published ? 'Hide' : 'Publish'}</button><button class="table-btn" data-material-action="delete" data-id="${m.id}">Delete</button></div></td>` : ''}</tr>`).join('')}</tbody></table>`;
  }

  $('adminMaterialsTable').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-material-action]'); if (!b) return;
    const id = Number(b.dataset.id), action = b.dataset.materialAction;
    try {
      if (action === 'delete') { if (!confirm('Delete this material?')) return; await API.deleteMaterial(id); }
      else if (action === 'publish') await API.publishMaterial(id);
      else await API.unpublishMaterial(id);
      toast('Material updated.'); await Promise.all([loadMaterials(), loadDashboard()]);
    } catch (error) { toast(error.message,true); }
  });

  async function refreshAdminSubjectList() {
    const ucid = $('subjectCourse').value, semester = $('subjectSemester').value;
    if (!ucid || !semester) { $('adminSubjectList').innerHTML = '<div class="empty-state"><strong>Select course and semester</strong><p>Subjects will appear here.</p></div>'; return; }
    try {
      // Fetch directly because this view renders subject cards instead of a select.
      const r = await API.getSubjects(ucid, semester, $('subjectSpecialization').value || null);
      $('adminSubjectList').innerHTML = r.data.length ? r.data.map((s) => `<article class="subject-card"><div><h3>${esc(s.name)}</h3><p>${esc(s.subject_code || '')}</p></div><span class="status published">Active</span></article>`).join('') : '<div class="empty-state"><strong>No subjects</strong><p>Add the first subject using the form above.</p></div>';
    } catch (e) { $('adminSubjectList').innerHTML = `<div class="empty-state"><strong>Could not load subjects</strong><p>${esc(e.message)}</p></div>`; }
  }

  $('subjectCreateForm').addEventListener('submit', async (e) => {
    e.preventDefault(); setMessage('subjectMessage','Saving...');
    try {
      await API.createSubject({ university_course_id:Number($('subjectCourse').value), specialization_id:$('subjectSpecialization').value ? Number($('subjectSpecialization').value) : null, semester_number:Number($('subjectSemester').value), name:$('newSubjectName').value.trim(), subject_code:$('newSubjectCode').value.trim(), description:$('newSubjectDescription').value.trim(), is_active:true, display_order:0 });
      setMessage('subjectMessage','Subject added.',true); $('newSubjectName').value=''; $('newSubjectCode').value=''; $('newSubjectDescription').value=''; await refreshAdminSubjectList();
    } catch (error) { setMessage('subjectMessage',error.message); }
  });

  $('universityCreateForm').addEventListener('submit', async (e) => {
    e.preventDefault(); setMessage('universityMessage','Saving...');
    try { await API.createUniversity({ name:$('newUniversityName').value.trim(), short_name:$('newUniversityShort').value.trim(), location:$('newUniversityLocation').value.trim() || null, website:null, is_active:true }); setMessage('universityMessage','University added.',true); await loadBaseOptions(); }
    catch (error) { setMessage('universityMessage',error.message); }
  });
  $('courseCreateForm').addEventListener('submit', async (e) => {
    e.preventDefault(); setMessage('courseMessage','Saving...');
    try { await API.createCourse({ name:$('newCourseName').value.trim(), short_name:$('newCourseShort').value.trim(), default_semesters:Number($('newCourseSemesters').value), is_active:true }); setMessage('courseMessage','Course added.',true); await loadBaseOptions(); }
    catch (error) { setMessage('courseMessage',error.message); }
  });
  $('mappingCreateForm').addEventListener('submit', async (e) => {
    e.preventDefault(); setMessage('mappingMessage','Saving...');
    try { await API.createMapping({ university_id:Number($('mapUniversity').value), course_id:Number($('mapCourse').value), total_semesters:Number($('mapSemesters').value), is_active:true }); setMessage('mappingMessage','Mapping created.',true); }
    catch (error) { setMessage('mappingMessage',error.message); }
  });
  $('specializationCreateForm').addEventListener('submit', async (e) => {
    e.preventDefault(); setMessage('branchMessage','Saving...');
    try { await API.createSpecialization({ university_course_id:Number($('branchCourse').value), name:$('branchName').value.trim(), short_name:$('branchShort').value.trim(), is_active:true }); setMessage('branchMessage','Branch added.',true); }
    catch (error) { setMessage('branchMessage',error.message); }
  });

  window.StudyVaultAdmin = { open, loadDashboard, loadMaterials };
})();
