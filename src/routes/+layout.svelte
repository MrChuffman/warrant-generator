<script lang="ts">
	import { Darkmode } from 'svelte-5-ui-lib';
	import { Button, Navbar, NavBrand, NavUl, NavLi, uiHelpers } from 'svelte-5-ui-lib';
	import { page } from '$app/stores';

	import '../app.css';

	let activeUrl = $state($page.url.pathname);
	let nav = uiHelpers();
	let navStatus = $state(false);
	let toggleNav = nav.toggle;
	let closeNav = nav.close;

	$effect(() => {
		navStatus = nav.isOpen;
		activeUrl = $page.url.pathname;
	});

	let { children } = $props();
</script>

<Navbar
	{toggleNav}
	{closeNav}
	{navStatus}
	breakPoint="md"
	navClass="bg-slate-300"
	divClass="max-w-screen-2xl"
>
	{#snippet brand()}
		<NavBrand siteName="Warrant Generator" spanClass="text-primary-700" />
	{/snippet}

	<NavUl {activeUrl} class="items-center">
		<NavLi href="/">All Warrants</NavLi>
		<NavLi>
			<Button href="/create">Create a Warrant</Button>
		</NavLi>
		<NavLi href="/settings">Setup</NavLi>
		<NavLi>
			<Darkmode class="text-primary-500 dark:text-primary-600 dark:border-primary-600 border" />
		</NavLi>
	</NavUl>
</Navbar>

<div class="mx-auto w-10/12 max-w-screen-2xl pt-2.5">
	{@render children()}
</div>
