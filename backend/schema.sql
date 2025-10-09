-- POSTGRESQL 18

CREATE TABLE skill (
    skill_id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100) NOT NULL
);

CREATE TABLE department (
    department_id INT PRIMARY KEY,
    department_name VARCHAR(255) NOT NULL,
	  head_id VARCHAR(50)
);

CREATE TABLE teacher (
    teacher_id VARCHAR(50) PRIMARY KEY,
    teacher_name VARCHAR(255) NOT NULL,
    teacher_email VARCHAR(255) UNIQUE,
    teacher_password VARCHAR(255) NOT NULL,
    department_id INT REFERENCES department(department_id)
);

CREATE TABLE subject (
    subject_id INT PRIMARY KEY,
    subject_name VARCHAR(255) NOT NULL,
    subject_code VARCHAR(50),
    department_id INT REFERENCES department(department_id)
);

CREATE TABLE course (
    course_id INT PRIMARY KEY,
    course_year VARCHAR(50) NOT NULL,
    semester_name VARCHAR(50) NOT NULL,
    register_period VARCHAR(100),
    subject_id INT REFERENCES subject(subject_id),
    department_id INT REFERENCES department(department_id),
    teacher_id VARCHAR(50) REFERENCES teacher(teacher_id),
    course_name VARCHAR(255) NOT NULL,
    number_of_credit INT,
    numberstudent INT,
    num_group INT,
    skill_id INT REFERENCES skill(skill_id),
    credit INT,
    unit INT,
    quantity INT,
    coef NUMERIC(5,2),
    num_out_hours INT,
    coef_cttt NUMERIC(5,2),
    coef_far NUMERIC(5,2),
    standard_hours NUMERIC(6,2),
    flag INT,
    note TEXT
);

ALTER TABLE department
ADD CONSTRAINT fk_department_head
FOREIGN KEY (head_id)
REFERENCES teacher(teacher_id);

CREATE TABLE requests (
    request_id SERIAL PRIMARY KEY,
    teacher_id VARCHAR(50) NOT NULL REFERENCES teacher(teacher_id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES course(course_id) ON DELETE CASCADE,
    numberstudent INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

