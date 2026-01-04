// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper for contract upload and case analysis
export const AnalysisAPI = {
	async uploadContractWithCases(file, options) {
		const formData = new FormData();
		formData.append('file', file);
		if (options) {
			Object.entries(options).forEach(([key, value]) => {
				formData.append(key, value);
			});
		}
		const response = await fetch(`${API_URL}/analyze/contract`, {
			method: 'POST',
			body: formData,
		});
		if (!response.ok) {
			throw new Error('Failed to upload and analyze contract');
		}
		return response.json();
	},
};

export default API_URL;
