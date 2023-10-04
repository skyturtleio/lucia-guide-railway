import { auth } from '$lib/server/lucia';
import { LuciaError } from 'lucia';
import { fail, redirect } from '@sveltejs/kit';

import type { Actions, PageServerLoad } from './$types';

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
		const email = formData.get('email');
		const password = formData.get('password');

		if (typeof email !== 'string' || email.length < 1 || email.length > 31) {
			return fail(400, {
				message: 'invalid email',
			});
		}

		if (typeof password !== 'string' || password.length < 1 || password.length > 225) {
			return fail(400, {
				message: 'invalid password',
			});
		}

		try {
			// find user by key and validate the password
			const key = await auth.useKey('email', email.toLowerCase(), password);
			const session = await auth.createSession({ userId: key.userId, attributes: {} });

			locals.auth.setSession(session);
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
