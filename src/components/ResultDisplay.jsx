import { ExclamationTriangleIcon, BookmarkIcon } from '@heroicons/react/24/outline';

// Helper function to parse and render enhanced markdown-like content
const parseEnhancedContent = (content) => {
  if (!content) return <p>No content available.</p>;

  const lines = content.split('\n');
  const elements = [];
  let currentIndex = 0;

  const processLine = (line, index) => {
    const trimmedLine = line.trim();
    
    // Main headings (# )
    if (trimmedLine.startsWith('# ')) {
      return (
        <h1 key={index} className="text-3xl font-bold text-blue-800 mb-6 mt-8 border-b-2 border-blue-200 pb-2">
          {trimmedLine.substring(2)}
        </h1>
      );
    }
    
    // Subheadings (## )
    if (trimmedLine.startsWith('## ')) {
      return (
        <h2 key={index} className="text-2xl font-semibold text-blue-700 mb-4 mt-6">
          {trimmedLine.substring(3)}
        </h2>
      );
    }
    
    // Section dividers (---)
    if (trimmedLine === '---') {
      return <hr key={index} className="my-6 border-gray-300" />;
    }
    
    // Bold subsection headers (**text:**)
    if (trimmedLine.startsWith('**') && trimmedLine.endsWith(':**')) {
      return (
        <h4 key={index} className="text-lg font-semibold text-gray-800 mb-3 mt-4">
          {trimmedLine.slice(2, -3)}:
        </h4>
      );
    }
    
    // Bold text (**text**)
    if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
      return (
        <p key={index} className="font-semibold text-gray-800 mb-2">
          {trimmedLine.slice(2, -2)}
        </p>
      );
    }
    
    // Bullet points (- )
    if (trimmedLine.startsWith('- ')) {
      return (
        <li key={index} className="text-gray-700 mb-2 ml-4">
          {trimmedLine.substring(2)}
        </li>
      );
    }
    
    // Warning/note sections
    if (trimmedLine.includes('⚠️') || trimmedLine.toLowerCase().includes('warning') || trimmedLine.toLowerCase().includes('note:')) {
      return (
        <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 flex items-start gap-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-800">{trimmedLine.replace('⚠️', '').trim()}</p>
        </div>
      );
    }
    
    // Disclaimer sections
    if (trimmedLine.includes('📌') || trimmedLine.toLowerCase().includes('disclaimer') || trimmedLine.toLowerCase().includes('note:')) {
      return (
        <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-start gap-3">
          <BookmarkIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm">{trimmedLine.replace('📌', '').trim()}</p>
        </div>
      );
    }
    
    // Empty lines
    if (!trimmedLine) {
      return <div key={index} className="mb-2"></div>;
    }
    
    // Regular paragraphs
    return (
      <p key={index} className="text-gray-700 mb-3 leading-relaxed">
        {trimmedLine}
      </p>
    );
  };

  return (
    <div className="prose prose-lg max-w-none">
      {lines.map((line, index) => processLine(line, index))}
    </div>
  );
};

export default function ResultDisplay({ result }) {
  if (!result) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Case Information Header */}
      {result.selectedCase && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-blue-800">Case Information</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Case Title</p>
              <p className="font-semibold text-gray-800">{result.selectedCase.title}</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Year</p>
              <p className="font-semibold text-gray-800">{result.selectedCase.year}</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Court</p>
              <p className="font-semibold text-gray-800">{result.selectedCase.court}</p>
            </div>
            {result.selectedCase.citation && (
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Citation</p>
                <p className="font-semibold text-gray-800">{result.selectedCase.citation}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legal Explanation Section */}
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-orange-100 rounded-full p-2 mr-3">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Direct Answer Based on Case Law</h2>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
            {parseEnhancedContent(result.summary)}
          </div>
        </div>

        {/* Reference Sections - Collapsible */}
        {result.topSections && result.topSections.length > 0 && (
          <details className="mt-8">
            <summary className="cursor-pointer text-lg font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Reference Sections ({result.topSections.length})
            </summary>
            <div className="mt-4 space-y-3">
              {result.topSections.slice(0, 5).map((sec, index) => (
                <div key={sec.sectionId || index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-300">
                  <div className="flex items-center mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full mr-2">
                      Section {index + 1}
                    </span>
                    {sec.score && (
                      <span className="text-xs text-gray-500">
                        Relevance: {(sec.score * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {sec.text.substring(0, 200)}
                    {sec.text.length > 200 && <span className="text-gray-500">...</span>}
                  </p>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
