// frontend/src/pages/CaseAnalysis.tsx
import React from "react";
import { 
  DocumentTextIcon, 
  ScaleIcon, 
  UserGroupIcon, 
  LinkIcon, 
  ClipboardDocumentListIcon 
} from '@heroicons/react/24/outline';
import DocumentUploadMUI from "../../components/summarizer/DocumentUploadMUI";
import SummaryView from "../../components/summarizer/SummaryView";
import ConstitutionalTab from "../../components/summarizer/ConstitutionalTab";
import LegalEntitiesDisplay from "../../components/summarizer/LegalEntitiesDisplay";
// import DocumentStructureDisplay from "../components/DocumentStructureDisplay";
import MultiLevelSummary from "../../components/summarizer/MultiLevelSummary";
import RelatedCases from "../../components/summarizer/RelatedCases";
// Semantic Legal Search (RAG) – enable when needed
// import RAGSearch from "../../components/summarizer/RAGSearch";
import ExportButton from "../../components/summarizer/ExportButton";
import axios from "axios";
import Header from "../../components/Header";
import { useCaseAnalysis } from "../../contexts/CaseAnalysisContext";
import CaseBriefDisplay from "../../components/summarizer/CaseBriefDisplay";
import { BACKEND_BASE } from "../../config/api";




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
    setCurrentDocumentName,
    setActiveTab,
    resetState,
  } = useCaseAnalysis();

  const handleUploadSuccess = async (doc: any) => {
    console.log('Upload response:', doc);
    
    // Try multiple fields for document name
    const documentName = doc.file_name || doc.filename || doc.title || doc.name || `Document_${doc.document_id}`;
    console.log('Setting document name:', documentName);
    
    // Reset state for new upload
    resetState();
    
    setAnalysisError(null);
    
    // Set both ID and name together to ensure they persist
    setCurrentDocumentId(doc.document_id);
    setCurrentDocumentName(documentName);

    // Set structure analysis from upload response
    if (doc.structure_analysis) {
      setStructureAnalysis(doc.structure_analysis);
      console.log("Document structure:", doc.structure_analysis);
    }

    try {
      // CORRECT: document_id as query parameter, not request body
      const sum = await axios.post(
        `${BACKEND_BASE}/api/analysis/summarize/with-local-context?document_id=${doc.document_id}`,
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
    <div className="min-h-screen bg-linear-to-b from-stone-50 to-amber-50">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-amber-400 to-orange-400 rounded-full mb-6 shadow-xl">
              <svg className="w-10 h-10 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-stone-800 mb-4">Sri Lankan Case Law Summarizer</h1>
            <div className="w-32 h-1 bg-linear-to-r from-amber-600 to-orange-500 mx-auto mb-4"></div>
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
                    <div className="w-12 h-12 bg-linear-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center mr-4 shadow-md">
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
                  
                  <div className="mt-6 p-5 bg-linear-to-br from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-xl">
                    <h4 className="font-bold text-amber-900 mb-3 flex items-center text-sm">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Case Analysis Features:
                    </h4>
                    <ul className="text-xs text-amber-800 space-y-2 font-medium">
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2.5 mt-1.5 shrink-0"></span>
                        <span>Extract judges, counsel, parties, and case citations</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2.5 mt-1.5 shrink-0"></span>
                        <span>Identify Sri Lankan constitutional provisions (Articles 10-18, etc.)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2.5 mt-1.5 shrink-0"></span>
                        <span>Generate sentence, paragraph & document-level summaries</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2.5 mt-1.5 shrink-0"></span>
                        <span>Find similar NLR/SLR cases and binding precedents</span>
                      </li>
                    </ul>
                  </div>
                  
                  {state.currentDocumentId && (
                    <div className="mt-6">
                      <ExportButton
                        documentId={state.currentDocumentId}
                        documentTitle={state.currentDocumentName || `Document_${state.currentDocumentId}`}
                        contentElementId="case-analysis-container"
                      />
                    </div>
                  )}
                </div>
              </div>
              
                  {/* Results Section */}
                  <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border-t-4 border-orange-500">
                      {/* Semantic Legal Search (RAG) – uncomment to use later
                      <RAGSearch documentId={state.currentDocumentId} />
                      */}
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-linear-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mr-4 shadow-md">
                      <svg className="w-6 h-6 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-stone-800">Analysis Results</h2>
                      {state.currentDocumentName && (
                        <p className="text-xs text-gray-600 mt-1 font-medium">
                          📄 {state.currentDocumentName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Error State */}
                  {state.analysisError && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                      <div className="flex items-start">
                        <svg className="w-6 h-6 text-red-600 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h3 className="text-red-800 font-semibold mb-1">Analysis Failed</h3>
                          <p className="text-red-700 text-sm">{state.analysisError}</p>
                        </div>
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
                              ? "bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          <DocumentTextIcon className="w-5 h-5 inline-block mr-1" />
                          Summary
                        </button>
                        <button
                          onClick={() => setActiveTab("constitutional")}
                          className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all ${
                            state.activeTab === "constitutional"
                              ? "bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          <ScaleIcon className="w-5 h-5 inline-block mr-1" />
                          Constitutional
                        </button>

                        <button
                          onClick={() => setActiveTab("related")}
                          className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all ${
                            state.activeTab === "related"
                              ? "bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          <LinkIcon className="w-5 h-5 inline-block mr-1" />
                          Related Cases
                        </button>
                        <button
                          onClick={() => setActiveTab("brief")}
                          className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all ${
                            state.activeTab === "brief"
                              ? "bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          <ClipboardDocumentListIcon className="w-5 h-5 inline-block mr-1" />
                          Case Brief
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
                          <div className="animate-fadeIn">
                            <ConstitutionalTab documentId={state.currentDocumentId!} />
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
                        
                        {state.activeTab === "brief" && (
                          <div className="animate-fadeIn">
                            <CaseBriefDisplay
                              documentId={state.currentDocumentId}
                              fileName={state.currentDocumentName || undefined}
                              autoLoad={true}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Three feature cards at bottom (same style as Scenario-Based Case Finder) */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-amber-100">
                <div className="w-14 h-14 bg-linear-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center mb-5 shadow-md">
                  <DocumentTextIcon className="w-7 h-7 text-amber-700" />
                </div>
                <h3 className="text-lg font-bold text-stone-800 mb-3">Case Summaries</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Executive, detailed, and section-by-section summaries with plain-language glossary for NLR/SLR judgments.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-orange-100">
                <div className="w-14 h-14 bg-linear-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mb-5 shadow-md">
                  <ScaleIcon className="w-7 h-7 text-orange-700" />
                </div>
                <h3 className="text-lg font-bold text-stone-800 mb-3">Constitutional & Related Cases</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Detect fundamental rights (Articles 10–18), constitutional provisions, and find similar cases from the corpus.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-yellow-100">
                <div className="w-14 h-14 bg-linear-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center mb-5 shadow-md">
                  <ClipboardDocumentListIcon className="w-7 h-7 text-yellow-700" />
                </div>
                <h3 className="text-lg font-bold text-stone-800 mb-3">Case Brief & Export</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Structured brief (facts, issues, holding, ratio) and download full analysis as a professional PDF.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CaseAnalysis;
