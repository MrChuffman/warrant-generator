<script lang="ts">
	import { page } from '$app/stores';
	import type { WarrantSetup, NarcoticsSeizureWarrant, SavedWarrants } from '$lib/types';

	import { Heading, Label, Textarea, Button, Helper } from 'svelte-5-ui-lib';
	import { PlusOutline, MinusOutline, TextSizeOutline } from 'flowbite-svelte-icons';

	import { createStorage } from '$lib/utils/localStorage.svelte';

	import { handleTextareaInput } from '$lib/utils/helpers.svelte';
	import { generateWordDocument } from '$lib/utils/docx.svelte';
	import { goto } from '$app/navigation';

	let warrantId = $page.url.searchParams.get('id');

	const storage = createStorage();
	const savedWarrants = storage.reactive<SavedWarrants[]>('savedWarrants', []);
	const savedWarrant = storage.get<NarcoticsSeizureWarrant>('warrant');

	const form = storage.reactive<NarcoticsSeizureWarrant>('warrant', {
		seizableItems: savedWarrant?.seizableItems ?? '',
		factsAndCircumstances: savedWarrant?.factsAndCircumstances ?? '',
		errors: {}
	});

	let textareas = $state<HTMLTextAreaElement[]>([]);

	const validateForm = (): boolean => {
		const errors: NarcoticsSeizureWarrant['errors'] = {};

		if (!form.value.seizableItems?.trim()) {
			errors.seizableItems = 'Seizable items can not be blank';
		}

		if (!form.value.factsAndCircumstances?.trim()) {
			errors.factsAndCircumstances = 'Facts and circumstances can not be blank';
		}

		form.value = { ...form.value, errors };
		return Object.keys(errors).length === 0;
	};

	const handleForm = async () => {
		if (!validateForm()) {
			return;
		}

		const { errors, ...alteredVinsData } = form.value;
		storage.set('warrant', alteredVinsData);

		const warrantData = storage.get<WarrantSetup>('warrant');

		const data = {
			...warrantData,
			...alteredVinsData,
			judicialCountyUppercase: warrantData.judicialCounty.toUpperCase(),
			judicialStateUppercase: warrantData.judicialState.toUpperCase(),
			affiantDepartmentUppercase: warrantData.affiantDepartment.toUpperCase(),
			fileName: `${warrantData.incidentNumber}-seizure-narcotics-warrant.docx`
		};

		if (warrantId) {
			console.clear();
			console.log('Called');
			// Update existing warrant
			savedWarrants.value = savedWarrants.value.map((warrant) => {
				if (warrant.id === warrantId) {
					return {
						...warrant,
						timestamp: Date.now(),
						incidentNumber: warrantData.incidentNumber,
						warrantType: warrantData.warrantType,
						warrantTypeFriendly: 'Seizure - Narcotics',
						subject: data.seizableItems.split('\n'),
						data
					};
				}
				return warrant;
			});
		} else {
			// Create new warrant
			const newForm: SavedWarrants = {
				id: crypto.randomUUID(),
				timestamp: Date.now(),
				incidentNumber: warrantData.incidentNumber,
				warrantType: warrantData.warrantType,
				warrantTypeFriendly: 'Seizure - Narcotics',
				subject: data.seizableItems.split('\n'),
				data
			};

			savedWarrants.value = [...savedWarrants.value, newForm];

			warrantId = newForm.id;
		}

		await generateWordDocument('/templates/seizure/narcotics.docx', data, [
			'affiantHerosheet',
			'factsAndCircumstances',
			'seizableItems'
		]);
	};

	const updateSeizableItems = (e: Event) => {
		const textarea = e.target as HTMLTextAreaElement;
		form.value = {
			...form.value,
			seizableItems: textarea.value
		};
	};

	const updateFactsAndCircumstances = (e: Event) => {
		const textarea = e.target as HTMLTextAreaElement;
		form.value = {
			...form.value,
			factsAndCircumstances: textarea.value
		};
	};

	let fontSize = $state('text-md');

	const increaseFontSize = () => {
		if (fontSize === 'text-xs') {
			fontSize = 'text-sm';
		} else if (fontSize === 'text-sm') {
			fontSize = 'text-md';
		} else if (fontSize === 'text-md') {
			fontSize = 'text-lg';
		} else if (fontSize === 'text-lg') {
			fontSize = 'text-xl';
		} else if (fontSize === 'text-xl') {
			fontSize = 'text-2xl';
		}
	};

	const decreaseFontSize = () => {
		if (fontSize === 'text-2xl') {
			fontSize = 'text-xl';
		} else if (fontSize === 'text-xl') {
			fontSize = 'text-lg';
		} else if (fontSize === 'text-lg') {
			fontSize = 'text-md';
		} else if (fontSize === 'text-md') {
			fontSize = 'text-sm';
		} else if (fontSize === 'text-sm') {
			fontSize = 'text-xs';
		}
	};
</script>

<div class="border-b-primary-700 dark:border-b-primary-500 mb-2.5 flex justify-between border-b-2">
	<Heading tag="h3" class="text-primary-700 dark:text-primary-500">
		Narcotics Seizure Warrant
	</Heading>
</div>

<div class="grid gap-2.5">
	<Label class="grid gap-2.5">
		Seizable Items
		<Textarea
			bind:this={textareas[0]}
			value={form.value.seizableItems}
			oninput={updateSeizableItems}
			color={form.value.errors?.seizableItems ? 'red' : 'gray'}
			class={`${fontSize}`}
			placeholder="Seizable Items"
		/>
	</Label>
	{#if form.value.errors?.seizableItems}
		<Helper color="red">{form.value.errors.seizableItems}</Helper>
	{:else}
		<Helper color="default">&nbsp;</Helper>
	{/if}
</div>

<div class="grid gap-2.5">
	<Label class="grid gap-2.5">
		<div class="flex items-center justify-between">
			Facts and Circumstances
			<div class="flex gap-2.5">
				<Button class="!p-2" onclick={decreaseFontSize}>
					<MinusOutline class="h-5 w-5" />
					<TextSizeOutline class="h-5 w-5" />
				</Button>
				<Button class="!p-2" onclick={increaseFontSize}>
					<PlusOutline class="h-5 w-5" /><TextSizeOutline class="h-5 w-5" />
				</Button>
			</div>
		</div>
		<Textarea
			bind:this={textareas[1]}
			value={form.value.factsAndCircumstances}
			oninput={updateFactsAndCircumstances}
			class={`h-[70vh] ${fontSize}`}
			color={form.value.errors?.factsAndCircumstances ? 'red' : 'gray'}
			placeholder="Facts and Circumstances"
		/>
	</Label>
	{#if form.value.errors?.factsAndCircumstances}
		<Helper color="red">{form.value.errors.factsAndCircumstances}</Helper>
	{:else}
		<Helper color="default">&nbsp;</Helper>
	{/if}
</div>

<div class="grid py-4">
	<Button color="green" onclick={handleForm}>Generate Warrant</Button>
</div>
