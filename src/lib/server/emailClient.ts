import * as postmark from 'postmark';
import 'dotenv/config';

const serverToken = process.env.POSTMARK_SERVER_API_TOKEN;
const client = new postmark.ServerClient(serverToken);

client
	.sendEmail({
		From: 'hello@skyturtle.io',
		To: 'test@blackhole.postmarkapp.com',
		Subject: 'Hello from Postmark!',
		HtmlBody: 'Hello message body.',
	})
	.then((response) => {
		console.log('sending message');
		console.log(response.To);
		console.log(response.Message);
	});
