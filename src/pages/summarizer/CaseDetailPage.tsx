import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CaseDetailPage.css';
import Header from "../../components/Header";
import { ChevronLeftIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface CaseData {
  document_id: number;
  file_name: string;
  court: string;
  year: number;
  case_number: string;
  uploaded_at: string;
  file_path?: string; // Add this property
  text: {
    cleaned: string;
    full_length: number;
  };
  metadata: {
    has_embedding: boolean;
    embedding_dimension: number;
  };
  analysis: {
    rights_detected: number;
    citations_found: number;
    entities_extracted: number;
  };
  rights: Array<{
    article_number: number;
    matched_text: string;
    explanation_en: string;
  }>;
  citations: string[];
  entities: Record<string, Array<{ text: string; context: string }>>;
}

const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullText, setShowFullText] = useState(false);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/analysis/case/${id}`);
        
        console.log('=== CASE DETAILS API RESPONSE ===');
        console.log('Full response:', response.data);
        console.log('Analysis:', response.data.analysis);
        console.log('================================');
        
        const data = response.data;
        
        // Check if analysis is missing or empty
        const needsAnalysis = !data.analysis || 
          (data.analysis.rights_detected === 0 && 
           data.analysis.citations_found === 0 && 
           data.analysis.entities_extracted === 0);
        
        if (needsAnalysis) {
          console.log('No analysis found, fetching fresh analysis...');
          
          try {
            // Fetch fresh analysis
            const [entitiesRes, rightsRes] = await Promise.all([
            axios.get(`http://127.0.0.1:8011/api/analysis/entities/${id}`),
            axios.post(`http://127.0.0.1:8011/api/analysis/summarize/with-local-context?document_id=${id}`, {})
            ]);
            
            // Merge analysis results with case data
            data.entities = entitiesRes.data.entities || {};
            data.rights = rightsRes.data.fundamental_rights || [];
            data.citations = rightsRes.data.citations || [];
            data.analysis = {
              rights_detected: (rightsRes.data.fundamental_rights || []).length,
              citations_found: (rightsRes.data.citations || []).length,
              entities_extracted: Object.values(entitiesRes.data.entities || {})
                .reduce((acc: number, arr: any) => acc + arr.length, 0)
            };
            
            console.log('Fresh analysis fetched successfully');
          } catch (analysisError) {
            console.error('Failed to fetch fresh analysis:', analysisError);
          }
        }
        
        setCaseData(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load case');
        console.error('Error loading case:', err);
        console.error('Error response:', err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCase();
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="case-detail-loading">
          <div className="spinner"></div>
          <p>Loading case details...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="case-detail-error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="back-link flex items-center gap-1">
            <ChevronLeftIcon className="w-4 h-4" />
            Back
          </button>
        </div>
      </>
    );
  }

  if (!caseData) {
    return (
      <>
        <Header />
        <div className="case-detail-error">
          <h2>Case Not Found</h2>
          <button onClick={() => navigate(-1)} className="back-link flex items-center gap-1">
            <ChevronLeftIcon className="w-4 h-4" />
            Back
          </button>
        </div>
      </>
    );
  }

  const isPDF = caseData.file_name.endsWith('.pdf');

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50">
        <Header />
        <main className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <button onClick={() => navigate(-1)} className="back-link mb-6 flex items-center gap-1">
              <ChevronLeftIcon className="w-4 h-4" />
              Back to Cases
            </button>

            {/* Page Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full mb-6 shadow-xl">
                <svg className="w-10 h-10 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-stone-800 mb-4">{caseData.file_name}</h1>
              <div className="w-32 h-1 bg-gradient-to-r from-amber-600 to-orange-500 mx-auto"></div>
            </div>

            {/* Metadata Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mb-6 border-t-4 border-amber-500">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center mr-4 shadow-md">
                  <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-stone-800">Case Metadata</h2>
              </div>
              <div className="metadata-grid">
                <div className="metadata-item">
                  <strong>Court:</strong>
                  <span className="text-amber-700 font-semibold">{caseData.court || 'N/A'}</span>
                </div>
                <div className="metadata-item">
                  <strong>Year:</strong>
                  <span className="text-amber-700 font-semibold">{caseData.year || 'N/A'}</span>
                </div>
                <div className="metadata-item">
                  <strong>Case Number:</strong>
                  <span className="text-amber-700 font-semibold">{caseData.case_number || 'N/A'}</span>
                </div>
                <div className="metadata-item">
                  <strong>Uploaded:</strong>
                  <span className="text-amber-700 font-semibold">
                    {caseData.uploaded_at
                      ? new Date(caseData.uploaded_at).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Analysis Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mb-6 border-t-4 border-orange-500">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mr-4 shadow-md">
                  <svg className="w-6 h-6 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-stone-800">Analysis Summary</h2>
              </div>
              <div className="analysis-stats">
                <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
                  <span className="stat-value text-blue-600">{caseData.analysis.rights_detected}</span>
                  <span className="stat-label">Rights Detected</span>
                </div>
                <div className="stat-card bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
                  <span className="stat-value text-green-600">{caseData.analysis.citations_found}</span>
                  <span className="stat-label">Citations Found</span>
                </div>
                <div className="stat-card bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500">
                  <span className="stat-value text-purple-600">{caseData.analysis.entities_extracted}</span>
                  <span className="stat-label">Entities Extracted</span>
                </div>
              </div>
            </div>

            {/* Constitutional Rights */}
            {caseData.rights && caseData.rights.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mb-6 border-t-4 border-blue-500">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-stone-800">Constitutional Rights Detected</h2>
                </div>
                <div className="rights-list">
                  {caseData.rights.map((right, idx) => (
                    <div key={idx} className="right-card bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500">
                      <div className="right-header">
                        <strong className="text-blue-700 text-lg">Article {right.article_number}</strong>
                      </div>
                      <p className="right-matched text-gray-700 italic">{right.matched_text}</p>
                      <p className="right-explanation text-gray-800">{right.explanation_en}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Citations */}
            {caseData.citations && caseData.citations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mb-6 border-t-4 border-green-500">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-stone-800">Citations</h2>
                </div>
                <ul className="citations-list">
                  {caseData.citations.map((citation, idx) => (
                    <li key={idx} className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500">{citation}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Entities */}
            {caseData.entities && Object.keys(caseData.entities).length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mb-6 border-t-4 border-purple-500">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-stone-800">Extracted Entities</h2>
                </div>
                {Object.entries(caseData.entities).map(([type, entities]) => (
                  <div key={type} className="entity-group">
                    <h3 className="text-lg font-bold text-purple-700">{type.replace('_', ' ')}</h3>
                    <div className="entity-tags">
                      {entities.map((entity, idx) => (
                        <span key={idx} className="entity-tag bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border border-purple-200" title={entity.context}>
                          {entity.text}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Case Document/Text */}
            <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border-t-4 border-amber-500">
              <div className="text-header">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-stone-800">{isPDF ? 'Case Document' : 'Case Text'}</h2>
                </div>
                {!isPDF && (
                  <button
                    className="toggle-text-btn bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    onClick={() => setShowFullText(!showFullText)}
                  >
                    {showFullText ? 'Show Less' : 'Show Full Text'}
                  </button>
                )}
              </div>
              <div className="case-text-content">
                {isPDF && caseData.file_path ? (
                  <iframe
                    src={`http://127.0.0.1:8011${caseData.file_path}`}
                    className="pdf-viewer"
                    title="Case PDF"
                  />
                ) : (
                  <>
                    <pre className="bg-gradient-to-br from-gray-50 to-stone-50">{showFullText ? caseData.text.cleaned : caseData.text.cleaned.substring(0, 5000)}</pre>
                    {!showFullText && caseData.text.full_length > 5000 && (
                      <p className="text-truncated-notice">
                        Showing first 5000 characters. Click "Show Full Text" to see more.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default CaseDetailPage;
