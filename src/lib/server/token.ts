import { db } from './database';
import * as schema from './schema';
// I could have imported just the `emailVerificationToken` schema,
// but being explicit here helped me figure out the arguments
// for the different functions from Drizzle
import { eq } from 'drizzle-orm';
import { generateRandomString, isWithinExpiration } from 'lucia/utils';

const EXPIRES_IN = 1000 * 60 * 60 * 2; // 2 hours

export const generateEmailVerificationToken = async (userId: string) => {
	console.log('inside generateemail verification token');
	const storedUserTokens = await db
		.select()
		.from(schema.emailVerificationToken)
		.where(eq(schema.emailVerificationToken.userId, userId));
	/**
	 * MISTAKE I MADE
	 * At first I had `.where(eq(schema.user.id, userId));`
	 * I was received an error something like `column user.id does not exist`
	 * I was supposed to be checking the userId column
	 * in the *emailVerificationToken* table, NOT the `user` table
	 */

	if (storedUserTokens.length > 0) {
		const reusableStoredToken = storedUserTokens.find((token) => {
			return isWithinExpiration(Number(token.expires) - EXPIRES_IN / 2);
		});
		if (reusableStoredToken) return reusableStoredToken.id;
	}

	const token = generateRandomString(63);
	await db.insert(schema.emailVerificationToken).values({
		id: token,
		userId: userId,
		expires: BigInt(new Date().getTime() + EXPIRES_IN),
	});

	return token;
};

export const validateEmailVerificationToken = async (token: string) => {
	const storedToken = await db.transaction(async (tx) => {
		const storedToken = await tx.query.emailVerificationToken.findFirst({
			where: eq(schema.emailVerificationToken.id, token),
		});
		if (!storedToken) throw new Error('Invalid token');

		await tx
			.delete(schema.emailVerificationToken)
			.where(eq(schema.emailVerificationToken.userId, storedToken.userId));

		return storedToken;
	});

	const tokenExpires = storedToken.expires;
	if (!isWithinExpiration(tokenExpires)) {
		throw new Error('Expired token');
	}

	return storedToken.userId;
};

export const generatePasswordResetToken = async (userId: string) => {
	const storedUserTokens = await db
		.select()
		.from(schema.passwordResetToken)
		.where(eq(schema.passwordResetToken.userId, userId));

	if (storedUserTokens.length > 0) {
		const reusableStoredToken = storedUserTokens.find((token) => {
			return isWithinExpiration(Number(token.expires) - EXPIRES_IN / 2);
		});
		if (reusableStoredToken) return reusableStoredToken.id;
	}

	const token = generateRandomString(63);
	await db.insert(schema.passwordResetToken).values({
		id: token,
		expires: BigInt(new Date().getTime() + EXPIRES_IN),
		userId,
	});

	return token;
};

export const validatePasswordResetToken = async (token: string) => {
	const storedToken = await db.transaction(async (tx) => {
		const storedToken = await tx.query.passwordResetToken.findFirst({
			where: eq(schema.passwordResetToken.id, token),
		});
		if (!storedToken) throw new Error('invalid token');
		await tx
			.delete(schema.passwordResetToken)
			.where(eq(schema.passwordResetToken.id, storedToken.id));

		return storedToken;
	});

	const tokenExpires = Number(storedToken.expires);
	if (!isWithinExpiration(tokenExpires)) {
		throw new Error('expired token');
	}
	return storedToken.userId;
};
