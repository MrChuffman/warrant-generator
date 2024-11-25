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

	const storage = createStorage();
	const savedWarrants = storage.get('savedWarrants') || [];

	const headItems = ['Incident Number', 'Type', 'Items', 'Actions'];

	let searchTerm = $state('');

	let filteredItems = $derived(
		savedWarrants.filter(
			(item) => item.incidentNumber.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
		)
	);
</script>

<TableSearch placeholder="Search by Incident Number" hoverable={true} bind:inputValue={searchTerm}>
	<TableHead {headItems} class="text-center" />
	<TableBody>
		{#if savedWarrants.length === 0}
			<TableBodyRow class="text-center">
				<TableBodyCell class="w-full">You have no warrants</TableBodyCell>
			</TableBodyRow>
		{:else}
			{#each filteredItems as item}
				<TableBodyRow class="text-center">
					<TableBodyCell>{item.incidentNumber}</TableBodyCell>
					<TableBodyCell>{item.data.warrantTypeFriendly}</TableBodyCell>
					<TableBodyCell>{item.items}</TableBodyCell>
					<TableBodyCell class="w-64">
						<div class="flex justify-around">
							<Button>View</Button>
							<!-- <Button color="blue">Copy</Button> -->
						</div>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		{/if}
	</TableBody>
</TableSearch>
