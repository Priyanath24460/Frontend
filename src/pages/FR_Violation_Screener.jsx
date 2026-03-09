import React, { useState } from 'react';
import Header from '../components/Header';
import { AnalysisAPI } from '../config/api.js';

export default function FR_Violation_Screener() {
  const [scenario, setScenario] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScreening = async (e) => {
    e.preventDefault();
    if (!scenario.trim()) {
      setError('Please enter a scenario or situation');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const data = await AnalysisAPI.screenScenario(scenario);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to screen scenario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Header - Centered */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full mb-6 shadow-xl">
              <svg className="w-10 h-10 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-stone-800 mb-4">Fundamental Rights Violation Screener</h1>
            <div className="w-32 h-1 bg-gradient-to-r from-amber-600 to-orange-500 mx-auto mb-4"></div>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6">
              Describe a situation or scenario you're facing, and we'll screen it for potential violations of your Fundamental Rights under the Sri Lankan Constitution.
            </p>
            
            {/* Step-by-step guide */}
            <div className="flex flex-wrap justify-center items-center gap-4 max-w-4xl mx-auto mt-8">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">1</div>
                <span className="ml-2 text-sm font-medium text-gray-700">Describe your situation</span>
              </div>
              <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">2</div>
                <span className="ml-2 text-sm font-medium text-gray-700">AI screens for violations</span>
              </div>
              <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">3</div>
                <span className="ml-2 text-sm font-medium text-gray-700">Get actionable guidance</span>
              </div>
            </div>
          </div>

          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
            {/* LEFT COLUMN - Scenario Input Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 sticky top-24 border-t-4 border-amber-500">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-stone-800">Describe Your Situation</h2>
                    <p className="text-xs text-gray-500 mt-1">Be specific for better results</p>
                  </div>
                </div>
                
                <form onSubmit={handleScreening} className="space-y-4">
                  <textarea
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    placeholder="Enter details about the situation or scenario you're concerned about. Include dates, people involved, and what happened..."
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-amber-400 focus:outline-none resize-none text-gray-700 leading-relaxed h-40"
                  />
                  <p className="text-xs text-gray-500">Include dates, people involved, and what happened</p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full group relative bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-amber-400/40 hover:scale-105"
                  >
                    <span className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Screening...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Screen for Violations
                        </>
                      )}
                    </span>
                  </button>
                </form>

                {error && (
                  <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-700 font-medium text-sm">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN - Results */}
            <div className="lg:col-span-3 space-y-6">
              {result ? (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border-t-4 border-amber-500">
                    <h2 className="text-3xl font-bold text-stone-800 mb-6">Screening Results</h2>

                    {result.violations && Array.isArray(result.violations) && result.violations.length > 0 ? (
                      <div className="space-y-4">
                        {result.violations.map((violation, i) => (
                          <div
                            key={i}
                            className={`rounded-2xl overflow-hidden ${
                              violation.status === 'Violation Detected'
                                ? 'border-2 border-red-200 bg-red-50'
                                : 'border-2 border-green-200 bg-green-50'
                            }`}
                          >
                            <div className={`px-6 py-4 ${
                              violation.status === 'Violation Detected'
                                ? 'bg-gradient-to-r from-red-500 to-red-600'
                                : 'bg-gradient-to-r from-green-500 to-green-600'
                            } text-white`}>
                              <div className="flex items-center gap-2">
                                {violation.status === 'Violation Detected' ? (
                                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                  </svg>
                                ) : (
                                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                  </svg>
                                )}
                                <span className="font-bold text-lg">{violation.status}</span>
                              </div>
                            </div>

                            <div className="px-6 py-6 space-y-5">
                              {/* Article */}
                              {violation.article && (
                                <div>
                                  <div className="text-sm font-bold text-stone-600 uppercase tracking-wide mb-2">
                                    Article / Section
                                  </div>
                                  <div className="bg-stone-100 px-4 py-3 rounded-lg text-stone-800 font-semibold border-l-4 border-amber-400">
                                    {violation.article}
                                  </div>
                                </div>
                              )}

                              {/* Explanation */}
                              {violation.explanation && (
                                <div>
                                  <div className="text-sm font-bold text-stone-600 uppercase tracking-wide mb-2">
                                    Explanation
                                  </div>
                                  <p className="text-gray-700 leading-relaxed bg-white px-4 py-3 rounded-lg border border-stone-200">
                                    {violation.explanation}
                                  </p>
                                </div>
                              )}

                              {/* Guidance */}
                              {violation.guidance && (
                                <div>
                                  <div className="text-sm font-bold text-stone-600 uppercase tracking-wide mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Guidance
                                  </div>
                                  <div className="bg-amber-50 px-4 py-3 rounded-lg text-gray-800 leading-relaxed border-l-4 border-amber-400">
                                    {violation.guidance}
                                  </div>
                                </div>
                              )}

                              {/* Confidence */}
                              {violation.confidence && (
                                <div className="pt-2 border-t border-stone-200">
                                  <div className="text-sm text-gray-600">
                                    <span className="font-semibold">Confidence Level:</span>{' '}
                                    <span className="font-bold text-amber-600">{(violation.confidence * 100).toFixed(0)}%</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {/* Summary Card *
                  {result.summary && (
                    <div className="bg-gradient-to-br from-stone-50 to-amber-50 rounded-2xl shadow-lg p-6 lg:p-8 border-t-4 border-amber-500">
                      <h3 className="text-2xl font-bold text-stone-800 mb-6">Summary</h3>
                      
                      <div className="space-y-4">
                        {result.summary.total_violations !== undefined && (
                          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-200">
                            <span className="text-gray-700 font-semibold">Total Violations</span>
                            <span className="text-2xl font-bold text-amber-600">{result.summary.total_violations}</span>
                          </div>
                        )}

                        {result.summary.risk_level && (
                          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-200">
                            <span className="text-gray-700 font-semibold">Risk Level</span>
                            <span className={`px-4 py-2 rounded-lg font-bold ${
                              result.summary.risk_level === 'High'
                                ? 'bg-red-100 text-red-700'
                                : result.summary.risk_level === 'Medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {result.summary.risk_level}
                            </span>
                          </div>
                        )}

                        {result.summary.recommendations && Array.isArray(result.summary.recommendations) && (
                          <div className="p-4 bg-white rounded-xl border border-stone-200">
                            <div className="font-semibold text-gray-800 mb-3">Recommendations</div>
                            <ul className="space-y-2">
                              {result.summary.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex gap-3 text-gray-700">
                                  <span className="text-amber-500 font-bold">→</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Relevant Past Cases Section */}
                  {result.relevant_cases && Array.isArray(result.relevant_cases) && result.relevant_cases.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border-t-4 border-blue-500">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mr-4 shadow-md">
                          <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-stone-800">Relevant Past Cases</h3>
                          <p className="text-xs text-gray-500 mt-1">How similar situations were decided by courts</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {result.relevant_cases.map((caseItem, idx) => (
                          <div key={idx} className="border-2 border-blue-100 rounded-xl p-5 hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-white">
                            {/* Case Name */}
                            {caseItem.case_name && (
                              <div className="mb-4">
                                <h4 className="text-lg font-bold text-blue-900">
                                  Case {idx + 1}: {caseItem.case_name}
                                </h4>
                              </div>
                            )}

                            {/* What Happened */}
                            {caseItem.what_happened && (
                              <div className="mb-4">
                                <div className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-2">What Happened</div>
                                <p className="text-gray-700 text-sm leading-relaxed bg-white px-3 py-2 rounded border border-blue-100">
                                  {caseItem.what_happened}
                                </p>
                              </div>
                            )}

                            {/* Court Decision */}
                            {caseItem.court_decision && (
                              <div className="mb-4">
                                <div className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-2">Court Decision</div>
                                <div className="bg-blue-100 px-3 py-2 rounded border-l-4 border-blue-600 text-gray-800 text-sm font-semibold">
                                  {caseItem.court_decision}
                                </div>
                              </div>
                            )}

                            {/* Relevance to Your Scenario */}
                            {caseItem.relevance && (
                              <div>
                                <div className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                  Relevance to Your Scenario
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed bg-amber-50 px-3 py-2 rounded border border-amber-200">
                                  {caseItem.relevance}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl p-12 lg:p-16 border-t-4 border-amber-500 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full mb-6">
                    <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-stone-800 mb-3">No Results Yet</h3>
                  <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
                    Describe your situation in the form on the left to screen for potential Fundamental Rights violations.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
