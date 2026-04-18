// API Configuration - centralised backend URL config
const FALLBACK_BACKEND_BASE =
	typeof window !== 'undefined'
		? `${window.location.protocol}//${window.location.hostname}:8011`
		: 'http://localhost:8011';
export const BACKEND_BASE =
	import.meta.env.VITE_SUMMARIZER_API_URL || FALLBACK_BACKEND_BASE;

// Legacy aliases used by older components.
export const API_URL = BACKEND_BASE;
export const SECONDARY_API_URL =
	import.meta.env.VITE_FR_API_URL || BACKEND_BASE;

const CONTRACT_API_URL = import.meta.env.VITE_CONTRACT_API_URL || 'http://localhost:8010';  // analyze-contract service

// FR Violation Screener Backend (different port)
const BACKEND_HOST = 'http://localhost';
const FR_SCREENER_PORT = 8016;
export const FR_SCREENER_BASE = import.meta.env.VITE_FR_API_URL || `${BACKEND_HOST}:${FR_SCREENER_PORT}`;

// Pass Case Finder Backend (Scenario-Based Case Finder - DigitalOcean domain)
export const PAST_CASE_API_URL = "https://www.pastcasebackend.me";
// Fallback: https://identify-functional-capital-behavioral.trycloudflare.com
// Local dev: http://localhost:5000

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
		const response = await fetch(`${CONTRACT_API_URL}/upload-contract-comprehensive`, {
			method: 'POST',
			body: formData,
		});
		if (!response.ok) {
			throw new Error('Failed to upload and analyze contract');
		}
		return response.json();
	},

	async generateAiRiskReport(analysisData) {
		const response = await fetch(`${CONTRACT_API_URL}/generate-ai-risk-report`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(analysisData),
		});
		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			throw new Error(error.detail || 'Failed to generate AI risk report');
		}
		return response.json();
	},

	async screenScenario(scenario) {
		const response = await fetch(`${FR_SCREENER_BASE}/screen-scenario`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ scenario }),
		});
		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			throw new Error(error.detail || 'Failed to screen scenario');
		}
		return response.json();
	},
};

export default API;
