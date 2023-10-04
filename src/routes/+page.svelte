<script lang="ts">
	import { enhance } from '$app/forms';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>Welcome to SvelteKit on Node</h1>
{#if !data.userId}
	<h2>You're not signed in</h2>
{:else}
	<h2>Profile Page</h2>
{/if}
<p>User id: {data.userId}</p>
<p>Username: {data.username}</p>
<p>Email: {data.email}</p>
<p>Email verified?: {data.verified}</p>

<form method="POST" action="?/logout" use:enhance>
	<button type="submit">Log out</button>
</form>
