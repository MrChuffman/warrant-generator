<script lang="ts">
	import { goto } from '$app/navigation';
	import { createStorage } from '$lib/utils/localStorage.svelte';
	import {
		Heading,
		Input,
		Label,
		Textarea,
		Button,
		Accordion,
		AccordionItem
	} from 'svelte-5-ui-lib';

	import { handleTextareaInput } from '$lib/utils/helpers.svelte';

	interface HeroSheet {
		title: string;
		content: string;
	}

	interface AffiantForm {
		affiantTitle: string;
		affiantFirstName: string;
		affiantLastName: string;
		affiantDepartment: string;
		affiantHerosheet: HeroSheet[];
	}

	const storage = createStorage();
	const form = storage.reactive<AffiantForm>('affiant', {
		affiantTitle: '',
		affiantFirstName: '',
		affiantLastName: '',
		affiantDepartment: '',
		affiantHerosheet: []
	});

	let textareas = $state<HTMLTextAreaElement[]>([]);

	$effect(() => {
		textareas.forEach((textarea) => adjustTextareaHeight(textarea));
	});

	const handleForm = () => {
		goto('/');
	};

	const handleAddHerosheet = () => {
		form.value = {
			...form.value,
			affiantHerosheet: [
				...form.value.affiantHerosheet,
				{
					title: '',
					content: ''
				}
			]
		};
	};

	const handleDeleteHerosheet = (index: number) => {
		if (confirm('Are you sure you want to delete this hero sheet?')) {
			form.value = {
				...form.value,
				affiantHerosheet: form.value.affiantHerosheet.filter((_, i) => i !== index)
			};
			textareas = textareas.filter((_, i) => i !== index);
		}
	};

	const updateHerosheetTitle = (index: number, title: string) => {
		form.value = {
			...form.value,
			affiantHerosheet: form.value.affiantHerosheet.map((sheet, i) =>
				i === index ? { ...sheet, title } : sheet
			)
		};
	};

	const updateHerosheetContent = (index: number, content: string) => {
		form.value = {
			...form.value,
			affiantHerosheet: form.value.affiantHerosheet.map((sheet, i) =>
				i === index ? { ...sheet, content } : sheet
			)
		};
	};
</script>

<Heading tag="h2" class="text-primary-700 dark:text-primary-500">Your Setup</Heading>

<div class="grid grid-cols-3 gap-4 pt-2.5">
	<Label class="grid gap-2.5">
		Affiant's Title
		<Input placeholder="Title" name="affiantTitle" bind:value={form.value.affiantTitle} />
	</Label>
	<Label class="grid gap-2.5">
		Affiant's First Name
		<Input
			placeholder="First Name"
			name="affiantFirstName"
			bind:value={form.value.affiantFirstName}
		/>
	</Label>
	<Label class="grid gap-2.5">
		Affiant's Last Name
		<Input placeholder="Last Name" name="affiantLastName" bind:value={form.value.affiantLastName} />
	</Label>
</div>

<div class="grid pt-2.5">
	<Label class="grid gap-2.5">
		Affiant's Department
		<Input
			placeholder="Department"
			name="affiantDepartment"
			bind:value={form.value.affiantDepartment}
		/>
	</Label>
</div>

<div class="grid pt-2.5">
	<Button onclick={handleAddHerosheet}>Add Hero Sheet</Button>
</div>

<div class="grid pt-2.5">
	<Accordion>
		{#each form.value.affiantHerosheet as sheet, index}
			<AccordionItem>
				{#snippet header()}
					<Button color="red" onclick={() => handleDeleteHerosheet(index)}>Delete</Button>
					<Input
						placeholder="Herosheet Title"
						class="w-[90%] border-0"
						value={sheet.title}
						oninput={(e) => updateHerosheetTitle(index, e.target.value)}
					/>
				{/snippet}
				<Textarea
					bind:this={textareas[index]}
					oninput={(e) => {
						handleTextareaInput(e);
						updateHerosheetContent(index, e.target.value);
					}}
					onkeydown={handleTextareaInput}
					value={sheet.content}
				/>
			</AccordionItem>
		{/each}
	</Accordion>
</div>

<div class="grid pt-4">
	<Button color="green" onclick={handleForm}>Save</Button>
</div>
