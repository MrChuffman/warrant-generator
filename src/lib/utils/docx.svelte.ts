import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

export const generateWordDocument = async (template, data, textareaFields) => {
	try {
		// Fetch the template
		const response = await fetch(template);
		const arrayBuffer = await response.arrayBuffer();

		// Initialize the document template
		const zip = new PizZip(arrayBuffer);
		const doc = new Docxtemplater(zip, {
			paragraphLoop: true,
			linebreaks: true
		});

		// Process each specified textarea field
		textareaFields.forEach((field) => {
			if (data[field]) {
				// Split content by new lines and format as Word-styled paragraphs
				const paragraphs = data[field].split('\n').map((line) => ({
					text: line.trim(),
					style: 'CustomParagraphStyle' // Apply a custom style
				}));
				// Replace the original field with formatted paragraphs
				data[field] = paragraphs;
			}
		});

		// Render the document with the modified data
		doc.render(data);

		// Generate the final Word document
		const buffer = doc.getZip().generate({ type: 'blob' });

		// Create a download link for the generated document
		const link = document.createElement('a');
		link.href = URL.createObjectURL(buffer);
		link.download = data.fileName || 'warrant.docx';
		link.click();
	} catch (error) {
		console.error('Error generating DOCX:', error);
	}
};
