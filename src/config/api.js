// API Configuration
const FR_API_URL = import.meta.env.VITE_FR_API_URL || 'http://localhost:8016';
const SECONDARY_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CONTRACT_API_URL = import.meta.env.VITE_CONTRACT_API_URL || 'http://localhost:8010';  // analyze-contract service
const LEGAL_SUMMARIZER_API_URL = import.meta.env.VITE_LEGAL_SUMMARIZER_API_URL || 'http://localhost:8011';

// Lightweight client helpers for the frontend to call backend analysis endpoints
const API_URL = '';

async function handleResponse(res){
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if(!res.ok){
    const msg = isJson ? (data.error || JSON.stringify(data)) : data;
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return data;
}

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

// Contract Analysis API (port 8010)
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

	/**
	 * Single-call comprehensive analysis: patterns + cases + acts.
	 * Accepts either a File object (PDF) or a plain text string.
	 * Hits the /upload-contract-comprehensive endpoint on analyze-contract service (port 8010).
	 */
	uploadContractComprehensive: async (fileOrText, params = {}) => {
		const fd = new FormData();

		if (typeof fileOrText === 'string') {
			// Raw contract text
			fd.append('text', fileOrText);
		} else {
			// PDF file
			fd.append('file', fileOrText);
		}

		const queryParts = [];
		if (params.top_k_cases != null) queryParts.push(`top_k_cases=${params.top_k_cases}`);
		if (params.top_k_acts != null) queryParts.push(`top_k_acts=${params.top_k_acts}`);
		if (params.top_k_patterns != null) queryParts.push(`top_k_patterns=${params.top_k_patterns}`);
		if (params.pattern_threshold != null) queryParts.push(`pattern_threshold=${params.pattern_threshold}`);
		if (params.use_bert_support != null) queryParts.push(`use_bert_support=${params.use_bert_support}`);
		if (params.bert_model_id != null) queryParts.push(`bert_model_id=${encodeURIComponent(params.bert_model_id)}`);
		if (params.bert_top_k != null) queryParts.push(`bert_top_k=${params.bert_top_k}`);
		if (params.use_simple_english != null) queryParts.push(`use_simple_english=${params.use_simple_english}`);
		if (params.simple_english_model_id != null) queryParts.push(`simple_english_model_id=${encodeURIComponent(params.simple_english_model_id)}`);
		if (params.simple_english_max_new_tokens != null) queryParts.push(`simple_english_max_new_tokens=${params.simple_english_max_new_tokens}`);
		const qs = queryParts.length ? `?${queryParts.join('&')}` : '';

		let res = await fetch(`${CONTRACT_API_URL}/upload-contract-comprehensive${qs}`, {
			method: 'POST',
			body: fd,
		});

		// Fallback: if URL is misconfigured to another service, retry analyze-contract default.
		if (res.status === 404 && CONTRACT_API_URL !== 'http://localhost:8010') {
			const fallbackFd = new FormData();
			if (typeof fileOrText === 'string') {
				fallbackFd.append('text', fileOrText);
			} else {
				fallbackFd.append('file', fileOrText);
			}

			res = await fetch(`http://localhost:8010/upload-contract-comprehensive${qs}`, {
				method: 'POST',
				body: fallbackFd,
			});
		}

		if (!res.ok) {
			const text = await res.text().catch(() => '');
			throw new Error(text || `Comprehensive analysis failed with status ${res.status}`);
		}

		return res.json();
	},
  uploadContract: async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API_URL}/analyze-contract-risks`, { method: 'POST', body: fd });
    return handleResponse(res);
  },
  preprocessText: async (text, contract_type) => {
    const res = await fetch(`${API_URL}/preprocess-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, contract_type })
    });
    return handleResponse(res);
  },
  detectType: async (text) => {
    const res = await fetch(`${API_URL}/detect-contract-type`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return handleResponse(res);
  },
  // eslint-disable-next-line no-dupe-keys
  analyzeClauses: async (text) => {
    const res = await fetch(`${API_URL}/analyze-clauses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return handleResponse(res);
  },
  uploadContractWithCases: async (file, options = {}) => {
    const fd = new FormData();
    fd.append('file', file);
    Object.entries(options).forEach(([k, v]) => fd.append(k, v));
    const res = await fetch(`${API_URL}/upload-contract-with-cases`, { method: 'POST', body: fd });
    return handleResponse(res);
  },
  health: async () => handleResponse(await fetch(`${API_URL}/health`))
};

export default API_URL;
