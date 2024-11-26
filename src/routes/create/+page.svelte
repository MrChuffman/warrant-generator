<script lang="ts">
	import { goto } from '$app/navigation';
	import { createStorage } from '$lib/utils/localStorage.svelte';
	import { Heading, Input, Label, Textarea, Button, Select, Helper } from 'svelte-5-ui-lib';

	import { handleTextareaInput } from '$lib/utils/helpers.svelte';

	interface HeroSheet {
		title: string;
		content: string;
	}

	interface WarrantType {
		group: string;
		value: string;
		label: string;
	}

	const warrantTypes: WarrantType[] = [
		{ group: 'General', value: 'general/property', label: 'Property' },
		{ group: 'Seizure', value: 'seizure/narcotics', label: 'Narcotics' },
		{ group: 'Seizure', value: 'seizure/altered-vins', label: 'Altered VINs' },
		{ group: 'Digital Evidence', value: 'digital-evidence/devices', label: 'Devices' },
		{
			group: 'Digital Evidence',
			value: 'digital-evidence/vehicle-infotainment-systems',
			label: 'Vehicle Infotainment Systems'
		}
	];

	// Group warrants by their group property
	const groupedWarrants = warrantTypes.reduce(
		(groups, warrant) => {
			const group = warrant.group;
			if (!groups[group]) {
				groups[group] = [];
			}
			groups[group].push(warrant);
			return groups;
		},
		{} as Record<string, WarrantType[]>
	);

	interface WarrantSetup {
		warrantType: string;
		incidentNumber: string;
		chargeCode: string;
		// Add new judicial fields
		judicialState: string;
		judicialCounty: string;
		judicialJudge: string;
		affiantTitle: string;
		affiantFirstName: string;
		affiantLastName: string;
		affiantDepartment: string;
		affiantHerosheet: string;
		heroSheets: HeroSheet[];
		errors?: {
			warrantType?: string;
			incidentNumber?: string;
			chargeCode?: string;
			// Add new judicial field errors
			judicialState?: string;
			judicialCounty?: string;
			judicialJudge?: string;
			affiantTitle?: string;
			affiantFirstName?: string;
			affiantLastName?: string;
			affiantDepartment?: string;
			affiantHerosheet?: string;
		};
	}

	const storage = createStorage();
	const affiant = storage.get<WarrantSetup>('affiant');
	const savedHeroSheets = affiant?.affiantHerosheet || [];

	const form = storage.reactive<WarrantSetup>('warrant', {
		warrantType: affiant?.warrantType ?? '',
		incidentNumber: affiant?.incidentNumber ?? '',
		chargeCode: affiant?.chargeCode ?? '',
		judicialState: affiant?.judicialState ?? '',
		judicialCounty: affiant?.judicialCounty ?? '',
		judicialJudge: affiant?.judicialJudge ?? '',
		affiantTitle: affiant?.affiantTitle ?? '',
		affiantFirstName: affiant?.affiantFirstName ?? '',
		affiantLastName: affiant?.affiantLastName ?? '',
		affiantDepartment: affiant?.affiantDepartment ?? '',
		affiantHerosheet: '',
		heroSheets: savedHeroSheets,
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
		const errors: WarrantSetup['errors'] = {};

		if (!form.value.warrantType?.trim()) {
			errors.warrantType = 'Warrant type is required';
		}

		if (!form.value.incidentNumber?.trim()) {
			errors.incidentNumber = 'Incident number is required';
		}

		if (!form.value.chargeCode?.trim()) {
			errors.chargeCode = 'Charge code is required';
		}

		// Add validation for new judicial fields
		if (!form.value.judicialState?.trim()) {
			errors.judicialState = 'Judicial state is required';
		}

		if (!form.value.judicialCounty?.trim()) {
			errors.judicialCounty = 'Judicial county is required';
		}

		if (!form.value.judicialJudge?.trim()) {
			errors.judicialJudge = 'Judicial judge is required';
		}

		if (!form.value.affiantTitle?.trim()) {
			errors.affiantTitle = 'Affiant title is required';
		}

		if (!form.value.affiantFirstName?.trim()) {
			errors.affiantFirstName = 'Affiant first name is required';
		}

		if (!form.value.affiantLastName?.trim()) {
			errors.affiantLastName = 'Affiant last name is required';
		}

		if (!form.value.affiantDepartment?.trim()) {
			errors.affiantDepartment = 'Affiant department is required';
		}

		form.value = { ...form.value, errors };
		return Object.keys(errors).length === 0;
	};

	const handleFormReset = () => {
		if (affiant) {
			form.value = {
				...affiant,
				affiantHerosheet: savedHeroSheets[0]?.content || '',
				judicialState: 'Mississippi',
				judicialCounty: 'DeSoto',
				judicialJudge: 'Circuit Court Judge',
				errors: {}
			};
		}
	};

	const handleForm = () => {
		if (!validateForm()) {
			return;
		}
		const { errors, ...formData } = form.value;

		goto(`/warrants/${formData.warrantType}`);
	};

	const updateHerosheet = (content: string) => {
		form.value = {
			...form.value,
			affiantHerosheet: content
		};
	};

	const handleHerosheetChange = (e: Event) => {
		const textarea = e.target as HTMLTextAreaElement;
		form.value = {
			...form.value,
			affiantHerosheet: textarea.value
		};
	};
</script>

<div class="flex justify-between">
	<Heading tag="h2" class="text-primary-700 dark:text-primary-500">Warrant Setup</Heading>
	<Button color="red" onclick={handleFormReset}>Reset Form</Button>
</div>

<div class="grid grid-cols-3 gap-4 pt-2.5">
	<Label class="grid gap-2.5">
		Warrant Type
		<Select
			id="warrantType"
			bind:value={form.value.warrantType}
			color={form.value.errors?.warrantType ? 'red' : 'gray'}
		>
			{#each Object.entries(groupedWarrants) as [group, warrants]}
				<optgroup label={group}>
					{#each warrants as warrant}
						<option value={warrant.value}>{warrant.label}</option>
					{/each}
				</optgroup>
			{/each}
		</Select>
		{#if form.value.errors?.warrantType}
			<Helper color="red">{form.value.errors.warrantType}</Helper>
		{:else}
			<Helper color="default">&nbsp;</Helper>
		{/if}
	</Label>
	<Label class="grid gap-2.5">
		Incident Number
		<Input
			placeholder="Incident Number"
			name="incidentNumber"
			bind:value={form.value.incidentNumber}
			color={form.value.errors?.incidentNumber ? 'red' : 'gray'}
		/>
		{#if form.value.errors?.incidentNumber}
			<Helper color="red">{form.value.errors.incidentNumber}</Helper>
		{:else}
			<Helper color="default">&nbsp;</Helper>
		{/if}
	</Label>
	<Label class="grid gap-2.5">
		Charge Code
		<Input
			placeholder="Charge Code"
			name="chargeCode"
			bind:value={form.value.chargeCode}
			color={form.value.errors?.chargeCode ? 'red' : 'gray'}
		/>
		{#if form.value.errors?.chargeCode}
			<Helper color="red">{form.value.errors.chargeCode}</Helper>
		{:else}
			<Helper color="default">&nbsp;</Helper>
		{/if}
	</Label>
</div>

<div class="grid grid-cols-3 gap-4 pt-2.5">
	<Label class="grid gap-2.5">
		Judicial State
		<Input
			placeholder="Judicial State"
			name="judicialState"
			bind:value={form.value.judicialState}
			color={form.value.errors?.judicialState ? 'red' : 'gray'}
		/>
		{#if form.value.errors?.judicialState}
			<Helper color="red">{form.value.errors.judicialState}</Helper>
		{:else}
			<Helper color="default">&nbsp;</Helper>
		{/if}
	</Label>
	<Label class="grid gap-2.5">
		Judicial County
		<Input
			placeholder="Judicial County"
			name="judicialCounty"
			bind:value={form.value.judicialCounty}
			color={form.value.errors?.judicialCounty ? 'red' : 'gray'}
		/>
		{#if form.value.errors?.judicialCounty}
			<Helper color="red">{form.value.errors.judicialCounty}</Helper>
		{:else}
			<Helper color="default">&nbsp;</Helper>
		{/if}
	</Label>
	<Label class="grid gap-2.5">
		Judicial Judge
		<Input
			placeholder="Judicial Judge"
			name="judicialJudge"
			bind:value={form.value.judicialJudge}
			color={form.value.errors?.judicialJudge ? 'red' : 'gray'}
		/>
		{#if form.value.errors?.judicialJudge}
			<Helper color="red">{form.value.errors.judicialJudge}</Helper>
		{:else}
			<Helper color="default">&nbsp;</Helper>
		{/if}
	</Label>
</div>
<div class="grid grid-cols-3 gap-4">
	<Label class="grid gap-2.5">
		Affiant's Title
		<Input
			placeholder="Title"
			name="affiantTitle"
			bind:value={form.value.affiantTitle}
			color={form.value.errors?.affiantTitle ? 'red' : 'gray'}
		/>
		{#if form.value.errors?.affiantTitle}
			<Helper color="red">{form.value.errors.affiantTitle}</Helper>
		{:else}
			<Helper color="default">&nbsp;</Helper>
		{/if}
	</Label>
	<Label class="grid gap-2.5">
		Affiant's First Name
		<Input
			placeholder="First Name"
			name="affiantFirstName"
			bind:value={form.value.affiantFirstName}
			color={form.value.errors?.affiantFirstName ? 'red' : 'gray'}
		/>
		{#if form.value.errors?.affiantFirstName}
			<Helper color="red">{form.value.errors.affiantFirstName}</Helper>
		{:else}
			<Helper color="default">&nbsp;</Helper>
		{/if}
	</Label>
	<Label class="grid gap-2.5">
		Affiant's Last Name
		<Input
			placeholder="Last Name"
			name="affiantLastName"
			bind:value={form.value.affiantLastName}
			color={form.value.errors?.affiantLastName ? 'red' : 'gray'}
		/>
		{#if form.value.errors?.affiantLastName}
			<Helper color="red">{form.value.errors.affiantLastName}</Helper>
		{:else}
			<Helper color="default">&nbsp;</Helper>
		{/if}
	</Label>
</div>

<div class="grid">
	<Label class="grid gap-2.5">
		Affiant's Department
		<Input
			placeholder="Department"
			name="affiantDepartment"
			bind:value={form.value.affiantDepartment}
			color={form.value.errors?.affiantDepartment ? 'red' : 'gray'}
		/>
		{#if form.value.errors?.affiantDepartment}
			<Helper color="red">{form.value.errors.affiantDepartment}</Helper>
		{:else}
			<Helper color="default">&nbsp;</Helper>
		{/if}
	</Label>
</div>

<div class="grid gap-2.5">
	<Label class="grid gap-2.5">Hero Sheet</Label>
	<div class="mb-2 flex gap-2">
		{#each savedHeroSheets as sheet}
			<Button onclick={() => updateHerosheet(sheet.content)}>
				{sheet.title}
			</Button>
		{/each}
	</div>
	<Textarea
		bind:this={textareas[0]}
		value={form.value.affiantHerosheet}
		oninput={handleHerosheetChange}
		onkeydown={handleTextareaInput}
		color={form.value.errors?.affiantHerosheet ? 'red' : 'gray'}
	/>
	{#if form.value.errors?.affiantHerosheet}
		<Helper color="red">{form.value.errors.affiantHerosheet}</Helper>
	{:else}
		<Helper color="default">&nbsp;</Helper>
	{/if}
</div>

<div class="grid pt-4">
	<Button color="green" onclick={handleForm}>Next</Button>
</div>
