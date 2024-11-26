<script lang="ts">
	import { goto } from '$app/navigation';

	import {
		Button,
		TableSearch,
		TableHead,
		TableBody,
		TableBodyRow,
		TableBodyCell,
		Tooltip,
		Modal,
		uiHelpers
	} from 'svelte-5-ui-lib';

	import { FileCopyOutline, TrashBinOutline, FolderOpenOutline } from 'flowbite-svelte-icons';

	import { createStorage } from '$lib/utils/localStorage.svelte';

	const storage = createStorage();
	let warrants = $state(storage.get('savedWarrants') || []);
	let searchTerm = $state('');

	const headItems = ['Incident Number', 'Warrant Type', 'Warrant Subject', 'Actions'];

	let filteredItems = $derived(
		warrants.filter((item) => item.incidentNumber.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	const deleteModal = uiHelpers();
	const closeDeleteModal = deleteModal.close;

	const copyModal = uiHelpers();
	const closeCopyModal = copyModal.close;

	let statusCopyModal = $state(false);
	let statusDeleteModal = $state(false);
	let modalWarrantIndex = $state<number | null>(null);

	$effect(() => {
		statusDeleteModal = deleteModal.isOpen;
		statusCopyModal = copyModal.isOpen;
	});

	const openDeleteModal = (index: number) => {
		modalWarrantIndex = index;
		deleteModal.toggle();
	};

	function handleDeleteWarrant() {
		warrants = warrants.filter((_, i) => i !== modalWarrantIndex);

		storage.set('savedWarrants', warrants);

		modalWarrantIndex = null;

		deleteModal.close();
	}

	const openCopyModal = (index: number) => {
		modalWarrantIndex = index;
		copyModal.toggle();
	};

	function handleCopyWarrant() {
		if (modalWarrantIndex === null) {
			return;
		}

		const warrantData = warrants[modalWarrantIndex];

		if (warrantData) {
			storage.set('warrant', warrantData.data);

			goto('/create');
		}
	}
</script>

<TableSearch placeholder="Search by Incident Number" hoverable={true} bind:inputValue={searchTerm}>
	<TableHead {headItems} class="text-center" />
	<TableBody>
		{#if warrants.length === 0}
			<TableBodyRow class="text-center">
				<TableBodyCell colspan={4}><Button href="/create">Create a Warrant</Button></TableBodyCell>
			</TableBodyRow>
		{:else}
			{#each filteredItems as item, index}
				<TableBodyRow class="text-center">
					<TableBodyCell>{item.incidentNumber}</TableBodyCell>
					<TableBodyCell>{item.warrantTypeFriendly}</TableBodyCell>
					{#if item?.subject?.length > 2}
						<TableBodyCell
							>{`${item?.subject} & ${item?.subject?.length - 1} more...`}</TableBodyCell
						>
					{:else if item?.subject?.length === 2}
						<TableBodyCell>{item?.subject[0]}<br />{item?.subject[1]}</TableBodyCell>
					{:else if item?.subject?.length === 1}
						<TableBodyCell>{`${item?.subject[0]}`}</TableBodyCell>
					{:else}
						<TableBodyCell></TableBodyCell>
					{/if}
					<TableBodyCell class="w-[300px]">
						<div class="flex justify-around">
							<Button id={`view-${index}`} href={`/warrants/${item.warrantType}?id=${item.id}`}>
								<FileCopyOutline class="h-5 w-5" />
							</Button>
							<Tooltip color="orange" offset={10} triggeredBy={`#view-${index}`}
								>View Warrant</Tooltip
							>
							<Button id={`copy-${index}`} color="blue" onclick={() => openCopyModal(index)}>
								<FolderOpenOutline class="h-5 w-5" />
							</Button>
							<Tooltip color="blue" offset={10} triggeredBy={`#copy-${index}`}
								>Copy Warrant Data</Tooltip
							>
							<Button id={`delete-${index}`} color="red" onclick={() => openDeleteModal(index)}>
								<TrashBinOutline class="h-5 w-5" />
							</Button>
							<Tooltip color="red" offset={10} triggeredBy={`#delete-${index}`}
								>Delete Warrant</Tooltip
							>
						</div>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		{/if}
	</TableBody>
</TableSearch>

<Modal
	title="Confirm Warrant Deletion"
	modalStatus={statusDeleteModal}
	closeModal={closeDeleteModal}
>
	{#snippet footer()}
		<Button color="red" onclick={handleDeleteWarrant}>Yes, Delete It</Button>
		<Button color="alternative" onclick={closeDeleteModal}>Take Me Back</Button>
	{/snippet}
	<!-- Modal body -->
	<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
		Are you sure you want to delete this warrant? This cannot be undone.
	</p>
</Modal>

<Modal title="Copy Warrant Contents" modalStatus={statusCopyModal} closeModal={closeCopyModal}>
	{#snippet footer()}
		<Button color="blue" onclick={handleCopyWarrant}>Yes, Copy It</Button>
		<Button color="alternative" onclick={closeCopyModal}>Take Me Back</Button>
	{/snippet}
	<!-- Modal body -->
	<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
		Are you sure you want to copy this warrant? You'll lose your active one.
	</p>
</Modal>
