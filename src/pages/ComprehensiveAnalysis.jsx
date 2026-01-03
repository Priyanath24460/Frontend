import React, { useState } from 'react';
import FileUpload from '../components/FileUpload.jsx';

export default function ComprehensiveAnalysis(){
  const [clauses, setClauses] = useState([]);
  const [loading, setLoading] = useState({
    clauses: false,
    risks: false,
    cases: false,
    acts: false
  });
  const [data, setData] = useState({
    risks: {},
    cases: [],
    acts: [],
    summary: null
  });
  const [error, setError] = useState('');

  const extractClauses = async (pdfFile) => {
    setLoading(prev => ({ ...prev, clauses: true }));
    try {
      const formData = new FormData();
      formData.append('file', pdfFile);
      const response = await fetch('/analyze-clauses', { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      const extractedClauses = result.clauses || [];
      setClauses(extractedClauses);
      setLoading(prev => ({ ...prev, clauses: false }));
      return extractedClauses;
    } catch (err) {
      console.error('Clause extraction error:', err);
      setError(`Clause extraction failed: ${err.message}`);
      setLoading(prev => ({ ...prev, clauses: false }));
      return null;
    }
  };

  const analyzeRisks = async (pdfFile) => {
    setLoading(prev => ({ ...prev, risks: true }));
    try {
      const formData = new FormData();
      formData.append('file', pdfFile);
      const response = await fetch('/analyze-contract-risks', { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      const risksMap = {};
      result.risk_analysis?.clauses_with_risks?.forEach(clause => {
        risksMap[clause.clause_id] = {
          risks: clause.identified_risks || [],
          risk_count: clause.risk_count || 0,
          signals: clause.signals || []
        };
      });
      setData(prev => ({ ...prev, risks: risksMap, summary: result.summary }));
      setLoading(prev => ({ ...prev, risks: false }));
    } catch (err) {
      console.warn('Risk analysis error:', err);
      setLoading(prev => ({ ...prev, risks: false }));
    }
  };

  const searchCases = async (clauseList) => {
    setLoading(prev => ({ ...prev, cases: true }));
    try {
      if (!clauseList || clauseList.length === 0) {
        setLoading(prev => ({ ...prev, cases: false }));
        return;
      }
      const response = await fetch('/api/v1/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clause_text: clauseList.map(c => c.text).join(' ').substring(0, 2000),
          top_k: 10
        })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      setData(prev => ({ ...prev, cases: result.results || [] }));
      setLoading(prev => ({ ...prev, cases: false }));
    } catch (err) {
      console.warn('Case search error:', err);
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
      const response = await fetch('/api/v1/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clause_text: clauseList.map(c => c.text).join(' ').substring(0, 2000),
          top_k: 10
        })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      setData(prev => ({ ...prev, acts: result.results || [] }));
      setLoading(prev => ({ ...prev, acts: false }));
    } catch (err) {
      console.warn('Act search error:', err);
      setLoading(prev => ({ ...prev, acts: false }));
    }
  };

  const onUpload = async (file) => {
    setError('');
    setClauses([]);
    setData({ risks: {}, cases: [], acts: [], summary: null });
    const extractedClauses = await extractClauses(file);
    if (!extractedClauses) return;
    Promise.all([
      analyzeRisks(file),
      searchCases(extractedClauses),
      searchActs(extractedClauses)
    ]);
  };

  const [expandedClauses, setExpandedClauses] = useState({});

  const toggleExpandClause = (clauseId) => {
    setExpandedClauses(prev => ({
      ...prev,
      [clauseId]: !prev[clauseId]
    }));
  };

  const renderClause = (clause) => {
    const clauseRisks = data.risks[clause.clause_id] || {};
    const riskList = clauseRisks.risks || [];
    const isExpanded = expandedClauses[clause.clause_id];
    const isLongText = clause.clause_text && clause.clause_text.length > 300;
    const displayText = isExpanded ? clause.clause_text : clause.clause_text?.substring(0, 300);
    
    return (
      <div key={clause.clause_id} className="clause-card">
        <div className="clause-header">
          <div>
            <span className="clause-type-badge">{clause.clause_type?.toUpperCase()}</span>
            <span className="clause-id">{clause.clause_id}</span>
          </div>
          <span className="clause-length">{clause.text_length || 0} chars</span>
        </div>

        <div className="clause-text-container">
          <p className="clause-text">
            {displayText}
            {isLongText && !isExpanded && '...'}
          </p>
          {isLongText && (
            <button 
              className="expand-btn"
              onClick={() => toggleExpandClause(clause.clause_id)}
              style={{marginTop: '8px', padding: '6px 12px', background: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '.9rem'}}
            >
              {isExpanded ? '📖 Read Less' : '📖 Read More'}
            </button>
          )}
        </div>

        {/* RISKS SECTION - Updates when available */}
        {!loading.risks && riskList.length > 0 && (
          <div className="risks-section">
            <h4>⚠️ Identified Risks ({riskList.length})</h4>
            <div className="risks-list">
              {riskList.map((risk, i) => (
                <div key={i} className="risk-item">
                  <div className="risk-header">
                    <strong>{risk.risk}</strong>
                    <span className="confidence">{(risk.confidence * 100).toFixed(0)}%</span>
                  </div>
                  {risk.explanation && <p className="risk-explanation">{risk.explanation}</p>}
                  {risk.legal_basis && Array.isArray(risk.legal_basis) && (
                    <div className="legal-basis">
                      {risk.legal_basis.map((b, j) => (
                        <span key={j} className="basis-tag">{b}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {loading.risks && <div className="loading-section">⏳ Analyzing risks...</div>}

        {/* CASES SECTION - Updates when available */}
        {!loading.cases && data.cases.length > 0 && (
          <div className="cases-section">
            <h4>📚 Related Case Law ({data.cases.length})</h4>
            <div className="cases-list">
              {data.cases.map((caseItem, i) => (
                <div key={i} className="case-item">
                  <div className="case-header">
                    <strong>{caseItem.case_name}</strong>
                    <span className="similarity">{(caseItem.similarity_score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="case-meta">
                    <span className="category">{caseItem.main_category}</span>
                    {caseItem.sub_category && <span className="subcategory">{caseItem.sub_category}</span>}
                  </div>
                  {caseItem.key_takeaway && <p className="takeaway">💡 {caseItem.key_takeaway}</p>}
                  {caseItem.outcome && <p className="outcome">📋 {caseItem.outcome}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        {loading.cases && <div className="loading-section">⏳ Searching cases...</div>}

        {/* LEGISLATION SECTION - Updates when available */}
        {!loading.acts && data.acts.length > 0 && (
          <div className="acts-section">
            <h4>📖 Related Legislation ({data.acts.length})</h4>
            <div className="acts-list">
              {data.acts.map((act, i) => (
                <div key={i} className="act-item">
                  <div className="act-header">
                    <strong>{act.act_name} {act.year && `(${act.year})`}</strong>
                    <span className="similarity">{(act.similarity_score * 100).toFixed(0)}%</span>
                  </div>
                  {act.section_number && (
                    <div className="act-meta">
                      <span className="section">Section {act.section_number}</span>
                      {act.section_heading && <span className="heading">{act.section_heading}</span>}
                    </div>
                  )}
                  {act.domain && <p className="domain">📌 {act.domain}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        {loading.acts && <div className="loading-section">⏳ Searching legislation...</div>}
      </div>
    );
  };

  const isAnalyzing = Object.values(loading).some(v => v);

  return (
    <div style={{padding:'20px', maxWidth:'1400px', margin:'0 auto'}}>
      <h1>📋 Contract Analysis - Granular Mode</h1>
      <p style={{color:'var(--muted)', fontSize:'.95rem'}}>
        Upload a contract to extract clauses and analyze for risks, case law, and legislation
      </p>
      <div style={{display:'flex', gap:20, marginTop:20}}>
        <div style={{flex:'0 0 300px', display:'flex', flexDirection:'column', gap:12}}>
          <FileUpload onUpload={onUpload} label="Select PDF Contract" />
          {isAnalyzing && (
            <div className="card" style={{padding:12}}>
              <h3 style={{marginTop:0, marginBottom:12}}>Analysis Progress</h3>
              <div style={{display:'flex', flexDirection:'column', gap:8}}>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <span style={{fontSize:'1.2rem'}}>{loading.clauses ? '⏳' : '✓'}</span>
                  <span style={{flex:1, fontSize:'.9rem'}}>Extract Clauses</span>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <span style={{fontSize:'1.2rem'}}>{loading.risks ? '⏳' : (Object.keys(data.risks).length > 0 ? '✓' : '○')}</span>
                  <span style={{flex:1, fontSize:'.9rem'}}>Risk Analysis</span>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <span style={{fontSize:'1.2rem'}}>{loading.cases ? '⏳' : (data.cases.length > 0 ? '✓' : '○')}</span>
                  <span style={{flex:1, fontSize:'.9rem'}}>Case Law Search</span>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <span style={{fontSize:'1.2rem'}}>{loading.acts ? '⏳' : (data.acts.length > 0 ? '✓' : '○')}</span>
                  <span style={{flex:1, fontSize:'.9rem'}}>Legislation Search</span>
                </div>
              </div>
            </div>
          )}
          {error && <p className="error">{error}</p>}
          {clauses.length > 0 && (
            <div className="card">
              <h3>Summary</h3>
              <div className="kv"><span>Total Clauses</span><span style={{fontWeight:600}}>{clauses.length}</span></div>
              {Object.keys(data.risks).length > 0 && (
                <div className="kv"><span>Clauses w/ Risks</span><span style={{fontWeight:600}}>{Object.keys(data.risks).filter(k => data.risks[k].risks.length > 0).length}</span></div>
              )}
              {data.cases.length > 0 && (
                <div className="kv"><span>Cases Found</span><span style={{fontWeight:600}}>{data.cases.length}</span></div>
              )}
              {data.acts.length > 0 && (
                <div className="kv"><span>Acts Found</span><span style={{fontWeight:600}}>{data.acts.length}</span></div>
              )}
            </div>
          )}
        </div>
        <div style={{flex:1, display:'flex', flexDirection:'column', gap:12, overflowY:'auto', maxHeight:'80vh'}}>
          {clauses.length > 0 ? (
            <>
              <div style={{paddingBottom:12, borderBottom:'2px solid var(--sand-200)'}}>
                <h2 style={{margin:0, marginBottom:8}}>✨ Clauses Extracted ({clauses.length})</h2>
                <p style={{margin:0, fontSize:'.9rem', color:'var(--muted)'}}>
                  {loading.risks && '• Risk analysis in progress...'}
                  {loading.cases && '• Searching case law...'}
                  {loading.acts && '• Searching legislation...'}
                </p>
              </div>
              <div className="list">
                {clauses.map((clause) => renderClause(clause))}
              </div>
            </>
          ) : (
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%', minHeight:'400px', color:'var(--muted)', fontSize:'1.1rem', textAlign:'center'}}>
              <div>
                <p style={{fontSize:'3rem', margin:'0 0 12px 0'}}>📄</p>
                <p>Upload a contract to get started</p>
                <p style={{fontSize:'.9rem'}}>Clauses will extract in 2-3 seconds, analysis follows</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
