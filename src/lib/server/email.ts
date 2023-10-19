import * as postmark from 'postmark';
import 'dotenv/config';

const serverToken = process.env.POSTMARK_SERVER_API_TOKEN;
let client = new postmark.ServerClient(serverToken);

export const sendEmailVerificationLink = async (token: string) => {
	const url = `http://localhost:5173/email-verification/${token}`;
	console.log(`Your email verification link: ${url}`);
};

export const sendPasswordResetLink = async (token: string) => {
	const url = `http://localhost:5173/password-reset/${token}`;
	console.log(`Your password reset link: ${url}`);
};
