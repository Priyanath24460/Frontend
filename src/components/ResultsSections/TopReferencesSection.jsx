export default function TopReferencesSection({ topCases, topActs }) {
  return (
    <>
      {/* Top Cases */}
      {topCases?.length > 0 && (
        <div id="top-cases" className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg border-2 border-blue-300 overflow-hidden">
          <details className="group">
            <summary className="cursor-pointer px-8 py-6 bg-linear-to-r from-blue-600 to-cyan-600 font-bold text-white text-lg flex items-center gap-3 hover:shadow-lg transition-all">
              <span className="text-2xl group-open:rotate-180 transition-transform">📚</span>
              <div className="text-left flex-1">
                <div>Top {Math.min(topCases.length, 10)} Most Relevant Cases</div>
                <div className="text-xs text-blue-100 font-medium mt-1">Across all clauses in your contract</div>
              </div>
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">{topCases.slice(0, 10).length} cases</span>
            </summary>
            <div className="px-8 py-6 bg-white/50 space-y-3">
              {topCases.slice(0, 10).map((c, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-lg border-2 border-blue-200 hover:shadow-md hover:border-blue-400 transition-all">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-blue-900 text-sm leading-tight">{c.case_name}</p>
                    <p className="text-xs text-stone-500 mt-1">{c.year} • {c.category}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="bg-linear-to-r from-blue-600 to-cyan-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {((c.similarity || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Top Acts */}
      {topActs?.length > 0 && (
        <div id="top-acts" className="bg-linear-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg border-2 border-purple-300 overflow-hidden">
          <details className="group">
            <summary className="cursor-pointer px-8 py-6 bg-linear-to-r from-purple-600 to-pink-600 font-bold text-white text-lg flex items-center gap-3 hover:shadow-lg transition-all">
              <span className="text-2xl group-open:rotate-180 transition-transform">📖</span>
              <div className="text-left flex-1">
                <div>Top {Math.min(topActs.length, 10)} Most Relevant Acts</div>
                <div className="text-xs text-purple-100 font-medium mt-1">Applicable Sri Lankan legislation</div>
              </div>
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">{topActs.slice(0, 10).length} acts</span>
            </summary>
            <div className="px-8 py-6 bg-white/50 space-y-3">
              {topActs.slice(0, 10).map((act, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-lg border-2 border-purple-200 hover:shadow-md hover:border-purple-400 transition-all">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-600 text-white rounded-full font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-purple-900 text-sm leading-tight">{act.act_name} {act.year ? `(${act.year})` : ''}</p>
                    <p className="text-xs text-stone-600 mt-1">📌 Section {act.section_number} — {act.section_heading}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="bg-linear-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {((act.similarity_score || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </>
  );
}
