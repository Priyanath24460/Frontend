export default function RiskAlertsSummary({ summary }) {
  if (summary.total_patterns_detected === 0) return null;

  return (
    <div id="risk-summary" className="bg-linear-to-br from-orange-50 via-red-50 to-rose-50 border-3 border-orange-400 rounded-3xl p-8 shadow-2xl">
      <div className="flex items-start gap-6 mb-8 flex-wrap">
        <div className="flex items-center gap-4">
          <span className="text-5xl animate-pulse">🚨</span>
          <div>
            <h3 className="text-4xl font-bold text-orange-900 tracking-tight">Risk Alerts Summary</h3>
            <p className="text-orange-800 font-bold mt-2 text-base flex items-center gap-2">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">⚠️ {summary.total_patterns_detected} risk{summary.total_patterns_detected !== 1 ? 's' : ''}</span>
              Detected in your contract
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border-2 border-orange-400 hover:shadow-lg hover:border-orange-500 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">Total Patterns</span>
            <span className="text-2xl">🔍</span>
          </div>
          <div className="text-3xl font-bold text-orange-900">{summary.total_patterns_detected}</div>
          <p className="text-xs text-orange-600 mt-2 font-medium">Risk patterns found</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border-2 border-red-400 hover:shadow-lg hover:border-red-500 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-red-700 uppercase tracking-wide">Affected Clauses</span>
            <span className="text-2xl">📄</span>
          </div>
          <div className="text-3xl font-bold text-red-900">{summary.clauses_with_patterns}</div>
          <p className="text-xs text-red-600 mt-2 font-medium">Out of {summary.total_clauses}</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border-2 border-blue-400 hover:shadow-lg hover:border-blue-500 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Case Law</span>
            <span className="text-2xl">⚖️</span>
          </div>
          <div className="text-3xl font-bold text-blue-900">{summary.unique_cases}</div>
          <p className="text-xs text-blue-600 mt-2 font-medium">Relevant cases cited</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border-2 border-purple-400 hover:shadow-lg hover:border-purple-500 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">Legislation</span>
            <span className="text-2xl">📚</span>
          </div>
          <div className="text-3xl font-bold text-purple-900">{summary.unique_acts}</div>
          <p className="text-xs text-purple-600 mt-2 font-medium">Applicable acts</p>
        </div>
      </div>

      <div className="mt-6 p-5 bg-white/70 rounded-xl border border-orange-200">
        <p className="text-sm text-orange-900 font-semibold flex items-start gap-3">
          <span className="text-lg shrink-0">ℹ️</span>
          <span>These risk patterns have been cross-referenced with Sri Lankan case law and legislation. Review the sections below for detailed analysis and recommendations.</span>
        </p>
      </div>
    </div>
  );
}
