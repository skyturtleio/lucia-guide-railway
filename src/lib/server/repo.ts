import { db } from './database';
import * as schema from './schema';
import { eq } from 'drizzle-orm';

export const getEmailByUserId = async (userId: string) => {
	const user = await db.query.user.findFirst({
		columns: {
			email: true,
		},
		where: eq(schema.user.id, userId),
	});

	if (!user?.email) return null;

	return user.email;
};

export const getEmailByUsername = async (username: string) => {
	const user = await db.query.user.findFirst({
		columns: {
			email: true,
		},
		where: (eq(schema.user.username, username))
	})

	if (!user?.email) return null;
	return user.email
};
