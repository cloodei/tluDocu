import type { CourseApi, Course, Teacher } from "./types";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined)
    return 0;
  const parsed = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapCourse(api: CourseApi): Course {
  return {
    courseYear: api.course_year,
    semesterName: api.semester_name,
    registerPeriod: api.register_period,
    courseName: api.course_name,
    subjectName: api.subject_name,
    skillName: api.skill_name,
    numberStudent: toNumber(api.number_student),
    numberGroup: toNumber(api.num_group),
    unit: toNumber(api.unit),
    quantity: toNumber(api.quantity),
    coef: toNumber(api.coef),
    coefCttt: toNumber(api.coef_cttt),
    coefFar: toNumber(api.coef_far),
    numOutHours: toNumber(api.num_out_hours),
    standardHours: toNumber(api.standard_hours),
    note: api.note,
    teacherId: api.teacher_id,
    teacherName: api.teacher_name
  };
}

async function fetchCourses(token: string): Promise<Course[]> {
  const response = await fetch(`${apiUrl}/api/dashboard/undergraduate`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok)
    throw new Error('Không thể tải dữ liệu học phần.');

  const data: CourseApi[] = await response.json();
  return data.map(mapCourse);
}

async function fetchTeachers(token: string): Promise<Teacher[]> {
  const response = await fetch(`${apiUrl}/api/teachers`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok)
    throw new Error('Không thể tải danh sách giảng viên.');

  const data: Teacher[] = await response.json();
  return data;
}

export { apiUrl, fetchCourses, fetchTeachers };
