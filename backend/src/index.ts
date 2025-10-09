import bcrypt from "bcryptjs";
import { eq, asc } from "drizzle-orm";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia, t } from "elysia";
import { jwt, JWTPayloadSpec } from "@elysiajs/jwt";
import { db } from "./db/db";
import { courseTable, departmentTable, requestTable, skillTable, subjectTable, teacherTable } from "./db/schema";

type Role = "admin" | "head" | "teacher";

const app = new Elysia()
  .use(openapi())
  .use(cors())
  .use(jwt({
    name: "access_token",
    secret: process.env.JWT_SECRET!,
    exp: "2h",
    schema: t.Object({
      role: t.UnionEnum(["admin", "head", "teacher"]),
      teacherId: t.String(),
      email: t.String({ format: "email" }),
      departmentId: t.Nullable(t.Integer())
    })
  }))
  .get("/", () => "Hello Elysia")
  .post("/api/login", async ({ body, access_token, status }) => {
    const email = body.email.trim().toLowerCase();
    const [teacher] = await db
      .select({
        id: teacherTable.teacher_id,
        email: teacherTable.teacher_email,
        name: teacherTable.teacher_name,
        password: teacherTable.teacher_password,
        department_id: teacherTable.department_id
      })
      .from(teacherTable)
      .where(eq(teacherTable.teacher_email, email))
      .limit(1);

    if (!teacher?.password)
      return status(401, { message: "Invalid credentials" });

    const passwordMatches = await bcrypt.compare(body.password, teacher.password);
    if (!passwordMatches)
      return status(403, { message: "Invalid credentials" });

    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);
    let role: Role = "teacher";

    if (adminEmails.includes(email)) {
      role = "admin";
    }
    else {
      const [headDepartment] = await db
        .select({ departmentId: departmentTable.department_id })
        .from(departmentTable)
        .where(eq(departmentTable.head_id, teacher.id));

      if (headDepartment)
        role = "head";
    }

    const payload = {
      sub: teacher.id,
      role,
      teacherId: teacher.id,
      email,
      departmentId: teacher.department_id
    };
    const token = await access_token.sign(payload);

    return {
      token,
      role,
      teacherId: teacher.id,
      email: teacher.email,
      teacherName: teacher.name,
      departmentId: teacher.department_id
    };
  }, {
    body: t.Object({
      email: t.String({ format: "email" }),
      password: t.String()
    })
  })
  .derive(async ({ headers, access_token }) => {
    const authHeader = headers["authorization"]?.split(" ");
    if (!authHeader || authHeader.length !== 2 || authHeader[0] !== "Bearer")
      return { user: null };

    const token = authHeader[1];
    if (!token)
      return { user: null };

    let payload: false | ({
      role: Role;
      teacherId: string;
      email: string;
      departmentId: number | null;
    } & Omit<JWTPayloadSpec, "role" | "teacherId" | "email">) | null = null;

    try {
      payload = await access_token.verify(token);
    }
    catch (error) {
      return { user: null };
    }

    if (!payload || typeof payload !== "object" || !("role" in payload) || !("teacherId" in payload)) {
      return { user: null };
    }

    return { user: payload };
  })

  .get("/api/dashboard/undergraduate", async ({ status, user }) => {
    if (!user)
      return status(401, { message: "Unauthorized" });

    const sel = {
      course_id: courseTable.course_id,
      course_year: courseTable.course_year,
      semester_name: courseTable.semester_name,
      register_period: courseTable.register_period,
      course_name: courseTable.course_name,
      subject_name: subjectTable.subject_name,
      skill_name: skillTable.skill_name,
      number_student: courseTable.number_student,
      num_group: courseTable.num_group,
      unit: courseTable.unit,
      quantity: courseTable.quantity,
      coef: courseTable.coef,
      coef_cttt: courseTable.coef_cttt,
      coef_far: courseTable.coef_far,
      num_out_hours: courseTable.num_out_hours,
      standard_hours: courseTable.standard_hours,
      note: courseTable.note,
      teacher_id: courseTable.teacher_id,
      teacher_name: teacherTable.teacher_name
    };

    if (user.role === "admin")
      return await db
        .select(sel)
        .from(courseTable)
        .leftJoin(subjectTable, eq(courseTable.subject_id, subjectTable.subject_id))
        .leftJoin(skillTable, eq(courseTable.skill_id, skillTable.skill_id))
        .leftJoin(teacherTable, eq(courseTable.teacher_id, teacherTable.teacher_id));

    if (user.role === "head")
      return await db
        .select(sel)
        .from(courseTable)
        .leftJoin(subjectTable, eq(courseTable.subject_id, subjectTable.subject_id))
        .leftJoin(skillTable, eq(courseTable.skill_id, skillTable.skill_id))
        .leftJoin(teacherTable, eq(courseTable.teacher_id, teacherTable.teacher_id))
        .where(eq(courseTable.department_id, user.departmentId!));

    return await db
      .select(sel)
      .from(courseTable)
      .leftJoin(subjectTable, eq(courseTable.subject_id, subjectTable.subject_id))
      .leftJoin(skillTable, eq(courseTable.skill_id, skillTable.skill_id))
      .leftJoin(teacherTable, eq(courseTable.teacher_id, teacherTable.teacher_id))
      .where(eq(courseTable.teacher_id, user.teacherId));
  })
  .get("/api/teachers", async ({ status, user }) => {
    if (!user)
      return status(401, { message: "Unauthorized" });

    if (user.role === "teacher")
      return status(403, { message: "Forbidden" });

    if (user.role === "admin")
      return await db
        .select({
          id: teacherTable.teacher_id,
          name: teacherTable.teacher_name,
          email: teacherTable.teacher_email,
          department_id: teacherTable.department_id
        })
        .from(teacherTable);

    return await db
      .select({
        id: teacherTable.teacher_id,
        name: teacherTable.teacher_name,
        email: teacherTable.teacher_email,
        department_id: teacherTable.department_id
      })
      .from(teacherTable)
      .where(eq(teacherTable.department_id, user.departmentId!));
  })

  .post("/api/courses/:courseId/requests", async ({ params, body, user, status }) => {
    if (!user)
      return status(401, { message: "Unauthorized" });

    if (user.role !== "head" && user.role !== "admin")
      return status(403, { message: "Forbidden" });

    const courseId = Number(params.courseId);
    if (!Number.isFinite(courseId))
      return status(400, { message: "Invalid course" });

    const [course] = await db
      .select({
        departmentId: courseTable.department_id,
      })
      .from(courseTable)
      .where(eq(courseTable.course_id, courseId))

    if (!course)
      return status(404, { message: "Course not found" });

    if (user.role === "head" && course.departmentId !== user.departmentId)
      return status(403, { message: "Forbidden" });

    const values = body.requests.map((request) => ({
      teacher_id: request.teacherId,
      course_id: courseId,
      number_student: request.numberStudent,
      quantity: request.quantity,
    }));

    if (values.length === 0)
      return status(400, { message: "Empty request" });

    await db.insert(requestTable).values(values);

    return { success: true };
  }, {
    params: t.Object({
      courseId: t.String(),
    }),
    body: t.Object({
      requests: t.Array(t.Object({
        teacherId: t.String(),
        numberStudent: t.Integer({ minimum: 0 }),
        quantity: t.Integer({ minimum: 0 }),
      }), { minItems: 1 }),
    }),
  })
  .get("/api/courses/:courseId/requests", async ({ params, user, status }) => {
    if (!user)
      return status(401, { message: "Unauthorized" });

    if (user.role !== "head" && user.role !== "admin")
      return status(403, { message: "Forbidden" });

    const courseId = Number(params.courseId);
    if (!Number.isFinite(courseId))
      return status(400, { message: "Invalid course" });

    const [course] = await db
      .select({ departmentId: courseTable.department_id })
      .from(courseTable)
      .where(eq(courseTable.course_id, courseId))

    if (!course)
      return status(404, { message: "Course not found" });

    if (user.role === "head" && course.departmentId !== user.departmentId)
      return status(403, { message: "Forbidden" });

    return await db
      .select({
        requestId: requestTable.request_id,
        teacherId: requestTable.teacher_id,
        teacherName: teacherTable.teacher_name,
        numberStudent: requestTable.number_student,
        quantity: requestTable.quantity,
        createdAt: requestTable.created_at,
      })
      .from(requestTable)
      .leftJoin(teacherTable, eq(requestTable.teacher_id, teacherTable.teacher_id))
      .where(eq(requestTable.course_id, courseId))
      .orderBy(asc(requestTable.created_at));
  })

  .get("/api/dashboard/graduate", async () => {
    
  })
  .get("/api/dashboard/postgraduate", async () => {
    
  })
  .get("/api/dashboard/phd", async () => {
    
  })
  .get("/api/dashboard/SaT", async () => {
    
  })
  .listen({ port: 8080, hostname: "0.0.0.0" });

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
