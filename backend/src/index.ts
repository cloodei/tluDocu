import { Elysia, t } from "elysia";
import { db } from "./db/db";
import { teacherTable } from "./db/schema";
import { eq } from "drizzle-orm";

const app = new Elysia()
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
      .select()
      .from(teacherTable)
      .where(eq(teacherTable.teacherId, params.id));
    return teacher;
  })
  .listen({ port: 3000, hostname: "0.0.0.0" });

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
