import { Elysia, t } from "elysia";
import { db } from "./db/db";
import { courseTable, teacherTable } from "./db/schema";
import { eq } from "drizzle-orm";
import { openapi } from "@elysiajs/openapi";

const app = new Elysia()
  .use(openapi())
  .get("/", () => "Hello Elysia")
  .post("/api/login", async ({ body }) => {
    
  }, {
    body: t.Object({
      email: t.String({ format: "email" }),
      password: t.String()
    })
  })
  .get("/api/teachers", async () => {
    const data = await db.select().from(teacherTable);
    return data;
  })
  .get("/api/teachers/:id", async ({ params }) => {
    const [teacher] = await db
      .select({
        semesterName: courseTable.semesterName,
        courseYear: courseTable.courseYear,
        courseName: courseTable.courseName,
        numberOfCredit: courseTable.numberOfCredit,
      })
      .from(courseTable)
      .where(eq(courseTable.teacherId, params.id));
    return teacher;
  })
  .listen({ port: 3000, hostname: "0.0.0.0" });

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
