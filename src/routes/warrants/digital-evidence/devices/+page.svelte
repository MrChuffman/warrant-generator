<script lang="ts">
	import { page } from '$app/stores';
	import type { WarrantSetup, DevicesWarrant, SavedWarrants } from '$lib/types';

	import {
		Heading,
		Label,
		Textarea,
		Button,
		Helper,
		Accordion,
		AccordionItem
	} from 'svelte-5-ui-lib';
	import { PlusOutline, MinusOutline, TextSizeOutline } from 'flowbite-svelte-icons';

	import { createStorage } from '$lib/utils/localStorage.svelte';

	import { generateWordDocument } from '$lib/utils/docx.svelte';

	import { devicesItemsToSeize } from '$lib/itemsToSeize';

	let warrantId = $page.url.searchParams.get('id');

	const defaultItemsToSeize = devicesItemsToSeize.join('\n\n');

	const storage = createStorage();
	const savedWarrants = storage.reactive<SavedWarrants[]>('savedWarrants', []);
	const savedWarrant = storage.get<DevicesWarrant>('warrant');

	const form = storage.reactive<DevicesWarrant>('warrant', {
		itemsToSeize: savedWarrant?.itemsToSeize ?? '',
		devicesDescription: savedWarrant?.devicesDescription ?? '',
		factsAndCircumstances: savedWarrant?.factsAndCircumstances ?? '',
		errors: {}
	});

	let textareas = $state<HTMLTextAreaElement[]>([]);

	const validateForm = (): boolean => {
		const errors: DevicesWarrant['errors'] = {};

		if (!form.value.itemsToSeize?.trim()) {
			errors.itemsToSeize = 'Items to seize can not be blank';
		}

		if (!form.value.devicesDescription?.trim()) {
			errors.devicesDescription = 'Device(s) description can not be blank';
		}

		if (!form.value.factsAndCircumstances?.trim()) {
			errors.factsAndCircumstances = 'Facts and circumstances can not be blank';
		}

		form.value = { ...form.value, errors };
		return Object.keys(errors).length === 0;
	};

	const handleForm = async () => {
		const { errors, ...formData } = form.value;

		if (!validateForm()) {
			console.log(errors);
			return;
		}

		storage.set('warrant', formData);

		const warrantData = storage.get<WarrantSetup>('warrant');

		const data = {
			...warrantData,
			...formData,
			judicialCountyUppercase: warrantData.judicialCounty.toUpperCase(),
			judicialStateUppercase: warrantData.judicialState.toUpperCase(),
			affiantDepartmentUppercase: warrantData.affiantDepartment.toUpperCase(),
			fileName: `${warrantData.incidentNumber}-devices-warrant.docx`
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
						warrantTypeFriendly: 'Electronic Devices',
						subject: data.devicesDescription.split('\n'),
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
				warrantTypeFriendly: 'Electronic Devices',
				subject: data.devicesDescription.split('\n'),
				data
			};

			savedWarrants.value = [...savedWarrants.value, newForm];

			warrantId = newForm.id;
		}

		data.itemsToSeize = data.itemsToSeize
			.split('\n')
			.filter((line) => line.trim() !== '') // Exclude blank lines
			.map((line, index) => `${index + 1}. ${line}`)
			.join('\n\n');

		console.log(data.itemsToSeize);

		await generateWordDocument('/templates/digital-evidence/devices.docx', data, [
			'affiantHerosheet',
			'factsAndCircumstances',
			'devicesDescription',
			'itemsToSeize'
		]);
	};

	const updateItemsToSeize = (e: Event) => {
		const textarea = e.target as HTMLTextAreaElement;
		form.value = {
			...form.value,
			itemsToSeize: textarea.value
		};
	};

	const updateDevicesDescription = (e: Event) => {
		const textarea = e.target as HTMLTextAreaElement;

		form.value = {
			...form.value,
			devicesDescription: textarea.value
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
		Electronic Devices Warrant
	</Heading>
</div>

<div class="grid gap-2.5">
	<Label class="grid gap-2.5">
		Devices(s) Descriptions
		<Textarea
			bind:this={textareas[0]}
			value={form.value.devicesDescription}
			oninput={updateDevicesDescription}
			color={form.value.errors?.devicesDescription ? 'red' : 'gray'}
			class={`${fontSize}`}
			placeholder="Device(s) Description"
		/>
	</Label>
	{#if form.value.errors?.devicesDescription}
		<Helper color="red">{form.value.errors.devicesDescription}</Helper>
	{:else}
		<Helper color="default">&nbsp;</Helper>
	{/if}
</div>
<Accordion class="my-2.5 border-none">
	<AccordionItem class="rounded-md dark:border-gray-500 ">
		{#snippet header()}
			<div class="mr-5 flex w-full items-center justify-between">
				Items to Be Seized
				<Button color="red" onclick={() => (form.value.itemsToSeize = defaultItemsToSeize)}
					>Reset Items</Button
				>
			</div>
		{/snippet}
		<Textarea
			bind:this={textareas[1]}
			value={form.value.itemsToSeize ?? defaultItemsToSeize}
			oninput={updateItemsToSeize}
			class={`h-[70vh] ${fontSize}`}
			color={form.value.errors?.itemsToSeize ? 'red' : 'gray'}
			placeholder="Items to Be Seized"
		/>
		<p class="pb-1 text-sm">Items will be numbered automatically.</p>
	</AccordionItem>
</Accordion>
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
			bind:this={textareas[2]}
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
