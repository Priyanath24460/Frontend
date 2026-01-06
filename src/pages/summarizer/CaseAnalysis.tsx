// frontend/src/pages/CaseAnalysis.tsx
import React from "react";
import DocumentUploadMUI from "../../components/summarizer/DocumentUploadMUI";
import SummaryView from "../../components/summarizer/SummaryView";
import ConstitutionalRightsHighlighter from "../../components/summarizer/ConstitutionalRightsHighlighter";
import ConstitutionalProvisionsDisplay from "../../components/summarizer/ConstitutionalProvisionsDisplay";
import LegalEntitiesDisplay from "../../components/summarizer/LegalEntitiesDisplay";
// import DocumentStructureDisplay from "../components/DocumentStructureDisplay";
import MultiLevelSummary from "../../components/summarizer/MultiLevelSummary";
import RelatedCases from "../../components/summarizer/RelatedCases";
import { DocumentTextIcon, ScaleIcon, UserGroupIcon, LinkIcon } from '@heroicons/react/24/outline';
import ExportButton from "../../components/summarizer/ExportButton";
import axios from "axios";
import Header from "../../components/Header";
import { useCaseAnalysis } from "../../contexts/CaseAnalysisContext";


interface FundamentalRight {
  article: string;
  article_title?: string;
  matched_text: string;
  explanation?: string;
  context?: string;
  method?: string;
  score?: number;
}

interface ConstitutionalProvision {
  article: string;
  matched_text: string;
  method: string;
  score: number;
  constitutional_provision?: string;
  explanation?: string;
  context?: string;
  document?: string;
}

interface StructureAnalysis {
  total_paragraphs: number;
  sections: {
    [key: string]: number;
  };
  classification_methods?: {
    [key: string]: number;
  };
}

interface CaseAnalysisProps {
  lang: string;
}

const CaseAnalysis: React.FC<CaseAnalysisProps> = ({ lang }) => {
  const {
    state,
    setSummary,
    setKeywords,
    setFundamentalRights,
    setConstitutionalProvisions,
    setStructureAnalysis,
    setAnalysisError,
    setCurrentDocumentId,
    setActiveTab,
    resetState,
  } = useCaseAnalysis();

  const handleUploadSuccess = async (doc: any) => {
    // Reset state for new upload
    resetState();
    
    setAnalysisError(null);
    setCurrentDocumentId(doc.document_id);

    // Set structure analysis from upload response
    if (doc.structure_analysis) {
      setStructureAnalysis(doc.structure_analysis);
      console.log("Document structure:", doc.structure_analysis);
    }

    try {
      // CORRECT: document_id as query parameter, not request body
      const sum = await axios.post(
        `http://127.0.0.1:8011/api/analysis/summarize/with-local-context?document_id=${doc.document_id}`,
        {}, // Empty request body
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setSummary(sum.data.summary);
      setKeywords(sum.data.keywords || []);

      // Get fundamental rights (Articles 10-18 only)
      if (sum.data.fundamental_rights) {
        setFundamentalRights(sum.data.fundamental_rights);
        console.log("Fundamental rights:", sum.data.fundamental_rights);
      }

      // NEW: Get constitutional provisions from summary response
      if (sum.data.constitutional_provisions) {
        setConstitutionalProvisions(sum.data.constitutional_provisions);
        console.log(
          "Constitutional provisions:",
          sum.data.constitutional_provisions
        );
      }
    } catch (error: any) {
      console.error("Analysis failed:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage = error.response?.data?.detail || error.message;
      setAnalysisError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full mb-6 shadow-xl">
              <svg className="w-10 h-10 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-stone-800 mb-4">Sri Lankan Case Law Summarizer</h1>
            <div className="w-32 h-1 bg-gradient-to-r from-amber-600 to-orange-500 mx-auto mb-4"></div>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6">
              Upload judgments from New Law Reports (NLR) or Sri Lanka Law Reports (SLR) for comprehensive AI-powered 
              analysis. Our system extracts key legal entities, identifies constitutional provisions, generates multi-level 
              summaries, and finds related precedents from Sri Lankan case law.
            </p>
            
            {/* Step-by-step guide */}
            <div className="flex flex-wrap justify-center items-center gap-4 max-w-4xl mx-auto mt-8">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">1</div>
                <span className="ml-2 text-sm font-medium text-gray-700">Upload NLR/SLR case</span>
              </div>
              <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">2</div>
                <span className="ml-2 text-sm font-medium text-gray-700">AI extracts key details</span>
              </div>
              <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">3</div>
                <span className="ml-2 text-sm font-medium text-gray-700">Get case summary</span>
              </div>
            </div>
          </div>

          <div className="case-analysis-container" id="case-analysis-container">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
              {/* Upload Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 sticky top-24 border-t-4 border-amber-500">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center mr-4 shadow-md">
                      <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-stone-800">Upload Case Document</h2>
                      <p className="text-xs text-gray-500 mt-1">NLR/SLR judgments in PDF, DOCX, or TXT</p>
                    </div>
                  </div>
                  
                  <DocumentUploadMUI onUploadSuccess={handleUploadSuccess} />
                  
                  <div className="mt-6 p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-xl">
                    <h4 className="font-bold text-amber-900 mb-3 flex items-center text-sm">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Case Analysis Features:
                    </h4>
                    <ul className="text-xs text-amber-800 space-y-2 font-medium">
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2.5 mt-1.5 flex-shrink-0"></span>
                        <span>Extract judges, counsel, parties, and case citations</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2.5 mt-1.5 flex-shrink-0"></span>
                        <span>Identify Sri Lankan constitutional provisions (Articles 10-18, etc.)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2.5 mt-1.5 flex-shrink-0"></span>
                        <span>Generate sentence, paragraph & document-level summaries</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2.5 mt-1.5 flex-shrink-0"></span>
                        <span>Find similar NLR/SLR cases and binding precedents</span>
                      </li>
                    </ul>
                  </div>
                  
                  {state.currentDocumentId && (
                    <div className="mt-6">
                      <ExportButton
                        documentId={state.currentDocumentId}
                        documentTitle={`Document_${state.currentDocumentId}`}
                        contentElementId="case-analysis-container"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Results Section */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border-t-4 border-orange-500">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mr-4 shadow-md">
                      <svg className="w-6 h-6 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-stone-800">Analysis Results</h2>
                      {state.currentDocumentId && <p className="text-xs text-gray-500 mt-1">Document ID: {state.currentDocumentId}</p>}
                    </div>
                  </div>

                  {/* Error State */}
                  {state.analysisError && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                      <div className="flex items-start">
                        <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h3 className="text-red-800 font-semibold mb-1">Analysis Failed</h3>
                          <p className="text-red-700 text-sm">{state.analysisError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {!state.currentDocumentId && !state.analysisError && (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to Summarize</h3>
                      <p className="text-gray-600 mb-6">Upload an NLR or SLR case judgment to begin comprehensive case analysis</p>
                      
                      {/* What to expect section */}
                      <div className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                        <h4 className="font-bold text-blue-900 mb-3 flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Your Case Summary Will Include:
                        </h4>
                        <ul className="text-sm text-blue-800 space-y-2 text-left">
                          <li className="flex items-start">
                            <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Tiered summaries: Quick overview, paragraph summaries, full analysis</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Key parties: Judges (appellant/respondent), counsel, litigants</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Constitutional references: Fundamental rights (Arts 10-18) & provisions</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Similar precedents from NLR/SLR database with relevance scores</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Results Display */}
                  {state.currentDocumentId && !state.analysisError && (
                    <div className="space-y-4">
                      {/* Tab Navigation */}
                      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
                        <button
                          onClick={() => setActiveTab("summary")}
                          className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all ${
                            state.activeTab === "summary"
                              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          <DocumentTextIcon className="w-4 h-4 inline-block mr-1" />
                          Summary
                        </button>
                        <button
                          onClick={() => setActiveTab("constitutional")}
                          className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all ${
                            state.activeTab === "constitutional"
                              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          <ScaleIcon className="w-4 h-4 inline-block mr-1" />
                          Constitutional
                        </button>
                        <button
                          onClick={() => setActiveTab("entities")}
                          className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all ${
                            state.activeTab === "entities"
                              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          <UserGroupIcon className="w-4 h-4 inline-block mr-1" />
                          Legal Entities
                        </button>
                        <button
                          onClick={() => setActiveTab("related")}
                          className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all ${
                            state.activeTab === "related"
                              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          <LinkIcon className="w-4 h-4 inline-block mr-1" />
                          Related Cases
                        </button>
                      </div>

                      {/* Tab Content */}
                      <div className="mt-4">
                        {state.activeTab === "summary" && (
                          <div className="animate-fadeIn">
                            <MultiLevelSummary documentId={state.currentDocumentId} />
                          </div>
                        )}
                        
                        {state.activeTab === "constitutional" && (
                          <div className="animate-fadeIn space-y-4">
                            <ConstitutionalRightsHighlighter rights={state.fundamentalRights} />
                            <ConstitutionalProvisionsDisplay provisions={state.constitutionalProvisions} />
                          </div>
                        )}
                        
                        {state.activeTab === "entities" && (
                          <div className="animate-fadeIn">
                            <LegalEntitiesDisplay documentId={state.currentDocumentId} autoLoad={true} />
                          </div>
                        )}
                        
                        {state.activeTab === "related" && (
                          <div className="animate-fadeIn">
                            <RelatedCases
                              documentId={state.currentDocumentId}
                              topK={5}
                              minSimilarity={0.3}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Feature Cards */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-amber-100">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center mb-5 shadow-md">
                <svg className="w-7 h-7 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-stone-800 mb-3">Legal Entity Recognition</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Automatically identify and categorize judges, counsel (PC, SC), parties, case citations, and legal concepts from NLR/SLR judgments
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-orange-100">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mb-5 shadow-md">
                <svg className="w-7 h-7 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-stone-800 mb-3">Constitutional Detection</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Detect and highlight fundamental rights violations (Articles 10-18) and other Sri Lankan constitutional provisions cited in judgments
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-yellow-100">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center mb-5 shadow-md">
                <svg className="w-7 h-7 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-stone-800 mb-3">Multi-Level Case Summaries</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Generate hierarchical summaries: one-sentence gist, paragraph-level breakdowns, and comprehensive document analysis for rapid case review
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CaseAnalysis;
