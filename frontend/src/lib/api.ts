import type { CourseApi, Course, Teacher, AssignmentRequest, CourseRequestRecord } from "./types";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined)
    return 0;

  const parsed = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapCourse(api: CourseApi): Course {
  return {
    courseId: toNumber(api.course_id),
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
    teacherName: api.teacher_name,
  };
}

async function ftch(url: string, token: string) {
  const response = await fetch(`${apiUrl}/api/${url}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (response.status === 401)
    throw new Error("1");
  if (response.status === 403)
    throw new Error("Bạn không có quyền truy cập");
  if (!response.ok)
    throw new Error("Không thể tải dữ liệu");

  return response;
}

async function fetchCourses(token: string) {
  const response = await ftch("dashboard/undergraduate", token);
  const data: CourseApi[] = await response.json();

  return data.map(mapCourse);
}

async function fetchTeachers(token: string) {
  const response = await ftch("teachers", token);
  const data: Teacher[] = await response.json();

  return data;
}

async function submitCourseRequests(token: string, courseId: number, requests: AssignmentRequest[]) {
  const response = await fetch(`${apiUrl}/api/courses/${courseId}/requests`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ requests }),
  });

  if (response.status === 401)
    throw new Error("1");
  if (response.status === 403)
    throw new Error("Bạn không có quyền gửi yêu cầu");
  if (!response.ok)
    throw new Error("Không thể gửi yêu cầu");

  return response.json();
}

async function fetchCourseRequests(token: string, courseId: number) {
  const response = await ftch(`courses/${courseId}/requests`, token);
  const data: CourseRequestRecord[] = await response.json();

  return data;
}

export { apiUrl, fetchCourses, fetchTeachers, submitCourseRequests, fetchCourseRequests };
