import { pgTable, varchar, integer, numeric, text, AnyPgColumn, timestamp, serial } from 'drizzle-orm/pg-core';

export const skillTable = pgTable('skill', {
  skill_id: integer().primaryKey(),
  skill_name: varchar({ length: 100 }).notNull(),
});

export const departmentTable = pgTable('department', {
  department_id: integer().primaryKey(),
  department_name: varchar({ length: 255 }).notNull(),
  head_id: varchar({ length: 50 }).references((): AnyPgColumn => teacherTable.teacher_id),
});

export const teacherTable = pgTable('teacher', {
  teacher_id: varchar({ length: 50 }).primaryKey(),
  teacher_name: varchar({ length: 255 }).notNull(),
  teacher_email: varchar({ length: 255 }).unique(),
  teacher_password: varchar({ length: 255 }),
  department_id: integer().references(() => departmentTable.department_id),
});

export const subjectTable = pgTable('subject', {
  subject_id: integer().primaryKey(),
  subject_name: varchar({ length: 255 }).notNull(),
  subject_code: varchar({ length: 50 }),
  department_id: integer().references(() => departmentTable.department_id),
});

export const courseTable = pgTable('course', {
  course_id: integer().primaryKey(),
  course_year: varchar({ length: 50 }).notNull(),
  semester_name: varchar({ length: 50 }).notNull(),
  register_period: varchar({ length: 100 }),
  subject_id: integer().references(() => subjectTable.subject_id),
  department_id: integer().references(() => departmentTable.department_id),
  teacher_id: varchar({ length: 50 }).references(() => teacherTable.teacher_id),
  course_name: varchar({ length: 255 }).notNull(),
  number_of_credit: integer(),
  number_student: integer("numberstudent"),
  num_group: integer(),
  skill_id: integer().references(() => skillTable.skill_id),
  credit: integer(),
  unit: integer(),
  quantity: integer(),
  coef: numeric({ precision: 5, scale: 2 }),
  num_out_hours: integer(),
  coef_cttt: numeric({ precision: 5, scale: 2 }),
  coef_far: numeric({ precision: 5, scale: 2 }),
  standard_hours: numeric({ precision: 6, scale: 2 }),
  flag: integer(),
  note: text()
});

export const requestTable = pgTable('requests', {
  request_id: serial().primaryKey(),
  teacher_id: varchar({ length: 50 }).references(() => teacherTable.teacher_id),
  course_id: integer().references(() => courseTable.course_id),
  number_student: integer("numberstudent").notNull(),
  quantity: integer().notNull(),
  created_at: timestamp({ withTimezone: true }).defaultNow(),
  updated_at: timestamp({ withTimezone: true }).defaultNow(),
});
