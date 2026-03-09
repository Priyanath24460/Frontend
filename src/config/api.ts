/**
 * Centralised API endpoint configuration.
 * All frontend components should import from here — never hard-code URLs.
 */

const BACKEND_PORT = 8011;
const BACKEND_HOST = 'http://localhost';
export const BACKEND_BASE = `${BACKEND_HOST}:${BACKEND_PORT}`;

export const API = {
    RAG: `${BACKEND_BASE}/api/rag`,
    ANALYSIS: `${BACKEND_BASE}/api/analysis`,
    SEARCH: `${BACKEND_BASE}/api/search`,
    DOCUMENTS: `${BACKEND_BASE}/api/documents`,
} as const;

export default API;
