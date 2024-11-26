<script lang="ts">
	import type { SavedWarrants } from '$lib/types';
	import {
		Button,
		TableSearch,
		TableHead,
		TableBody,
		TableBodyRow,
		TableBodyCell
	} from 'svelte-5-ui-lib';
	import { createStorage } from '$lib/utils/localStorage.svelte';
	import { goto } from '$app/navigation';

	const storage = createStorage();
	let warrants = $state(storage.get('savedWarrants') || []);
	let searchTerm = $state('');

	const headItems = ['Incident Number', 'Type', 'Items', 'Actions'];

	let filteredItems = $derived(
		warrants.filter((item) => item.incidentNumber.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	function handleDeleteWarrant(index: number) {
		if (confirm('Are you sure you want to delete this warrant?')) {
			warrants = warrants.filter((_, i) => i !== index);
			storage.set('savedWarrants', warrants);
		}
	}

	function handleCopyWarrant(index: number) {
		const warrantData = warrants[index];

		if (warrantData) {
			storage.get('warrant', warrantData);

			goto('/create');
		}
	}
</script>

<TableSearch placeholder="Search by Incident Number" hoverable={true} bind:inputValue={searchTerm}>
	<TableHead {headItems} class="text-center" />
	<TableBody>
		{#if warrants.length === 0}
			<TableBodyRow class="text-center">
				<TableBodyCell class="w-full">You have no warrants</TableBodyCell>
			</TableBodyRow>
		{:else}
			{#each filteredItems as item, index}
				<TableBodyRow class="text-center">
					<TableBodyCell>{item.incidentNumber}</TableBodyCell>
					<TableBodyCell>{item.data.warrantTypeFriendly}</TableBodyCell>
					<TableBodyCell>{item.items}</TableBodyCell>
					<TableBodyCell class="w-64">
						<div class="flex justify-around">
							<Button>View</Button>
							<Button color="blue" onclick={() => handleCopyWarrant(index)}>Copy</Button>
							<Button color="red" onclick={() => handleDeleteWarrant(index)}>Delete</Button>
						</div>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		{/if}
	</TableBody>
</TableSearch>
