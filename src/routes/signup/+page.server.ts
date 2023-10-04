import { auth } from '$lib/server/lucia';
import { fail, redirect } from '@sveltejs/kit';
import { generateEmailVerificationToken } from '$lib/server/token';
import { sendEmailVerificationLink } from '$lib/server/email';
import { isValidEmail } from '$lib/utils';

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
		const username = formData.get('username');
		const email = formData.get('email');
		const password = formData.get('password');

		if (typeof username !== 'string' || username.length < 4 || username.length > 31) {
			return fail(400, {
				message: 'Invalid username',
			});
		}

		if (!isValidEmail || typeof email !== 'string') {
			return fail(400, {
				message: 'Invalid email address',
			});
		}

		if (typeof password !== 'string' || password.length < 6 || password.length > 255) {
			return fail(400, {
				message: 'Invalid password',
			});
		}

		try {
			const user = await auth.createUser({
				/*
				|-----------------------------------------------------------------------------
				| Lucia Keys
				|-----------------------------------------------------------------------------
				| A user can have any number of keys, allowing for multiple ways of 
				| referencing and authenticating users without cramming 
				| your user table.
				|
				| https://lucia-auth.com/basics/keys
				|
				*/
				key: {
					providerId: 'username', // the identifier for the authentication method, e.g. "email", "github", "username"
					/*
					|-----------------------------------------------------------------------------
					| `providerUserId` 
					|-----------------------------------------------------------------------------
					| The unique `id` for a user within the provider from `providerId.
					|
					| This gives this user a unique identifier from the specific method above. So,
					| that means, we can reference this *same* user and authenticate them through
					| email, or their Github account, or a username.
					|
					*/
					providerUserId: username.toLowerCase(),
					password, // password is hashed by Lucia (no need for `bcrypt`)
				},
				attributes: {
					username,
					email: email.toLowerCase(),
					email_verified: false,
				},
			});

			/*
			|-----------------------------------------------------------------------------
			| Using `username` and `email` for login
			|-----------------------------------------------------------------------------
			| In the example Guidebook, they choose *either* a username or email for
			| login. We are extending the code from the `username` only example.
			|
			| When we create a user above, we create a new key with it using `username`.
			| Below, we are creating another key using the email from the form data,
			| and the same password that was used for `username`. When using
			| `Auth.createUser()`, providing the `key` property is optional. We could have
			| created a `usernameKey` as we do below with email, used `email` as the 
			| `providerId` and created a separate `usernameKey` afterwards, or not
			| created a key at all with `createUser` and created the keys separately.
			|
			*/
			await auth.createKey({
				userId: user.userId,
				providerId: 'email',
				providerUserId: email.toLowerCase(),
				password,
			});

			// After successfully creating a user, create a sessions with `Auth.createSession()` and
			// store it as a cookie with `AuthRequest.setSession()`. `AuthRequest` is accessible as
			// `locals.auth` through the `handle` hook in `src/hooks.server.ts`.
			const session = await auth.createSession({
				userId: user.userId,
				attributes: {},
			});

			locals.auth.setSession(session); // Set session cookie using SvelteKit `locals`

			const token = await generateEmailVerificationToken(user.userId);
			await sendEmailVerificationLink(token);
		} catch (e) {
			const USER_TABLE_UNIQUE_CONSTRAINT_ERROR =
				'LibsqlError: SQLITE_CONSTRAINT: SQLite error: UNIQUE constraint failed: user.username';

			if (e === USER_TABLE_UNIQUE_CONSTRAINT_ERROR) {
				return fail(400, {
					message: 'Username already taken',
				});
			}

			if (e) {
				console.log(e);
			}

			return fail(500, {
				message: 'An unknown error occurred',
			});
		}
		throw redirect(302, '/email-verification');
	},
};
