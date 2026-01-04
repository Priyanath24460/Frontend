// API Configuration
const FR_API_URL = import.meta.env.VITE_FR_API_URL || 'http://localhost:8016';
const SECONDARY_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CONTRACT_API_URL = import.meta.env.VITE_CONTRACT_API_URL || 'http://localhost:8006';
const LEGAL_SUMMARIZER_API_URL = import.meta.env.VITE_LEGAL_SUMMARIZER_API_URL || 'http://localhost:8011';

// Lightweight client helpers for the frontend to call backend analysis endpoints
export const AnalysisAPI = {
	 uploadContractWithCases: async (file, options = {}) => {
		 const fd = new FormData();
		 fd.append('file', file);
		 fd.append('options', JSON.stringify(options));

		 const res = await fetch(`${FR_API_URL}/analysis/comprehensive`, {
			 method: 'POST',
			 body: fd,
		 });

		 if (!res.ok) {
			 const text = await res.text().catch(() => '');
			 throw new Error(text || `Upload failed with status ${res.status}`);
		 }

		 return res.json();
	 },
	 screenFRViolations: async (file) => {
		 const fd = new FormData();
		 fd.append('file', file);

		 const res = await fetch(`${FR_API_URL}/screen`, {
			 method: 'POST',
			 body: fd,
		 });

		 if (!res.ok) {
			 const text = await res.text().catch(() => '');
			 throw new Error(text || `Screening failed with status ${res.status}`);
		 }

		 return res.json();
	 },
	 screenScenario: async (scenario) => {
		 const res = await fetch(`${FR_API_URL}/screen-scenario`, {
			 method: 'POST',
			 headers: {
				 'Content-Type': 'application/json',
			 },
			 body: JSON.stringify({ scenario }),
		 });

		 if (!res.ok) {
			 const text = await res.text().catch(() => '');
			 throw new Error(text || `Screening failed with status ${res.status}`);
		 }

		 return res.json();
	 }
 };

// Export secondary API instance for localhost:5000 (LegalcaseBackend)
export const SecondaryAPI = {
	// Case Management Endpoints
	uploadPDF: async (file) => {
		const fd = new FormData();
		fd.append('pdf', file);

		const res = await fetch(`${SECONDARY_API_URL}/api/cases/upload`, {
			method: 'POST',
			body: fd,
		});

		if (!res.ok) {
			const text = await res.text().catch(() => '');
			throw new Error(text || `PDF upload failed with status ${res.status}`);
		}

		return res.json();
	},

	previewPDF: async (file) => {
		const fd = new FormData();
		fd.append('pdf', file);

		const res = await fetch(`${SECONDARY_API_URL}/api/cases/preview`, {
			method: 'POST',
			body: fd,
		});

		if (!res.ok) {
			const text = await res.text().catch(() => '');
			throw new Error(text || `PDF preview failed with status ${res.status}`);
		}

		return res.json();
	},

	previewText: async (text, fileName) => {
		const res = await fetch(`${SECONDARY_API_URL}/api/cases/preview-text`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ text, fileName }),
		});

		if (!res.ok) {
			const errorText = await res.text().catch(() => '');
			throw new Error(errorText || `Text preview failed with status ${res.status}`);
		}

		return res.json();
	},

	confirmPDF: async (previewData, approvedMetadata) => {
		const res = await fetch(`${SECONDARY_API_URL}/api/cases/confirm`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				previewId: previewData.previewId,
				filePath: previewData.filePath,
				fileName: previewData.fileName,
				text: previewData.text,
				isTextInput: previewData.isTextInput,
				approvedMetadata,
			}),
		});

		if (!res.ok) {
			const text = await res.text().catch(() => '');
			throw new Error(text || `PDF confirmation failed with status ${res.status}`);
		}

		return res.json();
	},

	// Query Endpoint
	searchQuestion: async (question) => {
		const res = await fetch(`${SECONDARY_API_URL}/api/query`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ question }),
		});

		if (!res.ok) {
			const text = await res.text().catch(() => '');
			throw new Error(text || `Search query failed with status ${res.status}`);
		}

		return res.json();
	},
};

// Contract Analysis API (port 8000)
export const ContractAPI = {
	analyzeClauses: async (file) => {
		const fd = new FormData();
		fd.append('file', file);

		const res = await fetch(`${CONTRACT_API_URL}/analyze-clauses`, {
			method: 'POST',
			body: fd,
		});

		if (!res.ok) {
			const text = await res.text().catch(() => '');
			throw new Error(text || `Clause analysis failed with status ${res.status}`);
		}

		return res.json();
	},

	analyzeContractRisks: async (file) => {
		const fd = new FormData();
		fd.append('file', file);

		const res = await fetch(`${CONTRACT_API_URL}/analyze-contract-risks`, {
			method: 'POST',
			body: fd,
		});

		if (!res.ok) {
			const text = await res.text().catch(() => '');
			throw new Error(text || `Risk analysis failed with status ${res.status}`);
		}

		return res.json();
	},

	analyzeContractWithCases: async (file) => {
		const fd = new FormData();
		fd.append('file', file);

		const res = await fetch(`${CONTRACT_API_URL}/analyze-contract-with-cases`, {
			method: 'POST',
			body: fd,
		});

		if (!res.ok) {
			const text = await res.text().catch(() => '');
			throw new Error(text || `Contract analysis failed with status ${res.status}`);
		}

		return res.json();
	},
};

export default FR_API_URL;
export { SECONDARY_API_URL, CONTRACT_API_URL, LEGAL_SUMMARIZER_API_URL };
