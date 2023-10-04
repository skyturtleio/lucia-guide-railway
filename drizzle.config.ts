import type { Config } from 'drizzle-kit';
import 'dotenv/config';

export default {
	schema: './src/lib/server/schema.ts',
	out: './migrations',
	driver: 'turso',
	breakpoints: true,
	dbCredentials: {
		url: process.env.DB_URL || '',
		authToken: process.env.DB_AUTH_TOKEN || '',
	},
} satisfies Config;
