import { pgTable, serial, varchar, integer, numeric, text, AnyPgColumn } from 'drizzle-orm/pg-core';

export const skillTable = pgTable('skill', {
  skillId: serial('skill_id').primaryKey(),
  skillName: varchar('skill_name', { length: 100 }).notNull(),
});

export const departmentTable = pgTable('department', {
  departmentId: integer('department_id').primaryKey(),
  departmentName: varchar('department_name', { length: 255 }).notNull(),
  headId: varchar('head_id', { length: 50 }).references((): AnyPgColumn => teacherTable.teacherId),
});

export const teacherTable = pgTable('teacher', {
  teacherId: varchar('teacher_id', { length: 50 }).primaryKey(),
  teacherName: varchar('teacher_name', { length: 255 }).notNull(),
  teacherEmail: varchar('teacher_email', { length: 255 }).unique(),
  departmentId: integer('department_id').references(() => departmentTable.departmentId),
});

export const subjectTable = pgTable('subject', {
  subjectId: integer('subject_id').primaryKey(),
  subjectName: varchar('subject_name', { length: 255 }).notNull(),
  subjectCode: varchar('subject_code', { length: 50 }),
  departmentId: integer('department_id').references(() => departmentTable.departmentId),
});

export const courseTable = pgTable('course', {
  courseId: integer('course_id').primaryKey(),
  courseYear: varchar('course_year', { length: 50 }).notNull(),
  semesterName: varchar('semester_name', { length: 50 }).notNull(),
  registerPeriod: varchar('register_period', { length: 100 }),
  subjectId: integer('subject_id').references(() => subjectTable.subjectId),
  departmentId: integer('department_id').references(() => departmentTable.departmentId),
  teacherId: varchar('teacher_id', { length: 50 }).references(() => teacherTable.teacherId),
  courseName: varchar('course_name', { length: 255 }).notNull(),
  numberOfCredit: integer('number_of_credit'),
  numberstudent: integer('numberstudent'),
  numGroup: integer('num_group'),
  skillId: integer('skill_id').references(() => skillTable.skillId),
  credit: integer('credit'),
  unit: integer('unit'),
  quantity: integer('quantity'),
  coef: numeric('coef', { precision: 5, scale: 2 }),
  numOutHours: integer('num_out_hours'),
  coefCttt: numeric('coef_cttt', { precision: 5, scale: 2 }),
  coefFar: numeric('coef_far', { precision: 5, scale: 2 }),
  standardHours: numeric('standard_hours', { precision: 6, scale: 2 }),
  flag: integer('flag'),
  note: text('note'),
});
