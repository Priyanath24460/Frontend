// API Configuration
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
