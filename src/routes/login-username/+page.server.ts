import { auth } from '$lib/server/lucia';
import { LuciaError } from 'lucia';
import { fail, redirect } from '@sveltejs/kit';
import * as schema from '$lib/server/schema';

import type { Actions, PageServerLoad } from './$types';
import { getEmailByUsername } from '$lib/server/repo';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth.validate();
	if (session) {
		if (!session.user.emailVerified) throw redirect(302, '/email-verification');
		throw redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (typeof username !== 'string' || username.length < 1 || username.length > 31) {
			return fail(400, {
				message: 'invalid username',
			});
		}

		if (typeof password !== 'string' || password.length < 1 || password.length > 225) {
			return fail(400, {
				message: 'invalid password',
			});
		}

		const email = await getEmailByUsername(username) as string;

		try {
			// find user by key and validate the password
			const key = await auth.useKey('username', username.toLowerCase(), password);
			const session = await auth.createSession({ userId: key.userId, attributes: {} });

			locals.auth.setSession(session);

			await auth.createKey({
				userId: key.userId,
				providerId: 'email',
				providerUserId: email.toLowerCase(),
				password,
			});
		} catch (e) {
			if (
				e instanceof LuciaError &&
				(e.message === 'AUTH_INVALID_KEY_ID' || e.message === 'AUTH_INVALID_PASSWORD')
			) {
				return fail(400, {
					message: 'incorrect username or password',
				});
			}
			return fail(500, {
				message: 'an unknown error occurred',
			});
		}

		throw redirect(302, '/');
	},
};
