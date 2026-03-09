import React, { useRef, useState } from 'react';
import FileUpload from '../components/FileUpload.jsx';
import Header from '../components/Header.jsx';
import { ContractAPI } from '../config/api.js';

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
        <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 mb-4 text-stone-700">
          {listItems.map((item, i) => <li key={i} className="text-sm leading-relaxed">{parseInline(item)}</li>)}
        </ul>
      );
      listItems = [];
    }
  };

  const flushBlockquote = () => {
    if (blockquoteLines.length > 0) {
      elements.push(
        <blockquote key={`bq-${elements.length}`} className="border-l-4 border-amber-400 pl-4 py-2 mb-4 bg-amber-50 rounded-r-lg">
          {blockquoteLines.map((line, i) => <p key={i} className="text-sm text-stone-600 italic">{parseInline(line)}</p>)}
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
        parts.push(<strong key={key++} className="font-bold text-stone-800">{boldMatch[1]}</strong>);
        remaining = remaining.slice(idx + boldMatch[0].length);
        continue;
      }
      // Inline code: `text`
      const codeMatch = remaining.match(/`(.+?)`/);
      if (codeMatch) {
        const idx = codeMatch.index;
        if (idx > 0) parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
        parts.push(<code key={key++} className="bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded text-xs font-mono">{codeMatch[1]}</code>);
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
        <h4 key={`h3-${i}`} className="text-lg font-bold text-stone-800 mt-6 mb-3 flex items-center gap-2">
          {parseInline(trimmed.slice(4))}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={`h2-${i}`} className="text-xl font-bold text-stone-900 mt-8 mb-4 pb-2 border-b-2 border-amber-200">
          {parseInline(trimmed.slice(3))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={`h1-${i}`} className="text-2xl font-bold text-stone-900 mt-6 mb-4">
          {parseInline(trimmed.slice(2))}
        </h2>
      );
      continue;
    }

    // Horizontal rule
    if (trimmed === '---' || trimmed === '***') {
      flushList();
      elements.push(<hr key={`hr-${i}`} className="my-6 border-stone-200" />);
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
      <p key={`p-${i}`} className="text-sm text-stone-700 leading-relaxed mb-3">
        {parseInline(trimmed)}
      </p>
    );
  }

  flushList();
  flushBlockquote();

  return <div className="prose-sm">{elements}</div>;
}

// ─── Severity badge colors ─────────────────────────────────────────────────────
const SEVERITY_STYLES = {
  CRITICAL: 'bg-red-600 text-white',
  HIGH:     'bg-orange-500 text-white',
  MEDIUM:   'bg-yellow-500 text-stone-900',
  LOW:      'bg-blue-400 text-white',
};

const SEVERITY_BORDER = {
  CRITICAL: 'border-red-500',
  HIGH:     'border-orange-400',
  MEDIUM:   'border-yellow-400',
  LOW:      'border-blue-300',
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
      const aiReport = await ContractAPI.generateAiRiskReport({
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
      const data = await ContractAPI.uploadContractComprehensive(file, {
        include_ai_report: false,
        use_bert_support: false,
        use_simple_english: true,
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
      const data = await ContractAPI.uploadContractComprehensive(contractText, {
        include_ai_report: false,
        use_bert_support: false,
        use_simple_english: true,
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
      <div id={`clause-${clause_id}`} key={clause_id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl border border-amber-100 overflow-hidden transition-all duration-300">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div
          onClick={() => toggle(clause_id)}
          className={`flex justify-between items-center cursor-pointer px-8 py-5 transition-all duration-300 ${
            isExpanded
              ? 'bg-gradient-to-r from-stone-100 via-amber-50 to-orange-50 border-b-2 border-amber-200'
              : 'bg-gradient-to-r from-stone-50 to-gray-50'
          }`}
        >
          <div className="flex items-center gap-4 flex-1">
            <span className={`text-xl transition-transform duration-300 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>▼</span>
            <span className="bg-gradient-to-r from-stone-700 via-amber-700 to-orange-700 text-white px-3 py-1 rounded-lg text-sm font-bold uppercase">
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
                  <h4 className="mb-4 text-stone-800 text-lg font-bold">📄 Full Clause Text</h4>
                  <div className="bg-gradient-to-br from-stone-50 to-amber-50 p-6 border-l-4 border-amber-700 rounded-lg shadow-sm">
                    <p className="m-0 leading-relaxed whitespace-pre-wrap text-stone-700 text-base">
                      {text_preview || '[No text available]'}
                    </p>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(text_preview); }}
                    className="mt-4 px-5 py-2 bg-gradient-to-r from-stone-700 to-amber-700 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all"
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
                      <div key={i} className={`bg-gradient-to-r from-orange-50 to-amber-50 p-5 rounded-xl border-l-4 ${SEVERITY_BORDER[det.severity] || 'border-stone-300'} shadow-sm`}>
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
                        <p className="text-sm text-stone-600 mb-2">{det.description}</p>
                        {det.consequences && (
                          <p className="text-sm text-red-700 font-medium">
                            <strong>Consequences:</strong> {det.consequences}
                          </p>
                        )}
                        {det.matched_trigger && (
                          <p className="mt-1 text-xs text-stone-500">
                            Trigger: <code className="bg-stone-200 px-1.5 py-0.5 rounded text-stone-700">{det.matched_trigger}</code>
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
                                    <div className="w-32 flex-shrink-0">
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
                                    <div className="flex-grow">
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
                                      <p className="text-xs text-stone-500">({data.count})</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-stone-500">No outcome data available</p>
                            )}
                            
                            <p className="text-xs text-stone-600 mt-2 italic">
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
                            <p className="text-xs font-bold text-stone-600 mb-2">📚 Pattern's Supporting Cases ({det.supporting_cases.length}):</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {det.supporting_cases.slice(0, 4).map((sc, j) => (
                                <div key={j} className="bg-white p-2 rounded border border-orange-200 text-xs">
                                  <p className="font-semibold text-stone-800 truncate">{sc.case_name}</p>
                                  <p className="text-stone-500">{sc.year} · {sc.citation}</p>
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
                        <div key={i} className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 border-l-4 border-blue-600 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <strong className="text-blue-800 text-sm">{c.case_name}</strong>
                            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                              {((c.similarity || 0) * 100).toFixed(0)}% match
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {c.year && <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded">{c.year}</span>}
                            {c.category && <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded">{c.category}</span>}
                            {c.source && (
                              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                c.source === 'hybrid' || c.source === 'pattern_linked'
                                  ? 'bg-green-100 text-green-700'
                                  : c.source === 'semantic_search'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-stone-100 text-stone-600'
                              }`}>
                                {c.source === 'hybrid' ? '🔗 Pattern + Semantic' :
                                 c.source === 'pattern_linked' ? '🔗 Pattern-Linked' :
                                 c.source === 'semantic_search' ? '🔎 Semantic' :
                                 c.source === 'semantic_fallback' ? '🔎 Semantic' : c.source}
                              </span>
                            )}
                          </div>
                          {c.from_pattern && (
                            <p className="text-xs text-stone-500 mb-1">
                              From pattern: <code className="bg-stone-200 px-1 py-0.5 rounded">{c.from_pattern}</code>
                            </p>
                          )}
                          {c.snippet && (
                            <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">{c.snippet}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-stone-400 italic text-center py-12">No related case law found for this clause</p>
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
                        <div key={i} className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-l-4 border-purple-600 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <strong className="text-purple-900 text-sm">{act.act_name} {act.year ? `(${act.year})` : ''}</strong>
                            <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                              {((act.similarity_score || 0) * 100).toFixed(0)}% match
                            </span>
                          </div>
                          {act.section_number && <p className="m-0 mb-1 text-xs text-stone-600"><strong>Section:</strong> {act.section_number}</p>}
                          {act.section_heading && <p className="m-0 mb-1 text-xs text-stone-600"><strong>Heading:</strong> {act.section_heading}</p>}
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
                    <p className="text-stone-400 italic text-center py-12">No related legislation found for this clause</p>
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
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Hero Header ──────────────────────────────────────────── */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full mb-6 shadow-xl">
              <svg className="w-10 h-10 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-stone-800 mb-4">
              Contract Risk &amp; Pattern Analysis
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-amber-600 to-orange-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Upload a contract PDF or paste the text to detect legal risk patterns backed by Sri Lankan case law,
              find supporting cases and applicable legislation — all in a single analysis.
            </p>
          </div>

          {/* ── Before results: Upload / Text section ─────────────────── */}
          {!result && !loading && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 border-t-4 border-amber-500">

                  {/* ── Mode Toggle ─────────────────────────────────────── */}
                  <div className="flex gap-2 mb-8 bg-stone-100 rounded-xl p-1.5">
                    <button
                      onClick={() => setInputMode('pdf')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
                        inputMode === 'pdf'
                          ? 'bg-gradient-to-r from-stone-700 to-amber-700 text-white shadow-lg'
                          : 'text-stone-500 hover:text-stone-700 hover:bg-white/60'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload PDF
                    </button>
                    <button
                      onClick={() => setInputMode('text')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
                        inputMode === 'text'
                          ? 'bg-gradient-to-r from-stone-700 to-amber-700 text-white shadow-lg'
                          : 'text-stone-500 hover:text-stone-700 hover:bg-white/60'
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
                      <label className="block text-sm font-bold text-stone-700 mb-2">
                        Contract Text
                      </label>
                      <textarea
                        value={contractText}
                        onChange={(e) => setContractText(e.target.value)}
                        placeholder="Paste the full contract text here…&#10;&#10;Example:&#10;This Employment Agreement is entered into between ABC Company (Employer) and John Doe (Employee)…"
                        rows={14}
                        className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl text-sm text-stone-700 leading-relaxed resize-y focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder:text-stone-400"
                      />
                      <div className="flex justify-between items-center mt-3">
                        <span className={`text-xs font-medium ${contractText.length < 50 ? 'text-stone-400' : 'text-green-600'}`}>
                          {contractText.length} characters {contractText.length < 50 ? '(min 50)' : '✓'}
                        </span>
                        <button
                          onClick={onSubmitText}
                          disabled={contractText.trim().length < 50}
                          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                            contractText.trim().length < 50
                              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-xl hover:scale-[1.02] active:scale-100'
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
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 shadow-lg">
                  <h4 className="font-bold text-blue-900 mb-4 flex items-center text-lg">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    What You'll Get:
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-3 list-none p-0">
                    {[
                      ['Pattern-based risk detection', 'Risks matched against 200+ legal patterns from Sri Lankan case law'],
                      ['Supporting case law', 'Cases linked via pattern + semantic hybrid search'],
                      ['Applicable legislation', 'Relevant acts and sections from Sri Lankan law'],
                      ['Missing provisions', 'Fields your contract should include'],
                      ['Severity assessment', 'CRITICAL / HIGH / MEDIUM risk levels']
                    ].map(([title, desc], i) => (
                      <li key={i} className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span><strong>{title}</strong> — {desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ── Loading state ─────────────────────────────────────────── */}
          {loading && (
            <div className="max-w-xl mx-auto text-center py-24">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full mb-6 shadow-xl animate-pulse">
                <svg className="w-10 h-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-stone-800 mb-2">Analyzing Contract…</h3>
              <p className="text-stone-500 mb-1">Running pattern detection, case retrieval and legislation search.</p>
              <p className="text-stone-400 text-sm">This may take up to 60 seconds for large contracts.</p>
            </div>
          )}

          {/* ── Error banner ──────────────────────────────────────────── */}
          {error && (
            <div className="mb-8 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-400 rounded-2xl p-6 shadow-lg">
              <div className="flex gap-3 items-start">
                <span className="text-2xl">❌</span>
                <div>
                  <p className="text-red-700 font-bold mb-1">Analysis Failed</p>
                  <p className="text-red-600 text-sm">{error}</p>
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
                <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
                  <h4 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Analyze Another
                  </h4>
                  <FileUpload onUpload={onUpload} label="Upload PDF" compact={true} />
                  <div className="mt-3 text-center">
                    <button
                      onClick={() => { setResult(null); setError(''); setInputMode('text'); }}
                      className="text-xs text-amber-700 font-semibold hover:underline"
                    >
                      or paste contract text →
                    </button>
                  </div>
                </div>

                {/* Contract info */}
                <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-stone-600 text-sm font-semibold">Contract Type</p>
                        <p className="text-xl font-bold text-amber-700">{(dataCoverage.label || preprocessing.contract_type || 'unknown').toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-amber-200 text-sm text-stone-600 space-y-1">
                      <p><strong>Source:</strong> {result?.input_mode === 'text' ? '📝 Text Input' : `📄 ${filename}`}</p>
                      <p><strong>Size:</strong> {(result.file_size / 1024).toFixed(1)} KB</p>
                      {preprocessing.contract_confidence != null && (
                        <p><strong>Confidence:</strong> {(preprocessing.contract_confidence * 100).toFixed(0)}%</p>
                      )}
                      {dataCoverage.supported && (
                        <p className="flex items-center gap-1">
                          <strong>Data Coverage:</strong>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            dataCoverage.coverage_level === 'strong' ? 'bg-green-100 text-green-800' :
                            dataCoverage.coverage_level === 'good' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {dataCoverage.coverage_level === 'strong' ? '🟢' : dataCoverage.coverage_level === 'good' ? '🔵' : '🟡'} {dataCoverage.coverage_level?.toUpperCase()}
                          </span>
                        </p>
                      )}
                      {dataCoverage.supported && (
                        <p className="text-xs text-stone-500">{dataCoverage.available_cases} cases, {dataCoverage.available_patterns} patterns available</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Data Coverage Warning — unsupported contract type */}
                {dataCoverage.warning && (
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-2xl p-5 shadow-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-yellow-800 mb-1">Limited Data Coverage</h4>
                        <p className="text-xs text-yellow-700 leading-relaxed">{dataCoverage.warning}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary stats */}
                <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
                  <h4 className="text-base font-bold text-stone-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Analysis Summary
                  </h4>
                  <div className="space-y-3">
                    <StatRow label="Total Clauses" value={summary.total_clauses} color="stone" />
                    <StatRow label="Patterns Detected" value={summary.total_patterns_detected} color="orange" />
                    <StatRow label="Unique Cases" value={summary.unique_cases} color="blue" />
                    <StatRow label="Unique Acts" value={summary.unique_acts} color="purple" />
                    <StatRow label="Processing Time" value={`${(summary.processing_time_ms / 1000).toFixed(1)}s`} color="stone" />
                  </div>
                </div>

                {/* Missing fields */}
                {missingList.length > 0 && (
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl p-6 shadow-lg">
                    <h4 className="text-base font-bold text-red-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Missing Provisions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {missingList.map((f, i) => (
                        <span key={i} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold border border-red-200">
                          {f.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── MAIN CONTENT ───────────────────────────────────────── */}
              <div className="lg:col-span-3 space-y-8">

                {/* ── Risk Summary Banner ──────────────────────────────── */}
                {summary.total_patterns_detected > 0 && (
                  <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 border-2 border-orange-400 rounded-3xl p-8 shadow-xl">
                    <div className="flex items-start gap-4 mb-6">
                      <span className="text-4xl">🚨</span>
                      <div>
                        <h3 className="text-2xl font-bold text-orange-900">Risk Pattern Summary</h3>
                        <p className="text-orange-700 font-medium mt-1">Pattern-based risk detections across your contract</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <SummaryCard label="Risk Patterns" value={summary.total_patterns_detected} emoji="🔍" borderColor="border-orange-300" />
                      <SummaryCard label="Clauses at Risk" value={summary.clauses_with_patterns} emoji="⚠️" borderColor="border-red-300" />
                      <SummaryCard label="Cases Found" value={summary.unique_cases} emoji="📚" borderColor="border-blue-300" />
                      <SummaryCard label="Acts Found" value={summary.unique_acts} emoji="📖" borderColor="border-purple-300" />
                    </div>
                  </div>
                )}

                {/* ── Simplified Contract View ───────────────────────── */}
                {simplifiedClauses.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-sky-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-sky-600 to-cyan-600 px-8 py-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">Simple English Version</h3>
                        <p className="text-sky-100 text-xs">Quick plain-language view of detected clauses</p>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(simplifiedContractText)}
                        className="px-3 py-2 bg-white text-sky-700 rounded-lg text-xs font-bold hover:bg-sky-50 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="px-8 py-6 bg-sky-50/40">
                      <div className="max-h-80 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-stone-700 bg-white border border-sky-100 rounded-xl p-4">
                        {simplifiedContractText}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── AI Risk Analysis Report ──────────────────────────── */}
                {result.ai_risk_report && (
                  <div className="bg-white rounded-2xl shadow-xl border-2 border-emerald-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-8 py-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🤖</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">AI Risk Analysis Report</h3>
                            <p className="text-emerald-100 text-sm">
                              Generated by {result.ai_risk_report.model || 'Gemini'} — synthesizing {summary.total_patterns_detected || 0} patterns, {summary.unique_cases || 0} cases, {summary.unique_acts || 0} acts
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {result.ai_risk_report.risk_score && (
                            <span className={`px-4 py-2 rounded-lg text-sm font-bold shadow-lg ${
                              result.ai_risk_report.risk_score === 'CRITICAL' ? 'bg-red-500 text-white' :
                              result.ai_risk_report.risk_score === 'HIGH' ? 'bg-orange-500 text-white' :
                              result.ai_risk_report.risk_score === 'MEDIUM' ? 'bg-yellow-400 text-stone-900' :
                              'bg-green-400 text-stone-900'
                            }`}>
                              {result.ai_risk_report.risk_score} RISK
                            </span>
                          )}
                          {result.ai_risk_report.generation_time_ms && (
                            <span className="text-emerald-200 text-xs">
                              {(result.ai_risk_report.generation_time_ms / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Report Content */}
                    {(aiLoading || result.ai_risk_report.loading) ? (
                      <div className="px-8 py-6">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          <div>
                            <p className="text-emerald-900 text-sm font-semibold">Generating AI report in background...</p>
                            <p className="text-emerald-700 text-xs">Core analysis is ready; Gemini synthesis will appear automatically.</p>
                          </div>
                        </div>
                      </div>
                    ) : result.ai_risk_report.risk_report ? (
                      <div className="px-8 py-6">
                        <SimpleMarkdown text={result.ai_risk_report.risk_report} />

                        {(riskyClauses.length > 0 || missingProtections.length > 0 || referencedCases.length > 0) && (
                          <div className="mt-8 space-y-6">
                            {riskyClauses.length > 0 && (
                              <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-5">
                                <h4 className="text-base font-bold text-red-900 mb-3">Risky Clauses (Quick Jump)</h4>
                                <div className="space-y-3">
                                  {riskyClauses.map((risk, idx) => (
                                    <div key={`risk-clause-${idx}`} className="bg-white border border-red-100 rounded-lg p-3">
                                      <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="text-xs font-bold bg-stone-900 text-white px-2 py-1 rounded">Risk #{risk.risk_number}</span>
                                        {risk.severity && (
                                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                                            risk.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                                            risk.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                                            risk.severity === 'MEDIUM' ? 'bg-yellow-400 text-stone-900' :
                                            'bg-blue-500 text-white'
                                          }`}>
                                            {risk.severity}
                                          </span>
                                        )}
                                        <span className="text-sm font-semibold text-stone-800">{risk.risk_title}</span>
                                      </div>
                                      <p className="text-xs text-stone-600 mb-2">{risk.affected_clause || 'Clause reference unavailable'}</p>
                                      {risk.clause_ids?.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                          {risk.clause_ids.map((cid) => (
                                            <a
                                              key={`${risk.risk_number}-${cid}`}
                                              href={`#clause-${cid}`}
                                              className="text-xs font-semibold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-1 rounded hover:bg-amber-200"
                                            >
                                              Go to Clause {cid}
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
                              <div className="bg-gradient-to-br from-amber-50 to-red-50 border border-amber-300 rounded-xl p-5">
                                <h4 className="text-base font-bold text-amber-900 mb-3">Missing Protections</h4>
                                <div className="space-y-3">
                                  {missingProtections.map((risk, idx) => (
                                    <div key={`missing-protection-${idx}`} className="bg-white border border-amber-200 rounded-lg p-3">
                                      <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="text-xs font-bold bg-stone-900 text-white px-2 py-1 rounded">Risk #{risk.risk_number}</span>
                                        {risk.severity && (
                                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                                            risk.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                                            risk.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                                            risk.severity === 'MEDIUM' ? 'bg-yellow-400 text-stone-900' :
                                            'bg-blue-500 text-white'
                                          }`}>
                                            {risk.severity}
                                          </span>
                                        )}
                                        <span className="text-sm font-semibold text-stone-800">{risk.risk_title}</span>
                                      </div>

                                      <p className="text-xs text-stone-700 mb-1">
                                        {risk.affected_clause || 'Missing clause/protection (no clause reference)'}
                                      </p>

                                      {risk.direct_issue && (
                                        <p className="text-xs text-stone-600 mb-1"><strong>Issue:</strong> {risk.direct_issue}</p>
                                      )}

                                      {risk.recommended_fix && (
                                        <p className="text-xs text-emerald-700"><strong>Recommended Fix:</strong> {risk.recommended_fix}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {referencedCases.length > 0 && (
                              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-5">
                                <h4 className="text-base font-bold text-blue-900 mb-3">Referenced Cases (Open Source)</h4>
                                <div className="space-y-2">
                                  {referencedCases.map((c, idx) => (
                                    <div key={`ref-case-${idx}`} className="bg-white border border-blue-100 rounded-lg p-3 flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <p className="text-sm font-semibold text-blue-900 break-words">{c.case_name}</p>
                                        {c.raw_support_text && (
                                          <p className="text-xs text-stone-600 mt-1 break-words">{c.raw_support_text}</p>
                                        )}
                                      </div>
                                      <a
                                        href={getCaseSearchUrl(c.case_name)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="shrink-0 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded"
                                      >
                                        View Case
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-between">
                          <p className="text-xs text-stone-400 italic">
                            This analysis is AI-generated based on pattern matching against Sri Lankan legal databases. 
                            It should be reviewed by a qualified legal professional.
                          </p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(result.ai_risk_report.risk_report);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all flex items-center gap-2"
                          >
                            📋 Copy Report
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

                {/* ── Top Cases Banner ──────────────────────────────────── */}
                {result.aggregated_results?.top_cases?.length > 0 && (
                  <details className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
                    <summary className="cursor-pointer px-8 py-5 bg-gradient-to-r from-blue-50 to-cyan-50 font-bold text-blue-800 text-lg flex items-center gap-2 hover:bg-blue-100 transition-colors">
                      📚 Top {Math.min(result.aggregated_results.top_cases.length, 10)} Most Relevant Cases (across all clauses)
                    </summary>
                    <div className="px-8 py-6 space-y-3">
                      {result.aggregated_results.top_cases.slice(0, 10).map((c, i) => (
                        <div key={i} className="flex justify-between items-start p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex-1">
                            <p className="font-semibold text-blue-900 text-sm">{c.case_name}</p>
                            <p className="text-xs text-stone-500">{c.year} · {c.category}</p>
                          </div>
                          <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold ml-3 whitespace-nowrap">
                            {((c.similarity || 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {/* ── Top Acts Banner ──────────────────────────────────── */}
                {result.aggregated_results?.top_acts?.length > 0 && (
                  <details className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
                    <summary className="cursor-pointer px-8 py-5 bg-gradient-to-r from-purple-50 to-pink-50 font-bold text-purple-800 text-lg flex items-center gap-2 hover:bg-purple-100 transition-colors">
                      📖 Top {Math.min(result.aggregated_results.top_acts.length, 10)} Most Relevant Acts (across all clauses)
                    </summary>
                    <div className="px-8 py-6 space-y-3">
                      {result.aggregated_results.top_acts.slice(0, 10).map((act, i) => (
                        <div key={i} className="flex justify-between items-start p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex-1">
                            <p className="font-semibold text-purple-900 text-sm">{act.act_name} {act.year ? `(${act.year})` : ''}</p>
                            <p className="text-xs text-stone-500">Section {act.section_number} — {act.section_heading}</p>
                          </div>
                          <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold ml-3 whitespace-nowrap">
                            {((act.similarity_score || 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {/* ── Clause-by-Clause Section ─────────────────────────── */}
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
                      <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Clause-by-Clause Analysis
                    </h2>
                    <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-5 py-2 rounded-full font-bold shadow-lg">
                      {summary.total_clauses} Clauses
                    </span>
                  </div>
                  <p className="text-gray-500 mb-6">Click any clause to expand. Clauses with detected patterns are auto-expanded.</p>
                  <div className="space-y-4">
                    {(result.pattern_detection?.clauses_with_patterns || []).map(clause => renderClause(clause))}
                  </div>
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
    stone:  'bg-gradient-to-r from-stone-700 to-amber-700 text-white shadow-lg',
    orange: 'bg-orange-600 text-white shadow-lg',
    blue:   'bg-blue-600 text-white shadow-lg',
    purple: 'bg-purple-600 text-white shadow-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
        active
          ? activeClass[color]
          : disabled
            ? 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed'
            : 'bg-white text-stone-600 border-2 border-stone-200 hover:border-stone-400'
      }`}
    >
      {children}
    </button>
  );
}

function StatRow({ label, value, color }) {
  const border = {
    stone:  'border-stone-700',
    orange: 'border-orange-600',
    blue:   'border-blue-600',
    purple: 'border-purple-600',
  };
  const text = {
    stone:  'text-stone-800',
    orange: 'text-orange-700',
    blue:   'text-blue-700',
    purple: 'text-purple-700',
  };

  return (
    <div className={`flex justify-between items-center p-3 rounded-xl border-l-4 ${border[color]} bg-gradient-to-r from-stone-50 to-amber-50`}>
      <span className="text-sm text-stone-600 font-semibold">{label}</span>
      <span className={`text-xl font-bold ${text[color]}`}>{value ?? '—'}</span>
    </div>
  );
}

function SummaryCard({ label, value, emoji, borderColor }) {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-lg border-2 ${borderColor}`}>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-stone-600 font-semibold text-xs mb-1">{label}</p>
          <p className="text-3xl font-bold text-stone-800">{value ?? 0}</p>
        </div>
        <span className="text-3xl opacity-30">{emoji}</span>
      </div>
    </div>
  );
}
