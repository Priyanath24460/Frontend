import React, { useState } from 'react';
import Header from '../components/Header';
import QuestionForm from '../components/QuestionForm';
import ResultDisplay from '../components/ResultDisplay';

const Search = () => {
  const [result, setResult] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-stone-800 mb-4">Search Legal Cases</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ask questions about legal cases and documents. Our AI-powered search will find relevant information and provide detailed answers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Search Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h2 className="text-2xl font-semibold text-stone-800 mb-4">Ask a Question</h2>
                <p className="text-gray-600 mb-6">
                  Enter your legal question or query below. The system will search through uploaded documents to find relevant information.
                </p>
                <QuestionForm onAsk={setResult} />
                
                <div className="mt-6 p-4 bg-stone-50 border border-stone-200 rounded-lg">
                  <h4 className="font-semibold text-stone-800 mb-2">Search Tips:</h4>
                  <ul className="text-sm text-stone-700 space-y-1">
                    <li>• Be specific about legal concepts</li>
                    <li>• Include relevant case names if known</li>
                    <li>• Ask about specific legal precedents</li>
                    <li>• Use legal terminology for better results</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Results Section */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-stone-800 mb-4">Search Results</h2>
                {!result ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-stone-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg">Enter a question to search for legal cases and documents</p>
                  </div>
                ) : (
                  <ResultDisplay result={result} />
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-stone-800 mb-3">Case Law Search</h3>
              <p className="text-gray-600 text-sm">
                Search through uploaded case law documents and legal precedents
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-stone-800 mb-3">Semantic Understanding</h3>
              <p className="text-gray-600 text-sm">
                AI-powered search that understands legal context and terminology
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-stone-800 mb-3">Detailed Results</h3>
              <p className="text-gray-600 text-sm">
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