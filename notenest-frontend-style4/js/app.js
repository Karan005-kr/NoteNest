(function () {
  const API = window.StudyVaultAPI;
  const cfg = window.STUDYVAULT_CONFIG;

  const state = {
    university: null,
    course: null,
    specialization: null,
    semester: null,
    subject: null,
    content: null,
    materialTab: 'syllabus'
  };

  const $ = (id) => document.getElementById(id);

  const $$ = (selector) =>
    Array.from(document.querySelectorAll(selector));

  const esc = (value) =>
    String(value ?? '').replace(
      /[&<>'"]/g,
      (ch) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[ch])
    );

  function toast(message, error = false) {
    const el = $('toast');

    if (!el) return;

    el.textContent = message;

    el.className = `toast show${error ? ' error' : ''}`;

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {
      el.className = 'toast';
    }, 3000);
  }

  window.studyVaultToast = toast;

  function resetSelect(id, placeholder) {
    const el = $(id);

    if (!el) return;

    el.innerHTML =
      `<option value="">${esc(placeholder)}</option>`;

    el.value = '';
  }

  function resetBrowseFlow() {
    state.university = null;
    state.course = null;
    state.specialization = null;
    state.semester = null;
    state.subject = null;
    state.content = null;
    state.materialTab = 'syllabus';

    const universitySelect = $('universitySelect');

    if (universitySelect) {
      universitySelect.value = '';
    }

    resetSelect(
      'courseSelect',
      'Select Course / Degree'
    );

    resetSelect(
      'specializationSelect',
      'Select Branch / Specialization'
    );

    resetSelect(
      'semesterSelect',
      'Select Semester'
    );

    if ($('universityNext')) {
      $('universityNext').disabled = true;
    }

    if ($('courseNext')) {
      $('courseNext').disabled = true;
    }

    if ($('specializationNext')) {
      $('specializationNext').disabled = true;
    }

    if ($('semesterNext')) {
      $('semesterNext').disabled = true;
    }

    if ($('subjectList')) {
      $('subjectList').innerHTML = '';
    }

    if ($('materialList')) {
      $('materialList').innerHTML = '';
    }

    if ($('subjectTitle')) {
      $('subjectTitle').textContent = '';
    }

    if ($('subjectMeta')) {
      $('subjectMeta').textContent = '';
    }

    if ($('subjectDescription')) {
      $('subjectDescription').textContent = '';
    }

    ['syllabus', 'notes', 'pyq'].forEach((key) => {
      const count = $(`${key}Count`);

      if (count) {
        count.textContent = '0';
      }
    });

    $$('.material-tab').forEach((button) => {
      button.classList.toggle(
        'active',
        button.dataset.materialTab === 'syllabus'
      );
    });

    const summary = $('selectionSummary');

    if (summary) {
      summary.hidden = true;
      summary.textContent = '';
    }

    showBrowseStep('university');
  }

  window.resetStudyVaultBrowse = resetBrowseFlow;

  function setRoute(route) {
    $$('.view').forEach((v) => {
      v.classList.remove('active-view');
    });

    const target =
      $(`${route}View`) || $('homeView');

    target.classList.add('active-view');

    $$('.main-nav button[data-route]').forEach((b) => {
      b.classList.toggle(
        'active',
        b.dataset.route === route
      );
    });

    document
      .querySelector('.main-nav')
      ?.classList.remove('open');

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    if (route === 'browse') {
      resetBrowseFlow();
      ensureUniversities();
    }

    if (
      route === 'admin' &&
      window.StudyVaultAdmin
    ) {
      window.StudyVaultAdmin.open();
    }

    location.hash =
      route === 'home'
        ? ''
        : route;
  }

  window.studyVaultSetRoute = setRoute;

  function selectOption(
    select,
    placeholder,
    items,
    valueKey,
    labelFn
  ) {
    select.innerHTML =
      `<option value="">${esc(
        placeholder
      )}</option>` +
      items
        .map(
          (item) =>
            `<option value="${esc(
              item[valueKey]
            )}">${esc(
              labelFn(item)
            )}</option>`
        )
        .join('');
  }

  async function loadHomeStats() {
    try {
      const [u, c] = await Promise.all([
        API.getUniversities(),
        API.getCourses()
      ]);

      $('statUniversities').textContent =
        u.data.length;

      $('statCourses').textContent =
        c.data.length;
    } catch (_error) {
      $('statUniversities').textContent = '—';
      $('statCourses').textContent = '—';
    }
  }

  let universitiesLoaded = false;

  async function ensureUniversities() {
    if (universitiesLoaded) return;

    try {
      const result =
        await API.getUniversities();

      selectOption(
        $('universitySelect'),
        'Select University',
        result.data,
        'id',
        (u) =>
          `${u.name}${
            u.short_name
              ? ` (${u.short_name})`
              : ''
          }`
      );

      universitiesLoaded = true;

      $('universitySelect').value = '';

      $('universityNext').disabled = true;
    } catch (error) {
      $('universitySelect').innerHTML =
        '<option value="">Backend not connected</option>';

      toast(
        `Could not load universities: ${error.message}`,
        true
      );
    }
  }

  function showBrowseStep(name) {
    [
      'universityStep',
      'courseStep',
      'specializationStep',
      'semesterStep',
      'subjectStep',
      'materialStep'
    ].forEach((id) => {
      const el = $(id);

      if (el) {
        el.hidden = true;
      }
    });

    const selectedStep =
      $(`${name}Step`);

    if (selectedStep) {
      selectedStep.hidden = false;
    }

    const map = {
      university: 0,
      course: 1,
      specialization: 1,
      semester: 2,
      subject: 3,
      material: 4
    };

    $$('#browseSteps .step').forEach(
      (s, i) => {
        s.classList.toggle(
          'active',
          i <= map[name]
        );
      }
    );

    updateSummary();
  }

  function updateSummary() {
    const parts = [];

    if (state.university) {
      parts.push(
        state.university.name
      );
    }

    if (state.course) {
      parts.push(
        state.course.short_name ||
          state.course.name
      );
    }

    if (state.specialization) {
      parts.push(
        state.specialization.short_name ||
          state.specialization.name
      );
    }

    if (state.semester) {
      parts.push(
        `Semester ${state.semester}`
      );
    }

    if (state.subject) {
      parts.push(
        state.subject.name
      );
    }

    const el =
      $('selectionSummary');

    if (!el) return;

    el.hidden = !parts.length;

    el.textContent =
      parts.join(' › ');
  }

  $('universitySelect').addEventListener(
    'change',
    () => {
      $('universityNext').disabled =
        !$('universitySelect').value;

      state.university = null;
      state.course = null;
      state.specialization = null;
      state.semester = null;
      state.subject = null;
      state.content = null;

      resetSelect(
        'courseSelect',
        'Select Course / Degree'
      );

      resetSelect(
        'specializationSelect',
        'Select Branch / Specialization'
      );

      resetSelect(
        'semesterSelect',
        'Select Semester'
      );

      $('courseNext').disabled = true;

      $('specializationNext').disabled =
        true;

      $('semesterNext').disabled = true;

      $('subjectList').innerHTML = '';

      $('materialList').innerHTML = '';

      updateSummary();
    }
  );

  $('universityNext').addEventListener(
    'click',
    async () => {
      const id =
        Number(
          $('universitySelect').value
        );

      if (!id) return;

      try {
        const [u, courses] =
          await Promise.all([
            API.getUniversity(id),
            API.getUniversityCourses(id)
          ]);

        state.university = u.data;
        state.course = null;
        state.specialization = null;
        state.semester = null;
        state.subject = null;
        state.content = null;
        state.materialTab = 'syllabus';

        selectOption(
          $('courseSelect'),
          'Select Course / Degree',
          courses.data,
          'university_course_id',
          (c) =>
            `${
              c.short_name ||
              c.name
            } — ${c.name}`
        );

        resetSelect(
          'specializationSelect',
          'Select Branch / Specialization'
        );

        resetSelect(
          'semesterSelect',
          'Select Semester'
        );

        $('courseNext').disabled = true;

        $('specializationNext').disabled =
          true;

        $('semesterNext').disabled = true;

        $('subjectList').innerHTML = '';

        $('materialList').innerHTML = '';

        showBrowseStep('course');
      } catch (e) {
        toast(
          e.message,
          true
        );
      }
    }
  );

  $('courseSelect').addEventListener(
    'change',
    () => {
      $('courseNext').disabled =
        !$('courseSelect').value;

      state.course = null;
      state.specialization = null;
      state.semester = null;
      state.subject = null;
      state.content = null;

      resetSelect(
        'specializationSelect',
        'Select Branch / Specialization'
      );

      resetSelect(
        'semesterSelect',
        'Select Semester'
      );

      $('specializationNext').disabled =
        true;

      $('semesterNext').disabled = true;

      $('subjectList').innerHTML = '';

      $('materialList').innerHTML = '';

      updateSummary();
    }
  );

  $('courseNext').addEventListener(
    'click',
    async () => {
      const universityCourseId =
        Number(
          $('courseSelect').value
        );

      if (!universityCourseId) return;

      try {
        const [
          courseDetail,
          specs,
          semesters
        ] = await Promise.all([
          API.getUniversityCourse(
            universityCourseId
          ),
          API.getSpecializations(
            universityCourseId
          ),
          API.getSemesters(
            universityCourseId
          )
        ]);

        state.course = {
          ...courseDetail.data,
          university_course_id:
            universityCourseId
        };

        state.specialization = null;
        state.semester = null;
        state.subject = null;
        state.content = null;

        selectOption(
          $('semesterSelect'),
          'Select Semester',
          semesters.data,
          'number',
          (s) => s.label
        );

        $('semesterNext').disabled = true;

        if (specs.data.length) {
          selectOption(
            $('specializationSelect'),
            'Select Branch / Specialization',
            specs.data,
            'id',
            (s) =>
              `${
                s.short_name ||
                s.name
              } — ${s.name}`
          );

          $('specializationNext').disabled =
            true;

          showBrowseStep(
            'specialization'
          );
        } else {
          resetSelect(
            'specializationSelect',
            'Select Branch / Specialization'
          );

          showBrowseStep(
            'semester'
          );
        }
      } catch (e) {
        toast(
          e.message,
          true
        );
      }
    }
  );

  $('specializationSelect').addEventListener(
    'change',
    () => {
      $('specializationNext').disabled =
        !$(
          'specializationSelect'
        ).value;

      state.specialization = null;
      state.semester = null;
      state.subject = null;
      state.content = null;

      $('semesterSelect').value = '';

      $('semesterNext').disabled = true;

      $('subjectList').innerHTML = '';

      $('materialList').innerHTML = '';

      updateSummary();
    }
  );

  $('specializationNext').addEventListener(
    'click',
    () => {
      const option =
        $('specializationSelect')
          .selectedOptions[0];

      if (
        !option ||
        !option.value
      ) {
        return;
      }

      state.specialization = {
        id: Number(
          option.value
        ),
        name:
          option.textContent
            .split(' — ')
            .pop(),
        short_name:
          option.textContent
            .split(' — ')[0]
      };

      state.semester = null;
      state.subject = null;
      state.content = null;

      $('semesterSelect').value = '';

      $('semesterNext').disabled = true;

      $('subjectList').innerHTML = '';

      $('materialList').innerHTML = '';

      showBrowseStep('semester');
    }
  );

  $('semesterSelect').addEventListener(
    'change',
    () => {
      $('semesterNext').disabled =
        !$('semesterSelect').value;

      state.semester = null;
      state.subject = null;
      state.content = null;

      $('subjectList').innerHTML = '';

      $('materialList').innerHTML = '';

      updateSummary();
    }
  );

  $('semesterNext').addEventListener(
    'click',
    async () => {
      const semester =
        Number(
          $('semesterSelect').value
        );

      if (!semester) return;

      try {
        state.semester =
          semester;

        state.subject = null;
        state.content = null;

        const result =
          await API.getSubjects(
            state.course
              .university_course_id ||
              state.course.id,
            semester,
            state.specialization?.id ||
              null
          );

        renderSubjects(
          result.data
        );

        showBrowseStep('subject');
      } catch (e) {
        toast(
          e.message,
          true
        );
      }
    }
  );

  function renderSubjects(subjects) {
    const list =
      $('subjectList');

    if (!subjects.length) {
      list.innerHTML =
        `
        <div class="empty-state">
          <strong>No subjects found</strong>
          <p>
            The admin has not added subjects
            for this selection yet.
          </p>
        </div>
        `;

      return;
    }

    list.innerHTML =
      subjects
        .map(
          (s) =>
            `
            <article class="subject-card">

              <div>

                <h3>
                  ${esc(s.name)}
                </h3>

                <p>

                  ${esc(
                    s.subject_code ||
                      'No subject code'
                  )}

                  ${
                    s.specialization_name
                      ? ` · ${esc(
                          s.specialization_name
                        )}`
                      : ''
                  }

                </p>

              </div>

              <button
                class="btn btn-primary btn-small"
                data-open-subject="${s.id}"
              >
                Open Subject
              </button>

            </article>
            `
        )
        .join('');
  }

  $('subjectList').addEventListener(
    'click',
    async (event) => {
      const button =
        event.target.closest(
          '[data-open-subject]'
        );

      if (!button) return;

      try {
        button.disabled = true;

        const result =
          await API.getSubjectContent(
            button.dataset
              .openSubject
          );

        state.subject =
          result.data.subject;

        state.content =
          result.data.materials;

        state.materialTab =
          'syllabus';

        renderSubjectContent();

        showBrowseStep(
          'material'
        );
      } catch (e) {
        toast(
          e.message,
          true
        );
      } finally {
        button.disabled = false;
      }
    }
  );

  function renderSubjectContent() {
    const s =
      state.subject;

    if (!s) return;

    $('subjectTitle').textContent =
      s.name;

    $('subjectMeta').textContent =
      `${
        s.subject_code ||
        'SUBJECT'
      } · Semester ${
        s.semester_number ||
        state.semester
      }`;

    $('subjectDescription').textContent =
      s.description ||
      'Study resources available for this subject.';

    [
      'syllabus',
      'notes',
      'pyq'
    ].forEach((key) => {
      $(`${key}Count`).textContent =
        state.content?.[key]
          ?.length || 0;
    });

    $$('.material-tab').forEach(
      (b) => {
        b.classList.toggle(
          'active',
          b.dataset.materialTab ===
            state.materialTab
        );
      }
    );

    const items =
      state.content?.[
        state.materialTab
      ] || [];

    const list =
      $('materialList');

    if (!items.length) {
      list.innerHTML =
        `
        <div class="empty-state">

          <strong>

            No ${
              state.materialTab ===
              'pyq'
                ? 'previous year papers'
                : state.materialTab
            } published yet

          </strong>

          <p>
            Published material will
            appear here automatically.
          </p>

        </div>
        `;

      return;
    }

    list.innerHTML =
      items
        .map((m) => {
          const fileUrl =
            m.file_url
              ? m.file_url.startsWith(
                  '/'
                )
                ? cfg.BACKEND_BASE_URL +
                  m.file_url
                : m.file_url
              : m.file_path
              ? m.file_path.startsWith(
                  '/'
                )
                ? cfg.BACKEND_BASE_URL +
                  m.file_path
                : m.file_path
              : '#';

          const meta = [
            m.unit_number
              ? `Unit ${m.unit_number}`
              : '',
            m.exam_year || '',
            m.original_file_name || ''
          ]
            .filter(Boolean)
            .join(' · ');

          return `
            <article class="material-item">

              <div>

                <h3>
                  ${esc(m.title)}
                </h3>

                <div class="material-meta">

                  ${esc(
                    meta ||
                      m.material_type
                  )}

                </div>

                ${
                  m.description
                    ? `
                    <p class="muted">
                      ${esc(
                        m.description
                      )}
                    </p>
                    `
                    : ''
                }

              </div>

              <a
                class="btn btn-primary btn-small"
                href="${esc(fileUrl)}"
                target="_blank"
                rel="noopener"
              >
                Open
              </a>

            </article>
          `;
        })
        .join('');
  }

  $$('.material-tab').forEach(
    (button) => {
      button.addEventListener(
        'click',
        () => {
          state.materialTab =
            button.dataset
              .materialTab;

          renderSubjectContent();
        }
      );
    }
  );

  $$('[data-browse-back]').forEach(
    (button) => {
      button.addEventListener(
        'click',
        () => {
          const target =
            button.dataset
              .browseBack;

          if (
            target ===
            'university'
          ) {
            resetBrowseFlow();
          } else if (
            target ===
            'course'
          ) {
            state.course = null;
            state.specialization =
              null;
            state.semester = null;
            state.subject = null;
            state.content = null;

            resetSelect(
              'specializationSelect',
              'Select Branch / Specialization'
            );

            resetSelect(
              'semesterSelect',
              'Select Semester'
            );

            $('subjectList')
              .innerHTML = '';

            $('materialList')
              .innerHTML = '';

            showBrowseStep(
              'course'
            );
          } else if (
            target ===
            'semester'
          ) {
            state.semester = null;
            state.subject = null;
            state.content = null;

            $('semesterSelect')
              .value = '';

            $('semesterNext')
              .disabled = true;

            $('subjectList')
              .innerHTML = '';

            $('materialList')
              .innerHTML = '';

            showBrowseStep(
              'semester'
            );
          } else if (
            target ===
            'subjects'
          ) {
            state.subject = null;
            state.content = null;
            state.materialTab =
              'syllabus';

            $('materialList')
              .innerHTML = '';

            showBrowseStep(
              'subject'
            );
          }
        }
      );
    }
  );

  $('searchForm').addEventListener(
    'submit',
    async (event) => {
      event.preventDefault();

      const q =
        $('searchInput')
          .value
          .trim();

      if (q.length < 2) {
        return;
      }

      $('searchResults').innerHTML =
        '<div class="loading">Searching...</div>';

      try {
        const result =
          await API.search(q);

        renderSearch(
          result.data
        );
      } catch (e) {
        $('searchResults').innerHTML =
          `
          <div class="empty-state">

            <strong>
              Search failed
            </strong>

            <p>
              ${esc(e.message)}
            </p>

          </div>
          `;
      }
    }
  );

  function renderSearch(data) {
    const results =
      Array.isArray(data)
        ? data
        : [];

    if (!results.length) {
      $('searchResults').innerHTML =
        `
        <div class="empty-state">

          <strong>
            No results found
          </strong>

          <p>
            Try a different subject
            name, code or material title.
          </p>

        </div>
        `;

      return;
    }

    $('searchResults').innerHTML =
      results
        .map((item) => {
          const label =
            item.material_id
              ? item.material_type ||
                'MATERIAL'
              : 'SUBJECT';

          const title =
            item.material_title ||
            item.subject_name ||
            'Result';

          const details = [
            item.subject_code,
            item.course_name,
            item.university_short_name ||
              item.university_name,
            item.semester_number
              ? `Semester ${item.semester_number}`
              : ''
          ]
            .filter(Boolean)
            .join(' · ');

          return `
            <article class="search-result">

              <span class="search-badge">
                ${esc(label)}
              </span>

              <h3>
                ${esc(title)}
              </h3>

              <p>
                ${esc(details)}
              </p>

            </article>
          `;
        })
        .join('');
  }

  $$('[data-route]').forEach(
    (button) => {
      button.addEventListener(
        'click',
        () => {
          setRoute(
            button.dataset.route
          );
        }
      );
    }
  );

  $('menuToggle').addEventListener(
    'click',
    () => {
      document
        .querySelector(
          '.main-nav'
        )
        .classList.toggle(
          'open'
        );
    }
  );

  window.addEventListener(
    'DOMContentLoaded',
    () => {
      loadHomeStats();

      const route =
        location.hash.replace(
          '#',
          ''
        ) || 'home';

      setRoute(
        [
          'home',
          'browse',
          'search',
          'admin'
        ].includes(route)
          ? route
          : 'home'
      );
    }
  );
})();