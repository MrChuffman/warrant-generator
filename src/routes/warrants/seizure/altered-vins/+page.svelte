<script lang="ts">
	import type {
		WarrantSetup,
		HeroSheet,
		AlteredVINsSeizureWarrant,
		SavedWarrants
	} from '$lib/types';

	import { Heading, Input, Label, Textarea, Button, Select, Helper } from 'svelte-5-ui-lib';
	import { PlusOutline, MinusOutline, TextSizeOutline } from 'flowbite-svelte-icons';

	import { createStorage } from '$lib/utils/localStorage.svelte';

	import { handleTextareaInput } from '$lib/utils/helpers.svelte';
	import { generateWordDocument } from '$lib/utils/docx.svelte';

	const storage = createStorage();
	const savedWarrants = storage.reactive<SavedWarrants[]>('savedWarrants', []);
	const savedWarrant = storage.get<AlteredVINsSeizureWarrant>('warrant');

	const form = storage.reactive<AlteredVINsSeizureWarrant>('warrant', {
		seizableItems: savedWarrant?.seizableItems ?? '',
		factsAndCircumstances: savedWarrant?.factsAndCircumstances ?? '',
		errors: {}
	});

	let textareas = $state<HTMLTextAreaElement[]>([]);

	const validateForm = (): boolean => {
		const errors: AlteredVINsSeizureWarrant['errors'] = {};

		if (!form.value.seizableItems?.trim()) {
			errors.seizableItems = 'Seizable items are required';
		}

		if (!form.value.factsAndCircumstances?.trim()) {
			errors.factsAndCircumstances = 'Facts and circumstances are required';
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

		// Save to forms array
		const newForm: SavedForm = {
			id: crypto.randomUUID(),
			timestamp: Date.now(),
			incidentNumber: warrantData.incidentNumber,
			warrantType: warrantData.warrantType,
			data
		};

		savedWarrants.value = [...savedWarrants.value, newForm];

		await generateWordDocument('/templates/seizure/altered-vins.docx', data, [
			'affiantHerosheet',
			'factsAndCircumstances'
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
			value={form.value.seizableItems}
			oninput={updateSeizableItems}
			onkeydown={handleTextareaInput}
			color={form.value.errors?.seizableItems ? 'red' : 'gray'}
			placeholder="Seizable Vehicles"
			class={`${fontSize}`}
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
