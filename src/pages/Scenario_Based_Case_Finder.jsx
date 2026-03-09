import React, { useState } from 'react';
import Header from '../components/Header';
import QuestionForm from '../components/QuestionForm';
import ResultDisplay from '../components/ResultDisplay';

const Search = () => {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");

  const exampleQueries = [
    "What are the legal precedents for property disputes in Sri Lanka?",
    "Explain the doctrine of precedent in Sri Lankan law",
    "What are the requirements for a valid contract?",
    "Cases related to fundamental rights violations"
  ];

  const handleExampleClick = (query) => {
    setSelectedQuery(query);
    // Trigger form submission after setting the query
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full mb-6 shadow-xl">
              <svg className="w-10 h-10 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-stone-800 mb-4">Scenario-Based Case Finder</h1>
            <div className="w-32 h-1 bg-gradient-to-r from-amber-600 to-orange-500 mx-auto mb-4"></div>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6">
              Describe your legal issue in plain language and find relevant past cases from the New Law Reports database. 
              Our AI understands your situation and matches it with similar precedent cases, helping you understand how 
              courts have handled similar issues.
            </p>
            
            {/* Step-by-step guide */}
            <div className="flex flex-wrap justify-center items-center gap-4 max-w-4xl mx-auto mt-8">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">1</div>
                <span className="ml-2 text-sm font-medium text-gray-700">Enter your question</span>
              </div>
              <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">2</div>
                <span className="ml-2 text-sm font-medium text-gray-700">AI searches case law</span>
              </div>
              <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">3</div>
                <span className="ml-2 text-sm font-medium text-gray-700">Get detailed answers</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Search Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 sticky top-24 border-t-4 border-amber-500">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-stone-800">Ask a Question</h2>
                    <p className="text-xs text-gray-500 mt-1">Be specific for better results</p>
                  </div>
                </div>
                
                <QuestionForm 
                  onAsk={setResult} 
                  setIsLoading={setIsLoading} 
                  setError={setError}
                  selectedQuery={selectedQuery}
                  setSelectedQuery={setSelectedQuery}
                  setLastQuestion={setLastQuestion}
                />
                
                {/* Example Queries Section */}
                <div className="mt-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Try These Examples:
                  </h4>
                  <div className="space-y-2">
                    {exampleQueries.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => handleExampleClick(query)}
                        className="w-full text-left p-3 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 rounded-lg border border-amber-200 hover:border-amber-300 transition-all duration-200 group"
                      >
                        <div className="flex items-start">
                          <svg className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                          <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">{query}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6 p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-xl">
                  <h4 className="font-bold text-amber-900 mb-3 flex items-center text-sm">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Search Tips:
                  </h4>
                  <ul className="text-xs text-amber-800 space-y-2 font-medium">
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2.5 mt-1.5 flex-shrink-0"></span>
                      <span>Be specific about legal concepts or areas of law</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2.5 mt-1.5 flex-shrink-0"></span>
                      <span>Include relevant case names if you know them</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2.5 mt-1.5 flex-shrink-0"></span>
                      <span>Ask about specific legal precedents or principles</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2.5 mt-1.5 flex-shrink-0"></span>
                      <span>Use legal terminology for more accurate results</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Results Section */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-xl border-t-4 border-orange-500">
                {/* Error, Loading, and Empty States */}
                {(error || isLoading || !result) && (
                  <div className="p-6 lg:p-8">
                    {/* Error State */}
                    {error && (
                      <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                        <div className="flex items-start">
                          <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <h3 className="text-red-800 font-semibold mb-1">Search Failed</h3>
                            <p className="text-red-700 text-sm">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                      <div className="text-center py-16">
                        <div className="relative w-24 h-24 mx-auto mb-6">
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full animate-ping opacity-75"></div>
                          <div className="relative w-24 h-24 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-12 h-12 text-amber-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Searching Case Law...</h3>
                        <p className="text-gray-600 mb-4">Our AI is analyzing legal documents to find the best answer</p>
                        <div className="max-w-md mx-auto">
                          <div className="flex justify-between text-xs text-gray-500 mb-2">
                            <span>Processing query</span>
                            <span>Please wait...</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {!result && !isLoading && (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to Search</h3>
                        <p className="text-gray-600 mb-6">Enter a question on the left to search for legal cases and documents</p>
                        
                        {/* What to expect section */}
                        <div className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                          <h4 className="font-bold text-blue-900 mb-3 flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            What You'll Get:
                          </h4>
                          <ul className="text-sm text-blue-800 space-y-2 text-left">
                            <li className="flex items-start">
                              <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Direct answers based on case law</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Relevant case citations and references</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Detailed legal explanations</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Supporting reference sections</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Results Display */}
                {result && !isLoading && (
                  <ResultDisplay result={result} userQuestion={lastQuestion} />
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-amber-100">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center mb-5 shadow-md">
                <svg className="w-7 h-7 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-stone-800 mb-3">Case Law Search</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Search through uploaded case law documents and legal precedents
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-orange-100">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mb-5 shadow-md">
                <svg className="w-7 h-7 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-stone-800 mb-3">Semantic Understanding</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                AI-powered search that understands legal context and terminology
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-yellow-100">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center mb-5 shadow-md">
                <svg className="w-7 h-7 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-stone-800 mb-3">Detailed Results</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Get comprehensive answers with relevant case citations and references
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Search;