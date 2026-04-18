/**
 * Centralised API endpoint configuration.
 * All frontend components should import from here — never hard-code URLs.
 */

const FALLBACK_BACKEND_BASE =
    typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.hostname}:8011`
        : 'http://localhost:8011';
const viteApiUrl = (import.meta as any).env?.VITE_SUMMARIZER_API_URL as string | undefined;
export const BACKEND_BASE =
    viteApiUrl || FALLBACK_BACKEND_BASE;

// Legacy aliases used by older components.
export const API_URL = BACKEND_BASE;
export const SECONDARY_API_URL =
    (import.meta as any).env?.VITE_FR_API_URL || BACKEND_BASE;

export const API = {
    RAG: `${BACKEND_BASE}/api/rag`,
    ANALYSIS: `${BACKEND_BASE}/api/analysis`,
    SEARCH: `${BACKEND_BASE}/api/search`,
    DOCUMENTS: `${BACKEND_BASE}/api/documents`,
} as const;

export default API;
