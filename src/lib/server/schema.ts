import { sqliteTable, text, blob, integer } from 'drizzle-orm/sqlite-core';

/*
|-----------------------------------------------------------------------------
| Database Model for Lucia
|-----------------------------------------------------------------------------
| Lucia requires three tables to work:
| 	- User table
| 	- Session table
| 	- Key table
|
| https://lucia-auth.com/basics/database
|
*/
export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	username: text('username', { length: 32 }).notNull().unique(),
	email: text('email', { length: 32 }).notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).default(false).notNull(),
});

/*
|-----------------------------------------------------------------------------
| camelCase versus snake_case
|-----------------------------------------------------------------------------
| You'll notice that when defining the schema, the property name
| is camel cased and refers to a column name that is snake cased.
| This is how they do it in the Lucia example docs
|
*/
export const session = sqliteTable('user_session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	activeExpires: blob('active_expires', {
		mode: 'bigint',
	}).notNull(),
	idleExpires: blob('idle_expires', {
		mode: 'bigint',
	}).notNull(),
});

export const key = sqliteTable('user_key', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	hashedPassword: text('hashed_password'),
});

export const emailVerificationToken = sqliteTable('email_verification_token', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expires: blob('expires', {
		mode: 'bigint',
	}).notNull(),
});

export const passwordResetToken = sqliteTable('password_reset_token', {
	id: text('id').primaryKey(),
	expires: blob('expires', {
		mode: 'bigint',
	}).notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
});
