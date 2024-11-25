<script lang="ts">
	import type { WarrantSetup, HeroSheet, NarcoticsWarrant, SavedWarrants } from '$lib/types';
	import { createStorage } from '$lib/utils/localStorage.svelte';
	import { Heading, Input, Label, Textarea, Button, Select, Helper } from 'svelte-5-ui-lib';

	import PizZip from 'pizzip';
	import Docxtemplater from 'docxtemplater';

	const storage = createStorage();
	const savedWarrants = storage.reactive<SavedWarrants[]>('savedWarrants', []);
	const savedWarrant = storage.get<NarcoticsWarrant>('warrant');

	const form = storage.reactive<NarcoticsWarrant>('warrant', {
		seizableItems: savedWarrant?.seizableItems ?? '',
		factsAndCircumstances: savedWarrant?.factsAndCircumstances ?? '',
		errors: {}
	});

	let textareas = $state<HTMLTextAreaElement[]>([]);

	const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
		if (textarea) {
			textarea.style.height = 'auto';
			textarea.style.height = `${textarea.scrollHeight}px`;
		}
	};

	$effect(() => {
		textareas.forEach((textarea) => adjustTextareaHeight(textarea));
	});

	const validateForm = (): boolean => {
		const errors: NarcoticsWarrant['errors'] = {};

		if (!form.value.seizableItems?.trim()) {
			errors.seizableItems = 'Seizable items are required';
		}

		if (!form.value.factsAndCircumstances?.trim()) {
			errors.factsAndCircumstances = 'Facts and circumstances are required';
		}

		form.value = { ...form.value, errors };
		return Object.keys(errors).length === 0;
	};

	const generateWordDocument = async (template: string, data: object) => {
		try {
			const response = await fetch(template);
			const arrayBuffer = await response.arrayBuffer();

			const zip = new PizZip(arrayBuffer);
			const doc = new Docxtemplater(zip, {
				paragraphLoop: true,
				linebreaks: true
			});

			doc.render(data);
			const buffer = doc.getZip().generate({ type: 'blob' });

			const link = document.createElement('a');
			link.href = URL.createObjectURL(buffer);
			link.download = data.fileName;
			link.click();
		} catch (error) {
			console.error('Error generating DOCX:', error);
		}
	};

	const handleForm = async () => {
		if (!validateForm()) {
			return;
		}

		const { errors, ...narcoticsData } = form.value;
		storage.set('warrant', narcoticsData);

		const warrantData = storage.get<WarrantSetup>('warrant');

		const data = {
			...warrantData,
			...narcoticsData,
			judicialCountyUppercase: warrantData.judicialCounty.toUpperCase(),
			judicialStateUppercase: warrantData.judicialState.toUpperCase(),
			affiantDepartmentUppercase: warrantData.affiantDepartment.toUpperCase(),
			fileName: `${warrantData.incidentNumber}-seizure-narcotics-warrant.docx`
		};

		// Save to forms array
		const newForm: SavedForm = {
			id: crypto.randomUUID(),
			timestamp: Date.now(),
			incidentNumber: warrantData.incidentNumber,
			warrantType: warrantData.warrantType,
			warrantType: 'Seizure - Narcotics',
			data
		};

		savedWarrants.value = [...savedWarrants.value, newForm];

		await generateWordDocument('/templates/seizure/narcotics.docx', data);
	};

	const handleTextareaInput = (event: Event & { target: HTMLTextAreaElement; key?: string }) => {
		const textarea = event.target;
		adjustTextareaHeight(textarea);

		if (event.key === 'Tab') {
			event.preventDefault();
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			textarea.value =
				textarea.value.substring(0, start) + '        ' + textarea.value.substring(end);
			textarea.selectionStart = textarea.selectionEnd = start + 8;
		}
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
</script>

<div class="flex justify-between">
	<Heading tag="h3" class="text-primary-700 dark:text-primary-500"
		>Narcotics Seizure Warrant</Heading
	>
</div>

<div class="grid gap-2.5">
	<Label class="grid gap-2.5">
		Seizable Items
		<Textarea
			bind:this={textareas[0]}
			value={form.value.seizableItems}
			oninput={updateSeizableItems}
			onkeydown={handleTextareaInput}
			color={form.value.errors?.seizableItems ? 'red' : 'gray'}
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
		Facts and Circumstances
		<Textarea
			bind:this={textareas[1]}
			value={form.value.factsAndCircumstances}
			oninput={updateFactsAndCircumstances}
			onkeydown={handleTextareaInput}
			color={form.value.errors?.factsAndCircumstances ? 'red' : 'gray'}
		/>
	</Label>
	{#if form.value.errors?.factsAndCircumstances}
		<Helper color="red">{form.value.errors.factsAndCircumstances}</Helper>
	{:else}
		<Helper color="default">&nbsp;</Helper>
	{/if}
</div>

<div class="grid pt-4">
	<Button color="green" onclick={handleForm}>Generate Warrant</Button>
</div>
