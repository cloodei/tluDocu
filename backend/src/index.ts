import bcrypt from "bcryptjs";
import { eq, inArray } from "drizzle-orm";
import { jwt, JWTPayloadSpec } from "@elysiajs/jwt";
import { openapi } from "@elysiajs/openapi";
import { Elysia, t } from "elysia";
import { db } from "./db/db";
import { courseTable, departmentTable, skillTable, subjectTable, teacherTable } from "./db/schema";

type Role = "admin" | "head" | "teacher";

const app = new Elysia()
  .use(openapi())
  .use(jwt({
    name: "access_token",
    secret: process.env.JWT_SECRET!,
    exp: "2h",
    schema: t.Object({
      role: t.UnionEnum(["admin", "head", "teacher"]),
      teacherId: t.String(),
      email: t.String({ format: "email" })
    })
  }))
  .get("/", () => "Hello Elysia")
  .post("/api/login", async ({ body, access_token, set }) => {
    const email = body.email;
    const [teacher] = await db
      .select({
        id: teacherTable.teacher_id,
        email: teacherTable.teacher_email,
        password: teacherTable.teacher_password
      })
      .from(teacherTable)
      .where(eq(teacherTable.teacher_email, email));

    if (!teacher?.password) {
      set.status = 401;
      return { message: "Invalid credentials" };
    }

    const passwordMatches = await bcrypt.compare(body.password, teacher.password);
    if (!passwordMatches) {
      set.status = 401;
      return { message: "Invalid credentials" };
    }

    const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",");
    let role: Role = "teacher";

    if (adminEmails.includes(email)) {
      role = "admin";
    }
    else {
      const [headDepartment] = await db
        .select({ departmentId: departmentTable.department_id })
        .from(departmentTable)
        .where(eq(departmentTable.head_id, teacher.id));

      if (headDepartment) {
        role = "head";
      }
    }

    const token = await access_token.sign({
      sub: teacher.id,
      role,
      teacherId: teacher.id,
      email
    });

    return {
      token,
      role,
      teacherId: teacher.id
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

  .get("/api/dashboard/undergraduate", async ({ access_token, request, set, user }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }
    let whereClause;

    if (user.role === "teacher") {
      whereClause = eq(courseTable.teacher_id, user.teacherId);
    }
    else if (user.role === "head") {
      const departments = await db
        .select({ id: departmentTable.department_id })
        .from(departmentTable)
        .where(eq(departmentTable.head_id, user.teacherId));

      const departmentIds = departments.map((department) => department.id);

      if (departmentIds.length === 0) {
        return [];
      }

      whereClause = inArray(courseTable.department_id, departmentIds);
    }

    let query = db
      .select({
        semesterName: courseTable.semester_name,
        registerPeriod: courseTable.register_period,
        subjectName: subjectTable.subject_name,
        skillName: skillTable.skill_name,
        numberStudent: courseTable.number_student,
        numberGroup: courseTable.num_group,
        unit: courseTable.unit,
        quantity: courseTable.quantity,
        coef: courseTable.coef,
        coefCttt: courseTable.coef_cttt,
        coefFar: courseTable.coef_far,
        numOutHours: courseTable.num_out_hours,
        standardHours: courseTable.standard_hours,
        note: courseTable.note
      })
      .from(courseTable)
      .leftJoin(subjectTable, eq(courseTable.subject_id, subjectTable.subject_id))
      .leftJoin(skillTable, eq(courseTable.skill_id, skillTable.skill_id));

    if (whereClause) {
      // query = query.where(whereClause);
    }

    const courses = await query;

    return courses;
  })
  .get("/api/dashboard/graduate", async () => {
    
  })
  .get("/api/dashboard/postgraduate", async () => {
    
  })
  .get("/api/dashboard/phd", async () => {
    
  })
  .get("/api/dashboard/SaT", async () => {
    
  })
  .listen({ port: 3000, hostname: "0.0.0.0" });

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
