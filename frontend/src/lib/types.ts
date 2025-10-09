type Role = 'admin' | 'head' | 'teacher';

type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  departmentId: number | null;
}

type CourseApi = {
  course_id: number;
  course_year: string | null;
  semester_name: string | null;
  register_period: string | null;
  course_name: string | null;
  subject_name: string | null;
  skill_name: string | null;
  number_student: number | null;
  num_group: number | null;
  unit: number | null;
  quantity: number | null;
  coef: number | null;
  coef_cttt: number | null;
  coef_far: number | null;
  num_out_hours: number | null;
  standard_hours: number | null;
  note: string | null;
  teacher_id: string | null;
  teacher_name: string | null;
}

type Course = {
  courseId: number;
  courseYear: string | null;
  semesterName: string | null;
  registerPeriod: string | null;
  courseName: string | null;
  subjectName: string | null;
  skillName: string | null;
  numberStudent: number;
  numberGroup: number;
  unit: number;
  quantity: number;
  coef: number;
  coefCttt: number;
  coefFar: number;
  numOutHours: number;
  standardHours: number;
  note: string | null;
  teacherId: string | null;
  teacherName: string | null;
}

type Teacher = {
  id: string;
  name: string | null;
  email: string | null;
  department_id: number | null;
}

type Assignment = {
  teacherId: string;
  teacherName: string;
  numberStudent: number;
  quantity: number;
  isOriginal: boolean;
}

type AssignmentRequest = {
  teacherId: string;
  numberStudent: number;
  quantity: number;
}

type CourseRequestRecord = {
  requestId: number;
  teacherId: string;
  teacherName: string | null;
  numberStudent: number;
  quantity: number;
  createdAt: string;
}

export type { Role, User, Course, CourseApi, Teacher, Assignment, AssignmentRequest, CourseRequestRecord }
