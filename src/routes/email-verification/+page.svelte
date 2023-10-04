<script lang="ts">
	import { enhance } from '$app/forms';

	import type { ActionData, PageServerData } from './$types';

	export let form: ActionData;
	export let data: PageServerData;
	const { email, userId, verified } = data;
</script>

<h1>Email verification</h1>
<h2>Debugging info</h2>
<ul>
	<li>
		user id: {userId}
	</li>
	<li>
		email: {email}
	</li>
	<li>
		verified?: {verified}
	</li>
</ul>
<p>Your email verification link was sent to your inbox.</p>
<p>For development, this is `console`</p>
<h2>Resend verification link</h2>
<form method="POST" action="?/resend" use:enhance>
	<button type="submit">Resend</button>
</form>

{#if form?.success}
	<p>Your verification link was resent</p>
{/if}
