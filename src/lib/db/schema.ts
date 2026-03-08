import { pgTable, varchar, boolean, timestamp, text } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const registrations = pgTable('registrations', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  
  // Step 1: Parent/Guardian & Contact Details
  parentName: varchar('parentName', { length: 256 }).notNull(),
  contactNumber: varchar('contactNumber', { length: 32 }).notNull(),
  whatsappGroup: boolean('whatsappGroup').default(false),
  email: varchar('email', { length: 256 }),
  homeAddress: text('homeAddress').notNull(),

  // Step 2: Child Details & Safety
  childName: varchar('childName', { length: 256 }).notNull(),
  dateOfBirth: varchar('dateOfBirth', { length: 64 }).notNull(),
  schoolName: varchar('schoolName', { length: 256 }).notNull(),
  classGrade: varchar('classGrade', { length: 64 }).notNull(),
  emergencyInfo: text('emergencyInfo'),

  // Step 3: Camp Preferences & Expectations
  preferredBatch: varchar('preferredBatch', { length: 128 }).notNull(),
  readingLevel: varchar('readingLevel', { length: 256 }).notNull(),
  parentExpectations: varchar('parentExpectations', { length: 256 }).notNull(),

  // Step 4: Declaration
  declarationAgreed: boolean('declarationAgreed').notNull(),
  parentSignature: varchar('parentSignature', { length: 256 }).notNull(),
  
  createdAt: timestamp('createdAt').defaultNow(),
});
