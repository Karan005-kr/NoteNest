SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS admins (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('SUPER_ADMIN','ADMIN') NOT NULL DEFAULT 'ADMIN',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS universities (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(50) NOT NULL,
  slug VARCHAR(180) NOT NULL,
  location VARCHAR(255) NULL,
  website VARCHAR(500) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_university_slug (slug),
  KEY idx_university_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS courses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  short_name VARCHAR(50) NOT NULL,
  slug VARCHAR(180) NOT NULL,
  default_semesters TINYINT UNSIGNED NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_course_slug (slug),
  KEY idx_course_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS university_courses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  university_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  total_semesters TINYINT UNSIGNED NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_university_course (university_id, course_id),
  KEY idx_uc_university (university_id),
  KEY idx_uc_course (course_id),
  KEY idx_uc_active (is_active),
  CONSTRAINT fk_uc_university FOREIGN KEY (university_id) REFERENCES universities(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_uc_course FOREIGN KEY (course_id) REFERENCES courses(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS specializations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  university_course_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  short_name VARCHAR(50) NOT NULL,
  slug VARCHAR(180) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_specialization_scope (university_course_id, slug),
  KEY idx_specialization_uc (university_course_id),
  CONSTRAINT fk_specialization_uc FOREIGN KEY (university_course_id) REFERENCES university_courses(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subjects (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  university_course_id BIGINT UNSIGNED NOT NULL,
  specialization_id BIGINT UNSIGNED NULL,
  semester_number TINYINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  subject_code VARCHAR(80) NOT NULL,
  slug VARCHAR(180) NOT NULL,
  description TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  display_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_subject_code_scope (university_course_id, semester_number, subject_code, specialization_id),
  KEY idx_subject_uc (university_course_id),
  KEY idx_subject_specialization (specialization_id),
  KEY idx_subject_semester (semester_number),
  KEY idx_subject_active (is_active),
  CONSTRAINT fk_subject_uc FOREIGN KEY (university_course_id) REFERENCES university_courses(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_subject_specialization FOREIGN KEY (specialization_id) REFERENCES specializations(id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS materials (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  subject_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  material_type ENUM('SYLLABUS','NOTES','PYQ') NOT NULL,
  unit_number SMALLINT UNSIGNED NULL,
  exam_year SMALLINT UNSIGNED NULL,
  file_path VARCHAR(1000) NULL,
  file_url VARCHAR(2000) NULL,
  original_file_name VARCHAR(500) NULL,
  mime_type VARCHAR(255) NULL,
  file_size BIGINT UNSIGNED NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  display_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_material_subject (subject_id),
  KEY idx_material_type (material_type),
  KEY idx_material_exam_year (exam_year),
  KEY idx_material_published (is_published),
  CONSTRAINT fk_material_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_material_admin FOREIGN KEY (created_by) REFERENCES admins(id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_id BIGINT UNSIGNED NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id BIGINT UNSIGNED NULL,
  action VARCHAR(80) NOT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_admin (admin_id),
  KEY idx_audit_entity (entity_type, entity_id),
  KEY idx_audit_created (created_at),
  CONSTRAINT fk_audit_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
