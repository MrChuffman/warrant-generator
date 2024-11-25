<script lang="ts">
	import { Darkmode } from 'svelte-5-ui-lib';
	import { Navbar, NavBrand, NavUl, NavLi, uiHelpers } from 'svelte-5-ui-lib';
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

	export const prerender = true;
</script>

<Navbar {toggleNav} {closeNav} {navStatus} breakPoint="md">
	{#snippet brand()}
		<NavBrand siteName="Warrant Generator" />
	{/snippet}

	<NavUl {activeUrl} class="items-center">
		<NavLi href="/">All Warrants</NavLi>
		<NavLi href="/create">Create Warrant</NavLi>
		<NavLi href="/settings">Setup</NavLi>
		<NavLi>
			<Darkmode class="text-primary-500 dark:text-primary-600 border dark:border-gray-800" />
		</NavLi>
	</NavUl>
</Navbar>

<div class="mx-auto w-10/12 pt-2.5">
	{@render children()}
</div>
