<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<h1>Login with Username</h1>

<form method="POST" use:enhance>
	<label for="username">
		Username
		<input type="text" name="username" id="username" />
	</label>
	<label for="password">
		Password
		<input type="password" name="password" id="password" />
	</label>
	<button type="submit">Submit</button>
</form>

{#if form?.message}
	<p class="error">{form.message}</p>
{/if}
