type Role = 'admin' | 'head' | 'teacher';

type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  departmentId: number | null;
}

type CourseApi = {
  course_year: string | null;
  semester_name: string | null;
  register_period: string | null;
  course_name: string | null;
  subject_name: string | null;
  skill_name: string | null;
  number_student: number | string | null;
  num_group: number | string | null;
  unit: number | string | null;
  quantity: number | string | null;
  coef: number | string | null;
  coef_cttt: number | string | null;
  coef_far: number | string | null;
  num_out_hours: number | string | null;
  standard_hours: number | string | null;
  note: string | null;
  teacher_id: string | null;
  teacher_name: string | null;
}

type Course = {
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

export type { Role, User, Course, CourseApi, Teacher, Assignment }
