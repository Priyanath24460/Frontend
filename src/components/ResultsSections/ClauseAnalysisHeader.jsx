export default function ClauseAnalysisHeader({ summary }) {
  return (
    <div className="mt-12 pt-8 border-t-2 border-stone-300">
      <div className="mb-8 bg-linear-to-r from-amber-50 via-orange-50 to-red-50 rounded-2xl p-8 border-2 border-amber-300 shadow-lg">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-linear-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              📋
            </div>
            <div>
              <h2 className="text-3xl font-bold text-stone-900 tracking-tight">Detailed Clause Analysis</h2>
              <p className="text-amber-800 font-medium text-sm mt-2">Comprehensive breakdown of each clause with identified patterns</p>
            </div>
          </div>
          <span className="bg-linear-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full font-bold shadow-lg text-lg whitespace-nowrap">
            {summary.total_clauses} Clauses
          </span>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/70 rounded-lg p-4 border border-orange-200">
            <div className="text-sm text-orange-700 font-semibold">With Patterns</div>
            <div className="text-2xl font-bold text-orange-900 mt-1">{summary.clauses_with_patterns || 0}</div>
          </div>
          <div className="bg-white/70 rounded-lg p-4 border border-amber-200">
            <div className="text-sm text-amber-700 font-semibold">Total Patterns</div>
            <div className="text-2xl font-bold text-amber-900 mt-1">{summary.total_patterns_detected || 0}</div>
          </div>
          <div className="bg-white/70 rounded-lg p-4 border border-red-200">
            <div className="text-sm text-red-700 font-semibold">Coverage</div>
            <div className="text-2xl font-bold text-red-900 mt-1">{summary.total_clauses > 0 ? Math.round((summary.clauses_with_patterns / summary.total_clauses) * 100) : 0}%</div>
          </div>
        </div>
      </div>
      <p className="text-gray-600 mb-8 text-base font-medium flex items-center gap-2">
        <span>💡</span>
        Click any clause to expand. Clauses with detected risk patterns are auto-expanded.
      </p>
    </div>
  );
}
