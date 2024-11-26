<script lang="ts">
	import { page } from '$app/stores';

	import { Heading, Label, Textarea, Button, Helper } from 'svelte-5-ui-lib';
	import { PlusOutline, MinusOutline, TextSizeOutline } from 'flowbite-svelte-icons';

	import type { WarrantSetup, AlteredVINsSeizureWarrant, SavedWarrants } from '$lib/types';
	import { createStorage } from '$lib/utils/localStorage.svelte';
	import { handleTextareaInput } from '$lib/utils/helpers.svelte';
	import { generateWordDocument } from '$lib/utils/docx.svelte';

	let warrantId = $page.url.searchParams.get('id');

	const storage = createStorage();
	const savedWarrants = storage.reactive<SavedWarrants[]>('savedWarrants', []);
	const savedWarrant = storage.get<AlteredVINsSeizureWarrant>('warrant');

	const form = storage.reactive<AlteredVINsSeizureWarrant>('warrant', {
		seizableVehicles: savedWarrant?.seizableVehicles ?? '',
		factsAndCircumstances: savedWarrant?.factsAndCircumstances ?? '',
		errors: {}
	});

	let textareas = $state<HTMLTextAreaElement[]>([]);

	const validateForm = (): boolean => {
		const errors: AlteredVINsSeizureWarrant['errors'] = {};

		if (!form.value.seizableVehicles?.trim()) {
			errors.seizableVehicles = 'Seizable vehicles can not be blank';
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
			fileName: `${warrantData.incidentNumber}-seizure-altered-vins-warrant.docx`
		};

		if (warrantId) {
			// Update existing warrant
			savedWarrants.value = savedWarrants.value.map((warrant) => {
				if (warrant.id === warrantId) {
					return {
						...warrant,
						timestamp: Date.now(),
						incidentNumber: warrantData.incidentNumber,
						warrantType: warrantData.warrantType,
						warrantTypeFriendly: 'Seizure - Altered VINs',
						subject: data.seizableVehicles.split('\n'),
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
				warrantTypeFriendly: 'Seizure - Altered VINs',
				subject: data.seizableVehicles.split('\n'),
				data
			};

			savedWarrants.value = [...savedWarrants.value, newForm];

			warrantId = newForm.id;
		}

		await generateWordDocument('/templates/seizure/altered-vins.docx', data, [
			'affiantHerosheet',
			'factsAndCircumstances',
			'seizableVehicles'
		]);
	};

	const updateseizableVehicles = (e: Event) => {
		const textarea = e.target as HTMLTextAreaElement;
		form.value = {
			...form.value,
			seizableVehicles: textarea.value
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

<div class="mb-2.5 flex justify-between border-b-2">
	<Heading tag="h3" class="text-primary-700 dark:text-primary-500"
		>Altered VINs Seizure Warrant</Heading
	>
</div>

<div class="grid gap-2.5">
	<Label class="grid gap-2.5">
		Seizable Vehicles
		<Textarea
			bind:this={textareas[0]}
			value={form.value.seizableVehicles}
			oninput={updateseizableVehicles}
			color={form.value.errors?.seizableVehicles ? 'red' : 'gray'}
			placeholder="Seizable Vehicles"
			class={`${fontSize}`}
		/>
	</Label>
	{#if form.value.errors?.seizableVehicles}
		<Helper color="red">{form.value.errors.seizableVehicles}</Helper>
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
