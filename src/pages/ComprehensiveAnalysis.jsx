import React, { useState } from 'react';
import FileUpload from '../components/FileUpload.jsx';
import { AnalysisAPI } from '../config/api.js';

export default function ComprehensiveAnalysis(){
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [options, setOptions] = useState({
    mask_pii: false,
    detect_contract_type: true,
    detect_clause_types: true,
    detect_missing_fields: true,
    include_case_law: true,
    top_k_cases: 5
  });

  const onUpload = async (file) => {
    setError('');
    setLoading(true);
    try{
      const data = await AnalysisAPI.uploadContractWithCases(file, options);
      setResult(data);
    }catch(err){ setError(err.message || 'Failed'); }
    finally{ setLoading(false); }
  };

  return (
    <div style={{padding:'20px', maxWidth:'1400px', margin:'0 auto'}}>
      <h1>Upload Contract for Comprehensive Analysis</h1>
      
      <div style={{display:'flex', gap:20, marginTop:20, minHeight:'70vh'}}>
        {/* LEFT COLUMN - Upload & Contract Info */}
        <div style={{flex:'0 0 35%', display:'flex', flexDirection:'column', gap:12, overflowY:'auto', paddingRight:12}}>
          <FileUpload onUpload={onUpload} label="Select PDF Contract" />
          
          <div className="card">
            <h3>Analysis Options</h3>
            <label style={{marginTop:10}}>
              <input type="checkbox" checked={options.mask_pii} onChange={e=>setOptions({...options, mask_pii: e.target.checked})} /> Mask PII
            </label>
            <label style={{marginTop:8}}>
              <input type="checkbox" checked={options.detect_contract_type} onChange={e=>setOptions({...options, detect_contract_type: e.target.checked})} /> Detect Contract Type
            </label>
            <label style={{marginTop:8}}>
              <input type="checkbox" checked={options.detect_clause_types} onChange={e=>setOptions({...options, detect_clause_types: e.target.checked})} /> Detect Clause Types
            </label>
            <label style={{marginTop:8}}>
              <input type="checkbox" checked={options.detect_missing_fields} onChange={e=>setOptions({...options, detect_missing_fields: e.target.checked})} /> Detect Missing Fields
            </label>
            <label style={{marginTop:8}}>
              <input type="checkbox" checked={options.include_case_law} onChange={e=>setOptions({...options, include_case_law: e.target.checked})} /> Include Case Law
            </label>
            <label style={{marginTop:8}}>
              <span>Top K Cases per Clause:</span>
              <input className="input" type="number" min={1} max={20} value={options.top_k_cases} onChange={e=>setOptions({...options, top_k_cases: Number(e.target.value)})} style={{marginTop:4}} />
            </label>
          </div>

          {result && (
            <div className="card">
              <h3>Contract Info</h3>
              <div className="kv"><span>File</span><span style={{fontWeight:600}}>{result.filename || 'N/A'}</span></div>
              {result.file_size && <div className="kv"><span>File Size</span><span>{(result.file_size/1024).toFixed(2)} KB</span></div>}
              <div className="kv"><span>Status</span><span className="badge">{result.processing_status || 'unknown'}</span></div>
            </div>
          )}

          {loading && <p className="loading">Running comprehensive analysis...</p>}
          {error && <p className="error">{error}</p>}
        </div>

        {/* RIGHT COLUMN - Analysis Results */}
        <div style={{flex:'1', display:'flex', flexDirection:'column', gap:12, overflowY:'auto', paddingLeft:12, borderLeft:'1px solid var(--sand-200)'}}>
          {result ? (
            <>
              <div className="card">
                <h2 style={{marginTop:0}}>Analysis Results</h2>
                {result.summary && (
                  <div>
                    <div className="kv"><span>Total Risks</span><span className="badge" style={{background:'#f44336', color:'white'}}>{result.summary.total_risks || 0}</span></div>
                    <div className="kv"><span>Supporting Cases</span><span className="badge" style={{background:'#2196f3', color:'white'}}>{result.summary.total_supporting_cases || 0}</span></div>
                    <div className="kv"><span>Supporting Acts</span><span className="badge" style={{background:'#4caf50', color:'white'}}>{result.summary.total_supporting_acts || 0}</span></div>
                    <div className="kv"><span>Clauses with Risk</span><span style={{fontWeight:600}}>{result.summary.clauses_with_risk || 0}</span></div>
                  </div>
                )}
              </div>

            {result.preprocessing && (
              <div className="card">
                <h3>Preprocessing</h3>
                <div className="kv"><span>Contract Type</span><span className="badge">{result.preprocessing.contract_type || 'Unknown'}</span></div>
                {result.preprocessing.contract_confidence && <div className="kv"><span>Confidence</span><span>{(result.preprocessing.contract_confidence * 100).toFixed(1)}%</span></div>}
                <div className="kv"><span>Total Clauses</span><span>{result.preprocessing.total_clauses || 0}</span></div>
                
                {result.preprocessing.missing_fields && Object.keys(result.preprocessing.missing_fields).length > 0 && (
                  <div style={{marginTop:10}}>
                    <h4>Missing Fields</h4>
                    <ul style={{marginLeft:0, paddingLeft:0}}>
                      {Object.entries(result.preprocessing.missing_fields).map(([field, isMissing], i) => (
                        <li key={i} style={{listStyle:'none', padding:'4px 0'}}>
                          <span style={{display:'inline-block', width:150}}>{field}:</span>
                          <span className="badge" style={{background: isMissing ? '#ffcccc' : '#ccffcc', color: isMissing ? '#8b0000' : '#2d5a3d'}}>
                            {isMissing ? 'Missing' : 'Present'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(result.preprocessing.masked_entities) && result.preprocessing.masked_entities.length > 0 && (
                  <div style={{marginTop:10}}>
                    <h4>Masked Entities</h4>
                    <div className="list">
                      {result.preprocessing.masked_entities.map((e, i) => <div key={i} className="item" style={{padding:6}}>{e}</div>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {result.risk_analysis && Array.isArray(result.risk_analysis.clauses_with_risks) && (
              <div className="card">
                {(() => {
                  const allRiskClauses = result.risk_analysis.clauses_with_risks;
                  const highRiskClauses = allRiskClauses.filter(c => c.risk_count > 1);
                  return (
                    <>
                      <h3>⚠️ Clauses with Identified Risks ({allRiskClauses.length})</h3>
                      {allRiskClauses.length === 0 ? (
                        <div style={{padding:12, background:'#d4edda', color:'#155724', borderRadius:8, textAlign:'center', fontWeight:600}}>
                          ✅ No risks identified in this contract!
                        </div>
                      ) : (
                        <>
                          <div style={{marginBottom:12, fontSize:'.9rem', color:'var(--muted)'}}>
                            Showing {allRiskClauses.length} clause{allRiskClauses.length !== 1 ? 's' : ''} with identified risks
                            {highRiskClauses.length > 0 && ` (${highRiskClauses.length} with multiple risks)`}
                          </div>
                          <div className="list">
                            {allRiskClauses.map((c, i) => (
                              <div key={i} style={{opacity: c.risk_count > 1 ? 1 : 0.8}}>
                                {c.risk_count > 1 && <div style={{fontSize:'.75rem', color:'#f44336', fontWeight:700, marginBottom:4, textTransform:'uppercase'}}>🔴 Multiple Risks</div>}
                                <ClauseWithRisks clause={c} />
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {result.case_law && Array.isArray(result.case_law.clauses_with_cases) && (
              <div className="card">
                <h3>Supporting Cases ({result.case_law.total_cases_retrieved} cases)</h3>
                <div className="list">
                  {result.case_law.clauses_with_cases.map((c, i) => (
                    <ClauseWithCases key={i} clause={c} />
                  ))}
                </div>
              </div>
            )}

            {result.acts_law && Array.isArray(result.acts_law.clauses_with_acts) && (
              <div className="card">
                <h3>Supporting Acts & Legislation ({result.acts_law.total_acts_retrieved} acts)</h3>
                <div className="list">
                  {result.acts_law.clauses_with_acts.map((c, i) => (
                    <ClauseWithActs key={i} clause={c} />
                  ))}
                </div>
              </div>
            )}
            </>
          ) : (
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--muted)', fontSize:'1.1rem'}}>
              Upload a contract to see analysis results
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ClauseWithRisks({ clause }){
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="item" style={{borderLeft:'4px solid #f44336', paddingLeft:16}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
        <div style={{flex:1}}>
          <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:6}}>
            <span className="badge" style={{background:'#f44336', color:'white'}}>{clause.clause_type || 'clause'}</span>
            <span className="badge" style={{background:'#ff9800', color:'white', fontWeight:700}}>⚠️ {clause.risk_count} RISK{clause.risk_count !== 1 ? 'S' : ''}</span>
          </div>
          {Array.isArray(clause.signals) && clause.signals.length > 0 && (
            <div style={{marginTop:6, display:'flex', gap:4, flexWrap:'wrap'}}>
              {clause.signals.map((s, i) => (
                <span key={i} className="badge" style={{background:'#fff0e6', color:'#b8860b', fontSize:'.8rem'}}>{s}</span>
              ))}
            </div>
          )}
        </div>
        <button className="button ghost" onClick={() => setExpanded(!expanded)} style={{whiteSpace:'nowrap', marginLeft:8, fontSize:'.85rem'}}>
          {expanded ? '−' : '+'} Details
        </button>
      </div>

      {expanded && Array.isArray(clause.identified_risks) && (
        <div style={{marginTop:10, paddingTop:10, borderTop:'1px solid var(--sand-100)'}}>
          <div className="list">
            {clause.identified_risks.map((r, i) => (
              <div key={i} className="item" style={{padding:10, borderLeft:'3px solid #ff9800', background:'#fff9f5'}}>
                <div style={{marginBottom:8}}>
                  <strong style={{color:'#f44336', fontSize:'.95rem'}}>🔴 {r.risk}</strong>
                  <div className="kv" style={{margin:'6px 0'}}><span>Confidence</span><span style={{color:'#f44336', fontWeight:700}}>{(r.confidence * 100).toFixed(1)}%</span></div>
                </div>
                {r.explanation && <div style={{marginTop:6, fontSize:'.9rem', color:'var(--muted)', lineHeight:1.4}}>{r.explanation}</div>}
                {r.legal_basis && Array.isArray(r.legal_basis) && (
                  <div style={{marginTop:6}}>
                    <strong style={{fontSize:'.9rem'}}>Legal Basis:</strong>
                    <div style={{display:'flex', gap:4, marginTop:4, flexWrap:'wrap'}}>
                      {r.legal_basis.map((b, i) => <span key={i} className="badge" style={{fontSize:'.8rem'}}>{b}</span>)}
                    </div>
                  </div>
                )}
                {r.reasoning?.adjustment_summary && (
                  <div style={{marginTop:8, padding:8, background:'#f5f5f5', borderRadius:6, fontSize:'.85rem', fontFamily:'monospace', lineHeight:1.3}}>
                    {r.reasoning.adjustment_summary}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ClauseWithCases({ clause }){
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="item">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:10}}>
        <div style={{flex:1}}>
          <div className="badge">{clause.clause_type || 'clause'}</div>
          <div style={{marginTop:6, fontSize:'.9rem', color:'var(--muted)', lineHeight:1.4}}>{clause.text_preview || clause.text}</div>
        </div>
        <button className="button ghost" onClick={() => setExpanded(!expanded)} style={{whiteSpace:'nowrap', marginLeft:8, fontSize:'.85rem'}}>
          {expanded ? '−' : '+'} ({clause.supporting_cases?.length || 0})
        </button>
      </div>

      {expanded && Array.isArray(clause.supporting_cases) && clause.supporting_cases.length > 0 && (
        <div style={{paddingTop:10, borderTop:'1px solid var(--sand-100)'}}>
          <div className="list" style={{marginTop:8}}>
            {clause.supporting_cases.map((c, i) => (
              <div key={i} className="item" style={{padding:10}}>
                <div style={{marginBottom:8}}>
                  <div className="kv" style={{margin:'4px 0'}}><span>Rank</span><span className="badge">{c.rank}</span></div>
                  <div className="kv" style={{margin:'4px 0'}}><span>Case ID</span><span className="badge">{c.case_id}</span></div>
                  <div className="kv" style={{margin:'4px 0'}}><span>Similarity</span><span>{(c.similarity_score * 100).toFixed(1)}%</span></div>
                </div>
                <div style={{marginBottom:6}}>
                  <strong style={{color:'var(--text-light)', fontSize:'.95rem'}}>{c.case_name}</strong>
                </div>
                <div className="kv" style={{margin:'4px 0'}}><span>Category</span><span>{c.main_category}</span></div>
                {c.sub_category && <div className="kv" style={{margin:'4px 0'}}><span>Sub-Category</span><span style={{fontSize:'.9rem'}}>{c.sub_category}</span></div>}
                {c.outcome && <div style={{marginTop:6, padding:6, background:'var(--sand-100)', borderRadius:6, fontSize:'.9rem'}}><strong>Outcome:</strong> {c.outcome}</div>}
                {c.key_takeaway && <div style={{marginTop:6, padding:6, background:'#e8f5e9', borderRadius:6, fontSize:'.9rem', color:'#2d5a3d'}}><strong>Key Takeaway:</strong> {c.key_takeaway}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
      {expanded && (!clause.supporting_cases || clause.supporting_cases.length === 0) && (
        <div style={{marginTop:10, color:'var(--muted)', fontSize:'.9rem'}}>No supporting cases found</div>
      )}
    </div>
  );
}

function ClauseWithActs({ clause }){
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="item">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:10}}>
        <div style={{flex:1}}>
          <div className="badge">{clause.clause_type || 'clause'}</div>
          <div style={{marginTop:6, fontSize:'.9rem', color:'var(--muted)', lineHeight:1.4}}>{clause.text_preview || clause.text}</div>
        </div>
        <button className="button ghost" onClick={() => setExpanded(!expanded)} style={{whiteSpace:'nowrap', marginLeft:8, fontSize:'.85rem'}}>
          {expanded ? '−' : '+'} ({clause.supporting_acts?.length || 0})
        </button>
      </div>

      {expanded && Array.isArray(clause.supporting_acts) && clause.supporting_acts.length > 0 && (
        <div style={{paddingTop:10, borderTop:'1px solid var(--sand-100)'}}>
          <div className="list" style={{marginTop:8}}>
            {clause.supporting_acts.map((a, i) => (
              <div key={i} className="item" style={{padding:10}}>
                <div style={{marginBottom:8}}>
                  <div className="kv" style={{margin:'4px 0'}}><span>Rank</span><span className="badge">{a.rank}</span></div>
                  <div className="kv" style={{margin:'4px 0'}}><span>Similarity</span><span>{(a.similarity_score * 100).toFixed(1)}%</span></div>
                </div>
                <div style={{marginBottom:6}}>
                  <strong style={{color:'var(--text-light)', fontSize:'.95rem'}}>{a.act_name} ({a.year})</strong>
                </div>
                <div className="kv" style={{margin:'4px 0'}}><span>Section</span><span className="badge">{a.section_number}</span></div>
                <div className="kv" style={{margin:'4px 0'}}><span>Heading</span><span style={{fontSize:'.9rem'}}>{a.section_heading}</span></div>
                {a.domain && <div className="kv" style={{margin:'4px 0'}}><span>Domain</span><span>{a.domain}</span></div>}
                <div style={{marginTop:6, fontSize:'.85rem', color:'var(--muted)', fontStyle:'italic'}}>Source: {a.retrieval_source || 'unknown'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {expanded && (!clause.supporting_acts || clause.supporting_acts.length === 0) && (
        <div style={{marginTop:10, color:'var(--muted)', fontSize:'.9rem'}}>No supporting acts found</div>
      )}
    </div>
  );
}
