import { useMemo, useReducer, useState, useRef, useCallback } from 'react'
import Header from '../components/Header'

// ─── Simple markdown renderer ────────────────────────────────────────────────
function renderMarkdown(text) {
  if (!text) return []
  const lines = String(text).split('\n')
  const elements = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) { elements.push({ type: 'spacer', key: i }); i++; continue }
    if (line.startsWith('## ')) { elements.push({ type: 'h2', text: line.slice(3).trim(), key: i }); i++; continue }
    if (line.startsWith('# ')) { elements.push({ type: 'h1', text: line.slice(2).trim(), key: i }); i++; continue }
    if (line.startsWith('### ')) { elements.push({ type: 'h3', text: line.slice(4).trim(), key: i }); i++; continue }
    if (line.match(/^[-*]\s/)) { elements.push({ type: 'bullet', text: line.slice(2).trim(), key: i, depth: 0 }); i++; continue }
    if (line.match(/^\s{2,4}[-*]\s/)) { elements.push({ type: 'bullet', text: line.replace(/^\s+[-*]\s/, '').trim(), key: i, depth: 1 }); i++; continue }
    elements.push({ type: 'para', text: line.trim(), key: i }); i++
  }
  return elements
}

function inlineParse(text) {
  const parts = []
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*)/g
  let last = 0, m
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ t: 'text', v: text.slice(last, m.index) })
    if (m[2]) parts.push({ t: 'bold', v: m[2] })
    else if (m[3]) parts.push({ t: 'em', v: m[3] })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ t: 'text', v: text.slice(last) })
  return parts.length ? parts : [{ t: 'text', v: text }]
}

function InlineText({ text }) {
  const parts = inlineParse(text)
  return <>{parts.map((p, i) => p.t === 'bold' ? <strong key={i} className="font-bold text-stone-800">{p.v}</strong> : p.t === 'em' ? <em key={i} className="italic text-stone-600">{p.v}</em> : <span key={i}>{p.v}</span>)}</>
}

function MarkdownReport({ text }) {
  const elements = renderMarkdown(text)
  return (
    <div className="space-y-1.5">
      {elements.map((el) => {
        if (el.type === 'spacer') return <div key={el.key} className="h-2" />
        if (el.type === 'h1') return <h2 key={el.key} className="text-base font-bold text-stone-900 mt-4 mb-1 pb-1 border-b border-stone-200"><InlineText text={el.text} /></h2>
        if (el.type === 'h2') return <h3 key={el.key} className="text-sm font-bold text-amber-800 mt-3 mb-1 uppercase tracking-wide"><InlineText text={el.text} /></h3>
        if (el.type === 'h3') return <h4 key={el.key} className="text-xs font-bold text-stone-700 mt-2 mb-0.5"><InlineText text={el.text} /></h4>
        if (el.type === 'bullet') return (
          <div key={el.key} className={`flex gap-2 text-sm text-stone-600 leading-relaxed ${el.depth ? 'ml-4' : ''}`}>
            <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            <span><InlineText text={el.text} /></span>
          </div>
        )
        return <p key={el.key} className="text-sm text-stone-600 leading-relaxed"><InlineText text={el.text} /></p>
      })}
    </div>
  )
}

// ─── Config ──────────────────────────────────────────────────────────────────
const defaultAnalyzeBase = import.meta.env.DEV ? '/api/analyze' : 'https://analyze-api.pasindi.me'
const API_BASE = import.meta.env.VITE_ANALYZE_API_BASE || defaultAnalyzeBase
const serviceEndpoints = {
  analyze: API_BASE,
  pattern: import.meta.env.VITE_PATTERN_API_BASE || 'https://pattern-api.pasindi.me',
  caseService: import.meta.env.VITE_CASE_API_BASE || 'https://case-api.pasindi.me',
  acts: import.meta.env.VITE_ACTS_API_BASE || 'https://acts-api.pasindi.me',
}

const defaultContractText = `EMPLOYMENT AGREEMENT

This Employment Agreement is made between ABC Manufacturing (Pvt) Ltd and the Employee.

1. The employee shall be on probation for three months and may be terminated without severance during probation.
2. Salary shall be LKR 180,000 monthly, payable on the last working day.
3. Overtime compensation will be at management discretion.
4. Either party may terminate this agreement with 7 days notice.
5. The employee shall not join any competitor for 24 months after separation.
6. The employee is responsible for all losses caused by negligence.
7. Disputes shall be resolved by arbitration under Sri Lankan law.`

const defaultFormFlags = {
  mask_pii: true,
  include_pattern_detection: true,
  include_case_law: true,
  include_acts: true,
  include_ai_report: true,
  use_bert_support: false,
  use_simple_english: false,
}

// Internal constants — not exposed to user
const TOP_K_CASES = 10
const TOP_K_ACTS = 5
const PATTERN_THRESHOLD = 0.5
const TOP_K_PATTERNS = 5

const riskFilters = ['all', 'high', 'medium', 'low']
const DIRECT_ANALYZE_BASE = 'https://analyze-api.pasindi.me'
const ANALYSIS_STEPS = ['clauses', 'patterns', 'cases', 'acts', 'report']

const TAB_CONFIG = [
  { id: 'summary', label: 'Summary', icon: '⚡', step: null, desc: 'Your risk overview' },
  { id: 'clauses', label: 'Clause Details', icon: '📄', step: 'clauses', desc: 'Each contract clause' },
  { id: 'patterns', label: 'Risk Patterns', icon: '🔍', step: 'patterns', desc: 'Detected risk signals' },
  { id: 'cases', label: 'Similar Cases', icon: '⚖️', step: 'cases', desc: 'Matching court cases' },
  { id: 'acts', label: 'Relevant Laws', icon: '📋', step: 'acts', desc: 'Applicable legislation' },
  { id: 'ai', label: 'Full AI Report', icon: '🤖', step: 'report', desc: 'Complete AI analysis' },
]

// ─── Pure logic helpers ───────────────────────────────────────────────────────
function inferSeverity(risk) {
  const t = String(risk?.severity || risk?.risk_level || risk?.level || risk?.label || '').toLowerCase()
  if (t.includes('high')) return 'high'
  if (t.includes('medium')) return 'medium'
  if (t.includes('low')) return 'low'
  const c = Number(risk?.confidence ?? 0)
  if (c >= 0.75) return 'high'
  if (c >= 0.45) return 'medium'
  return 'low'
}

function mergeByClauseId(payload) {
  const map = new Map()
    ; (payload?.pattern_detection?.clauses_with_patterns || []).forEach((item) => {
      const id = item?.clause_id || `P-${map.size + 1}`
      map.set(id, { clause_id: id, clause_type: item?.clause_type || 'unknown', clause_text: item?.clause_text || item?.text_preview || '', risks: item?.detections || item?.identified_risks || [], cases: [], acts: [] })
    })
    ; (payload?.case_law?.clauses_with_cases || []).forEach((item) => {
      const id = item?.clause_id || `C-${map.size + 1}`
      const e = map.get(id)
      map.set(id, { clause_id: id, clause_type: item?.clause_type || e?.clause_type || 'unknown', clause_text: e?.clause_text || item?.clause_text || item?.text_preview || '', risks: e?.risks || item?.identified_risks || [], cases: item?.supporting_cases || [], acts: e?.acts || [] })
    })
    ; (payload?.acts_law?.clauses_with_acts || []).forEach((item) => {
      const id = item?.clause_id || `A-${map.size + 1}`
      const e = map.get(id)
      map.set(id, { clause_id: id, clause_type: item?.clause_type || e?.clause_type || 'unknown', clause_text: e?.clause_text || item?.clause_text || item?.text_preview || '', risks: e?.risks || [], cases: e?.cases || [], acts: item?.supporting_acts || item?.acts || item?.sections || [] })
    })
  return Array.from(map.values())
}

function extractAiReportText(r) { if (!r) return ''; if (typeof r === 'string') return r; return r?.risk_report || r?.report || r?.analysis || '' }
function extractAiRiskLevel(r) { if (!r || typeof r !== 'object') return 'N/A'; return r?.risk_score || r?.overall_risk || r?.overall_risk_level || 'N/A' }
async function tryParseJson(res) { try { return await res.json() } catch { return {} } }
async function copyToClipboard(text) { const v = String(text || '').trim(); if (!v) return false; try { await navigator.clipboard.writeText(v); return true } catch { return false } }

function createIdleStatus() { return { clauses: 'idle', patterns: 'idle', cases: 'idle', acts: 'idle', report: 'idle' } }
function createInitialAnalysisState() { return { clausesPayload: null, patternPayload: null, casePayload: null, actsPayload: null, reportPayload: null, status: createIdleStatus(), errors: {} } }

function analysisReducer(state, action) {
  switch (action.type) {
    case 'RESET': return createInitialAnalysisState()
    case 'STEP_LOADING': return { ...state, status: { ...state.status, [action.step]: 'loading' } }
    case 'STEP_DONE': {
      const n = { ...state, status: { ...state.status, [action.step]: 'done' }, errors: { ...state.errors, [action.step]: undefined } }
      if (action.step === 'clauses') n.clausesPayload = action.payload
      if (action.step === 'patterns') n.patternPayload = action.payload
      if (action.step === 'cases') n.casePayload = action.payload
      if (action.step === 'acts') n.actsPayload = action.payload
      if (action.step === 'report') n.reportPayload = action.payload
      return n
    }
    case 'STEP_ERROR': return { ...state, status: { ...state.status, [action.step]: 'error' }, errors: { ...state.errors, [action.step]: action.error || 'Unknown error' } }
    default: return state
  }
}

function normalizePatternPayload(raw, clauseLookup) {
  const cwp = (raw?.results || []).map((item) => {
    const detections = (item?.results || []).map((m) => ({
      pattern_id: m?.pattern_id || '', pattern_title: m?.pattern_title || '',
      severity: m?.pattern_statistics?.risk_severity || item?.risk_level || 'MEDIUM',
      category: m?.risk_category || 'Unknown', confidence: Number(m?.match_score ?? 0),
      matched_trigger: (m?.matching_facts || [])[0] || '', description: m?.pattern_statistics?.risk_description || '',
      consequences: m?.pattern_statistics?.consequences || '', safer_clause: m?.pattern_statistics?.safer_clause_template || null,
      case_count: Number(m?.relevant_cases_count ?? 0),
      supporting_cases: (m?.relevant_cases || []).map((c) => ({ case_name: c?.case_title || '', year: c?.year, outcome: c?.outcome, context_match_score: c?.context_match_score })),
    }))
    return { clause_id: item?.clause_id || '', clause_type: clauseLookup[item?.clause_id]?.clause_type || 'unknown', clause_text: clauseLookup[item?.clause_id]?.clause_text || item?.clause_text || '', text_preview: String(item?.clause_text || '').slice(0, 200), patterns_detected: detections.length, detections }
  })
  return { total_patterns_detected: cwp.reduce((s, r) => s + r.patterns_detected, 0), clauses_with_patterns: cwp }
}

function progressPercent(status) { return Math.round(ANALYSIS_STEPS.filter((s) => status[s] === 'done' || status[s] === 'error').length / ANALYSIS_STEPS.length * 100) }
function toDirectAnalyzeUrl(url) { if (typeof url !== 'string' || !url.startsWith('/api/analyze')) return null; return `${DIRECT_ANALYZE_BASE}${url.replace(/^\/api\/analyze/, '')}` }
async function fetchWithProxyFallback(url, options) {
  try { const res = await fetch(url, options); if (res && res.status >= 500) { const fb = toDirectAnalyzeUrl(url); if (fb) { try { return await fetch(fb, options) } catch { return res } } }; return res }
  catch (err) { const fb = toDirectAnalyzeUrl(url); if (!fb) throw err; return await fetch(fb, options) }
}

// ─── Severity config ──────────────────────────────────────────────────────────
const SEV = {
  high: { chip: 'bg-red-50 text-red-700 ring-1 ring-red-200', dot: 'bg-red-500', bar: 'bg-red-400', badge: 'bg-red-50 border-red-200 text-red-700', label: 'High Risk', meaning: 'Clause may violate your legal rights or expose you to significant financial/legal harm.' },
  medium: { chip: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200', dot: 'bg-amber-500', bar: 'bg-amber-400', badge: 'bg-amber-50 border-amber-200 text-amber-700', label: 'Medium Risk', meaning: 'Clause is unfair or unusual — review carefully before signing.' },
  low: { chip: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500', bar: 'bg-emerald-400', badge: 'bg-emerald-50 border-emerald-200 text-emerald-700', label: 'Low Risk', meaning: 'Clause is slightly unusual but unlikely to cause significant harm.' },
}

// ─── Micro-components ─────────────────────────────────────────────────────────
function StatusDot({ status }) {
  if (status === 'done') return <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
  if (status === 'loading') return <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
  if (status === 'error') return <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
  return <span className="inline-block w-1.5 h-1.5 rounded-full bg-stone-300 flex-shrink-0" />
}

function SeverityChip({ level }) {
  const s = SEV[level] || SEV.low
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${s.chip}`}>
      <span className={`w-1 h-1 rounded-full inline-block ${s.dot}`} />{s.label}
    </span>
  )
}

function SeverityTooltip({ level }) {
  const s = SEV[level] || SEV.low
  return (
    <span className="group relative inline-flex">
      <SeverityChip level={level} />
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-lg bg-stone-900 text-white text-[10px] leading-relaxed px-2.5 py-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 text-center shadow-xl">
        {s.meaning}
      </span>
    </span>
  )
}

function SkeletonBlock({ h = 'h-3', w = 'w-full' }) { return <div className={`${h} ${w} rounded bg-stone-100 animate-pulse`} /> }
function SkeletonCard() { return <div className="border border-stone-100 rounded-xl p-4 space-y-2.5"><SkeletonBlock h="h-2.5" w="w-1/3" /><SkeletonBlock /><SkeletonBlock w="w-4/5" /><SkeletonBlock h="h-2.5" w="w-2/3" /></div> }

function EmptyState({ icon, title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-4">
      <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mb-3 text-2xl">{icon}</div>
      <p className="text-sm font-bold text-stone-600 mb-1">{title}</p>
      {body && <p className="text-xs text-stone-400 max-w-xs leading-relaxed mt-1">{body}</p>}
      {action}
    </div>
  )
}

function StatCard({ label, value, color, loading, sub }) {
  return (
    <div className="bg-white rounded-xl border border-stone-100 p-4 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">{label}</p>
      {loading ? <SkeletonBlock h="h-7" w="w-12" /> : <p className={`text-2xl font-bold ${color}`}>{value}</p>}
      {sub && <p className="text-[10px] text-stone-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`relative w-8 h-4 rounded-full flex-shrink-0 transition-colors ${checked ? 'bg-amber-500' : 'bg-stone-200'}`}>
      <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  )
}

// ─── PDF Preview Modal ────────────────────────────────────────────────────────
function PdfPreviewModal({ file, onClose }) {
  const url = useMemo(() => file ? URL.createObjectURL(file) : null, [file])
  if (!file || !url) return null
  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-stone-900/80 backdrop-blur-sm" onClick={onClose}>
      <div className="flex items-center justify-between px-5 py-3 bg-stone-900 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <span className="text-lg">📄</span>
          <p className="text-sm font-semibold text-white truncate max-w-xs">{file.name}</p>
          <span className="text-[10px] text-stone-400 bg-stone-800 px-2 py-0.5 rounded-full">{(file.size / 1024).toFixed(0)} KB</span>
        </div>
        <button onClick={onClose} className="text-stone-400 hover:text-white transition text-xl px-2">✕</button>
      </div>
      <div className="flex-1 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <iframe src={url} className="w-full h-full border-0" title="Contract PDF Preview" />
      </div>
    </div>
  )
}

// ─── Summary Tab ──────────────────────────────────────────────────────────────
function SummaryTab({ summary, aiRiskLevel, aiReportText, mergedClauses, response, stepStatus, hasRun, onNavigate }) {
  if (!hasRun) return (
    <EmptyState icon="🔍" title="No contract analysed yet"
      body="Paste your contract text or upload a PDF, then click Analyse My Contract to get started." />
  )

  const contractType = response?.preprocessing?.contract_type
  const topRisks = mergedClauses.flatMap((c) => (c.risks || []).map((r) => ({ ...r, clause_id: c.clause_id, clause_type: c.clause_type, clause_text: c.clause_text }))).filter((r) => inferSeverity(r) === 'high').slice(0, 3)
  const overallSev = summary.high > 0 ? 'high' : summary.medium > 0 ? 'medium' : 'low'
  const overallLabel = summary.high > 0 ? 'HIGH RISK' : summary.medium > 0 ? 'MEDIUM RISK' : 'LOW RISK'
  const overallDesc = summary.high > 0
    ? 'This contract contains clauses that may significantly harm your rights. Do not sign without legal review.'
    : summary.medium > 0
      ? 'Some clauses are unusual or unfair. Consider negotiating these before signing.'
      : 'No major red flags detected. Still review carefully before signing.'

  return (
    <div className="space-y-5">
      <div className={`rounded-xl border-2 p-5 ${overallSev === 'high' ? 'border-red-200 bg-red-50' : overallSev === 'medium' ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
        <div className="flex items-start gap-4 flex-wrap">
          <div className={`text-3xl flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${overallSev === 'high' ? 'bg-red-100' : overallSev === 'medium' ? 'bg-amber-100' : 'bg-emerald-100'}`}>
            {overallSev === 'high' ? '⚠️' : overallSev === 'medium' ? '⚡' : '✅'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-lg font-black tracking-tight ${overallSev === 'high' ? 'text-red-800' : overallSev === 'medium' ? 'text-amber-800' : 'text-emerald-800'}`}>{overallLabel}</span>
              {aiRiskLevel !== 'N/A' && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${SEV[overallSev]?.badge}`}>AI: {aiRiskLevel}</span>}
              {contractType && contractType !== 'unknown' && <span className="text-xs text-stone-500 bg-white border border-stone-200 px-2 py-0.5 rounded-full capitalize">{contractType.replace(/_/g, ' ')}</span>}
            </div>
            <p className={`text-sm mt-1 leading-relaxed ${overallSev === 'high' ? 'text-red-700' : overallSev === 'medium' ? 'text-amber-700' : 'text-emerald-700'}`}>{overallDesc}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Clauses analysed" value={summary.clauses} color="text-stone-800" loading={stepStatus.clauses === 'loading'} sub="contract sections" />
        <StatCard label="Risk signals" value={summary.patterns} color="text-amber-700" loading={stepStatus.patterns === 'loading'} sub="patterns matched" />
        <StatCard label="Similar cases" value={summary.cases} color="text-orange-700" loading={stepStatus.cases === 'loading'} sub="court precedents" />
        <StatCard label="Laws referenced" value={summary.acts} color="text-amber-800" loading={stepStatus.acts === 'loading'} sub="Act sections" />
      </div>

      <div className="bg-white rounded-xl border border-stone-100 p-5">
        <h3 className="text-sm font-bold text-stone-800 mb-3">Risk Breakdown</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { lbl: 'High Risk', count: summary.high, sev: 'high', desc: 'Clauses that may harm your rights' },
            { lbl: 'Medium Risk', count: summary.medium, sev: 'medium', desc: 'Unusual or unfair clauses' },
            { lbl: 'Low Risk', count: summary.low, sev: 'low', desc: 'Minor concerns only' },
          ].map(({ lbl, count, sev, desc }) => (
            <div key={sev} className={`rounded-xl p-4 text-center border ${SEV[sev].badge}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">{lbl}</p>
              {stepStatus.patterns === 'loading' ? <div className="h-8 w-8 rounded bg-white/60 animate-pulse mx-auto" /> : <p className="text-3xl font-black">{count}</p>}
              <p className="text-[10px] opacity-60 mt-1 leading-snug">{desc}</p>
            </div>
          ))}
        </div>
        {(summary.high + summary.medium + summary.low > 0) && (
          <>
            <div className="flex h-2 rounded-full overflow-hidden gap-px">
              {summary.high > 0 && <div className="bg-red-400 transition-all rounded-l-full" style={{ flex: summary.high }} />}
              {summary.medium > 0 && <div className="bg-amber-400 transition-all" style={{ flex: summary.medium }} />}
              {summary.low > 0 && <div className="bg-emerald-400 transition-all rounded-r-full" style={{ flex: summary.low }} />}
            </div>
            <p className="text-[10px] text-stone-400 mt-1.5">{summary.high + summary.medium + summary.low} total risk signals across {summary.clauses} clauses</p>
          </>
        )}
      </div>

      {topRisks.length > 0 && (
        <div className="bg-white rounded-xl border border-red-100 p-5">
          <h3 className="text-sm font-bold text-red-800 mb-1 flex items-center gap-2">⚠️ Immediate Concerns</h3>
          <p className="text-xs text-stone-400 mb-3">These clauses require your attention before signing.</p>
          <div className="space-y-2">
            {topRisks.map((r, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">{idx + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-red-800">{String(r?.risk || r?.title || r?.pattern_title || 'Risk detected')}</p>
                  <p className="text-[11px] text-stone-500 mt-0.5 capitalize">in {r.clause_type?.replace(/_/g, ' ') || 'clause'}</p>
                  {r.clause_text && <p className="text-[11px] text-stone-400 mt-1 italic truncate">"{r.clause_text.slice(0, 80)}…"</p>}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate('clauses')} className="mt-3 text-xs text-amber-700 font-semibold hover:underline">View all clauses →</button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { id: 'patterns', icon: '🔍', label: 'Risk Patterns', count: summary.patterns, color: 'text-amber-700' },
          { id: 'cases', icon: '⚖️', label: 'Court Cases', count: summary.cases, color: 'text-orange-700' },
          { id: 'acts', icon: '📋', label: 'Relevant Laws', count: summary.acts, color: 'text-amber-800' },
          { id: 'ai', icon: '🤖', label: 'Full AI Report', count: null, color: 'text-stone-700' },
        ].map(({ id, icon, label, count, color }) => (
          <button key={id} onClick={() => onNavigate(id)} className="flex items-center gap-2 p-3 rounded-xl border border-stone-100 bg-white hover:border-amber-200 hover:bg-amber-50/50 transition-all text-left group">
            <span className="text-base flex-shrink-0">{icon}</span>
            <div className="min-w-0">
              <p className={`text-xs font-bold ${color} group-hover:text-amber-700 transition-colors`}>{label}</p>
              {count !== null && <p className="text-[10px] text-stone-400">{count} found</p>}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200">
        <span className="text-base flex-shrink-0 mt-0.5">ℹ️</span>
        <p className="text-[11px] text-stone-500 leading-relaxed">
          <strong className="text-stone-700">This is an AI-assisted analysis, not legal advice.</strong> LawKnow uses NLP pattern matching and Sri Lankan legal data to flag potential risks. For any High Risk clause, consult a qualified lawyer before signing.
        </p>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ContractRiskRetestPage() {
  const [mode, setMode] = useState('text')
  const [contractText, setContractText] = useState(defaultContractText)
  const [file, setFile] = useState(null)
  const [flags, setFlags] = useState(defaultFormFlags)
  const [activeTab, setActiveTab] = useState('summary')
  const [riskFilter, setRiskFilter] = useState('all')
  const [expandedClauseIds, setExpandedClauseIds] = useState({})
  const [loadingStep, setLoadingStep] = useState('idle')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [analysisState, dispatchAnalysis] = useReducer(analysisReducer, undefined, createInitialAnalysisState)
  const [simplifyPayload, setSimplifyPayload] = useState(null)
  const [copyStatus, setCopyStatus] = useState('')
  const [hasRun, setHasRun] = useState(false)
  const [showPdfPreview, setShowPdfPreview] = useState(false)
  const [analysedAt, setAnalysedAt] = useState(null)
  const fileInputRef = useRef(null)
  const dragRef = useRef(null)

  const apiBase = serviceEndpoints.analyze
  const clausesUrl = useMemo(() => `${apiBase.replace(/\/$/, '')}/analyze-clauses`, [apiBase])
  const aiReportUrl = useMemo(() => `${apiBase.replace(/\/$/, '')}/generate-ai-risk-report`, [apiBase])
  const simplifyUrl = useMemo(() => `${apiBase.replace(/\/$/, '')}/simplify-contract`, [apiBase])
  const patternUrl = useMemo(() => `${apiBase.replace(/\/$/, '')}/proxy/pattern-batch`, [apiBase])
  const caseUrl = useMemo(() => `${apiBase.replace(/\/$/, '')}/proxy/case-similar`, [apiBase])
  const actsUrl = useMemo(() => `${apiBase.replace(/\/$/, '')}/proxy/acts-search`, [apiBase])

  const response = useMemo(() => {
    const cp = analysisState?.clausesPayload
    const pp = analysisState?.patternPayload || { total_patterns_detected: 0, clauses_with_patterns: [] }
    const rawCase = analysisState?.casePayload || {}
    const cas = { total_cases_retrieved: rawCase.total_cases_retrieved || (rawCase.cases ? rawCase.cases.length : 0), cases: rawCase.cases || [], clauses_with_cases: rawCase.clauses_with_cases || [] }
    const rawActs = analysisState?.actsPayload || {}
    const ap = { total_acts_retrieved: rawActs.total_acts_retrieved || (rawActs.sections ? rawActs.sections.length : 0), sections: rawActs.sections || [], clauses_with_acts: rawActs.clauses_with_acts || [] }
    return {
      preprocessing: { contract_type: cp?.contract_type || 'unknown' },
      pattern_detection: pp, case_law: cas, acts_law: ap,
      ai_risk_report: analysisState?.reportPayload || null,
      simplified_contract_text: simplifyPayload?.simplified_contract_text || '',
      summary: { total_clauses: cp?.total_clauses || (cp?.clauses || []).length, total_patterns_detected: pp.total_patterns_detected || 0, total_cases_retrieved: cas.total_cases_retrieved || 0, total_acts_retrieved: ap.total_acts_retrieved || 0 },
    }
  }, [analysisState, simplifyPayload])

  const analysisProgress = useMemo(() => progressPercent(analysisState.status), [analysisState.status])
  const mergedClauses = useMemo(() => mergeByClauseId(response || {}), [response])
  const filteredClauses = useMemo(() => riskFilter === 'all' ? mergedClauses : mergedClauses.filter((c) => (c?.risks || []).some((r) => inferSeverity(r) === riskFilter)), [mergedClauses, riskFilter])

  const summary = useMemo(() => {
    const src = response?.summary || {}
    const rc = { high: 0, medium: 0, low: 0 }
    mergedClauses.forEach((c) => (c?.risks || []).forEach((r) => { rc[inferSeverity(r)] += 1 }))
    return { clauses: src.total_clauses ?? mergedClauses.length, patterns: src.total_patterns_detected ?? 0, cases: src.total_cases_retrieved ?? 0, acts: src.total_acts_retrieved ?? 0, ...rc }
  }, [response, mergedClauses])

  const aiReport = useMemo(() => response?.ai_risk_report || null, [response])
  const aiReportText = useMemo(() => extractAiReportText(aiReport), [aiReport])
  const aiRiskLevel = useMemo(() => extractAiRiskLevel(aiReport), [aiReport])

  const simplifiedClauses = useMemo(() => (response?.experimental_bert_support?.clauses || []).filter((i) => String(i?.simple_english || '').trim()).map((i) => ({ clause_id: i?.clause_id || 'unknown', simple_english: String(i?.simple_english || '').trim() })), [response])
  const simplifiedContractText = useMemo(() => { const w = String(response?.simplified_contract_text || '').trim(); return w || simplifiedClauses.map((i) => i.simple_english).join('\n\n') }, [response, simplifiedClauses])

  const flatCaseList = useMemo(() => {
    const casRaw = response?.case_law || {}
    if (casRaw?.cases && casRaw.cases.length) return casRaw.cases
    if (casRaw?.clauses_with_cases && casRaw.clauses_with_cases.length) {
      return casRaw.clauses_with_cases.flatMap((item) => (item.supporting_cases || []).map((c) => ({ ...c, matching_clauses: c?.matching_clauses || [{ clause_id: item.clause_id, clause_text: item.text_preview || item.clause_text || '' }] })))
    }
    return []
  }, [response])

  const flatActsList = useMemo(() => {
    const actsRaw = response?.acts_law || {}
    if (actsRaw?.sections && actsRaw.sections.length) return actsRaw.sections
    if (actsRaw?.clauses_with_acts && actsRaw.clauses_with_acts.length) {
      return actsRaw.clauses_with_acts.flatMap((item) => item.supporting_acts || item.acts || item.sections || [])
    }
    return []
  }, [response])

  const stepStatus = analysisState.status

  const handleDragOver = useCallback((e) => { e.preventDefault(); dragRef.current?.classList.add('border-amber-400', 'bg-amber-50') }, [])
  const handleDragLeave = useCallback(() => { dragRef.current?.classList.remove('border-amber-400', 'bg-amber-50') }, [])
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    dragRef.current?.classList.remove('border-amber-400', 'bg-amber-50')
    const dropped = e.dataTransfer.files?.[0]
    if (dropped && (dropped.type === 'application/pdf' || dropped.type === 'text/plain')) setFile(dropped)
  }, [])

  function viewFullCase(caseItem) {
    try {
      if (!caseItem) return
      if (caseItem.full_case_url) { window.open(caseItem.full_case_url, '_blank'); return }
      const w = window.open('', '_blank')
      if (!w) return
      w.document.title = caseItem.case_name || 'Case'
      const pre = w.document.createElement('pre')
      pre.textContent = caseItem.full_case ? JSON.stringify(caseItem.full_case, null, 2) : JSON.stringify(caseItem, null, 2)
      pre.style.whiteSpace = 'pre-wrap'; pre.style.fontFamily = 'monospace'
      w.document.body.appendChild(pre)
    } catch (err) { console.error('viewFullCase', err); alert('Unable to open full case.') }
  }

  async function submitAnalysis(e) {
    e.preventDefault()
    if (loading) return
    setLoading(true); setHasRun(true); setError(''); setLoadingStep('Preparing'); setCopyStatus('')
    dispatchAnalysis({ type: 'RESET' }); setSimplifyPayload(null); setActiveTab('summary')

    try {
      if (mode === 'file' && !file) throw new Error('Select a PDF file first.')
      if (mode === 'text' && !String(contractText || '').trim()) throw new Error('Paste contract text before running.')

      const fd = new FormData()
      if (mode === 'file' && file) fd.append('file', file); else fd.append('text', contractText)
      fd.append('mask_pii', String(flags.mask_pii))

      setLoadingStep('Extracting clauses')
      dispatchAnalysis({ type: 'STEP_LOADING', step: 'clauses' })
      const clauseRes = await fetchWithProxyFallback(clausesUrl, { method: 'POST', body: fd })
      const clausesPayload = await tryParseJson(clauseRes)
      if (!clauseRes.ok) { const detail = clausesPayload?.detail || `Clause extraction failed (${clauseRes.status})`; dispatchAnalysis({ type: 'STEP_ERROR', step: 'clauses', error: detail }); throw new Error(detail) }
      dispatchAnalysis({ type: 'STEP_DONE', step: 'clauses', payload: clausesPayload })

      const clauses = clausesPayload?.clauses || []
      const clauseLookup = {}
      clauses.forEach((c) => { clauseLookup[c?.clause_id] = { clause_type: c?.clause_type || 'unknown', clause_text: c?.clause_text || '' } })
      const ctx = { sector: 'unknown', company_size: 'unknown', unionized: 'unknown', industry: 'unknown', employee_level: 'unknown', jurisdiction: 'sri_lanka', contract_type: clausesPayload?.contract_type || 'unknown', contract_duration: 'unknown', foreign_worker: 'unknown' }

      setLoadingStep('Running parallel analysis…')
      dispatchAnalysis({ type: 'STEP_LOADING', step: 'patterns' })
      dispatchAnalysis({ type: 'STEP_LOADING', step: 'cases' })
      dispatchAnalysis({ type: 'STEP_LOADING', step: 'acts' })

      const patternPromise = (async () => {
        try {
          const res = await fetchWithProxyFallback(patternUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clauses: clauses.map((i) => ({ clause_id: i?.clause_id, clause_text: i?.clause_text || '' })), contract_context: ctx, top_patterns: TOP_K_PATTERNS, min_context_score: PATTERN_THRESHOLD }) })
          const raw = await tryParseJson(res)
          if (!res.ok) throw new Error(raw?.detail || 'Pattern API failed')
          const n = normalizePatternPayload(raw, clauseLookup)
          dispatchAnalysis({ type: 'STEP_DONE', step: 'patterns', payload: n })
          return n
        } catch (err) { dispatchAnalysis({ type: 'STEP_ERROR', step: 'patterns', error: err?.message }); return null }
      })()

      const casePromise = (async () => {
        try {
          const contractBodyText = mode === 'file' ? clauses.map((c) => c?.clause_text || '').join('\n\n') : String(contractText || '').trim()
          const caseRes = await fetchWithProxyFallback(caseUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: contractBodyText, top_k: TOP_K_CASES, contract_type: clausesPayload?.contract_type || 'unknown', clauses: clauses.map((c) => ({ clause_id: c?.clause_id, clause_text: c?.clause_text || '' })) }) })
          const casePayload = await tryParseJson(caseRes)
          if (!caseRes.ok) throw new Error(casePayload?.detail || `Case API failed (${caseRes.status})`)
          const enrichedCases = (casePayload?.cases || []).map((c) => ({ case_id: c?.case_id, case_name: c?.case_name || c?.title, year: c?.year, category: c?.category, similarity: c?.similarity ?? c?.similarity_score ?? null, relevance: c?.relevance ?? null, snippet: c?.snippet || c?.text_snippet || '', full_case: c?.full_case || null, matching_clauses: c?.matching_clauses || [] }))
          const normalizedCases = { total_cases_retrieved: enrichedCases.length, cases: enrichedCases }
          dispatchAnalysis({ type: 'STEP_DONE', step: 'cases', payload: normalizedCases })
          return normalizedCases
        } catch (err) { dispatchAnalysis({ type: 'STEP_ERROR', step: 'cases', error: err?.message || 'Case step failed' }); return null }
      })()

      const actsPromise = (async () => {
        try {
          const contractBodyText = mode === 'file' ? clauses.map((c) => c?.clause_text || '').join('\n\n') : String(contractText || '').trim()
          const actsRes = await fetchWithProxyFallback(actsUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query_text: contractBodyText, domain: clausesPayload?.contract_type || 'unknown', top_k: TOP_K_ACTS }) })
          const actsPayload = await tryParseJson(actsRes)
          if (!actsRes.ok) return { total_acts_retrieved: 0, sections: [] }
          const normalizedActs = { total_acts_retrieved: actsPayload?.total_results || (actsPayload?.sections || []).length, sections: actsPayload?.sections || [] }
          dispatchAnalysis({ type: 'STEP_DONE', step: 'acts', payload: normalizedActs })
          return normalizedActs
        } catch (err) { dispatchAnalysis({ type: 'STEP_ERROR', step: 'acts', error: err?.message || 'Acts step failed' }); return null }
      })()

      const simplifyPromise = flags.use_simple_english
        ? (async () => {
          try {
            const sfd = new FormData()
            if (mode === 'file' && file) sfd.append('file', file); else sfd.append('text', contractText)
            sfd.append('mask_pii', String(flags.mask_pii))
            sfd.append('simplify_model_id', 'google/flan-t5-small')
            sfd.append('simplify_max_new_tokens', '640')
            const res = await fetchWithProxyFallback(simplifyUrl, { method: 'POST', body: sfd })
            const data = await tryParseJson(res)
            if (!res.ok) return null
            setSimplifyPayload(data)
            return data
          } catch { return null }
        })()
        : Promise.resolve(null)

      const settled = await Promise.allSettled([patternPromise, casePromise, actsPromise, simplifyPromise])
      const patternData = settled[0]?.status === 'fulfilled' ? settled[0].value : null
      const caseData = settled[1]?.status === 'fulfilled' ? settled[1].value : null
      const actsData = settled[2]?.status === 'fulfilled' ? settled[2].value : null

      if (flags.include_ai_report) {
        setLoadingStep('Generating AI report…')
        dispatchAnalysis({ type: 'STEP_LOADING', step: 'report' })
        try {
          const rRes = await fetchWithProxyFallback(aiReportUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ preprocessing: { contract_type: clausesPayload?.contract_type || 'unknown', total_clauses: clauses.length }, pattern_data: patternData, case_data: caseData, acts_data: actsData, data_coverage: {} }) })
          const rp = await tryParseJson(rRes)
          if (!rRes.ok) throw new Error(rp?.detail || 'AI report failed')
          dispatchAnalysis({ type: 'STEP_DONE', step: 'report', payload: rp })
        } catch (err) { dispatchAnalysis({ type: 'STEP_ERROR', step: 'report', error: err?.message }) }
      }

      setLoadingStep('Complete')
      setAnalysedAt(new Date())
    } catch (err) { setError(err?.message || 'Analysis failed.'); setLoadingStep('Failed') }
    finally { setLoading(false) }
  }

  function toggleClause(id) { setExpandedClauseIds((p) => ({ ...p, [id]: !p[id] })) }
  async function handleCopy(text) { const ok = await copyToClipboard(text); setCopyStatus(ok ? 'Copied!' : 'Copy failed'); setTimeout(() => setCopyStatus(''), 1800) }

  const visibleTabs = [
    ...TAB_CONFIG,
    ...(flags.use_simple_english ? [{ id: 'simplified', label: 'Plain English', icon: '🌐', step: null, desc: 'Simplified text' }] : []),
  ]

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      {showPdfPreview && file && <PdfPreviewModal file={file} onClose={() => setShowPdfPreview(false)} />}

      <div className="fixed top-0 left-0 right-0 z-50 h-0.5">
        {loading && <div className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 transition-all duration-700" style={{ width: `${analysisProgress}%` }} />}
      </div>

      <main className="pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="pt-8 pb-5 border-b border-stone-200 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold tracking-widest text-amber-600 uppercase mb-1.5">LawKnow · AI Legal Analysis</p>
                <h1 className="text-3xl font-bold text-stone-800 tracking-tight leading-tight">Contract Risk Review</h1>
                <p className="text-sm text-stone-500 mt-1.5 max-w-lg leading-relaxed">
                  Know your risks before you sign — powered by Sri Lankan law, court precedents, and risk pattern analysis.
                </p>
              </div>
              {hasRun && (
                <div className="flex-shrink-0">
                  {loading ? (
                    <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                      {loadingStep}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      Analysis complete · {analysedAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ════ LEFT: Input panel ════ */}
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden sticky top-24">

                <div className="px-5 py-4 bg-gradient-to-r from-amber-600 to-orange-500">
                  <p className="text-[10px] font-bold text-amber-100 uppercase tracking-widest mb-0.5">LawKnow</p>
                  <h2 className="text-sm font-bold text-white">Your Contract</h2>
                  <p className="text-[11px] text-amber-100 mt-0.5">Paste text or upload a PDF</p>
                </div>

                <div className="p-5 space-y-5">

                  <div className="flex rounded-lg border border-stone-200 overflow-hidden bg-stone-50">
                    {[['text', '✏️ Paste Text'], ['file', '📎 Upload PDF']].map(([m, lbl]) => (
                      <button key={m} type="button" onClick={() => setMode(m)}
                        className={`flex-1 py-2 text-xs font-semibold transition-colors ${mode === m ? 'bg-amber-500 text-white' : 'text-stone-500 hover:text-stone-700'}`}>
                        {lbl}
                      </button>
                    ))}
                  </div>

                  {mode === 'text' ? (
                    <textarea
                      rows={11}
                      placeholder="Paste your employment contract here…"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition resize-none leading-relaxed"
                      value={contractText}
                      onChange={(e) => setContractText(e.target.value)}
                    />
                  ) : (
                    <div>
                      <div ref={dragRef} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="block border-2 border-dashed border-stone-200 rounded-xl p-5 text-center hover:border-amber-300 transition-colors cursor-pointer">
                        <div className="text-2xl mb-1.5">{file ? '📄' : '📎'}</div>
                        <p className="text-xs text-stone-400 mb-1">{file ? 'Click to change file' : 'Click to browse or drag & drop'}</p>
                        <input ref={fileInputRef} type="file" accept="application/pdf,text/plain" className="sr-only"
                          onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        {file
                          ? <p className="text-xs text-amber-700 font-bold truncate mt-1">{file.name}</p>
                          : <p className="text-[10px] text-stone-400">PDF or TXT · max 10 MB</p>}
                      </div>
                      {file && file.type === 'application/pdf' && (
                        <button onClick={() => setShowPdfPreview(true)}
                          className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg py-2 hover:bg-amber-100 transition">
                          <span>👁️</span> Preview PDF
                        </button>
                      )}
                    </div>
                  )}

                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">What we check</p>
                    <div className="space-y-2">
                      {[
                        { key: 'include_pattern_detection', icon: '🔍', label: 'Risk pattern matching', desc: '169 known harmful clause patterns' },
                        { key: 'include_case_law', icon: '⚖️', label: 'Similar court cases', desc: '1,040 Sri Lankan legal cases' },
                        { key: 'include_acts', icon: '📋', label: 'Relevant laws & acts', desc: 'Sri Lankan employment legislation' },
                        { key: 'include_ai_report', icon: '🤖', label: 'AI risk summary', desc: 'Plain-language explanation of risks' },
                      ].map(({ key, icon, label, desc }) => (
                        <div key={key}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${flags[key] ? 'border-amber-200 bg-amber-50/60' : 'border-stone-100 bg-white'}`}>
                          <div className="flex items-center gap-3 min-w-0 mr-3">
                            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-sm flex-shrink-0">
                              {icon}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-semibold leading-tight ${flags[key] ? 'text-amber-800' : 'text-stone-600'}`}>{label}</p>
                              <p className="text-[10px] text-stone-400 mt-0.5">{desc}</p>
                            </div>
                          </div>
                          <Toggle
                            checked={!!flags[key]}
                            onChange={(v) => setFlags((p) => ({ ...p, [key]: v }))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">How it works</p>
                    <div className="space-y-0">
                      {[
                        { step: '1', title: 'Your contract is read & split into clauses', desc: 'Each clause is assessed separately for accuracy' },
                        { step: '2', title: 'Matched against patterns, cases & laws', desc: 'All three run in parallel for speed' },
                        { step: '3', title: 'AI generates a plain-language risk report', desc: 'Highlights what to negotiate before signing' },
                      ].map(({ step, title, desc }, idx, arr) => (
                        <div key={step} className="flex gap-3 items-start">
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className="w-6 h-6 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                              {step}
                            </div>
                            {idx < arr.length - 1 && <div className="w-px h-5 bg-stone-200 my-0.5" />}
                          </div>
                          <div className={idx < arr.length - 1 ? 'pb-2' : ''}>
                            <p className="text-xs font-semibold text-stone-700 leading-snug pt-0.5">{title}</p>
                            <p className="text-[10px] text-stone-400 mt-0.5 leading-relaxed">{desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                      <span className="text-base flex-shrink-0">⚠️</span>
                      <p className="text-xs text-red-700 font-medium leading-relaxed">{error}</p>
                    </div>
                  )}

                  <button onClick={submitAnalysis} disabled={loading}
                    className={`w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${loading ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg active:scale-[0.98]'}`}>
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                        {loadingStep}
                      </span>
                    ) : hasRun ? '🔄 Re-run Analysis' : '🔍 Analyse My Contract'}
                  </button>

                  {loading && (
                    <div>
                      <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                        <span>{loadingStep}</span><span>{analysisProgress}%</span>
                      </div>
                      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-700" style={{ width: `${analysisProgress}%` }} />
                      </div>
                      <p className="text-[10px] text-stone-400 mt-1 text-center">Usually takes 15–30 seconds</p>
                    </div>
                  )}

                  <div className="flex gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-100">
                    <span className="text-sm flex-shrink-0 mt-0.5">ℹ️</span>
                    <p className="text-[10px] text-stone-500 leading-relaxed">
                      <strong className="text-stone-600">Not legal advice.</strong> LawKnow helps you understand your contract — for any high-risk clause, consult a qualified lawyer before signing.
                    </p>
                  </div>

                </div>
              </div>
            </div>

            {/* ════ RIGHT: Results ════ */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-5">
              <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">

                <div className="flex border-b border-stone-100 overflow-x-auto bg-stone-50/60 px-1 scrollbar-none">
                  {visibleTabs.map(({ id, label, icon, step, desc }) => {
                    const active = activeTab === id
                    const s = step ? stepStatus[step] : null
                    return (
                      <button key={id} onClick={() => setActiveTab(id)} title={desc}
                        className={`relative flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 flex-shrink-0 ${active ? 'border-amber-500 text-amber-700 bg-white' : 'border-transparent text-stone-400 hover:text-stone-600 hover:bg-stone-50'}`}>
                        <span>{icon}</span>
                        <span className="hidden sm:inline">{label}</span>
                        {s && <StatusDot status={s} />}
                      </button>
                    )
                  })}
                </div>

                <div className="p-5">

                  {activeTab === 'summary' && (
                    <SummaryTab summary={summary} aiRiskLevel={aiRiskLevel} aiReportText={aiReportText}
                      mergedClauses={mergedClauses} response={response} stepStatus={stepStatus}
                      hasRun={hasRun} onNavigate={setActiveTab} />
                  )}

                  {activeTab === 'clauses' && (
                    <div className="space-y-3">
                      {stepStatus.clauses === 'loading'
                        ? <div className="space-y-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
                        : stepStatus.clauses === 'error'
                          ? <EmptyState icon="⚠️" title="Clause extraction failed" body={analysisState.errors.clauses} />
                          : !hasRun
                            ? <EmptyState icon="📄" title="No contract analysed yet" body="Paste or upload a contract and click Analyse My Contract." />
                            : mergedClauses.length === 0
                              ? <EmptyState icon="📄" title="No clauses found" body="The contract may be empty or unrecognised." />
                              : (
                                <>
                                  <div className="flex items-center gap-2 flex-wrap pb-1">
                                    <span className="text-[11px] text-stone-500 font-bold">Show:</span>
                                    {riskFilters.map((f) => (
                                      <button key={f} onClick={() => setRiskFilter(f)}
                                        className={`text-[11px] px-3 py-1 rounded-full font-semibold capitalize transition-all ${riskFilter === f ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-500 hover:bg-amber-50 hover:text-amber-700'}`}>
                                        {f === 'all' ? 'All clauses' : `${f} risk only`}
                                      </button>
                                    ))}
                                    <span className="ml-auto text-[11px] text-stone-400">{filteredClauses.length} clause{filteredClauses.length !== 1 ? 's' : ''}</span>
                                    {copyStatus && <span className="text-[11px] text-emerald-600 font-bold">{copyStatus}</span>}
                                  </div>
                                  <p className="text-[11px] text-stone-400">Hover the risk badge to understand what it means.</p>
                                  {filteredClauses.length === 0
                                    ? <p className="text-center text-sm text-stone-400 py-8">No clauses match this filter.</p>
                                    : (
                                      <div className="space-y-2">
                                        {filteredClauses.map((clause) => {
                                          const risks = clause?.risks || []
                                          const exp = !!expandedClauseIds[clause.clause_id]
                                          const topSev = risks.length ? inferSeverity(risks[0]) : null
                                          return (
                                            <article key={clause.clause_id} className={`rounded-xl border overflow-hidden transition-all ${topSev === 'high' ? 'border-red-100' : 'border-stone-100'}`}>
                                              <button onClick={() => toggleClause(clause.clause_id)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 transition-colors">
                                                <span className={`w-0.5 h-8 rounded-full flex-shrink-0 ${topSev === 'high' ? 'bg-red-400' : topSev === 'medium' ? 'bg-amber-400' : topSev === 'low' ? 'bg-emerald-400' : 'bg-stone-200'}`} />
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs font-bold text-stone-700 capitalize">{(clause.clause_type || 'Clause').replace(/_/g, ' ')}</span>
                                                    <span className="text-[10px] font-mono text-stone-300">{clause.clause_id}</span>
                                                  </div>
                                                  {!exp && clause.clause_text && <p className="text-[11px] text-stone-400 truncate mt-0.5">"{clause.clause_text.slice(0, 80)}…"</p>}
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                  {topSev && <SeverityTooltip level={topSev} />}
                                                  {risks.length > 0 && <span className="text-[11px] text-stone-400 font-medium">{risks.length} risk{risks.length !== 1 ? 's' : ''}</span>}
                                                  <svg className={`w-3.5 h-3.5 text-stone-300 transition-transform ${exp ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                                </div>
                                              </button>
                                              {exp && (
                                                <div className="border-t border-stone-100 bg-stone-50 px-4 py-4 space-y-4">
                                                  <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Clause text</p>
                                                      <button onClick={() => handleCopy(clause.clause_text)} className="text-[11px] px-2.5 py-1 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 transition font-semibold">📋 Copy</button>
                                                    </div>
                                                    <p className="text-xs text-stone-600 leading-relaxed bg-white border border-stone-100 rounded-lg px-3 py-2.5 whitespace-pre-wrap">{clause.clause_text || 'Clause text unavailable.'}</p>
                                                  </div>
                                                  {risks.length > 0 && (
                                                    <div>
                                                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">What was flagged</p>
                                                      <div className="space-y-1.5">
                                                        {risks.map((risk, idx) => (
                                                          <div key={idx} className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-white border border-stone-100 gap-3">
                                                            <span className="text-stone-700 font-medium truncate">{String(risk?.risk || risk?.title || risk?.pattern_title || 'Risk detected')}</span>
                                                            <SeverityTooltip level={inferSeverity(risk)} />
                                                          </div>
                                                        ))}
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </article>
                                          )
                                        })}
                                      </div>
                                    )}
                                </>
                              )}
                    </div>
                  )}

                  {activeTab === 'patterns' && (
                    <div className="space-y-4">
                      <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                        <p className="text-xs font-bold text-amber-800 mb-0.5">What are risk patterns?</p>
                        <p className="text-[11px] text-amber-700 leading-relaxed">LawKnow checks your contract against known risk patterns from Sri Lankan law — clause structures that have caused disputes in past cases.</p>
                      </div>
                      {stepStatus.patterns === 'loading'
                        ? <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>
                        : stepStatus.patterns === 'error'
                          ? <EmptyState icon="⚠️" title="Pattern detection failed" body={analysisState.errors.patterns} />
                          : !hasRun
                            ? <EmptyState icon="🔍" title="Run an analysis to see risk patterns" />
                            : (response?.pattern_detection?.clauses_with_patterns || []).length === 0
                              ? <EmptyState icon="✅" title="No risk patterns detected" body="No clauses matched the 169-pattern library above the confidence threshold." />
                              : (response?.pattern_detection?.clauses_with_patterns || []).map((item) => (
                                <div key={item?.clause_id} className="border border-stone-100 rounded-xl overflow-hidden">
                                  <div className="px-4 py-3 bg-stone-50 border-b border-stone-100 flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-stone-700 capitalize">{(item?.clause_type || 'Clause').replace(/_/g, ' ')}</span>
                                    <span className="text-[10px] font-mono text-stone-300">{item?.clause_id}</span>
                                    <span className="ml-auto text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">{item?.patterns_detected} pattern{item?.patterns_detected !== 1 ? 's' : ''} found</span>
                                  </div>
                                  {item?.clause_text && <p className="px-4 pt-2.5 text-[11px] text-stone-400 italic">"{item.clause_text.slice(0, 100)}{item.clause_text.length > 100 ? '…' : ''}"</p>}
                                  <div className="p-3 space-y-2">
                                    {(item?.detections || []).map((det, i) => (
                                      <div key={i} className="px-3 py-3 rounded-lg bg-white border border-stone-100 text-xs space-y-1.5">
                                        <div className="flex items-start justify-between gap-3">
                                          <p className="font-bold text-stone-800">{det?.pattern_title || 'Risk Pattern'}</p>
                                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                            <SeverityTooltip level={inferSeverity(det)} />
                                            <span className="text-[10px] text-stone-400">{(det?.confidence * 100).toFixed(0)}% confidence</span>
                                          </div>
                                        </div>
                                        {det?.description && <p className="text-stone-500 leading-relaxed text-[11px]">{det.description}</p>}
                                        {det?.consequences && <p className="text-red-600 text-[11px] font-medium">⚠️ Risk: {det.consequences}</p>}
                                        {det?.safer_clause && (
                                          <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-2 mt-1">
                                            <p className="text-[10px] font-bold text-emerald-800 mb-0.5">✅ Safer alternative</p>
                                            <p className="text-[11px] text-emerald-700 leading-relaxed">{det.safer_clause}</p>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                    </div>
                  )}

                  {activeTab === 'cases' && (
                    <div className="space-y-4">
                      <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                        <p className="text-xs font-bold text-orange-800 mb-0.5">Why court cases matter</p>
                        <p className="text-[11px] text-orange-700 leading-relaxed">These Sri Lankan cases involved clauses similar to your contract. Past court decisions can show how your clauses may be interpreted and their legal consequences.</p>
                      </div>
                      {stepStatus.cases === 'loading'
                        ? <div className="space-y-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
                        : stepStatus.cases === 'error'
                          ? <EmptyState icon="⚠️" title="Case retrieval failed" body={analysisState.errors.cases} />
                          : !hasRun
                            ? <EmptyState icon="⚖️" title="Run an analysis to see similar cases" />
                            : flatCaseList.length === 0
                              ? <EmptyState icon="✅" title="No similar cases found" body="No court cases matched closely enough to include." />
                              : flatCaseList.map((singleCase, idx) => (
                                <div key={`case-${singleCase?.case_id || idx}`} className="border border-stone-100 rounded-xl overflow-hidden">
                                  <div className="px-4 py-3 bg-stone-50 border-b border-stone-100 flex items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-sm font-bold text-stone-800 leading-snug">{singleCase?.case_name || singleCase?.title || 'Case'}</h4>
                                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        {singleCase?.year && <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded font-mono">{singleCase.year}</span>}
                                        {singleCase?.category && <span className="text-[10px] text-stone-500">{singleCase.category}</span>}
                                      </div>
                                    </div>
                                    {(singleCase?.similarity || singleCase?.similarity_score) && (
                                      <div className="text-right flex-shrink-0">
                                        <p className="text-[10px] text-stone-400">Similarity</p>
                                        <p className="text-lg font-black text-amber-700">{Math.round((singleCase.similarity || singleCase.similarity_score) * 100)}%</p>
                                      </div>
                                    )}
                                  </div>
                                  {singleCase?.snippet && (
                                    <div className="px-4 pt-3 pb-1">
                                      <p className="text-[11px] text-stone-400 font-bold uppercase tracking-wide mb-1">Case excerpt</p>
                                      <p className="text-xs text-stone-600 italic leading-relaxed">"{String(singleCase.snippet).slice(0, 240)}{singleCase.snippet.length > 240 ? '…' : ''}"</p>
                                    </div>
                                  )}
                                  <div className="p-3 space-y-2">
                                    {singleCase?.matching_clauses && singleCase.matching_clauses.length > 0 && (
                                      <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                                        <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wide mb-1.5">Matching clauses in your contract</p>
                                        <div className="space-y-1.5">
                                          {singleCase.matching_clauses.map((clause, cidx) => (
                                            <div key={cidx} className="text-[11px] text-stone-600 leading-relaxed">
                                              <span className="font-bold text-amber-700">{clause?.clause_id ? `Clause ${clause.clause_id}` : 'Clause'}:</span>{' '}
                                              {String(clause?.clause_text || clause?.text || '').slice(0, 100)}{(clause?.clause_text || '').length > 100 ? '…' : ''}
                                              {clause?.why_matches && <span className="block text-stone-400 mt-0.5 italic">Why: {clause.why_matches}</span>}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    <button onClick={() => viewFullCase(singleCase)} className="text-[11px] px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition font-semibold flex items-center gap-1.5">
                                      📄 View full case
                                    </button>
                                  </div>
                                </div>
                              ))}
                    </div>
                  )}

                  {activeTab === 'acts' && (
                    <div className="space-y-4">
                      <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3">
                        <p className="text-xs font-bold text-stone-700 mb-0.5">Sri Lankan employment legislation</p>
                        <p className="text-[11px] text-stone-500 leading-relaxed">These Acts and sections are relevant to clauses in your contract. A lawyer can advise whether the contracting party is complying with them.</p>
                      </div>
                      {stepStatus.acts === 'loading'
                        ? <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>
                        : stepStatus.acts === 'error'
                          ? <EmptyState icon="⚠️" title="Legislation retrieval failed" body={analysisState.errors.acts} />
                          : !hasRun
                            ? <EmptyState icon="📋" title="Run an analysis to see relevant laws" />
                            : flatActsList.length === 0
                              ? <EmptyState icon="✅" title="No legislation matched" body="No specific Acts were matched to this contract's clauses." />
                              : (
                                <div className="space-y-2">
                                  {flatActsList.map((act, idx) => (
                                    <div key={`act-${idx}`} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white border border-stone-100 hover:border-amber-200 transition-colors">
                                      <span className="text-base flex-shrink-0 mt-0.5">📋</span>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-stone-800">{act?.act_name || act?.law_name || act?.title || 'Act'}</p>
                                        {act?.section_title && <p className="text-[11px] text-stone-500 mt-0.5">{act.section_title}</p>}
                                        {act?.section_text && <p className="text-[11px] text-stone-400 mt-1 leading-relaxed line-clamp-2">{act.section_text}</p>}
                                      </div>
                                      {(act?.section || act?.section_number) && (
                                        <span className="text-amber-700 font-mono text-[11px] font-bold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5">§{act?.section || act?.section_number}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                    </div>
                  )}

                  {activeTab === 'ai' && (
                    <div className="space-y-4">
                      {stepStatus.report === 'loading' ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                            <svg className="w-5 h-5 text-amber-500 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                            <div><p className="text-xs font-bold text-amber-800">Generating AI report…</p><p className="text-[10px] text-amber-600 mt-0.5">Synthesising all findings into a plain-language risk assessment</p></div>
                          </div>
                          <SkeletonCard /><SkeletonCard />
                        </div>
                      ) : stepStatus.report === 'error' ? (
                        <EmptyState icon="⚠️" title="AI report failed" body={analysisState.errors.report} />
                      ) : !hasRun ? (
                        <EmptyState icon="🤖" title="AI report not generated yet" body="Run an analysis with AI risk summary enabled." />
                      ) : aiReportText ? (
                        <>
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                              <h3 className="text-sm font-bold text-stone-800">AI Risk Report</h3>
                              <p className="text-[11px] text-stone-400 mt-0.5">AI-generated · Sri Lankan law · Not legal advice</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {aiRiskLevel !== 'N/A' && (
                                <span className={`text-xs px-3 py-1 rounded-lg font-bold border ${String(aiRiskLevel).toLowerCase().includes('high') ? 'bg-red-50 border-red-200 text-red-700' : String(aiRiskLevel).toLowerCase().includes('medium') ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                  Overall: {aiRiskLevel}
                                </span>
                              )}
                              <button onClick={() => handleCopy(aiReportText)} className="text-[11px] px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition font-semibold flex items-center gap-1">
                                📋 {copyStatus || 'Copy report'}
                              </button>
                            </div>
                          </div>
                          <div className="bg-stone-50 border border-stone-100 rounded-xl p-5">
                            <MarkdownReport text={aiReportText} />
                          </div>
                          <div className="flex gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-100">
                            <span className="text-base flex-shrink-0">⚖️</span>
                            <p className="text-[11px] text-blue-700 leading-relaxed">
                              <strong>For legal professionals:</strong> This report is based on NLP pattern matching against Sri Lankan employment legislation and case law. Clause IDs, severity scores, and pattern references are available in the Clause Details and Risk Patterns tabs for deeper validation.
                            </p>
                          </div>
                        </>
                      ) : (
                        <EmptyState icon="🤖" title="No report content returned" body={aiReport?.error} />
                      )}
                    </div>
                  )}

                  {activeTab === 'simplified' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-stone-800">Plain English Version</h3>
                          <p className="text-[11px] text-stone-400 mt-0.5">Contract rewritten in simple, everyday language</p>
                        </div>
                        {simplifiedContractText && (
                          <button onClick={() => handleCopy(simplifiedContractText)} className="text-[11px] px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 font-semibold flex items-center gap-1">
                            📋 {copyStatus || 'Copy'}
                          </button>
                        )}
                      </div>
                      {simplifiedContractText
                        ? <div className="bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{simplifiedContractText}</div>
                        : <EmptyState icon="🌐" title="No simplified text" body="Enable 'Simplify text' and re-run the analysis." />}
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}