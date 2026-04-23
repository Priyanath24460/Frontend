import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API } from "../../config/api";
import { ScaleIcon, BookOpenIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import "./RelatedCases.css";


interface SimilarCase {
  document_id: number;
  file_name: string;
  title: string;
  citation?: string;
  court: string;
  year: number;
  similarity_score: number;
  weighted_score: number;
  binding: boolean;
  court_weight: number;
  recency: number | null;
  source?: string;
  /** When data/corpus_google_drive_map.json is deployed with the backend */
  drive_view_url?: string | null;
  drive_file_id?: string | null;
}

interface CorpusCaseData {
  file_name: string;
  case_name: string;
  citation: string;
  court: string;
  year: number | null;
  source: string;
  text: string;
  text_length: number;
  drive_view_url?: string | null;
  drive_download_url?: string | null;
  drive_only?: boolean;
  notice?: string;
}

interface RelatedCasesProps {
  documentId: number | null;
  topK?: number;
  minSimilarity?: number;
}

const RelatedCases: React.FC<RelatedCasesProps> = ({
  documentId,
  topK = 5,
  minSimilarity = 0.3,
}) => {
  const [similarCases, setSimilarCases] = useState<SimilarCase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceDocument, setSourceDocument] = useState<any>(null);
  /** Backend local NLR/SLR index (combined_legal_cases.json); 0 means rebuild or sync PDFs locally. */
  const [corpusIndexSize, setCorpusIndexSize] = useState<number | null>(null);
  const [corpusJsonFound, setCorpusJsonFound] = useState<boolean | null>(null);

  // Corpus case reader state
  const [readerCase, setReaderCase] = useState<CorpusCaseData | null>(null);
  const [readerLoading, setReaderLoading] = useState<string | null>(null); // file_name being loaded
  const [readerError, setReaderError] = useState<string | null>(null);

  useEffect(() => {
    if (documentId == null || documentId <= 0) {
      setSimilarCases([]);
      setLoading(false);
      return;
    }
    setSimilarCases([]); // clear previous document's cases immediately
    fetchSimilarCases();
  }, [documentId, topK, minSimilarity]);

  const fetchSimilarCases = async () => {
    if (documentId == null || documentId <= 0) return;
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API.ANALYSIS}/similar-cases/${documentId}`, {
        params: { top_k: topK, min_similarity: minSimilarity },
      });
      const d = response.data;
      setSimilarCases(d.similar_cases || []);
      setSourceDocument(d.source_document);
      const idx =
        typeof d.corpus_index_size === "number"
          ? d.corpus_index_size
          : typeof (d as { corpusIndexSize?: number }).corpusIndexSize === "number"
            ? (d as { corpusIndexSize: number }).corpusIndexSize
            : null;
      const jf =
        typeof d.corpus_json_found === "boolean"
          ? d.corpus_json_found
          : typeof (d as { corpusJsonFound?: boolean }).corpusJsonFound === "boolean"
            ? (d as { corpusJsonFound: boolean }).corpusJsonFound
            : null;
      setCorpusIndexSize(idx);
      setCorpusJsonFound(jf);
    } catch (err: any) {
      console.error("Error fetching similar cases:", err);
      setError(err.response?.data?.detail || "Failed to load similar cases");
    } finally {
      setLoading(false);
    }
  };

  const openCorpusReader = async (fileName: string) => {
    // If already open for same case, close it
    if (readerCase?.file_name?.toLowerCase() === fileName.toLowerCase()) {
      setReaderCase(null);
      return;
    }
    setReaderLoading(fileName);
    setReaderError(null);
    try {
      const response = await axios.get(`${API.ANALYSIS}/corpus-case`, {
        params: { file_name: fileName },
      });
      setReaderCase(response.data);
    } catch (err: any) {
      setReaderError(err.response?.data?.detail || "Failed to load case text");
    } finally {
      setReaderLoading(null);
    }
  };

  const getCourtColor = (court: string): string => {
    const c = court.toLowerCase();
    if (c.includes("supreme"))   return "#8B0000";
    if (c.includes("appeal"))    return "#FF6B6B";
    if (c.includes("high"))      return "#4ECDC4";
    if (c.includes("district"))  return "#95E1D3";
    return "#6C757D";
  };

  const getAuthorityBadge = (isBinding: boolean) => isBinding ? (
    <span className="authority-badge binding">
      <ScaleIcon className="w-4 h-4 inline-block" style={{ verticalAlign: 'middle' }} />
      {' '}Binding
    </span>
  ) : (
    <span className="authority-badge persuasive">
      <BookOpenIcon className="w-4 h-4 inline-block" style={{ verticalAlign: 'middle' }} />
      {' '}Persuasive
    </span>
  );

  const formatPercentage = (value: number | null): string => {
    if (value === null || value === undefined) return "N/A";
    return `${value.toFixed(1)}%`;
  };

  const getSimilarityColor = (score: number): string => {
    if (score >= 80) return "#2ECC71";
    if (score >= 60) return "#F39C12";
    if (score >= 40) return "#E67E22";
    return "#95A5A6";
  };

  if (loading) return (
    <div className="related-cases-container">
      <h3 className="related-cases-title">🔗 Related Cases</h3>
      <div className="loading-spinner"><div className="spinner"></div><p>Finding similar cases from NLR/SLR corpus...</p></div>
    </div>
  );

  if (error) return (
    <div className="related-cases-container">
      <h3 className="related-cases-title">🔗 Related Cases</h3>
      <div className="error-message"><ExclamationTriangleIcon className="w-6 h-6 text-red-500" /><p>{error}</p></div>
    </div>
  );

  if (similarCases.length === 0) {
    const corpusEmpty =
      corpusIndexSize === 0 || corpusJsonFound === false;
    /** Older or proxied APIs may omit corpus fields — often means the UI is not calling your local backend. */
    const corpusMetaUnknown =
      corpusIndexSize == null && corpusJsonFound == null;
    return (
      <div className="related-cases-container">
        <h3 className="related-cases-title">🔗 Related Cases</h3>
        <div className="no-cases-message">
          <InformationCircleIcon className="w-6 h-6 text-blue-500" />
          {corpusEmpty ? (
            <>
              <p>
                The NLR/SLR case index is missing or empty on this server. Related matching uses{" "}
                <code>data/processed/combined_legal_cases.json</code> (built once from PDFs). Google Drive is
                not queried at runtime for similarity.
              </p>
              <p style={{ marginTop: "0.75rem", fontSize: "0.9rem" }}>
                <strong>Hosted workflow:</strong> (1) Build the text index in CI or locally and ship{" "}
                <code>combined_legal_cases.json</code> with your backend image or volume. (2) Run{" "}
                <code>python backend/scripts/list_gdrive_pdfs_recursive.py</code> once, then deploy{" "}
                <code>data/corpus_google_drive_map.json</code> so &quot;Open PDF&quot; resolves Drive file IDs
                by filename.
              </p>
              <p style={{ marginTop: "0.75rem", fontSize: "0.9rem" }}>
                Optional local build: sync{" "}
                <a
                  href="https://drive.google.com/drive/folders/17rxYz3UwcK3ecNb_BKSE4qAKo7a0tRR4?usp=drive_link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Drive
                </a>{" "}
                to <code>data/raw_documents/</code> (<code>NLR_All_Volumes all</code>, <code>SLR_Downloads</code>
                ), then:
              </p>
              <pre
                style={{
                  marginTop: "0.5rem",
                  padding: "0.75rem",
                  background: "#f4f4f5",
                  borderRadius: 6,
                  fontSize: "0.8rem",
                  overflow: "auto",
                }}
              >
                python backend/scripts/build_combined_corpus_from_raw.py
              </pre>
              <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#57534e" }}>
                Restart the backend after updating JSON files.
              </p>
            </>
          ) : corpusMetaUnknown ? (
            <div>
              <p>
                The API did not report corpus status (older server, proxy, or wrong base URL). Upload and
                Related Cases both use <code>VITE_SUMMARIZER_API_URL</code> from{" "}
                <code>.env.development</code>.
              </p>
              <p style={{ marginTop: "0.75rem", fontSize: "0.9rem" }}>
                For local work, point it at the same host as uvicorn (for example{" "}
                <code>http://127.0.0.1:8011</code>), then <strong>restart the Vite dev server</strong> so
                the env file is re-read.
              </p>
            </div>
          ) : (
            <p>No similar cases found in the NLR/SLR corpus.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="related-cases-container">
      <div className="related-cases-header">
        <h3 className="related-cases-title">🔗 Related Cases</h3>
        {sourceDocument && (
          <div className="source-document-info">
            <span className="source-label">Source:</span>
            <span className="source-title">{sourceDocument.title}</span>
          </div>
        )}
      </div>

      <div className="similar-cases-count">
        Found <strong>{similarCases.length}</strong> similar case{similarCases.length !== 1 ? "s" : ""} from the official NLR/SLR corpus
      </div>

      <div className="similar-cases-list">
        {similarCases.map((similarCase, index) => {
          const isCorpus = similarCase.document_id === -1;
          const isThisReaderOpen = readerCase?.file_name?.toLowerCase() === similarCase.file_name?.toLowerCase();
          const isThisLoading = readerLoading === similarCase.file_name;

          return (
            <div key={index} className="similar-case-card">
              <div className="case-rank">#{index + 1}</div>

              <div className="case-content">
                <div className="case-header">
                  <h4 className="case-title">{similarCase.title}</h4>
                  {getAuthorityBadge(similarCase.binding)}
                </div>

                <div style={{ fontSize: '0.8rem', color: '#92400e', fontStyle: 'italic', marginBottom: 4 }}>
                  📋 {similarCase.citation || '—'}
                </div>

                <div className="case-metadata">
                  <span className="case-court" style={{ backgroundColor: getCourtColor(similarCase.court), color: "white" }}>
                    {similarCase.court}
                  </span>
                  <span className="case-year">📅 {similarCase.year ?? '—'}</span>
                  {isCorpus && (
                    <span style={{ fontSize: '0.75rem', background: '#f59e0b22', color: '#92400e', padding: '2px 8px', borderRadius: 8, border: '1px solid #f59e0b' }}>
                      📚 NLR/SLR Corpus
                    </span>
                  )}
                </div>

                <div className="similarity-metrics">
                  <div className="metric">
                    <span className="metric-label">Similarity:</span>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{ width: `${similarCase.similarity_score}%`, backgroundColor: getSimilarityColor(similarCase.similarity_score) }}></div>
                    </div>
                    <span className="metric-value">{formatPercentage(similarCase.similarity_score)}</span>
                  </div>
                </div>

                <div className="case-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {isCorpus ? (
                    <>
                      <button
                        className="view-case-btn"
                        style={{ background: isThisReaderOpen ? '#92400e' : '#b45309', cursor: 'pointer' }}
                        onClick={() => openCorpusReader(similarCase.file_name)}
                        disabled={isThisLoading}
                      >
                        {isThisLoading ? '⏳ Loading...' : isThisReaderOpen ? '▲ Close Case' : '📖 Read Case'}
                      </button>
                      <button
                        className="view-case-btn"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: '#0d9488',
                          color: '#fff',
                          padding: '8px 14px',
                          borderRadius: 8,
                          fontWeight: 600,
                          fontSize: 13,
                          textDecoration: 'none',
                          boxShadow: '0 2px 6px rgba(13,148,136,0.3)',
                        }}
                        onClick={async () => {
                          const direct = similarCase.drive_view_url?.trim();
                          if (direct) {
                            window.open(direct, '_blank', 'noopener,noreferrer');
                            return;
                          }
                          try {
                            const win = window.open('', '_blank');
                            win?.document.write('Loading PDF...');
                            const res = await axios.get(`${API.DOCUMENTS}/past-case-pdf`, {
                              params: { path: similarCase.file_name },
                            });
                            const url = res.data.url;
                            if (url) {
                              win!.location.href = url;
                            } else {
                              win?.close();
                              alert('PDF link not found.');
                            }
                          } catch (err) {
                            alert('Failed to fetch PDF link. Deploy data/corpus_google_drive_map.json on the server or run list_gdrive_pdfs_recursive.py.');
                          }
                        }}
                      >
                        <DocumentArrowDownIcon className="w-4 h-4" />
                        Open PDF
                      </button>
                    </>
                  ) : (
                    // User-uploaded document: navigate to its analysis page
                    <Link to={`/case-summarizer/${similarCase.document_id}`} className="view-case-btn">
                      View Analysis →
                    </Link>
                  )}
                </div>

                {/* ── Inline Case Reader ──────────────────────────────────── */}
                {isThisReaderOpen && readerCase && (
                  <div style={{
                    marginTop: 12,
                    background: '#fffbeb',
                    border: '1px solid #f59e0b',
                    borderRadius: 10,
                    padding: '16px',
                    maxHeight: '420px',
                    overflowY: 'auto',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#78350f', fontSize: '0.95rem' }}>{readerCase.case_name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#92400e' }}>
                          {readerCase.citation} · {readerCase.court} · {readerCase.year ?? '—'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#a16207', marginTop: 2 }}>
                          📚 Source: {readerCase.source}
                          {readerCase.text_length > 0
                            ? ` · ${readerCase.text_length.toLocaleString()} characters`
                            : ""}
                        </div>
                      </div>
                      <button
                        onClick={() => setReaderCase(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e' }}
                        title="Close reader"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                    {readerCase.drive_only || !readerCase.text?.trim() ? (
                      <div style={{ fontSize: "0.9rem", color: "#44403c", lineHeight: 1.6 }}>
                        {readerCase.notice && <p style={{ marginBottom: 12 }}>{readerCase.notice}</p>}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                          {readerCase.drive_view_url && (
                            <a
                              href={readerCase.drive_view_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="view-case-btn"
                              style={{ background: "#0d9488", color: "#fff", padding: "8px 14px", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}
                            >
                              Open in Google Drive
                            </a>
                          )}
                          {readerCase.drive_download_url && (
                            <a
                              href={readerCase.drive_download_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="view-case-btn"
                              style={{ background: "#0369a1", color: "#fff", padding: "8px 14px", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}
                            >
                              Download PDF
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <pre style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontSize: '0.82rem',
                        lineHeight: 1.6,
                        color: '#1c1917',
                        fontFamily: 'Georgia, serif',
                        margin: 0,
                      }}>
                        {readerCase.text}
                      </pre>
                    )}
                  </div>
                )}

                {/* Reader error */}
                {readerError && isThisLoading === null && (
                  <div style={{ marginTop: 8, color: '#dc2626', fontSize: '0.82rem' }}>
                    ⚠️ {readerError}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="related-cases-footer">
        <p className="footer-note">
          💡 <strong>Note:</strong> Cases ranked by legal keyword similarity. Use <strong>📖 Read Case</strong> for text inline or <strong>Open PDF</strong> to open the judgment PDF in a new tab.
        </p>
      </div>
    </div>
  );
};

export default RelatedCases;
