INSERT INTO universities (name, short_name, slug, location, website, is_active) VALUES
('Deenbandhu Chhotu Ram University of Science and Technology','DCRUST','dcrust','Murthal, Haryana','https://www.dcrustm.ac.in',1),
('Maharshi Dayanand University','MDU','mdu','Rohtak, Haryana','https://mdu.ac.in',1),
('Kurukshetra University','KUK','kuk','Kurukshetra, Haryana','https://kuk.ac.in',1),
('Guru Jambheshwar University of Science and Technology','GJUST','gjust','Hisar, Haryana','https://www.gjust.ac.in',1),
('Delhi Technological University','DTU','dtu','Delhi','https://dtu.ac.in',1),
('Netaji Subhas University of Technology','NSUT','nsut','Delhi','https://www.nsut.ac.in',1),
('Guru Gobind Singh Indraprastha University','GGSIPU','ggsipu','Delhi','https://ipu.ac.in',1),
('University of Delhi','DU','du','Delhi','https://www.du.ac.in',1),
('Chandigarh University','CU','chandigarh-university','Punjab','https://www.cuchd.in',1),
('Lovely Professional University','LPU','lpu','Punjab','https://www.lpu.in',1),
('Amity University','AMITY','amity-university','Noida, Uttar Pradesh','https://www.amity.edu',1),
('Sharda University','SHARDA','sharda-university','Greater Noida, Uttar Pradesh','https://www.sharda.ac.in',1)
ON DUPLICATE KEY UPDATE name=VALUES(name),short_name=VALUES(short_name),location=VALUES(location),website=VALUES(website);

INSERT INTO courses (name, short_name, slug, default_semesters, is_active) VALUES
('Bachelor of Technology','B.Tech','btech',8,1),
('Bachelor of Business Administration','BBA','bba',6,1),
('Bachelor of Computer Applications','BCA','bca',6,1),
('Bachelor of Commerce','B.Com','bcom',6,1),
('Master of Business Administration','MBA','mba',4,1),
('Master of Computer Applications','MCA','mca',4,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),short_name=VALUES(short_name),default_semesters=VALUES(default_semesters);

INSERT INTO university_courses (university_id, course_id, total_semesters, is_active)
SELECT u.id,c.id,c.default_semesters,1 FROM universities u CROSS JOIN courses c
WHERE u.slug='dcrust'
ON DUPLICATE KEY UPDATE total_semesters=VALUES(total_semesters),is_active=1;

-- Five realistic placeholder subjects per B.Tech semester for DCRUST.
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,1,'Engineering Mathematics-I','BT101','engineering-mathematics-i',1,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,1,'Engineering Physics','BT102','engineering-physics',2,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,1,'Basic Electrical Engineering','BT103','basic-electrical-engineering',3,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,1,'Programming Fundamentals','BT104','programming-fundamentals',4,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,1,'Communication Skills','BT105','communication-skills',5,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;

INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,2,'Engineering Mathematics-II','BT201','engineering-mathematics-ii',1,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,2,'Engineering Chemistry','BT202','engineering-chemistry',2,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,2,'Engineering Mechanics','BT203','engineering-mechanics',3,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,2,'Object Oriented Programming','BT204','object-oriented-programming',4,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,2,'Environmental Studies','BT205','environmental-studies',5,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;

INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,3,'Data Structures and Algorithms','BT301','data-structures-and-algorithms',1,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,3,'Database Management Systems','BT302','database-management-systems',2,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,3,'Digital Logic and Computer Organization','BT303','digital-logic-and-computer-organization',3,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,3,'Discrete Mathematics','BT304','discrete-mathematics',4,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,3,'Java Programming','BT305','java-programming',5,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;

INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,4,'Operating Systems','BT401','operating-systems',1,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,4,'Computer Networks','BT402','computer-networks',2,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,4,'Design and Analysis of Algorithms','BT403','design-and-analysis-of-algorithms',3,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,4,'Software Engineering','BT404','software-engineering',4,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,4,'Probability and Statistics','BT405','probability-and-statistics',5,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;

INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,5,'Theory of Computation','BT501','theory-of-computation',1,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,5,'Web Technologies','BT502','web-technologies',2,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,5,'Microprocessors and Microcontrollers','BT503','microprocessors-and-microcontrollers',3,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,5,'Data Communication','BT504','data-communication',4,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,5,'Professional Ethics','BT505','professional-ethics',5,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;

INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,6,'Machine Learning','BT601','machine-learning',1,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,6,'Compiler Design','BT602','compiler-design',2,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,6,'Artificial Intelligence','BT603','artificial-intelligence',3,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,6,'Cloud Computing','BT604','cloud-computing',4,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,6,'Information Security','BT605','information-security',5,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;

INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,7,'Data Science','BT701','data-science',1,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,7,'Distributed Systems','BT702','distributed-systems',2,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,7,'Mobile Application Development','BT703','mobile-application-development',3,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,7,'Big Data Analytics','BT704','big-data-analytics',4,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,7,'Elective-I','BT705','elective-i',5,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;

INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,8,'Internet of Things','BT801','internet-of-things',1,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,8,'Cyber Security','BT802','cyber-security',2,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,8,'DevOps and Software Deployment','BT803','devops-and-software-deployment',3,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,8,'Elective-II','BT804','elective-ii',4,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;
INSERT INTO subjects (university_course_id, semester_number, name, subject_code, slug, display_order, is_active)
SELECT uc.id,8,'Project Management','BT805','project-management',5,1 FROM university_courses uc JOIN universities u ON u.id=uc.university_id JOIN courses c ON c.id=uc.course_id WHERE u.slug='dcrust' AND c.slug='btech'
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),display_order=VALUES(display_order),is_active=1;

-- A few unpublished placeholder records. No actual documents are included.
INSERT INTO materials (subject_id,title,description,material_type,unit_number,exam_year,file_path,file_url,is_published,display_order)
SELECT s.id,'Sample Syllabus Path','Placeholder only; replace from admin panel.','SYLLABUS',NULL,NULL,'/materials/sample/syllabus.pdf',NULL,0,1 FROM subjects s WHERE s.subject_code='BT302'
AND NOT EXISTS (SELECT 1 FROM materials m WHERE m.subject_id=s.id AND m.title='Sample Syllabus Path');
INSERT INTO materials (subject_id,title,description,material_type,unit_number,exam_year,file_path,file_url,is_published,display_order)
SELECT s.id,'Sample Unit 1 Notes Path','Placeholder only; replace from admin panel.','NOTES',1,NULL,'/materials/sample/dbms-unit-1.pdf',NULL,0,2 FROM subjects s WHERE s.subject_code='BT302'
AND NOT EXISTS (SELECT 1 FROM materials m WHERE m.subject_id=s.id AND m.title='Sample Unit 1 Notes Path');
INSERT INTO materials (subject_id,title,description,material_type,unit_number,exam_year,file_path,file_url,is_published,display_order)
SELECT s.id,'Sample PYQ 2025 Path','Placeholder only; replace from admin panel.','PYQ',NULL,2025,'/materials/sample/dbms-pyq-2025.pdf',NULL,0,3 FROM subjects s WHERE s.subject_code='BT302'
AND NOT EXISTS (SELECT 1 FROM materials m WHERE m.subject_id=s.id AND m.title='Sample PYQ 2025 Path');
