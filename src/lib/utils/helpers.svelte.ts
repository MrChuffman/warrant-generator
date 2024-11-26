export const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
	if (textarea) {
		textarea.style.height = 'auto';
		textarea.style.height = `${textarea.scrollHeight + 50}px`;
	}
};

export const handleTextareaInput = (
	event: Event & { target: HTMLTextAreaElement; key?: string }
) => {
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
