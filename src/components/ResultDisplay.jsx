import { ExclamationTriangleIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';

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
    
    // Warning/note sections (⚠️)
    if (trimmedLine.includes('⚠️')) {
      return (
        <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="text-yellow-800">{trimmedLine}</p>
        </div>
      );
    }
    
    // Disclaimer sections (📌)
    if (trimmedLine.includes('📌')) {
      return (
        <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-blue-800 text-sm">{trimmedLine}</p>
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

export default function ResultDisplay({ result, userQuestion }) {
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  
  if (!result) return null;

  // Check if we have multiple cases
  const allCases = result.allCases || [];
  const hasMultipleCases = allCases.length > 1;
  const currentCase = allCases[selectedCaseIndex] || {};
  const currentCaseInfo = currentCase.caseInfo || result.selectedCase;
  const currentSummary = currentCase.summary || result.summary;
  const currentSections = currentCase.relevantSections || result.topSections || [];

  // Function to generate downloadable report
  const downloadReport = () => {
    const generateReport = () => {
      const date = new Date().toLocaleString();
      let report = `═══════════════════════════════════════════════════════════════════════
LEGAL CASE SEARCH REPORT
Generated: ${date}
═══════════════════════════════════════════════════════════════════════

`;

      // Add user question
      if (userQuestion) {
        report += `📋 YOUR QUESTION:\n${userQuestion}\n\n`;
        report += `${'═'.repeat(75)}\n\n`;
      }

      // Add all cases
      allCases.forEach((caseItem, index) => {
        const caseInfo = caseItem.caseInfo;
        const summary = caseItem.summary;
        const sections = caseItem.relevantSections || [];
        
        report += `\n${'█'.repeat(75)}\n`;
        report += `CASE #${index + 1} ${index === 0 ? '(BEST MATCH)' : index === 1 ? '(2ND BEST MATCH)' : '(3RD BEST MATCH)'}\n`;
        report += `${'█'.repeat(75)}\n\n`;

        // Case metadata
        report += `📖 CASE INFORMATION:\n`;
        report += `${'─'.repeat(75)}\n`;
        report += `Title:       ${caseInfo?.title || 'N/A'}\n`;
        report += `Court:       ${caseInfo?.court || 'N/A'}\n`;
        report += `Year:        ${caseInfo?.year || 'N/A'}\n`;
        if (caseInfo?.citation) {
          report += `Citation:    ${caseInfo.citation}\n`;
        }
        if (caseInfo?.caseNumber) {
          report += `Case Number: ${caseInfo.caseNumber}\n`;
        }
        if (caseInfo?.caseType) {
          report += `Case Type:   ${caseInfo.caseType}\n`;
        }
        if (caseInfo?.judges && Array.isArray(caseInfo.judges)) {
          report += `Judges:      ${caseInfo.judges.join(', ')}\n`;
        }
        report += `${'─'.repeat(75)}\n\n`;

        // Legal analysis
        report += `⚖️  LEGAL ANALYSIS:\n`;
        report += `${'─'.repeat(75)}\n`;
        if (summary) {
          // Clean up the summary text
          const cleanSummary = summary
            .replace(/\*\*/g, '')
            .replace(/🎯|✅|📖|💡|⚠️|📌/g, '')
            .trim();
          report += `${cleanSummary}\n`;
        } else {
          report += `No summary available.\n`;
        }
        report += `${'─'.repeat(75)}\n\n`;
      });

      // Footer
      report += `\n${'═'.repeat(75)}\n`;
      report += `END OF REPORT\n`;
      report += `Generated by LawKnow - Legal Case Search System\n`;
      report += `${'═'.repeat(75)}\n`;

      return report;
    };

    // Generate and download
    const reportContent = generateReport();
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    link.download = `LawKnow_Case_Report_${timestamp}.txt`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Function to download as PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add text and handle page breaks
    const addText = (text, fontSize = 10, isBold = false, isTitle = false) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont(undefined, 'bold');
      } else {
        doc.setFont(undefined, 'normal');
      }

      if (isTitle) {
        doc.setTextColor(0, 51, 102); // Dark blue for titles
      } else {
        doc.setTextColor(0, 0, 0); // Black for normal text
      }

      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach(line => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += fontSize * 0.5;
      });

      yPosition += 3;
    };

    const addLine = () => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = margin;
      }
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;
    };

    // Title
    doc.setFillColor(0, 51, 102);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('LEGAL CASE SEARCH REPORT', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: 'center' });

    yPosition = 50;

    // User question
    if (userQuestion) {
      addText('YOUR QUESTION:', 14, true, true);
      yPosition += 2;
      addText(userQuestion, 11, false);
      yPosition += 5;
      addLine();
      yPosition += 5;
    }

    // Add all cases
    allCases.forEach((caseItem, index) => {
      const caseInfo = caseItem.caseInfo;
      const summary = caseItem.summary;

      // Case header with colored background
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = margin;
      }

      const rankColors = [
        [251, 191, 36],  // Amber for #1 (Best Match)
        [249, 115, 22],  // Orange for #2
        [217, 119, 6]    // Dark amber for #3
      ];
      
      doc.setFillColor(...rankColors[index]);
      doc.rect(margin, yPosition - 5, maxWidth, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      const rankText = `CASE #${index + 1} ${index === 0 ? '(BEST MATCH)' : index === 1 ? '(2ND BEST MATCH)' : '(3RD BEST MATCH)'}`;
      doc.text(rankText, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Case information
      addText('CASE INFORMATION', 12, true, true);
      yPosition += 2;
      addLine();
      
      addText(`Title: ${caseInfo?.title || 'N/A'}`, 10, true);
      addText(`Court: ${caseInfo?.court || 'N/A'}`, 10);
      addText(`Year: ${caseInfo?.year || 'N/A'}`, 10);
      
      if (caseInfo?.citation) {
        addText(`Citation: ${caseInfo.citation}`, 10);
      }
      if (caseInfo?.caseNumber) {
        addText(`Case Number: ${caseInfo.caseNumber}`, 10);
      }
      if (caseInfo?.caseType) {
        addText(`Case Type: ${caseInfo.caseType}`, 10);
      }
      if (caseInfo?.judges && Array.isArray(caseInfo.judges)) {
        addText(`Judges: ${caseInfo.judges.join(', ')}`, 10);
      }

      yPosition += 5;
      addLine();
      yPosition += 5;

      // Legal analysis
      addText('LEGAL ANALYSIS', 12, true, true);
      yPosition += 2;
      addLine();
      
      if (summary) {
        const cleanSummary = summary
          .replace(/\*\*/g, '')
          .replace(/🎯|✅|📖|💡|⚠️|📌/g, '')
          .replace(/─+/g, '')
          .trim();
        addText(cleanSummary, 10, false);
      } else {
        addText('No summary available.', 10);
      }

      yPosition += 10;
    });

    // Footer on last page
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(
        'Generated by LawKnow - Legal Case Search System',
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      );
    }

    // Save PDF
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    doc.save(`LawKnow_Case_Report_${timestamp}.pdf`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
      {/* Search Results Header with Download Buttons */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-b-2 border-amber-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 rounded-lg p-2">
              <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Search Results</h3>
              <p className="text-xs text-gray-600">Analysis complete</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={downloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download TXT
            </button>
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-stone-700 to-stone-800 hover:from-stone-800 hover:to-stone-900 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Multiple Cases Tabs */}
      {hasMultipleCases && (
        <div className="bg-white border-b-2 border-gray-200 px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 rounded-lg p-2 shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-amber-900">Top {allCases.length} Matching Cases</h3>
                <p className="text-xs text-amber-700 mt-0.5">Click any case below to view its details</p>
              </div>
            </div>
            <span className="text-sm text-amber-800 font-semibold bg-amber-100 px-4 py-2 rounded-full shadow-sm">
              Viewing Case {selectedCaseIndex + 1} of {allCases.length}
            </span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-amber-400 scrollbar-track-amber-100">
            {allCases.map((caseItem, index) => (
              <button
                key={caseItem.caseInfo?.caseId || index}
                onClick={() => setSelectedCaseIndex(index)}
                className={`shrink-0 px-6 py-5 rounded-2xl transition-all duration-300 min-w-[320px] max-w-[380px] text-left border-[3px] ${
                  selectedCaseIndex === index
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-2xl border-amber-600'
                    : 'bg-white text-gray-700 hover:bg-amber-50 hover:shadow-lg border-amber-400 hover:border-amber-500'
                }`}
              >
                <div className="flex flex-col gap-3">
                  {/* Badge and Title Section */}
                  <div className="flex items-start gap-3">
                    <div className={`shrink-0 flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg shadow-md ${
                      selectedCaseIndex === index ? 'bg-white text-amber-600' : 'bg-amber-500 text-white'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold leading-snug mb-2 break-words ${
                        selectedCaseIndex === index ? 'text-white text-sm' : 'text-gray-900 text-sm'
                      }`} style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>
                        {caseItem.caseInfo?.title || 'Untitled Case'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Metadata Section */}
                  <div className="flex flex-col gap-2">
                    <div className={`flex items-center gap-2 text-xs font-medium ${
                      selectedCaseIndex === index ? 'text-amber-50' : 'text-gray-700'
                    }`}>
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{caseItem.caseInfo?.year || 'N/A'}</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-medium ${
                      selectedCaseIndex === index ? 'text-amber-50' : 'text-gray-700'
                    }`}>
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                      </svg>
                      <span className="break-words">{caseItem.caseInfo?.court || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Case Information Header */}
      {currentCaseInfo && (
        <div className="bg-white border-b-2 border-gray-200 px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-2 shadow-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-amber-950">
                  {hasMultipleCases ? `Case #${selectedCaseIndex + 1} Details` : 'Case Information'}
                </h3>
                <p className="text-xs text-amber-700 mt-1">Complete case details and metadata</p>
              </div>
            </div>
            {hasMultipleCases && (
              <div className="flex items-center gap-2">
                {selectedCaseIndex === 0 && (
                  <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Best Match
                  </span>
                )}
                {selectedCaseIndex === 1 && (
                  <span className="bg-gradient-to-r from-orange-400 to-red-400 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                    </svg>
                    2nd Best Match
                  </span>
                )}
                {selectedCaseIndex === 2 && (
                  <span className="bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    3rd Best Match
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-amber-500 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Case Title</p>
              </div>
              <p className="font-bold text-base text-gray-900 leading-snug">{currentCaseInfo.title}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Year</p>
              </div>
              <p className="font-bold text-lg text-gray-900">{currentCaseInfo.year}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-amber-600 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Court</p>
              </div>
              <p className="font-bold text-base text-gray-900 leading-snug">{currentCaseInfo.court}</p>
            </div>
            {currentCaseInfo.citation && (
              <div className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-orange-600 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  <p className="text-xs font-semibold text-orange-800 uppercase tracking-wide">Citation</p>
                </div>
                <p className="font-bold text-base text-gray-900 leading-snug">{currentCaseInfo.citation}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legal Explanation Section */}
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-gradient-to-br from-orange-400 to-red-400 rounded-2xl p-2 shadow-xl">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-amber-950">Direct Answer Based on Case Law</h2>
              <p className="text-xs text-amber-700 mt-1">Legal analysis derived from relevant precedents</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-white rounded-2xl p-6 border-2 border-amber-200 shadow-lg">
            <div className="prose prose-base max-w-none text-gray-800 leading-relaxed text-sm">
              {parseEnhancedContent(currentSummary)}
            </div>
          </div>
        </div>

        {/* Reference Sections - Collapsible */}
        {currentSections && currentSections.length > 0 && (
          <details className="mt-10 bg-white rounded-2xl shadow-lg border-2 border-amber-100 overflow-hidden">
            <summary className="cursor-pointer p-6 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-all duration-200 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-2 shadow-md group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div>
                  <span className="text-lg font-bold text-amber-950">Reference Sections</span>
                  <span className="ml-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">{currentSections.length} sections</span>
                </div>
              </div>
              <svg className="w-5 h-5 text-amber-600 group-hover:scale-125 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="p-6 space-y-4 bg-gradient-to-br from-white to-amber-50">
              {currentSections.slice(0, 5).map((sec, index) => (
                <div key={sec.sectionId || index} className="bg-white p-4 rounded-xl border-l-4 border-amber-400 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                      Section {index + 1}
                    </span>
                    {sec.score && (
                      <div className="flex items-center gap-1 bg-orange-100 px-3 py-1.5 rounded-full">
                        <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        <span className="text-xs font-semibold text-orange-800">
                          {(sec.score * 100).toFixed(1)}% match
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-800 leading-relaxed text-sm">
                    {sec.text.substring(0, 200)}
                    {sec.text.length > 200 && <span className="text-amber-600 font-semibold text-xs">... (read more)</span>}
                  </p>
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Navigation Buttons for Multiple Cases */}
        {hasMultipleCases && (
          <div className="mt-10 flex justify-between items-center bg-gradient-to-br from-amber-100 via-orange-100 to-amber-50 p-5 rounded-2xl border-2 border-amber-200 shadow-lg">
            <button
              onClick={() => setSelectedCaseIndex(Math.max(0, selectedCaseIndex - 1))}
              disabled={selectedCaseIndex === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-white to-amber-50 text-amber-800 font-bold rounded-xl hover:from-amber-50 hover:to-orange-50 hover:shadow-lg hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 shadow-md border-2 border-amber-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-base">Previous Case</span>
            </button>
            <div className="flex flex-col items-center gap-1">
              <span className="text-base font-bold text-amber-950">
                Case {selectedCaseIndex + 1} of {allCases.length}
              </span>
              <div className="flex gap-2">
                {allCases.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === selectedCaseIndex 
                        ? 'w-8 bg-gradient-to-r from-amber-500 to-orange-500 shadow-md' 
                        : 'w-2 bg-amber-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={() => setSelectedCaseIndex(Math.min(allCases.length - 1, selectedCaseIndex + 1))}
              disabled={selectedCaseIndex === allCases.length - 1}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-50 to-white text-amber-800 font-bold rounded-xl hover:from-orange-50 hover:to-amber-50 hover:shadow-lg hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 shadow-md border-2 border-amber-300"
            >
              <span className="text-base">Next Case</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
