import React, { useState } from 'react';
import FileUpload from '../components/FileUpload.jsx';
import Header from '../components/Header.jsx';
import { ContractAPI } from '../config/api.js';

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

  const extractClauses = async (pdfFile) => {
    setLoading(prev => ({ ...prev, clauses: true }));
    try {
      const result = await ContractAPI.analyzeClauses(pdfFile);
      const extractedClauses = result.clauses || [];
      
      // Capture contract type and check if employment
      const contractTypeValue = result.contract_type?.toLowerCase() || 'unknown';
      setContractType(contractTypeValue);
      
      if (contractTypeValue !== 'employment') {
        setWarning(`⚠️ Limited Analysis: This is a ${result.contract_type || 'Non-Employment'} contract. Our system is optimized for employment contracts. You may see fewer related cases and specialized signals.`);
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
      const result = await ContractAPI.analyzeContractRisks(pdfFile);
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
      const clause_text = clauseList.map(c => c.clause_text).join(' ').substring(0, 500);
      const allSignals = clauseList.flatMap(c => c.signals || []);
      console.log('Searching cases with clause_text:', clause_text.substring(0, 100) + '...');
      const response = await fetch('http://localhost:8002/api/v1/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clause_text, signals: allSignals, top_k: 10 })
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Case search API response:', errorText);
        throw new Error(`HTTP ${response.status}`)
      }
      const result = await response.json();
      console.log('Case search results:', result);
      // API returns { cases: [...] } not { results: [...] }
      const caseResults = result.cases || result.results || [];
      setData(prev => ({ ...prev, cases: { results: caseResults } }));
      setLoading(prev => ({ ...prev, cases: false }));
    } catch (err) {
      console.warn(`Case search failed: ${err.message}`);
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
      const query_text = clauseList.map(c => c.clause_text).join(' ').substring(0, 500);
      const allSignals = clauseList.flatMap(c => c.signals || []);
      console.log('Searching acts with query_text:', query_text.substring(0, 100) + '...');
      const response = await fetch('http://localhost:8003/api/v1/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query_text, signals: allSignals, top_k: 10 })
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Act search API response:', errorText);
        throw new Error(`HTTP ${response.status}`)
      }
      const result = await response.json();
      console.log('Act search results:', result);
      // API returns { sections: [...] } not { results: [...] }
      const actResults = result.sections || result.results || [];
      setData(prev => ({ ...prev, acts: { results: actResults } }));
      setLoading(prev => ({ ...prev, acts: false }));
    } catch (err) {
      console.warn(`Act search failed: ${err.message}`);
      setLoading(prev => ({ ...prev, acts: false }));
    }
  };

  const onUpload = async (file) => {
    setError('');
    setClauses([]);
    setData({ risks: {}, cases: { results: [] }, acts: { results: [] }, summary: null });
    
    // Extract clauses and risks in parallel to get complete data
    const [extractedClauses, riskData] = await Promise.all([
      extractClauses(file),
      analyzeRisksAndGetClauses(file)
    ]).catch(err => {
      console.error('Initial analysis error:', err);
      return [null, null];
    });
    
    if (!riskData || !riskData.clauses) return;
    
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
    setClauses(allClauses);
    
    // Auto-expand all clauses
    const expandedState = {};
    const initialTabs = {};
    allClauses.forEach(clause => {
      expandedState[clause.clause_id] = true;
      initialTabs[clause.clause_id] = 'text';
    });
    setExpandedClauses(expandedState);
    setClauseTabs(initialTabs);
    
    // Update risks data
    setData(prev => ({ ...prev, risks: riskData.risks, summary: riskData.summary }));
    
    // Run case and act searches in parallel
    await Promise.all([
      searchCases(allClauses),
      searchActs(allClauses)
    ]).catch(err => console.error('Search analysis error:', err));
  };

  const [expandedClauses, setExpandedClauses] = useState({});
  const [clauseTabs, setClauseTabs] = useState({}); // Track active tab for each clause

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
        <div onClick={() => toggleExpandClause(clause.clause_id)} className={`flex justify-between items-center cursor-pointer px-8 py-6 bg-gradient-to-r ${isExpanded ? 'from-stone-100 via-amber-50 to-orange-50 border-b-2 border-amber-200' : 'from-stone-50 to-gray-50'} transition-all duration-300`}>
          <div className="flex items-center gap-6 flex-1">
            <span className={`text-2xl transition-transform duration-300 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>▼</span>
            <div className="flex items-center gap-3">
              <span className="bg-gradient-to-r from-stone-700 via-amber-700 to-orange-700 text-white px-3 py-1 rounded-lg text-sm font-bold uppercase">{clause.clause_type}</span>
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
                    ? 'bg-gradient-to-r from-stone-700 via-amber-700 to-orange-700 text-white shadow-lg'
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
                    : `${hasCases ? 'bg-white text-stone-600 border-2 border-blue-300' : 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed'}`
                }`}
                disabled={!hasCases}
              >
                📚 Cases ({data.cases.results?.length || 0})
              </button>

              {/* Acts Tab */}
              <button
                onClick={() => setActiveTab(clause.clause_id, 'acts')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  activeTab === 'acts'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : `${hasActs ? 'bg-white text-stone-600 border-2 border-purple-300' : 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed'}`
                }`}
                disabled={!hasActs}
              >
                📖 Acts ({data.acts.results?.length || 0})
              </button>
            </div>

            {/* Tab Content */}
            <div className="px-8 py-6 min-h-52">
              {/* TEXT TAB */}
              {activeTab === 'text' && (
                <div>
                  <h4 className="mb-4 text-stone-800 text-lg font-bold">📄 Full Clause Text</h4>
                  <div className="bg-gradient-to-br from-stone-50 to-amber-50 p-6 border-l-4 border-amber-700 rounded-lg mb-6 shadow-sm">
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
                    className="px-6 py-3 bg-gradient-to-r from-stone-700 via-amber-700 to-orange-700 text-white rounded-lg cursor-pointer font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
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
                        <div key={i} className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 border-l-4 border-orange-600 rounded-lg shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <strong className="text-orange-700 text-sm">{risk.risk}</strong>
                            <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold">
                              {(risk.confidence * 100).toFixed(0)}% confidence
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
                  {data.cases.results && data.cases.results.length > 0 ? (
                    <div className="space-y-3">
                      {data.cases.results.slice(0, 3).map((caseItem, i) => (
                        <div key={i} className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 border-l-4 border-blue-600 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <strong className="text-blue-800 text-sm">{caseItem.case_name}</strong>
                            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                              {(caseItem.similarity_score * 100).toFixed(0)}% match
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
                  {data.acts.results && data.acts.results.length > 0 ? (
                    <div className="space-y-3">
                      {data.acts.results.slice(0, 3).map((act, i) => (
                        <div key={i} className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-l-4 border-purple-600 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <strong className="text-purple-900 text-sm">{act.act_name} {act.year && `(${act.year})`}</strong>
                            <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold">
                              {(act.similarity_score * 100).toFixed(0)}% match
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

  const isAnalyzing = Object.values(loading).some(v => v);

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
            <h1 className="text-4xl lg:text-5xl font-bold text-stone-800 mb-4">Comprehensive Contract Analysis</h1>
            <div className="w-32 h-1 bg-gradient-to-r from-amber-600 to-orange-500 mx-auto mb-4"></div>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6">
              Upload your employment contract for complete AI-powered analysis. Extract clauses, identify legal risks, 
              find missing provisions, and discover related case law and legislation—all in one comprehensive report.
            </p>
            
            {/* Step-by-step guide */}
            <div className="flex flex-wrap justify-center items-center gap-4 max-w-4xl mx-auto mt-8">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">1</div>
                <span className="ml-2 text-sm font-medium text-gray-700">Upload contract PDF</span>
              </div>
              <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">2</div>
                <span className="ml-2 text-sm font-medium text-gray-700">AI analyzes clauses & risks</span>
              </div>
              <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">3</div>
                <span className="ml-2 text-sm font-medium text-gray-700">Get comprehensive report</span>
              </div>
            </div>
          </div>

          {/* Warning Banner */}
          {warning && (
            <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">⚠️</div>
                <div>
                  <p className="m-0 text-amber-900 font-bold text-lg mb-2">Limited Analysis Mode</p>
                  <p className="m-0 text-amber-800 font-medium">{warning.replace('⚠️ Limited Analysis: ', '')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Section or Results */}
          {clauses.length === 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
              {/* Upload Card */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 border-t-4 border-amber-500">
                  <FileUpload onUpload={onUpload} />
                </div>
              </div>

              {/* Info Sidebar */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 shadow-lg">
                  <h4 className="font-bold text-blue-900 mb-4 flex items-center text-lg">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    What You'll Get:
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-3">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span><strong>Automated clause extraction</strong> from your PDF</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span><strong>Risk identification</strong> for problematic terms</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span><strong>Related case law</strong> citations and references</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span><strong>Applicable legislation</strong> from Sri Lankan law</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span><strong>Missing provisions</strong> that should be included</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* SIDEBAR */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                {/* Upload Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 hover:shadow-xl transition-all duration-300">
                  <h4 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload New Contract
                  </h4>
                  <FileUpload onUpload={onUpload} label="Choose File" compact={true} />
                </div>

                {/* Contract Type Card */}
                {contractType && (
                  <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-lg">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-stone-600 text-sm font-semibold">Contract Type</p>
                          <p className="text-xl font-bold text-amber-700">{contractType.toUpperCase()}</p>
                        </div>
                      </div>
                      {clauses.length > 0 && (
                        <div className="pt-4 border-t border-amber-200 flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-stone-600 text-sm font-semibold">Clauses Found</p>
                            <p className="text-xl font-bold text-blue-700">{clauses.length}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Progress Card */}
                {isAnalyzing && (
                  <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
                    <h4 className="text-base font-bold text-stone-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 animate-spin text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Analysis Progress
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                        <span className="text-lg">{loading.clauses ? '⏳' : '✅'}</span>
                        <span className="text-sm font-semibold text-stone-700">Extracting Clauses</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                        <span className="text-lg">{loading.risks ? '⏳' : (Object.keys(data.risks).length > 0 ? '✅' : '○')}</span>
                        <span className="text-sm font-semibold text-stone-700">Risk Analysis</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-cyan-50 to-blue-100 rounded-lg">
                        <span className="text-lg">{loading.cases ? '⏳' : (data.cases.results?.length > 0 ? '✅' : '○')}</span>
                        <span className="text-sm font-semibold text-stone-700">Case Law</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                        <span className="text-lg">{loading.acts ? '⏳' : (data.acts.results?.length > 0 ? '✅' : '○')}</span>
                        <span className="text-sm font-semibold text-stone-700">Legislation</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Card */}
                {error && (
                  <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-400 rounded-2xl p-6 shadow-lg">
                    <div className="flex gap-3">
                      <div className="text-2xl flex-shrink-0">❌</div>
                      <div>
                        <p className="text-red-700 font-bold mb-1">Error</p>
                        <p className="text-red-600 text-sm font-medium">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary Card */}
                {clauses.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
                    <h4 className="text-base font-bold text-stone-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Summary
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-stone-50 to-amber-50 rounded-xl border-l-4 border-stone-700">
                        <span className="text-sm text-stone-600 font-semibold">Total Clauses</span>
                        <span className="text-2xl font-bold text-stone-800">{clauses.length}</span>
                      </div>
                      {Object.keys(data.risks).length > 0 && (
                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-l-4 border-orange-600">
                          <span className="text-sm text-stone-600 font-semibold">With Risks</span>
                          <span className="text-2xl font-bold text-orange-700">{Object.keys(data.risks).filter(k => data.risks[k].risks.length > 0).length}</span>
                        </div>
                      )}
                      {data.cases.results?.length > 0 && (
                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-l-4 border-blue-600">
                          <span className="text-sm text-stone-600 font-semibold">Cases Found</span>
                          <span className="text-2xl font-bold text-blue-700">{data.cases.results.length}</span>
                        </div>
                      )}
                      {data.acts.results?.length > 0 && (
                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-l-4 border-purple-600">
                          <span className="text-sm text-stone-600 font-semibold">Legislation</span>
                          <span className="text-2xl font-bold text-purple-700">{data.acts.results.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* MAIN CONTENT */}
              <div className="lg:col-span-3 space-y-8">
                {/* Risk Summary */}
                {Object.keys(data.risks).length > 0 && (() => {
                  const summary = getRiskSummary();
                  return (
                    <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 border-3 border-orange-400 rounded-3xl p-10 shadow-2xl">
                      <div className="flex items-start gap-4 mb-8">
                        <div className="text-5xl">🚨</div>
                        <div>
                          <h3 className="text-3xl font-bold text-orange-900">Risk Assessment Summary</h3>
                          <p className="text-orange-700 font-semibold mt-2">Critical findings from contract analysis</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-200">
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-orange-600 font-semibold text-sm mb-1">Total Risks Identified</p>
                              <p className="text-5xl font-bold text-orange-700">{summary.totalRisks}</p>
                            </div>
                            <div className="text-4xl opacity-30">⚠️</div>
                          </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-red-200">
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-red-600 font-semibold text-sm mb-1">High-Risk Clauses</p>
                              <p className="text-5xl font-bold text-red-700">{summary.highRiskClauseIds.length}</p>
                            </div>
                            <div className="text-4xl opacity-30">🔴</div>
                          </div>
                        </div>
                      </div>
                      {summary.missingProvisions.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                          <p className="text-stone-800 font-bold text-lg mb-4 flex items-center gap-2">
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Missing Provisions ({summary.missingProvisions.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {summary.missingProvisions.slice(0, 10).map((p, i) => (
                              <span key={i} className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 text-sm font-semibold px-4 py-2 rounded-full border border-orange-300 shadow-sm">
                                {p.replace(/_/g, ' ')}
                              </span>
                            ))}
                            {summary.missingProvisions.length > 10 && (
                              <span className="bg-orange-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                                +{summary.missingProvisions.length - 10} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Clauses Section */}
                <div>
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-4xl font-bold text-stone-800 flex items-center gap-3">
                        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Extracted Clauses
                      </h2>
                      <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-6 py-2 rounded-full font-bold shadow-lg">
                        {clauses.length} Clauses
                      </div>
                    </div>
                    <p className="text-gray-600 font-medium">Click to expand and view full details, risks, and related legal information</p>
                  </div>
                  <div className="space-y-4">
                    {clauses.map((clause) => renderClause(clause))}
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
