// API Configuration — centralised backend URL config
const BACKEND_PORT = 8011;
const BACKEND_HOST = 'http://localhost';
export const BACKEND_BASE = `${BACKEND_HOST}:${BACKEND_PORT}`;

// Named export used by RAGResultsPage, CaseChatPanel, SearchInterface, etc.
export const API = {
	RAG: `${BACKEND_BASE}/api/rag`,
	ANALYSIS: `${BACKEND_BASE}/api/analysis`,
	SEARCH: `${BACKEND_BASE}/api/search`,
	DOCUMENTS: `${BACKEND_BASE}/api/documents`,
};

// Legacy export kept for backwards compatibility (ComprehensiveAnalysis, etc.)
export const AnalysisAPI = {
	async uploadContractWithCases(file, options) {
		const formData = new FormData();
		formData.append('file', file);
		if (options) {
			Object.entries(options).forEach(([key, value]) => {
				formData.append(key, value);
			});
		}
		const response = await fetch(`${BACKEND_BASE}/analyze/contract`, {
			method: 'POST',
			body: formData,
		});
		if (!response.ok) {
			throw new Error('Failed to upload and analyze contract');
		}
		return response.json();
	},
};

export default API;
