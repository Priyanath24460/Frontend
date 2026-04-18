import React, { useState } from 'react';
import FileUpload from '../components/FileUpload.jsx';
import Header from '../components/Header.jsx';

const ANALYZE_API_BASE =
  (import.meta.env?.VITE_ANALYZE_API_BASE || (import.meta.env?.DEV ? '/api/analyze' : 'https://analyze-api.pasindi.me')).replace(/\/$/, '');

export default function ComprehensiveAnalysis(){
  const [clauses, setClauses] = useState([]);
  const [contractType, setContractType] = useState(null);
  const [warning, setWarning] = useState('');
  const [loading, setLoading] = useState({
    clauses: false,
    risks: false,
    cases: false,
    acts: false
  });
  const [data, setData] = useState({
    risks: {},      // clause_id -> risks data
    cases: { results: [] },  // global cases results
    acts: { results: [] },   // global acts results
    summary: null
  });
  const [error, setError] = useState('');
  const [expandedClauses, setExpandedClauses] = useState({});
  const [clauseTabs, setClauseTabs] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const extractClauses = async (pdfFile) => {
    setLoading(prev => ({ ...prev, clauses: true }));
    try {
      const formData = new FormData();
      formData.append('file', pdfFile);
      const response = await fetch('/analyze-clauses', { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      const extractedClauses = result.clauses || [];
      
      // Capture contract type and show a generic notice for unsupported domains.
      const contractTypeValue = result.contract_type?.toLowerCase() || 'unknown';
      setContractType(contractTypeValue);
      
      if (!['employment', 'lease', 'loan', 'service', 'trust', 'sales'].includes(contractTypeValue)) {
        setWarning(`⚠️ Limited Analysis: This appears to be a ${result.contract_type || 'specialized'} contract. Coverage may be limited for this domain.`);
      } else {
        setWarning('');
      }
      
      // DON'T call setClauses here - let onUpload handle setting clauses with merged data
      setLoading(prev => ({ ...prev, clauses: false }));
      return extractedClauses;
    } catch (err) {
      console.error('Clause extraction error:', err);
      setError(`Clause extraction failed: ${err.message}`);
      setLoading(prev => ({ ...prev, clauses: false }));
      return null;
    }
  };

  const analyzeRisksAndGetClauses = async (pdfFile) => {
    setLoading(prev => ({ ...prev, risks: true }));
    try {
      const formData = new FormData();
      formData.append('file', pdfFile);
      const response = await fetch('/analyze-contract-risks', { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      console.log('Risk analysis full response:', result);
      
      const risksMap = {};
      const allClauses = [];
      
      // Extract clauses and risks from response
      const clausesList = result.risk_analysis?.clauses_with_risks || 
                         result.full_results?.clauses_with_risks ||
                         result.clauses_with_risks || 
                         result.clauses || 
                         [];
      
      console.log('Clauses with risks found:', clausesList.length);
      
      clausesList.forEach(clause => {
        console.log(`Processing clause ${clause.clause_id}:`, clause);
        console.log(`Available fields in ${clause.clause_id}:`, Object.keys(clause));
        
        // Try all possible text fields
        const textContent = clause.clause_text || 
                           clause.full_text || 
                           clause.text_preview || 
                           clause.text || 
                           clause.content ||
                           null;
        
        console.log(`Text for ${clause.clause_id}:`, textContent ? `${textContent.substring(0, 50)}...` : 'NO TEXT FOUND');
        
        risksMap[clause.clause_id] = {
          risks: clause.identified_risks || clause.risks || [],
          risk_count: clause.risk_count || 0,
          signals: clause.signals || []
        };
        
        allClauses.push({
          clause_id: clause.clause_id,
          clause_type: clause.clause_type || 'general',
          clause_text: textContent || `[Full text not available]`,
          text_length: (textContent || '').length,
          signals: clause.signals || [],
          hasFullText: !!textContent
        });
      });
      
      console.log('Final risks map:', risksMap);
      console.log('All clauses from risk API:', allClauses);
      
      setLoading(prev => ({ ...prev, risks: false }));
      
      return {
        clauses: allClauses,
        risks: risksMap,
        summary: result.summary
      };
    } catch (err) {
      console.warn('Risk analysis error:', err);
      setLoading(prev => ({ ...prev, risks: false }));
      return null;
    }
  };

  const searchCases = async (clauseList) => {
    setLoading(prev => ({ ...prev, cases: true }));
    try {
      if (!clauseList || clauseList.length === 0) {
        setLoading(prev => ({ ...prev, cases: false }));
        return;
      }
      
      // ✓ FIX: Search each clause individually instead of combining all clauses
      // This ensures each clause gets relevant case results, not generic ones
      const allCaseResults = [];
      
      for (const clause of clauseList) {
        const clause_text = clause.clause_text || '';
        const signals = clause.signals || [];
        const problem_type = clause.problem_type || null;  // NEW: Problem type for targeted search
        
        // Validate clause has content
        if (!clause_text || clause_text.trim().length === 0) {
          console.warn(`Skipping empty clause: ${clause.clause_id}`);
          continue;
        }
        
        console.log(`Searching cases for clause ${clause.clause_id}:`, clause_text.substring(0, 100) + '...');
        
        try {
          const response = await fetch(`${ANALYZE_API_BASE}/proxy/case-similar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              text: clause_text.substring(0, 500),  // Limit query size
              contract_type: contractType || 'unknown',
              clauses: [{ clause_id: clause.clause_id, clause_text }],
              top_k: 10 
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            const caseResults = result.cases || result.results || [];
            
            // Tag results with source clause for display
            const taggedResults = caseResults.map(c => ({
              ...c,
              source_clause_id: clause.clause_id,
              source_clause_type: clause.clause_type
            }));
            
            allCaseResults.push(...taggedResults);
            console.log(`  ✓ Found ${caseResults.length} cases for ${clause.clause_id}`);
          } else {
            console.warn(`Case search failed for ${clause.clause_id}: HTTP ${response.status}`);
          }
        } catch (err) {
          console.warn(`Case search error for ${clause.clause_id}:`, err.message);
        }
      }
      
      console.log(`Total case results across all clauses: ${allCaseResults.length}`);
      setData(prev => ({ ...prev, cases: { results: allCaseResults } }));
      setLoading(prev => ({ ...prev, cases: false }));
    } catch (err) {
      console.warn(`Case search batch failed: ${err.message}`);
      setLoading(prev => ({ ...prev, cases: false }));
    }
  };

  const searchActs = async (clauseList) => {
    setLoading(prev => ({ ...prev, acts: true }));
    try {
      if (!clauseList || clauseList.length === 0) {
        setLoading(prev => ({ ...prev, acts: false }));
        return;
      }
      
      // ✓ FIX: Search each clause individually instead of combining all clauses
      // This ensures each clause gets relevant act/legislation results, not generic ones
      const allActResults = [];
      
      for (const clause of clauseList) {
        const query_text = clause.clause_text || '';
        const signals = clause.signals || [];
        const problem_type = clause.problem_type || null;  // NEW: Problem type for targeted search
        
        // Validate clause has content
        if (!query_text || query_text.trim().length === 0) {
          console.warn(`Skipping empty clause: ${clause.clause_id}`);
          continue;
        }
        
        console.log(`Searching acts for clause ${clause.clause_id}:`, query_text.substring(0, 100) + '...');
        
        try {
          const response = await fetch(`${ANALYZE_API_BASE}/proxy/acts-search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              query_text: query_text.substring(0, 500),  // Limit query size
              domain: contractType || 'unknown',
              signals: signals,
              problem_type: problem_type,  // NEW: Send problem type for targeted search
              top_k: 10 
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            const actResults = result.sections || result.results || [];
            
            // Tag results with source clause for display
            const taggedResults = actResults.map(a => ({
              ...a,
              source_clause_id: clause.clause_id,
              source_clause_type: clause.clause_type
            }));
            
            allActResults.push(...taggedResults);
            console.log(`  ✓ Found ${actResults.length} acts for ${clause.clause_id}`);
          } else {
            console.warn(`Act search failed for ${clause.clause_id}: HTTP ${response.status}`);
          }
        } catch (err) {
          console.warn(`Act search error for ${clause.clause_id}:`, err.message);
        }
      }
      
      console.log(`Total act results across all clauses: ${allActResults.length}`);
      setData(prev => ({ ...prev, acts: { results: allActResults } }));
      setLoading(prev => ({ ...prev, acts: false }));
    } catch (err) {
      console.warn(`Act search batch failed: ${err.message}`);
      setLoading(prev => ({ ...prev, acts: false }));
    }
  };

  const onUpload = async (file) => {
    setError('');
    setClauses([]);
    setData({ risks: {}, cases: { results: [] }, acts: { results: [] }, summary: null });
    setIsAnalyzing(true);
    
    // Extract clauses and risks in parallel to get complete data
    const [extractedClauses, riskData] = await Promise.all([
      extractClauses(file),
      analyzeRisksAndGetClauses(file)
    ]).catch(err => {
      console.error('Initial analysis error:', err);
      return [null, null];
    });
    
    if (!riskData || !riskData.clauses) {
      setIsAnalyzing(false);
      return;
    }
    
    // Use clauses from risk API (has all 6), merge with extracted for better text
    const clauseTextMap = {};
    if (extractedClauses) {
      extractedClauses.forEach(c => {
        clauseTextMap[c.clause_id] = c.clause_text;
      });
    }
    
    const allClauses = riskData.clauses.map(clause => ({
      ...clause,
      // Use full text from extract API if available, otherwise use what we have
      clause_text: clauseTextMap[clause.clause_id] || clause.clause_text || clause.text_preview || `[Clause ${clause.clause_id}]`
    }));
    
    console.log('Final clauses to display:', allClauses);
    
    // DISPLAY CLAUSES IMMEDIATELY (progressive display)
    setClauses(allClauses);
    setData(prev => ({ ...prev, risks: riskData.risks }));
    
    // Auto-expand all clauses
    const expandedState = {};
    const initialTabs = {};
    allClauses.forEach(clause => {
      expandedState[clause.clause_id] = true;
      initialTabs[clause.clause_id] = 'text';
    });
    setExpandedClauses(expandedState);
    setClauseTabs(initialTabs);
    
    // NOW search for cases and acts in parallel (without blocking)
    setLoading(prev => ({ ...prev, cases: true, acts: true }));
    
    Promise.all([
      searchCases(allClauses),
      searchActs(allClauses)
    ]).finally(() => {
      setIsAnalyzing(false);
      setLoading(prev => ({ ...prev, cases: false, acts: false }));
    });
  };

  const toggleExpandClause = (clauseId) => {
    setExpandedClauses(prev => ({
      ...prev,
      [clauseId]: !prev[clauseId]
    }));
    // Set default tab when expanding
    if (!expandedClauses[clauseId]) {
      setClauseTabs(prev => ({
        ...prev,
        [clauseId]: prev[clauseId] || 'text'
      }));
    }
  };

  const setActiveTab = (clauseId, tab) => {
    setClauseTabs(prev => ({
      ...prev,
      [clauseId]: tab
    }));
  };

  // Calculate risk summary
  const getRiskSummary = () => {
    const allRisks = Object.values(data.risks);
    const totalRisks = allRisks.reduce((sum, r) => sum + (r.risks?.length || 0), 0);
    const highRiskClauses = allRisks.filter(r => r.risks?.length > 0);
    const missingProvisions = new Set();
    
    allRisks.forEach(r => {
      r.signals?.forEach(s => missingProvisions.add(s));
    });
    
    return {
      totalRisks,
      highRiskClauseIds: highRiskClauses.map((_) => {
        const clauseId = Object.keys(data.risks)[Object.values(data.risks).indexOf(_)];
        return clauseId;
      }).filter(Boolean),
      missingProvisions: Array.from(missingProvisions)
    };
  };

  const renderClause = (clause) => {
    const clauseRisks = data.risks[clause.clause_id] || {};
    const riskList = clauseRisks.risks || [];
    const isExpanded = expandedClauses[clause.clause_id];
    const activeTab = clauseTabs[clause.clause_id] || 'text';
    
    const hasRisks = riskList.length > 0;
    const hasCases = data.cases.results && data.cases.results.length > 0;
    const hasActs = data.acts.results && data.acts.results.length > 0;
    
    return (
      <div key={clause.clause_id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl border border-amber-100 overflow-hidden transition-all duration-300">
        {/* Header with expand/collapse */}
        <div onClick={() => toggleExpandClause(clause.clause_id)} className={`flex justify-between items-center cursor-pointer px-8 py-6 bg-linear-to-r ${isExpanded ? 'from-stone-100 via-amber-50 to-orange-50 border-b-2 border-amber-200' : 'from-stone-50 to-gray-50'} transition-all duration-300`}>
          <div className="flex items-center gap-6 flex-1">
            <span className={`text-2xl transition-transform duration-300 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>▼</span>
            <div className="flex items-center gap-3">
              <span className="bg-linear-to-r from-stone-700 via-amber-700 to-orange-700 text-white px-3 py-1 rounded-lg text-sm font-bold uppercase">{clause.clause_type}</span>
              <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-sm font-semibold border border-amber-200">{clause.clause_id}</span>
            </div>
          </div>
          <span className="text-stone-500 text-sm font-medium bg-stone-100 px-3 py-1 rounded-lg">{clause.clause_text?.length || 0} chars</span>
        </div>

        {/* Expanded content with tabs */}
        {isExpanded && (
          <div>
            {/* Tabs Navigation */}
            <div className="flex gap-2 px-8 py-4 bg-stone-50 border-b-2 border-amber-200 flex-wrap">
              {/* Text Tab */}
              <button
                onClick={() => setActiveTab(clause.clause_id, 'text')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  activeTab === 'text'
                    ? 'bg-linear-to-r from-stone-700 via-amber-700 to-orange-700 text-white shadow-lg'
                    : 'bg-white text-stone-600 border-2 border-stone-200 hover:border-stone-400'
                }`}
              >
                📄 Clause Text
              </button>

              {/* Risks Tab */}
              <button
                onClick={() => setActiveTab(clause.clause_id, 'risks')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  activeTab === 'risks'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : `${hasRisks ? 'bg-white text-stone-600 border-2 border-orange-300' : 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed'}`
                }`}
                disabled={!hasRisks}
              >
                ⚠️ Risks ({riskList.length})
              </button>

              {/* Cases Tab */}
              <button
                onClick={() => setActiveTab(clause.clause_id, 'cases')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  activeTab === 'cases'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : `${hasCases || loading.cases ? 'bg-white text-stone-600 border-2 border-blue-300' : 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed'}`
                }`}
                disabled={!hasCases && !loading.cases}
              >
                📚 Cases {loading.cases ? '⏳' : `(${data.cases.results?.length || 0})`}
              </button>

              {/* Acts Tab */}
              <button
                onClick={() => setActiveTab(clause.clause_id, 'acts')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  activeTab === 'acts'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : `${hasActs || loading.acts ? 'bg-white text-stone-600 border-2 border-purple-300' : 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed'}`
                }`}
                disabled={!hasActs && !loading.acts}
              >
                📖 Acts {loading.acts ? '⏳' : `(${data.acts.results?.length || 0})`}
              </button>
            </div>

            {/* Tab Content */}
            <div className="px-8 py-6 min-h-52">
              {/* TEXT TAB */}
              {activeTab === 'text' && (
                <div>
                  <h4 className="mb-4 text-stone-800 text-lg font-bold">📄 Full Clause Text</h4>
                  <div className="bg-linear-to-br from-stone-50 to-amber-50 p-6 border-l-4 border-amber-700 rounded-lg mb-6 shadow-sm">
                    <p className="m-0 leading-relaxed whitespace-pre-wrap text-stone-700 text-base font-normal font-sans">
                      {clause.clause_text || '[No text available]'}
                    </p>
                  </div>

                  {/* Copy Button */}
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(clause.clause_text);
                      alert('✅ Clause text copied to clipboard!');
                    }}
                    className="px-6 py-3 bg-linear-to-r from-stone-700 via-amber-700 to-orange-700 text-white rounded-lg cursor-pointer font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    📋 Copy Clause Text
                  </button>
                </div>
              )}

              {/* RISKS TAB */}
              {activeTab === 'risks' && (
                <div>
                  <h4 className="mb-4 text-orange-700 text-lg font-bold">⚠️ Identified Risks</h4>
                  {riskList.length > 0 ? (
                    <div className="space-y-3">
                      {riskList.map((risk, i) => (
                        <div key={i} className="bg-linear-to-r from-orange-50 to-amber-50 p-4 border-l-4 border-orange-600 rounded-lg shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <strong className="text-orange-700 text-sm">{risk.risk}</strong>
                            <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold">
                              {risk.confidence_percent || `${(risk.confidence * 100).toFixed(0)}%`} confidence
                            </span>
                          </div>
                          {risk.explanation && <p className="m-0 mb-2 text-sm text-stone-600">{risk.explanation}</p>}
                          {risk.legal_basis && Array.isArray(risk.legal_basis) && risk.legal_basis.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {risk.legal_basis.map((b, j) => (
                                <span key={j} className="bg-orange-200 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                                  ⚖️ {b}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-stone-400 italic text-center py-16">✓ No risks identified for this clause</p>
                  )}
                </div>
              )}

              {/* CASES TAB */}
              {activeTab === 'cases' && (
                <div>
                  <h4 className="mb-4 text-blue-800 text-lg font-bold">📚 Related Case Law</h4>
                  {loading.cases ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-linear-to-r from-blue-50 to-cyan-50 p-4 border-l-4 border-blue-600 rounded-lg animate-pulse">
                          <div className="h-4 bg-blue-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-blue-100 rounded w-1/2"></div>
                        </div>
                      ))}
                      <p className="text-center text-blue-600 font-semibold mt-4">⏳ Searching case law...</p>
                    </div>
                  ) : data.cases.results && data.cases.results.length > 0 ? (
                    <div className="space-y-3">
                      {data.cases.results.slice(0, 3).map((caseItem, i) => (
                        <div key={i} className="bg-linear-to-r from-blue-50 to-cyan-50 p-4 border-l-4 border-blue-600 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <strong className="text-blue-800 text-sm">{caseItem.case_name}</strong>
                            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                              {Math.round((Number(caseItem.similarity_score ?? caseItem.similarity ?? 0)) * 100)}% match
                            </span>
                          </div>
                          {caseItem.main_category && <p className="m-0 mb-1 text-xs text-stone-600"><strong>Category:</strong> {caseItem.main_category}</p>}
                          {caseItem.sub_category && <p className="m-0 mb-1 text-xs text-stone-600"><strong>Sub-Category:</strong> {caseItem.sub_category}</p>}
                          {caseItem.key_takeaway && <p className="m-0 mb-1 text-xs text-stone-600"><strong>Takeaway:</strong> {caseItem.key_takeaway}</p>}
                          {caseItem.outcome && <p className="m-0 text-xs text-green-700 font-semibold"><strong>⚖️ Outcome:</strong> {caseItem.outcome}</p>}
                        </div>
                      ))}
                      {data.cases.results.length > 3 && (
                        <p className="text-stone-400 text-xs text-center mt-3 italic">
                          Showing 3 of {data.cases.results.length} results
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-stone-400 italic text-center py-16">No related case law found</p>
                  )}
                </div>
              )}

              {/* ACTS TAB */}
              {activeTab === 'acts' && (
                <div>
                  <h4 className="mb-4 text-purple-900 text-lg font-bold">📖 Related Legislation</h4>
                  {loading.acts ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-linear-to-r from-purple-50 to-pink-50 p-4 border-l-4 border-purple-600 rounded-lg animate-pulse">
                          <div className="h-4 bg-purple-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-purple-100 rounded w-1/2"></div>
                        </div>
                      ))}
                      <p className="text-center text-purple-600 font-semibold mt-4">⏳ Searching legislation...</p>
                    </div>
                  ) : data.acts.results && data.acts.results.length > 0 ? (
                    <div className="space-y-3">
                      {data.acts.results.slice(0, 3).map((act, i) => (
                        <div key={i} className="bg-linear-to-r from-purple-50 to-pink-50 p-4 border-l-4 border-purple-600 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <strong className="text-purple-900 text-sm">{act.act_name} {act.year && `(${act.year})`}</strong>
                            <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold">
                              {Math.round((Number(act.similarity_score ?? act.similarity ?? 0)) * 100)}% match
                            </span>
                          </div>
                          {act.section_number && <p className="m-0 mb-1 text-xs text-stone-600"><strong>Section:</strong> {act.section_number}</p>}
                          {act.section_heading && <p className="m-0 mb-1 text-xs text-stone-600"><strong>Heading:</strong> {act.section_heading}</p>}
                          {act.domain && <p className="m-0 text-xs text-stone-600"><strong>Domain:</strong> {act.domain}</p>}
                        </div>
                      ))}
                      {data.acts.results.length > 3 && (
                        <p className="text-stone-400 text-xs text-center mt-3 italic">
                          Showing 3 of {data.acts.results.length} results
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-stone-400 italic text-center py-16">No related legislation found</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-stone-50 to-amber-50">
      <Header />
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="mb-8 rounded-2xl bg-linear-to-r from-stone-800 via-amber-900 to-orange-800 text-white p-8 shadow-xl">
            <h1 className="text-3xl md:text-4xl font-bold">Comprehensive Contract Analysis</h1>
            <p className="mt-2 text-amber-100">
              Upload a contract to extract clauses, detect risks, and retrieve related case law and legislation.
            </p>
          </section>

          {warning && (
            <div className="mb-6 rounded-xl border border-amber-300 bg-linear-to-r from-amber-50 to-orange-50 p-4 text-amber-900">
              {warning.replace('⚠️ Limited Analysis: ', '')}
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl border border-red-300 bg-linear-to-r from-red-50 to-red-100 p-4 text-red-800">
              {error}
            </div>
          )}

          {clauses.length === 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-amber-100 shadow-lg p-8">
                <FileUpload onUpload={onUpload} />
              </div>
              <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-lg p-6">
                <h3 className="text-lg font-bold text-blue-900">What You Get</h3>
                <ul className="mt-3 space-y-2 text-sm text-blue-800">
                  <li>Clause extraction and contract typing</li>
                  <li>Risk detection per clause</li>
                  <li>Related case law references</li>
                  <li>Relevant legal acts and sections</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <aside className="lg:col-span-1 space-y-4">
                <div className="bg-white rounded-2xl border border-amber-100 shadow-lg p-4">
                  <FileUpload onUpload={onUpload} label="Upload Another PDF" />
                </div>

                <div className="bg-white rounded-2xl border border-amber-100 shadow-lg p-4 space-y-2">
                  <p className="text-sm text-stone-600">Contract Type</p>
                  <p className="text-lg font-bold text-stone-800">{(contractType || 'unknown').toUpperCase()}</p>
                  <p className="text-sm text-stone-600">Total Clauses</p>
                  <p className="text-lg font-bold text-stone-800">{clauses.length}</p>
                  <p className="text-sm text-stone-600">Cases</p>
                  <p className="text-lg font-bold text-blue-700">{data.cases.results?.length || 0}</p>
                  <p className="text-sm text-stone-600">Acts</p>
                  <p className="text-lg font-bold text-purple-700">{data.acts.results?.length || 0}</p>
                </div>

                {isAnalyzing && (
                  <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-300 p-4 text-sm text-amber-900">
                    Analysis in progress. Clauses are shown first, then cases and acts load progressively.
                  </div>
                )}
              </aside>

              <section className="lg:col-span-3 space-y-6">
                {Object.keys(data.risks).length > 0 && (() => {
                  const summary = getRiskSummary();
                  return (
                    <div className="rounded-2xl border border-orange-300 bg-linear-to-br from-orange-50 to-amber-50 p-6 shadow-lg">
                      <h2 className="text-xl font-bold text-orange-900">Risk Summary</h2>
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="rounded-lg bg-white border border-orange-200 p-3">
                          <p className="text-xs text-orange-700">Total Risks</p>
                          <p className="text-2xl font-bold text-orange-800">{summary.totalRisks}</p>
                        </div>
                        <div className="rounded-lg bg-white border border-red-200 p-3">
                          <p className="text-xs text-red-700">High-Risk Clauses</p>
                          <p className="text-2xl font-bold text-red-800">{summary.highRiskClauseIds.length}</p>
                        </div>
                        <div className="rounded-lg bg-white border border-amber-200 p-3">
                          <p className="text-xs text-amber-700">Missing Provisions</p>
                          <p className="text-2xl font-bold text-amber-800">{summary.missingProvisions.length}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="space-y-4">
                  {clauses.map((clause) => renderClause(clause))}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
