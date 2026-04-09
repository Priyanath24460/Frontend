import React, { useRef, useState } from 'react';
import FileUpload from '../components/FileUpload.jsx';
import Header from '../components/Header.jsx';
import { AnalysisAPI } from '../config/api.js';
import ResultsOverviewNav from '../components/ResultsSections/ResultsOverviewNav.jsx';
import RiskAlertsSummary from '../components/ResultsSections/RiskAlertsSummary.jsx';
import TopReferencesSection from '../components/ResultsSections/TopReferencesSection.jsx';
import ClauseAnalysisHeader from '../components/ResultsSections/ClauseAnalysisHeader.jsx';

// ─── Lightweight Markdown Renderer ──────────────────────────────────────────────
function SimpleMarkdown({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let listItems = [];
  let blockquoteLines = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-2 mb-5 text-gray-700 ml-2">
          {listItems.map((item, i) => <li key={i} className="text-sm leading-relaxed text-gray-800 font-medium">{parseInline(item)}</li>)}
        </ul>
      );
      listItems = [];
    }
  };

  const flushBlockquote = () => {
    if (blockquoteLines.length > 0) {
      elements.push(
        <blockquote key={`bq-${elements.length}`} className="border-l-4 border-amber-500 pl-5 py-3 mb-5 bg-amber-50 rounded-r-lg shadow-sm">
          {blockquoteLines.map((line, i) => <p key={i} className="text-sm text-amber-900 italic font-medium leading-relaxed">{parseInline(line)}</p>)}
        </blockquote>
      );
      blockquoteLines = [];
    }
  };

  const parseInline = (text) => {
    if (!text) return text;
    // Bold + italic
    const parts = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Bold: **text**
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      if (boldMatch) {
        const idx = boldMatch.index;
        if (idx > 0) parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
        parts.push(<strong key={key++} className="font-bold text-amber-900">{boldMatch[1]}</strong>);
        remaining = remaining.slice(idx + boldMatch[0].length);
        continue;
      }
      // Inline code: `text`
      const codeMatch = remaining.match(/`(.+?)`/);
      if (codeMatch) {
        const idx = codeMatch.index;
        if (idx > 0) parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
        parts.push(<code key={key++} className="bg-stone-300 text-stone-900 px-2 py-1 rounded text-xs font-mono font-bold">{codeMatch[1]}</code>);
        remaining = remaining.slice(idx + codeMatch[0].length);
        continue;
      }
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }
    return parts.length === 1 ? parts[0] : <>{parts}</>;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      flushList();
      flushBlockquote();
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList();
      blockquoteLines.push(trimmed.slice(2));
      continue;
    } else {
      flushBlockquote();
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`h3-${i}`} className="text-base font-bold text-orange-700 mt-6 mb-3 flex items-center gap-2 pb-2 border-b-2 border-orange-200">
          🔹 {parseInline(trimmed.slice(4))}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={`h2-${i}`} className="text-xl font-bold text-stone-900 mt-7 mb-4 pb-3 border-b-2 border-amber-300 flex items-center gap-2">
          📌 {parseInline(trimmed.slice(3))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={`h1-${i}`} className="text-2xl font-bold text-stone-900 mt-6 mb-4 flex items-center gap-2">
          📊 {parseInline(trimmed.slice(2))}
        </h2>
      );
      continue;
    }

    // Horizontal rule
    if (trimmed === '---' || trimmed === '***') {
      flushList();
      elements.push(<div key={`hr-${i}`} className="my-6 border-t-2 border-stone-300" />);
      continue;
    }

    // List items
    if (trimmed.match(/^[-*]\s/)) {
      listItems.push(trimmed.slice(2));
      continue;
    }
    if (trimmed.match(/^\d+\.\s/)) {
      listItems.push(trimmed.replace(/^\d+\.\s/, ''));
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} className="text-sm text-gray-800 leading-relaxed mb-4 font-medium">
        {parseInline(trimmed)}
      </p>
    );
  }

  flushList();
  flushBlockquote();

  return <div className="prose-sm max-w-none">{elements}</div>;
}

// ─── Severity badge colors ─────────────────────────────────────────────────────
const SEVERITY_STYLES = {
  CRITICAL: 'bg-red-100 text-red-900',
  HIGH:     'bg-orange-100 text-orange-900',
  MEDIUM:   'bg-yellow-100 text-yellow-900',
  LOW:      'bg-green-100 text-green-900',
};

const SEVERITY_BORDER = {
  CRITICAL: 'border-red-300',
  HIGH:     'border-orange-300',
  MEDIUM:   'border-yellow-300',
  LOW:      'border-green-300',
};

// ─── Main Page Component ────────────────────────────────────────────────────────
export default function ContractRiskAnalysis() {
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError]         = useState('');
  const [expandedClauses, setExpandedClauses] = useState({});
  const [clauseTabs, setClauseTabs]           = useState({});
  const [filename, setFilename]   = useState('');
  const [inputMode, setInputMode] = useState('pdf');   // 'pdf' | 'text'
  const [contractText, setContractText] = useState('');
  const requestIdRef = useRef(0);
  const [simplifiedOpen, setSimplifiedOpen] = useState(false);
  const [simplifiedOpenClauses, setSimplifiedOpenClauses] = useState({});

  // ── Shared handler that processes the API response ──────────────────────────
  const handleResult = (data, sourceName) => {
    setResult(data);
    setFilename(sourceName);

    // Auto-expand clauses that have patterns
    const expanded = {};
    const tabs = {};
    (data.pattern_detection?.clauses_with_patterns || []).forEach(c => {
      if (c.patterns_detected > 0) {
        expanded[c.clause_id] = true;
        tabs[c.clause_id] = 'patterns';
      }
    });
    setExpandedClauses(expanded);
    setClauseTabs(tabs);
  };

  const requestDeferredAiReport = async (baseData, requestId) => {
    if (!baseData) return;

    const preprocessingPayload = {
      contract_type: baseData?.preprocessing?.contract_type || 'unknown',
      contract_confidence: baseData?.preprocessing?.contract_confidence || 0,
      total_clauses: baseData?.preprocessing?.total_clauses || 0,
      missing_fields: baseData?.preprocessing?.missing_fields || {},
    };

    setAiLoading(true);
    setResult(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        ai_risk_report: {
          ...(prev.ai_risk_report || {}),
          loading: true,
          error: null,
        },
      };
    });

    try {
      const aiReport = await AnalysisAPI.generateAiRiskReport({
        preprocessing: preprocessingPayload,
        pattern_data: baseData?.pattern_detection || {},
        case_data: baseData?.case_law || {},
        acts_data: baseData?.acts_law || {},
        data_coverage: baseData?.data_coverage || null,
      });

      if (requestId !== requestIdRef.current) return;

      setResult(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          ai_risk_report: {
            ...aiReport,
            loading: false,
          },
        };
      });
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      setResult(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          ai_risk_report: {
            risk_report: null,
            risk_score: null,
            llm_available: false,
            error: err?.message || 'AI report generation failed',
            loading: false,
          },
        };
      });
    } finally {
      if (requestId === requestIdRef.current) {
        setAiLoading(false);
      }
    }
  };

  // ── PDF upload handler ──────────────────────────────────────────────────────
  const onUpload = async (file) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setError('');
    setResult(null);
    setLoading(true);
    setAiLoading(false);

    try {
      const data = await AnalysisAPI.uploadContractWithCases(file, {
        include_ai_report: false,
        use_bert_support: true,
        use_simple_english: true,
        // Request fewer cases/acts by default to reduce backend work and latency
        top_k_cases: 5,
        top_k_acts: 3,
      });
      handleResult(data, file.name);
      void requestDeferredAiReport(data, requestId);
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Text submit handler ─────────────────────────────────────────────────────
  const onSubmitText = async () => {
    if (!contractText.trim() || contractText.trim().length < 50) {
      setError('Please enter at least 50 characters of contract text.');
      return;
    }
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setError('');
    setResult(null);
    setLoading(true);
    setAiLoading(false);

    try {
      // Convert text to a File object for API compatibility
      const textBlob = new Blob([contractText], { type: 'text/plain' });
      const textFile = new File([textBlob], 'contract.txt', { type: 'text/plain' });
      
      const data = await AnalysisAPI.uploadContractWithCases(textFile, {
        include_ai_report: false,
        use_bert_support: true,
        use_simple_english: true,
        // Request fewer cases/acts by default to reduce backend work and latency
        top_k_cases: 5,
        top_k_acts: 3,
      });
      handleResult(data, 'Text Input');
      void requestDeferredAiReport(data, requestId);
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const toggle = (id) => {
    setExpandedClauses(prev => ({ ...prev, [id]: !prev[id] }));
    if (!clauseTabs[id]) setClauseTabs(prev => ({ ...prev, [id]: 'text' }));
  };

  const setTab = (id, tab) => setClauseTabs(prev => ({ ...prev, [id]: tab }));

  const toggleSimplified = () => setSimplifiedOpen(prev => !prev);
  const toggleSimplifiedClause = (id) => setSimplifiedOpenClauses(prev => ({ ...prev, [id]: !prev[id] }));

  // Build a lookup: clause_id → cases
  const caseLookup = {};
  (result?.case_law?.clauses_with_cases || []).forEach(c => {
    caseLookup[c.clause_id] = c;
  });

  // Build a lookup: clause_id → acts
  const actLookup = {};
  (result?.acts_law?.clauses_with_acts || []).forEach(c => {
    actLookup[c.clause_id] = c;
  });

  // ── Render a single clause card ─────────────────────────────────────────────
  const renderClause = (clauseData) => {
    const { clause_id, clause_type, text_preview, detections = [], patterns_detected } = clauseData;
    const isExpanded  = expandedClauses[clause_id];
    const activeTab   = clauseTabs[clause_id] || 'text';
    const clauseCases = caseLookup[clause_id];
    const clauseActs  = actLookup[clause_id];

    const caseCount = clauseCases?.cases_count || 0;
    const actCount  = clauseActs?.acts_count || 0;

    // Highest severity in this clause
    const severities = detections.map(d => d.severity);
    const highestSeverity = severities.includes('CRITICAL') ? 'CRITICAL'
      : severities.includes('HIGH') ? 'HIGH'
      : severities.includes('MEDIUM') ? 'MEDIUM' : 'LOW';

    return (
      <div id={`clause-${clause_id}`} key={clause_id} className="bg-white rounded-2xl shadow-md hover:shadow-2xl hover:shadow-amber-500/20 border border-amber-100/50 overflow-hidden transition-all duration-300 hover:border-amber-200">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div
          onClick={() => toggle(clause_id)}
          className={`flex justify-between items-center cursor-pointer px-8 py-5 transition-all duration-300 ${
            isExpanded
              ? 'bg-linear-to-r from-stone-100 via-amber-50 to-orange-50 border-b-2 border-amber-200'
              : 'bg-linear-to-r from-stone-50 to-gray-50'
          }`}
        >
          <div className="flex items-center gap-4 flex-1">
            <span className={`text-xl transition-transform duration-300 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>▼</span>
            <span className="bg-linear-to-r from-stone-700 via-amber-700 to-orange-700 text-white px-3 py-1 rounded-lg text-sm font-bold uppercase">
              {clause_type || 'clause'}
            </span>
            <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-sm font-semibold border border-amber-200">
              {clause_id}
            </span>
            {patterns_detected > 0 && (
              <span className={`px-2 py-1 rounded text-xs font-bold ${SEVERITY_STYLES[highestSeverity]}`}>
                {patterns_detected} pattern{patterns_detected > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {caseCount > 0 && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">{caseCount} cases</span>
            )}
            {actCount > 0 && (
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold">{actCount} acts</span>
            )}
          </div>
        </div>

        {/* ── Expanded body ─────────────────────────────────────────────── */}
        {isExpanded && (
          <div>
            {/* Tab bar */}
            <div className="flex gap-2 px-8 py-4 bg-stone-50 border-b-2 border-amber-200 flex-wrap">
              <TabButton active={activeTab === 'text'} color="stone" onClick={() => setTab(clause_id, 'text')}>
                📄 Clause Text
              </TabButton>
              <TabButton active={activeTab === 'patterns'} color="orange" disabled={patterns_detected === 0} onClick={() => setTab(clause_id, 'patterns')}>
                🔍 Patterns ({patterns_detected})
              </TabButton>
              <TabButton active={activeTab === 'cases'} color="blue" disabled={caseCount === 0} onClick={() => setTab(clause_id, 'cases')}>
                📚 Cases ({caseCount})
              </TabButton>
              <TabButton active={activeTab === 'acts'} color="purple" disabled={actCount === 0} onClick={() => setTab(clause_id, 'acts')}>
                📖 Acts ({actCount})
              </TabButton>
            </div>

            {/* Tab content */}
            <div className="px-8 py-6 min-h-[200px]">
              {/* ── TEXT TAB ───────────────────────────────────────────── */}
              {activeTab === 'text' && (
                <div>
                  <h4 className="mb-4 text-stone-900 text-lg font-bold tracking-tight">📄 Full Clause Text</h4>
                  <div className="bg-linear-to-br from-stone-50 to-amber-50 p-6 border-l-4 border-amber-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <p className="m-0 leading-relaxed whitespace-pre-wrap text-stone-800 text-base font-medium">
                      {text_preview || '[No text available]'}
                    </p>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(text_preview); }}
                    className="mt-4 px-5 py-2 bg-linear-to-r from-stone-700 to-amber-700 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all"
                  >
                    📋 Copy Text
                  </button>
                </div>
              )}

              {/* ── PATTERNS TAB ───────────────────────────────────────── */}
              {activeTab === 'patterns' && (
                <div>
                  <h4 className="mb-4 text-orange-700 text-lg font-bold">🔍 Detected Risk Patterns</h4>
                  <div className="space-y-4">
                    {detections.map((det, i) => (
                      <div key={i} className={`bg-linear-to-r from-orange-50 to-amber-50 p-5 rounded-xl border-l-4 ${SEVERITY_BORDER[det.severity] || 'border-stone-300'} shadow-sm`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mr-2 ${SEVERITY_STYLES[det.severity]}`}>
                              {det.severity}
                            </span>
                            <strong className="text-stone-800">{det.pattern_title}</strong>
                          </div>
                          <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                            {((det.confidence || 0) * 100).toFixed(0)}% confidence
                          </span>
                        </div>
                        <p className="text-sm text-stone-700 font-medium mb-2">{det.description}</p>
                        {det.consequences && (
                          <p className="text-sm text-red-700 font-medium">
                            <strong>Consequences:</strong> {det.consequences}
                          </p>
                        )}
                        {det.matched_trigger && (
                          <p className="mt-1 text-xs text-stone-700 font-medium">
                            Trigger: <code className="bg-stone-300 px-1.5 py-0.5 rounded text-stone-900 font-bold">{det.matched_trigger}</code>
                          </p>
                        )}
                        
                        {/* ── OUTCOME DISTRIBUTION ──────────────────────── */}
                        {det.outcome_distribution && (
                          <div className="mt-3 pt-3 border-t border-orange-200 bg-white bg-opacity-50 p-3 rounded">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-bold text-stone-700">📊 Precedent Strength ({det.outcome_distribution.total_cases} cases)</p>
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                                det.outcome_distribution.risk_level === 'HIGH' ? 'bg-red-100 text-red-700' :
                                det.outcome_distribution.risk_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {det.outcome_distribution.risk_level} Risk
                              </span>
                            </div>
                            
                            {det.outcome_distribution.outcome_distribution && Object.keys(det.outcome_distribution.outcome_distribution).length > 0 ? (
                              <div className="space-y-2">
                                {Object.entries(det.outcome_distribution.outcome_distribution).map(([outcome, data], idx) => (
                                  <div key={idx} className="flex items-center gap-3">
                                    <div className="w-32 shrink-0">
                                      <p className="text-xs font-medium text-stone-700 capitalize">
                                        {outcome === 'employee' ? '👤 Employee Win' :
                                         outcome === 'employer' ? '🏢 Employer Win' :
                                         outcome === 'plaintiff' ? '👤 Plaintiff Win' :
                                         outcome === 'respondent' ? '⚖️ Respondent Win' :
                                         outcome === 'petitioner' ? '📄 Petitioner Win' :
                                         outcome === 'defendant' ? '🛡️ Defendant Win' :
                                         outcome.charAt(0).toUpperCase() + outcome.slice(1)}
                                      </p>
                                    </div>
                                    <div className="grow">
                                      <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                                        <div 
                                          className={`h-full transition-all ${
                                            outcome === 'employee' || outcome === 'plaintiff' || outcome === 'petitioner'
                                              ? 'bg-red-500' : 'bg-green-500'
                                          }`}
                                          style={{ width: `${data.percentage}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                    <div className="w-16 text-right">
                                      <p className="text-xs font-bold text-stone-700">{data.percentage}%</p>
                                      <p className="text-xs text-stone-700 font-semibold">({data.count})</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-stone-700 font-medium">No outcome data available</p>
                            )}
                            
                            <p className="text-xs text-stone-800 font-medium mt-2 italic">
                              {det.outcome_distribution.risk_level === 'HIGH' 
                                ? '⚠️ High proportion of cases favor the employee/plaintiff. This clause carries significant legal risk.'
                                : det.outcome_distribution.risk_level === 'MEDIUM'
                                  ? '⚡ Mixed outcomes in case law. Clause enforceability depends on specific circumstances.'
                                  : '✓ Most precedents favor the employer/respondent. This clause appears more defensible, but always verify context.'}
                            </p>
                          </div>
                        )}
                        
                        {/* Inline supporting cases from the pattern itself */}
                        {det.supporting_cases && det.supporting_cases.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-orange-200">
                            <p className="text-xs font-bold text-stone-800 mb-2">📚 Pattern's Supporting Cases ({det.supporting_cases.length}):</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {det.supporting_cases.slice(0, 4).map((sc, j) => (
                                <div key={j} className="bg-white p-2 rounded border border-orange-200 text-xs">
                                  <p className="font-semibold text-stone-800 truncate">{sc.case_name}</p>
                                  <p className="text-stone-700 font-medium text-xs">{sc.year} · {sc.citation}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="mt-2 flex gap-2 flex-wrap">
                          <span className="bg-stone-200 text-stone-700 px-2 py-0.5 rounded text-xs font-medium">{det.category}</span>
                          <span className="bg-stone-200 text-stone-700 px-2 py-0.5 rounded text-xs font-medium">ID: {det.pattern_id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── CASES TAB ──────────────────────────────────────────── */}
              {activeTab === 'cases' && (
                <div>
                  <h4 className="mb-4 text-blue-800 text-lg font-bold">📚 Related Case Law</h4>
                  {clauseCases && clauseCases.supporting_cases?.length > 0 ? (
                    <div className="space-y-3">
                      {clauseCases.supporting_cases.map((c, i) => (
                        <div key={i} className="bg-linear-to-r from-orange-50 to-amber-50 p-4 border-l-4 border-orange-600 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <strong className="text-blue-800 text-sm">{c.case_name}</strong>
                            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                              {((c.similarity || 0) * 100).toFixed(0)}% match
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {c.year && <span className="text-xs text-stone-800 font-semibold bg-stone-200 px-2 py-0.5 rounded">{c.year}</span>}
                            {c.category && <span className="text-xs text-stone-800 font-semibold bg-stone-200 px-2 py-0.5 rounded">{c.category}</span>}
                            {c.source && (
                              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                c.source === 'hybrid' || c.source === 'pattern_linked'
                                  ? 'bg-green-100 text-green-700'
                                  : c.source === 'semantic_search'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-stone-200 text-stone-800 font-semibold'
                              }`}>
                                {c.source === 'hybrid' ? '🔗 Pattern + Semantic' :
                                 c.source === 'pattern_linked' ? '🔗 Pattern-Linked' :
                                 c.source === 'semantic_search' ? '🔎 Semantic' :
                                 c.source === 'semantic_fallback' ? '🔎 Semantic' : c.source}
                              </span>
                            )}
                          </div>
                          {c.from_pattern && (
                            <p className="text-xs text-stone-700 font-medium mb-1">
                              From pattern: <code className="bg-stone-300 px-1 py-0.5 rounded text-stone-900 font-bold">{c.from_pattern}</code>
                            </p>
                          )}
                          {c.snippet && (
                            <p className="text-xs text-stone-700 font-medium leading-relaxed line-clamp-3">{c.snippet}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-stone-600 font-semibold italic text-center py-12">No related case law found for this clause</p>
                  )}
                </div>
              )}

              {/* ── ACTS TAB ───────────────────────────────────────────── */}
              {activeTab === 'acts' && (
                <div>
                  <h4 className="mb-4 text-purple-900 text-lg font-bold">📖 Related Legislation</h4>
                  {clauseActs && clauseActs.supporting_acts?.length > 0 ? (
                    <div className="space-y-3">
                      {clauseActs.supporting_acts.map((act, i) => (
                        <div key={i} className="bg-linear-to-r from-purple-50 to-pink-50 p-4 border-l-4 border-purple-600 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <strong className="text-purple-900 text-sm">{act.act_name} {act.year ? `(${act.year})` : ''}</strong>
                            <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                              {((act.similarity_score || 0) * 100).toFixed(0)}% match
                            </span>
                          </div>
                          {act.section_number && <p className="m-0 mb-1 text-xs text-stone-800 font-semibold"><strong>Section:</strong> {act.section_number}</p>}
                          {act.section_heading && <p className="m-0 mb-1 text-xs text-stone-800 font-semibold"><strong>Heading:</strong> {act.section_heading}</p>}
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                            act.source_label === 'case-backed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {act.source_label === 'case-backed' ? '🔗 Case-Backed' : '🔎 Semantic'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-stone-600 font-semibold italic text-center py-12">No related legislation found for this clause</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Summary stats ─────────────────────────────────────────────────────────
  const summary = result?.summary || {};
  const preprocessing = result?.preprocessing || {};
  const dataCoverage = result?.data_coverage || {};
  const missingFields = preprocessing.missing_fields || {};
  const missingList = Object.entries(missingFields).filter(([, v]) => v === false).map(([k]) => k);
  const riskyClauses = result?.ai_risk_report?.risky_clauses || [];
  const missingProtections = result?.ai_risk_report?.missing_protections || [];
  const referencedCases = result?.ai_risk_report?.referenced_cases || [];
  const bertSupport = result?.experimental_bert_support || {};
  const simplifiedClauses = (bertSupport?.clauses || []).filter(c =>
    String(c?.simple_english || '').trim().length > 0
  );
  const simplifiedContractText = simplifiedClauses
    .map((c, idx) => {
      const id = c?.clause_id || `C${idx + 1}`;
      return `Clause ${id}:\n${String(c.simple_english || '').trim()}`;
    })
    .join('\n\n');

  const getCaseSearchUrl = (caseName) => {
    if (!caseName) return '#';
    const q = encodeURIComponent(`${caseName} Sri Lanka case law`);
    return `https://www.google.com/search?q=${q}`;
  };

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Hero Header ──────────────────────────────────────────── */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center w-28 h-28 bg-linear-to-br from-amber-400 via-orange-400 to-orange-500 rounded-full mb-10 shadow-2xl shadow-amber-500/40 hover:scale-105 transition-transform duration-300">
              <svg className="w-14 h-14 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-6xl lg:text-7xl font-black text-stone-900 mb-6 leading-tight tracking-tight">
              Contract Risk
              <br />
              <span className="bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent drop-shadow-sm">Analysis</span>
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed mb-12 font-medium">
              Intelligent contract analysis powered by AI-driven pattern detection, backed by Sri Lankan case law and legislation.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm font-semibold">
              <span className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-amber-50 to-orange-50 rounded-full border-2 border-amber-200 text-amber-900 shadow-sm hover:shadow-md transition-shadow">✨ Pattern Detection</span>
              <span className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-amber-50 to-orange-50 rounded-full border-2 border-amber-200 text-amber-900 shadow-sm hover:shadow-md transition-shadow">📚 Case Law</span>
              <span className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-amber-50 to-orange-50 rounded-full border-2 border-amber-200 text-amber-900 shadow-sm hover:shadow-md transition-shadow">⚖️ Legislation</span>
              <span className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-amber-50 to-orange-50 rounded-full border-2 border-amber-200 text-amber-900 shadow-sm hover:shadow-md transition-shadow">🤖 AI Analysis</span>
            </div>
          </div>

          {/* ── Before results: Upload / Text section ─────────────────── */}
          {!result && !loading && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2">
                <div className="bg-linear-to-br from-stone-50 via-white to-stone-50 rounded-3xl shadow-2xl shadow-stone-900/10 p-10 border border-stone-300/40 backdrop-blur-sm hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300">
                  <h2 className="text-3xl font-bold text-stone-900 mb-3 tracking-tight">Analyze Your Contract</h2>
                  <p className="text-gray-700 text-base mb-10 font-medium">Choose your input method and let our AI-powered system analyze potential risks</p>

                  {/* ── Mode Toggle ─────────────────────────────────────── */}
                  <div className="flex gap-3 mb-10 bg-linear-to-r from-stone-100 to-white rounded-xl p-2.5 border-2 border-stone-300/50 shadow-sm">
                    <button
                      onClick={() => setInputMode('pdf')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                        inputMode === 'pdf'
                          ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/40'
                          : 'text-gray-700 hover:text-stone-900 bg-white hover:bg-stone-100 border-2 border-stone-200 hover:border-amber-200'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload PDF
                    </button>
                    <button
                      onClick={() => setInputMode('text')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                        inputMode === 'text'
                          ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/40'
                          : 'text-gray-700 hover:text-stone-900 bg-white hover:bg-stone-100 border-2 border-stone-200 hover:border-amber-200'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Paste Text
                    </button>
                  </div>

                  {/* ── PDF Upload ──────────────────────────────────────── */}
                  {inputMode === 'pdf' && <FileUpload onUpload={onUpload} />}

                  {/* ── Text Input ──────────────────────────────────────── */}
                  {inputMode === 'text' && (
                    <div>
                      <label className="block text-base font-bold text-stone-900 mb-4 tracking-tight">
                        📋 Paste Your Contract
                      </label>
                      <textarea
                        value={contractText}
                        onChange={(e) => setContractText(e.target.value)}
                        placeholder="Paste the full contract text here…\n\nExample:\nThis Employment Agreement is entered into between ABC Company (Employer) and John Doe (Employee)…"
                        rows={12}
                        className="w-full px-6 py-4 border-2 border-stone-300 bg-stone-50 text-gray-800 text-sm leading-relaxed rounded-xl resize-y focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 focus:border-opacity-100 transition-all placeholder:text-gray-600 font-medium shadow-sm hover:shadow-md hover:border-stone-400"
                      />
                      <div className="flex justify-between items-center mt-5">
                        <span className={`text-xs font-medium transition-colors ${ contractText.length < 50 ? 'text-gray-700' : 'text-green-700 font-bold'}`}>
                          {contractText.length}/50 characters
                        </span>
                        <button
                          onClick={onSubmitText}
                          disabled={contractText.trim().length < 50}
                          className={`px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 transform ${
                            contractText.trim().length < 50
                              ? 'bg-stone-400 text-white cursor-not-allowed font-bold'
                              : 'bg-linear-to-r from-amber-500 to-orange-500 text-white hover:shadow-2xl hover:shadow-amber-500/50 hover:scale-105 active:scale-95'
                          }`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Analyze Contract
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* ── Quick Info Card ─────────────────────────────────────────────────────────────── */}
              <div className="flex flex-col gap-6">
                <div className="bg-linear-to-br from-stone-50 via-white to-stone-50 rounded-3xl shadow-lg shadow-stone-900/10 border border-stone-300/40 p-8 hover:shadow-xl transition-shadow duration-300">
                  <h3 className="font-bold text-stone-900 mb-6 flex items-center text-lg gap-3 tracking-tight">
                    <span className="text-2xl">⚡</span>
                    Quick Features
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-3 list-none p-0">
                    {[
                      { icon: '🔍', text: 'Pattern Detection' },
                      { icon: '📚', text: 'Case Law Support' },
                      { icon: '📖', text: 'Legislation Lookup' },
                      { icon: '⚠️', text: 'Risk Assessment' },
                      { icon: '🤖', text: 'AI Summary' }
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-linear-to-br from-amber-50 via-orange-50 to-amber-50 border-2 border-orange-300 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <p className="text-sm text-orange-800 leading-relaxed font-medium">
                    <strong className="text-orange-900">💡 Pro Tip:</strong> Larger contracts with more clauses may take 30-60 seconds to analyze thoroughly. Grab a coffee! ☕
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Loading state ─────────────────────────────────────────── */}
          {loading && (
            <div className="max-w-2xl mx-auto text-center py-32">
              <div className="inline-flex items-center justify-center w-28 h-28 bg-linear-to-br from-amber-400 via-orange-400 to-orange-500 rounded-full mb-10 shadow-2xl shadow-amber-500/50 animate-pulse">
                <svg className="w-14 h-14 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-4xl font-bold text-stone-900 mb-4 tracking-tight">Analyzing Your Contract</h3>
              <p className="text-gray-700 mb-6 text-lg font-medium">Running pattern detection, case law search and legislation lookup…</p>
              <div className="w-full bg-stone-200 rounded-full h-3 mb-8 overflow-hidden shadow-sm">
                <div className="h-full bg-linear-to-r from-amber-500 to-orange-500 rounded-full animate-pulse" style={{width: '75%'}}></div>
              </div>
              <p className="text-gray-700 text-sm font-bold">⏱️ This may take 30-60 seconds for large contracts</p>
            </div>
          )}

          {/* ── Error banner ──────────────────────────────────────────── */}
          {error && (
            <div className="mb-12 max-w-2xl mx-auto animate-in fade-in slide-in-from-top-4">
              <div className="bg-linear-to-br from-red-50 to-rose-50 border-2 border-red-400 rounded-2xl p-8 shadow-lg shadow-red-500/20 backdrop-blur">
                <div className="flex gap-4 items-start">
                  <span className="text-4xl animate-bounce">⚠️</span>
                  <div>
                    <p className="text-red-900 font-bold text-lg mb-2">Analysis Error</p>
                    <p className="text-red-800 text-base leading-relaxed mb-4 font-medium">{error}</p>
                    <button
                      onClick={() => setError('')}
                      className="text-sm font-bold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Results ───────────────────────────────────────────────── */}
          {result && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

              {/* ── SIDEBAR ───────────────────────────────────────────── */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                {/* Re-upload */}
                <div className="bg-linear-to-br from-stone-50 via-white to-stone-50 rounded-2xl shadow-md shadow-stone-900/10 border border-stone-300/40 p-6 hover:shadow-lg transition-shadow duration-300">
                  <h4 className="font-bold text-stone-900 mb-4 flex items-center gap-2 tracking-tight">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Analyze Another
                  </h4>
                  <FileUpload onUpload={onUpload} label="Upload PDF" compact={true} />
                  <div className="mt-3 text-center">
                    <button
                      onClick={() => { setResult(null); setError(''); setInputMode('text'); }}
                      className="text-xs text-amber-400 font-semibold hover:text-amber-300"
                    >
                      or paste text →
                    </button>
                  </div>
                </div>

                {/* Contract Info Card */}
                <div className="bg-linear-to-br from-stone-50 via-white to-stone-50 border-2 border-amber-300 rounded-2xl p-6 shadow-lg shadow-amber-500/20 hover:shadow-xl transition-all duration-300">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-linear-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-700 text-xs font-bold">Contract Type</p>
                        <p className="text-xl font-bold text-amber-300">{(dataCoverage.label || preprocessing.contract_type || 'unknown').toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-stone-300 text-xs text-gray-800 space-y-1.5 font-medium">
                      <p><strong className="text-stone-700">Source:</strong> {result?.input_mode === 'text' ? '📝 Text' : `📄 ${filename}`}</p>
                      <p><strong className="text-stone-700">Size:</strong> {(result.file_size / 1024).toFixed(1)} KB</p>
                      {preprocessing.contract_confidence != null && (
                        <p><strong className="text-stone-700">Confidence:</strong> <span className="text-green-700 font-bold">{(preprocessing.contract_confidence * 100).toFixed(0)}%</span></p>
                      )}
                      {dataCoverage.supported && (
                        <p className="flex items-center gap-1">
                          <strong className="text-stone-700">Coverage:</strong>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            dataCoverage.coverage_level === 'strong' ? 'bg-emerald-500/20 text-orange-700 border border-emerald-500/50' :
                            dataCoverage.coverage_level === 'good' ? 'bg-cyan-500/20 text-amber-300 border border-amber-400/50' :
                            'bg-yellow-400/30 text-yellow-800 border border-yellow-500'
                          }`}>
                            {dataCoverage.coverage_level === 'strong' ? '🟢' : dataCoverage.coverage_level === 'good' ? '🔵' : '🟡'} {dataCoverage.coverage_level?.toUpperCase()}
                          </span>
                        </p>
                      )}
                      {dataCoverage.supported && (
                        <p className="text-gray-700 text-xs font-semibold">{dataCoverage.available_cases} cases • {dataCoverage.available_patterns} patterns</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Data Coverage Warning */}
                {dataCoverage.warning && (
                  <div className="bg-linear-to-br from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/40 rounded-xl p-4 shadow-lg">
                    <div className="flex items-start gap-2">
                      <span className="text-lg shrink-0">⚠️</span>
                      <div>
                        <p className="text-xs font-bold text-yellow-800 mb-1">Limited Data</p>
                        <p className="text-xs text-yellow-900 leading-relaxed font-medium">{dataCoverage.warning}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary Stats */}
                <div className="bg-linear-to-br from-stone-50 via-white to-stone-50 rounded-2xl shadow-md shadow-stone-900/10 border border-stone-300/40 p-6 hover:shadow-lg transition-shadow duration-300">
                  <h4 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2 tracking-tight">
                    <span className="text-lg">📊</span>
                    Summary
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-stone-50/50 border border-stone-200">
                      <span className="text-xs text-gray-800 font-semibold">Clauses</span>
                      <span className="text-sm font-bold text-gray-700">{summary.total_clauses}</span>
                    </div>
                    <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-stone-50/50 border border-stone-200">
                      <span className="text-xs text-gray-800 font-semibold">Patterns</span>
                      <span className="text-sm font-bold text-amber-700">{summary.total_patterns_detected}</span>
                    </div>
                    <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-stone-50/50 border border-stone-200">
                      <span className="text-xs text-gray-800 font-semibold">Cases</span>
                      <span className="text-sm font-bold text-blue-700">{summary.unique_cases}</span>
                    </div>
                    <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-stone-50/50 border border-stone-200">
                      <span className="text-xs text-gray-800 font-semibold">Acts</span>
                      <span className="text-sm font-bold text-purple-700">{summary.unique_acts}</span>
                    </div>
                    <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-stone-50/50 border border-stone-200">
                      <span className="text-xs text-gray-800 font-semibold">Time</span>
                      <span className="text-sm font-bold text-gray-700">{(summary.processing_time_ms / 1000).toFixed(1)}s</span>
                    </div>
                  </div>
                </div>

                {/* Missing Fields */}
                {missingList.length > 0 && (
                  <div className="bg-linear-to-br from-red-900/20 to-orange-900/20 border-2 border-red-500/30 rounded-xl p-5 shadow-lg">
                    <h4 className="text-sm font-bold text-red-700 mb-3 flex items-center gap-2">
                      <span className="text-lg">🚨</span>
                      Missing
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {missingList.map((f, i) => (
                        <span key={i} className="bg-red-200 text-red-900 px-2 py-1 rounded-full text-xs font-bold border border-red-400">
                          {f.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── MAIN CONTENT ───────────────────────────────────────── */}
              <div className="lg:col-span-3 space-y-8">

                {/* ── Results Navigation ──────────────────────────────── */}
                <ResultsOverviewNav 
                  summary={summary} 
                  simplifiedClauses={simplifiedClauses} 
                  aggregatedResults={result.aggregated_results}
                />

                {/* ── Risk Summary Banner ──────────────────────────────── */}
                <RiskAlertsSummary summary={summary} />

                {/* ── Simplified Contract View ───────────────────────── */}
                <div id="simplified-contract"></div>
                {simplifiedClauses.length > 0 && (
                  <div className="bg-linear-to-br from-stone-50 to-white rounded-2xl shadow-xl border border-stone-300/50 overflow-hidden hover:shadow-2xl transition-all">
                    {/* Header */}
                    <div className="bg-linear-to-r from-purple-600 via-blue-600 to-purple-700 px-8 py-6 shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur">
                            <span className="text-2xl">📖</span>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">Plain Language Summary</h3>
                            <p className="text-blue-50 text-xs font-medium mt-1">
                              BERT-Simplified • {simplifiedClauses.length} clauses • Easy-to-understand version of your contract
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => navigator.clipboard.writeText(simplifiedContractText)}
                            className="px-6 py-3 bg-white text-purple-700 font-bold rounded-xl text-sm hover:bg-blue-50 transition-all shadow-lg hover:shadow-2xl hover:shadow-purple-500/40 transform hover:scale-105 active:scale-95 flex items-center gap-2"
                          >
                            📋 Copy Full Summary
                          </button>
                          <button
                            onClick={toggleSimplified}
                            className="px-4 py-2 bg-purple-700 text-white rounded-md text-sm font-bold hover:bg-purple-600 transition-colors"
                          >
                            {simplifiedOpen ? 'Hide Summary' : 'Show Summary'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {simplifiedOpen ? (
                      <div className="px-8 py-8 bg-linear-to-b from-white via-blue-50/20 to-white">
                        <div className="space-y-4">
                          {simplifiedClauses.map((clause, idx) => {
                            const clauseId = clause?.clause_id || `C${idx + 1}`;
                            const simplifiedText = String(clause?.simple_english || '').trim();
                            const isOpen = simplifiedOpenClauses[clauseId];
                            return (
                              <div
                                key={`simplified-${idx}`}
                                className="bg-white border-l-4 border-purple-500 rounded-lg p-4 hover:shadow-lg hover:shadow-purple-200/50 transition-all"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-linear-to-br from-purple-500 to-blue-600 text-white rounded-full font-bold text-sm shrink-0">
                                      {idx + 1}
                                    </span>
                                    <h4 className="text-sm font-bold text-purple-900">Clause {clauseId}</h4>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => toggleSimplifiedClause(clauseId)}
                                      className="px-3 py-1 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-md text-xs font-bold hover:opacity-90 transition-opacity"
                                    >
                                      {isOpen ? 'Hide' : 'View'}
                                    </button>
                                    <button
                                      onClick={() => navigator.clipboard.writeText(simplifiedText)}
                                      className="px-3 py-1 bg-stone-100 text-stone-800 rounded-md text-xs font-bold hover:bg-stone-200 transition-colors"
                                    >
                                      Copy
                                    </button>
                                  </div>
                                </div>
                                {isOpen ? (
                                  <p className="text-sm leading-relaxed text-gray-700 font-medium whitespace-pre-wrap">{simplifiedText}</p>
                                ) : (
                                  <p className="text-sm text-gray-500 italic">Click "View" to expand this clause's simplified text.</p>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-8 pt-6 border-t-2 border-blue-200 flex items-start gap-3 bg-blue-50/50 rounded-xl p-5">
                          <span className="text-lg mt-0.5">💡</span>
                          <div>
                            <p className="text-xs text-blue-900 font-medium leading-relaxed">
                              <strong>What is this?</strong> This simplified version extracts key information from each clause to make it more approachable for non-lawyers. 
                              {bertSupport?.simple_english?.available && !bertSupport?.simple_english?.error ? (
                                <span> Uses BERT (Bidirectional Encoder Representations from Transformers), an advanced AI language model.</span>
                              ) : (
                                <span> Uses intelligent text extraction when advanced models aren't available.</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* ── AI Risk Analysis Report ──────────────────────────── */}
                {result.ai_risk_report && (
                  <div className="bg-linear-to-br from-stone-50 to-white rounded-2xl shadow-xl border border-stone-300/50 overflow-hidden hover:shadow-2xl transition-all">
                    {/* Header */}
                    <div className="bg-linear-to-r from-amber-600 via-orange-600 to-amber-700 px-8 py-6 shadow-md\">
                      <div className="flex items-center justify-between\">
                        <div className="flex items-center gap-3\">
                          <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur\">
                            <span className="text-2xl\">🤖</span>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white tracking-tight\">AI Risk Analysis</h3>
                            <p className="text-amber-50 text-xs font-medium mt-1\">
                              {result.ai_risk_report.model || 'Gemini'} synthesis • {summary.total_patterns_detected || 0} patterns • {summary.unique_cases || 0} cases • {summary.unique_acts || 0} acts
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-col\">
                          {result.ai_risk_report.risk_score && (
                            <span className={`px-6 py-2 rounded-xl text-sm font-bold shadow-xl ${
                              result.ai_risk_report.risk_score === 'CRITICAL' ? 'bg-red-600 text-white' :
                              result.ai_risk_report.risk_score === 'HIGH' ? 'bg-orange-500 text-white' :
                              result.ai_risk_report.risk_score === 'MEDIUM' ? 'bg-yellow-500 text-slate-900' :
                              'bg-emerald-500 text-white'
                            }`}>
                              {result.ai_risk_report.risk_score} RISK
                            </span>
                          )}
                          {result.ai_risk_report.generation_time_ms && (
                            <span className="text-amber-50 text-xs font-bold">
                              Generated in {(result.ai_risk_report.generation_time_ms / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Report Content */}
                    {(aiLoading || result.ai_risk_report.loading) ? (
                      <div className="px-8 py-8">
                        <div className="bg-linear-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-6 flex items-center gap-4 shadow-md">
                          <div className="w-6 h-6 border-3 border-amber-500 border-t-amber-700 rounded-full animate-spin shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-amber-900 text-base font-bold">🔄 Generating AI Analysis...</p>
                            <p className="text-amber-800 text-sm mt-1.5 font-medium">Our Gemini AI is synthesizing patterns, cases, and legislation into actionable insights.</p>
                          </div>
                        </div>
                      </div>
                    ) : result.ai_risk_report.risk_report ? (
                      <div className="px-8 py-8 bg-linear-to-b from-white via-stone-50 to-white">
                        {/* Main Report Section */}
                        <div className="mb-8">
                          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-amber-200">
                            <span className="text-3xl">📊</span>
                            <h4 className="text-2xl font-bold text-stone-900 tracking-tight">Comprehensive Risk Summary</h4>
                          </div>
                          <div className="prose-sm text-gray-700 bg-white rounded-xl p-6 border border-stone-200 shadow-sm">
                            <SimpleMarkdown text={result.ai_risk_report.risk_report} />
                          </div>
                        </div>

                        {(riskyClauses.length > 0 || missingProtections.length > 0 || referencedCases.length > 0) && (
                          <div className="mt-10 space-y-6">
                            {riskyClauses.length > 0 && (
                              <div className="bg-linear-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-6 shadow-md">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-red-200">
                                  <span className="text-2xl">⚠️</span>
                                  <div>
                                    <h4 className="text-lg font-bold text-red-900">Critical Issues Found</h4>
                                    <p className="text-red-700 text-xs font-medium">Jump to these clauses in the contract for quick review</p>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  {riskyClauses.map((risk, idx) => (
                                    <div key={`risk-clause-${idx}`} className="bg-white border-l-4 border-red-500 rounded-lg p-4 hover:shadow-md transition-all">
                                      <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <span className="text-xs font-bold bg-red-600 text-white px-3 py-1 rounded-full">Risk #{risk.risk_number}</span>
                                        {risk.severity && (
                                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                            risk.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                                            risk.severity === 'HIGH' ? 'bg-orange-600 text-white' :
                                            risk.severity === 'MEDIUM' ? 'bg-yellow-500 text-stone-900' :
                                            'bg-blue-600 text-white'
                                          }`}>
                                            {risk.severity}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm font-bold text-stone-900 mb-2">{risk.risk_title}</p>
                                      <p className="text-xs text-stone-600 mb-3">{risk.affected_clause || 'See clause details below'}</p>
                                      {risk.clause_ids?.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                          {risk.clause_ids.map((cid) => (
                                            <a
                                              key={`${risk.risk_number}-${cid}`}
                                              href={`#clause-${cid}`}
                                              className="text-xs font-bold text-white bg-linear-to-r from-amber-600 to-orange-600 px-4 py-2 rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
                                            >
                                              📍 View Clause {cid}
                                            </a>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {missingProtections.length > 0 && (
                              <div className="bg-linear-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 shadow-md">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-yellow-200">
                                  <span className="text-2xl">🛡️</span>
                                  <div>
                                    <h4 className="text-lg font-bold text-yellow-900">Missing Protections</h4>
                                    <p className="text-yellow-700 text-xs font-medium">Critical clauses or protections that should be added</p>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  {missingProtections.map((risk, idx) => (
                                    <div key={`missing-protection-${idx}`} className="bg-white border-l-4 border-yellow-500 rounded-lg p-4 hover:shadow-md transition-all">
                                      <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <span className="text-xs font-bold bg-yellow-600 text-white px-3 py-1 rounded-full">Protection #{risk.risk_number}</span>
                                        {risk.severity && (
                                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                            risk.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                                            risk.severity === 'HIGH' ? 'bg-orange-600 text-white' :
                                            risk.severity === 'MEDIUM' ? 'bg-yellow-500 text-stone-900' :
                                            'bg-blue-600 text-white'
                                          }`}>
                                            {risk.severity}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm font-bold text-stone-900 mb-2">{risk.risk_title}</p>
                                      <p className="text-xs text-stone-700 mb-2 font-medium">📌 {risk.affected_clause || 'Missing protection'}</p>
                                      {risk.direct_issue && (
                                        <p className="text-xs text-stone-700 mb-2"><strong>Why it matters:</strong> {risk.direct_issue}</p>
                                      )}
                                      {risk.recommended_fix && (
                                        <div className="bg-emerald-50 border border-emerald-200 rounded p-3 mt-2">
                                          <p className="text-xs font-bold text-emerald-900">✅ Recommended Addition:</p>
                                          <p className="text-xs text-emerald-800 mt-1">{risk.recommended_fix}</p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {referencedCases.length > 0 && (
                              <div className="bg-linear-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-6 shadow-md">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-200">
                                  <span className="text-2xl">📚</span>
                                  <div>
                                    <h4 className="text-lg font-bold text-blue-900">Referenced Case Law</h4>
                                    <p className="text-blue-700 text-xs font-medium">Sri Lankan case law supporting this analysis</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {referencedCases.map((c, idx) => (
                                    <div key={`ref-case-${idx}`} className="bg-white border-l-4 border-blue-500 rounded-lg p-4 hover:shadow-md transition-all">
                                      <div className="flex justify-between items-start gap-3 mb-2">
                                        <p className="text-sm font-bold text-blue-900">{c.case_name}</p>
                                        <a
                                          href={getCaseSearchUrl(c.case_name)}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="shrink-0 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg transition-all"
                                        >
                                          🔗 Search
                                        </a>
                                      </div>
                                      {c.raw_support_text && (
                                        <p className="text-xs text-stone-700 leading-relaxed">{c.raw_support_text}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Disclaimer and Actions */}
                        <div className="mt-10 pt-6 border-t-2 border-stone-200">
                          {/* <div className="bg-linear-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5 mb-4">
                            <p className="text-xs text-blue-900 font-medium leading-relaxed">
                              <strong>📋 Important:</strong> This AI-generated analysis uses pattern matching against Sri Lankan legal databases. While comprehensive, it should be reviewed and validated by a qualified legal professional before making decisions.
                            </p>
                          </div> */}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(result.ai_risk_report.risk_report);
                            }}
                            className="w-full px-6 py-3 bg-linear-to-r from-amber-600 to-orange-600 text-white rounded-xl text-sm font-bold hover:shadow-2xl hover:shadow-orange-500/40 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                          >
                            📋 Copy Full Report
                          </button>
                        </div>
                      </div>
                    ) : result.ai_risk_report.error ? (
                      <div className="px-8 py-6">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <p className="text-amber-800 text-sm font-medium">
                            ⚠️ AI report unavailable: {result.ai_risk_report.error}
                          </p>
                          {(() => {
                            const aiError = String(result.ai_risk_report.error || '');
                            const isGeminiConfigError = /gemini_api_key|llm not available|api key/i.test(aiError);

                            return isGeminiConfigError ? (
                              <p className="text-amber-600 text-xs mt-1">
                                Set the <code className="bg-amber-100 px-1 rounded">GEMINI_API_KEY</code> environment variable to enable AI-powered risk analysis.
                              </p>
                            ) : (
                              <p className="text-amber-600 text-xs mt-1">
                                Check the analyze-contract backend logs for the full stack trace and retry.
                              </p>
                            );
                          })()}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* ── Top Cases & Acts ──────────────────────────────────── */}
                <TopReferencesSection 
                  topCases={result.aggregated_results?.top_cases || []}
                  topActs={result.aggregated_results?.top_acts || []}
                />

                {/* ── Clause-by-Clause Section ─────────────────────────── */}
                <ClauseAnalysisHeader summary={summary} />
                <div className="space-y-4">
                  {(result.pattern_detection?.clauses_with_patterns || []).map(clause => renderClause(clause))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function TabButton({ active, color, disabled, onClick, children }) {
  const activeClass = {
    stone:  'bg-linear-to-r from-stone-400 to-stone-300 text-white shadow-lg',
    orange: 'bg-linear-to-r from-orange-600 to-orange-500 text-white shadow-lg',
    blue:   'bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-lg',
    purple: 'bg-linear-to-r from-purple-600 to-purple-500 text-white shadow-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 ${
        active
          ? activeClass[color]
          : disabled
            ? 'bg-stone-400 text-white cursor-not-allowed font-bold'
            : 'bg-white text-gray-700 hover:bg-stone-100 hover:text-stone-900 border-2 border-stone-200 hover:border-stone-400'
      }`}
    >
      {children}
    </button>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between items-center px-4 py-3.5 rounded-lg bg-linear-to-r from-stone-50 to-stone-100 border border-stone-300 hover:shadow-md transition-all">
      <span className="text-sm text-gray-700 font-semibold">{label}</span>
      <span className="text-lg font-bold text-stone-800">{value ?? '—'}</span>
    </div>
  );
}

function SummaryCard({ label, value, emoji }) {
  return (
    <div className="bg-linear-to-br from-stone-50 to-amber-50 rounded-xl p-5 shadow-md shadow-stone-900/10 border-2 border-amber-200 hover:shadow-lg hover:border-amber-300 transition-all">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-gray-700 font-bold text-xs mb-2">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value ?? 0}</p>
        </div>
        <span className="text-3xl opacity-60">{emoji}</span>
      </div>
    </div>
  );
}
