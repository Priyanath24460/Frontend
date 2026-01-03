// API Configuration
const FR_API_URL = import.meta.env.VITE_FR_API_URL || 'http://localhost:8016';
const SECONDARY_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

// Export secondary API instance for localhost:5000
export const SecondaryAPI = {
	// Add methods here for endpoints on the secondary backend
	// Example:
	// getResource: async (id) => {
	//   const res = await fetch(`${SECONDARY_API_URL}/resource/${id}`);
	//   if (!res.ok) throw new Error(`Failed with status ${res.status}`);
	//   return res.json();
	// }
};

export default FR_API_URL;
export { SECONDARY_API_URL };
