export default function ResultsOverviewNav({ summary, simplifiedClauses, aggregatedResults }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-6 sticky top-24 z-20">
      <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
        <span>📍</span>
        Results Overview
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <a href="#risk-summary" className="p-3 rounded-lg bg-orange-50 border border-orange-300 hover:bg-orange-100 transition-all text-center">
          <div className="text-lg font-bold text-orange-900">{summary.total_patterns_detected || 0}</div>
          <div className="text-xs text-orange-700 font-semibold">Risk Patterns</div>
        </a>
        <a href="#simplified-contract" className="p-3 rounded-lg bg-purple-50 border border-purple-300 hover:bg-purple-100 transition-all text-center">
          <div className="text-lg font-bold text-purple-900">{simplifiedClauses.length || 0}</div>
          <div className="text-xs text-purple-700 font-semibold">Simplified Clauses</div>
        </a>
        <a href="#top-cases" className="p-3 rounded-lg bg-blue-50 border border-blue-300 hover:bg-blue-100 transition-all text-center">
          <div className="text-lg font-bold text-blue-900">{aggregatedResults?.top_cases?.length || 0}</div>
          <div className="text-xs text-blue-700 font-semibold">Case References</div>
        </a>
        <a href="#top-acts" className="p-3 rounded-lg bg-pink-50 border border-pink-300 hover:bg-pink-100 transition-all text-center">
          <div className="text-lg font-bold text-pink-900">{aggregatedResults?.top_acts?.length || 0}</div>
          <div className="text-xs text-pink-700 font-semibold">Act References</div>
        </a>
      </div>
    </div>
  );
}
