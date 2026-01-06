import { useState } from "react";
import API_URL from "../config/api";
import { DocumentTextIcon, PencilSquareIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function UploadWithPreview({ onUpload }) {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: upload, 2: preview, 3: confirm
  const [editableMetadata, setEditableMetadata] = useState({});
  const [loadingMessage, setLoadingMessage] = useState("");
  const [inputMethod, setInputMethod] = useState("file"); // "file" or "text"
  const [pastedText, setPastedText] = useState("");

  const handleFileSelect = (e) => {
    setFile(e.target.files[0]);
    setPreviewData(null);
    setStep(1);
  };

  const handlePreview = async () => {
    if (inputMethod === "file" && !file) return;
    if (inputMethod === "text" && !pastedText.trim()) return;
    
    setLoading(true);
    setLoadingMessage(inputMethod === "file" ? "Uploading and processing document..." : "Processing pasted text...");
    
    try {
      let res, data;
      
      if (inputMethod === "file") {
        const formData = new FormData();
        formData.append("pdf", file);
        
        setLoadingMessage("Extracting text and metadata...");
        res = await fetch(`${API_URL}/api/cases/preview`, {
          method: "POST",
          body: formData,
        });
      } else {
        setLoadingMessage("Analyzing pasted text and extracting metadata...");
        res = await fetch(`${API_URL}/api/cases/preview-text`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: pastedText,
            fileName: "Pasted Text Document"
          }),
        });
      }
      
      data = await res.json();
      
      if (res.ok) {
        setLoadingMessage("Processing complete!");
        setPreviewData(data);
        setEditableMetadata({
          // Backward compatibility
          title: data.title || data.caseName || "Unknown Title",
          court: data.court || "Unknown Court", 
          year: data.year || new Date().getFullYear(),
          // Enhanced metadata
          caseName: data.caseName || data.title || "Unknown Case",
          caseNumber: data.caseNumber || "",
          judgmentDate: data.judgmentDate || "",
          judges: data.judges || [],
          caseType: data.caseType || "Unknown"
        });
        setStep(2);
      } else {
        console.error("Preview failed:", data);
        alert("Preview failed: " + (data.error || data.details || "Unknown error"));
      }
    } catch (error) {
      console.error("Preview error:", error);
      alert("Preview failed: " + error.message);
    }
    setLoading(false);
    setLoadingMessage("");
  };

  const handleMetadataChange = (field, value) => {
    setEditableMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirm = async () => {
    if (!previewData) return;
    
    setLoading(true);
    setLoadingMessage("Saving document to database...");
    
    try {
      const requestBody = {
        previewId: previewData.previewId,
        fileName: previewData.fileName,
        approvedMetadata: editableMetadata
      };

      // Add specific fields based on input method
      if (previewData.isTextInput) {
        requestBody.text = previewData.text;
        requestBody.isTextInput = true;
      } else {
        requestBody.filePath = previewData.filePath;
        requestBody.isTextInput = false;
      }

      const res = await fetch(`${API_URL}/api/cases/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setLoadingMessage("Building search index...");
        setStep(3);
        onUpload(data);
        // Reset form
        setTimeout(() => {
          setFile(null);
          setPastedText("");
          setPreviewData(null);
          setStep(1);
          setEditableMetadata({});
          setLoadingMessage("");
        }, 3000);
      } else {
        console.error("Confirmation failed:", data);
        alert("Confirmation failed: " + (data.error || data.details || "Unknown error"));
      }
    } catch (error) {
      console.error("Confirmation error:", error);
      alert("Confirmation failed: " + error.message);
    }
    setLoading(false);
    setLoadingMessage("");
  };

  const handleCancel = () => {
    setFile(null);
    setPastedText("");
    setPreviewData(null);
    setStep(1);
    setEditableMetadata({});
  };

  const handleInputMethodChange = (method) => {
    setInputMethod(method);
    setFile(null);
    setPastedText("");
    setPreviewData(null);
    setStep(1);
    setEditableMetadata({});
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Add Legal Document</h2>
      
      {/* Step 1: Input Method Selection and Document Input */}
      {step === 1 && (
        <div>
          {/* Input Method Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Input Method
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => handleInputMethodChange("file")}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                  inputMethod === "file"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1 flex justify-center">
                    <DocumentTextIcon className="w-8 h-8" />
                  </div>
                  <div className="font-medium">Upload PDF File</div>
                  <div className="text-sm text-gray-500">Select a PDF document from your computer</div>
                </div>
              </button>
              
              <button
                onClick={() => handleInputMethodChange("text")}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                  inputMethod === "text"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1 flex justify-center">
                    <PencilSquareIcon className="w-8 h-8" />
                  </div>
                  <div className="font-medium">Paste Text</div>
                  <div className="text-sm text-gray-500">Copy and paste case text directly</div>
                </div>
              </button>
            </div>
          </div>

          {/* File Upload Section */}
          {inputMethod === "file" && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select PDF File
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
                />
              </div>
              
              {file && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">
                    Selected: <span className="font-medium">{file.name}</span> ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Text Paste Section */}
          {inputMethod === "text" && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste Case Text
                </label>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste the full text of the legal case here. Include case name, court details, judgment date, judges, and the complete case content..."
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    Characters: {pastedText.length} | Words: {pastedText.trim() ? pastedText.trim().split(/\s+/).length : 0}
                  </p>
                  {pastedText.length > 10000 && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4" />
                      Good length for analysis
                    </p>
                  )}
                </div>
              </div>
              
              {pastedText.trim() && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">
                    Text preview: <span className="font-medium">"{pastedText.substring(0, 100)}..."</span>
                  </p>
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={handlePreview}
            disabled={(inputMethod === "file" && !file) || (inputMethod === "text" && !pastedText.trim()) || loading}
            className="w-full bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
          >
            {loading ? loadingMessage || "Processing..." : "Preview Document"}
          </button>
        </div>
      )}

      {/* Step 2: Preview and Edit */}
      {step === 2 && previewData && (
        <div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-green-600 flex items-center gap-2">
              <DocumentTextIcon className="w-6 h-6" />
              Document Preview
            </h3>
            
            {/* File Info */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-2">Document Information</h4>
              <p><strong>Document:</strong> {previewData.fileName}</p>
              <p><strong>Input Method:</strong> {previewData.isTextInput ? (
                <span className="inline-flex items-center gap-1">
                  <PencilSquareIcon className="w-4 h-4 inline" /> Pasted Text
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <DocumentTextIcon className="w-4 h-4 inline" /> PDF File
                </span>
              )}</p>
              <p><strong>Size:</strong> {
                previewData.isTextInput 
                  ? `${(previewData.fileSize / 1024).toFixed(1)} KB (${previewData.fileSize.toLocaleString()} characters)`
                  : `${(previewData.fileSize / 1024 / 1024).toFixed(2)} MB`
              }</p>
              <p><strong>Sections:</strong> {previewData.totalSections}</p>
            </div>

            {/* Editable Metadata */}
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-3">Comprehensive Case Metadata (Review & Edit)</h4>
              <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-600" /> Auto-extracted |
                <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" /> Needs review |
                <PencilSquareIcon className="w-4 h-4 text-blue-600" /> Please edit if needed
              </p>
              
              {/* Primary metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    Case Name
                    {(editableMetadata.caseName === "Unknown Case" || !editableMetadata.caseName) ? (
                      <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
                    ) : (
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    )}
                  </label>
                  <input
                    type="text"
                    value={editableMetadata.caseName || editableMetadata.title}
                    onChange={(e) => {
                      handleMetadataChange('caseName', e.target.value);
                      handleMetadataChange('title', e.target.value); // Backward compatibility
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      (editableMetadata.caseName === "Unknown Case" || !editableMetadata.caseName)
                        ? "border-orange-300 bg-orange-50" 
                        : "border-green-300 bg-green-50"
                    }`}
                    placeholder="Enter case name (e.g., ANDRIS APPTJ v. SILVA et al.)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    Case Number
                    {!editableMetadata.caseNumber ? (
                      <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
                    ) : (
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    )}
                  </label>
                  <input
                    type="text"
                    value={editableMetadata.caseNumber || ""}
                    onChange={(e) => handleMetadataChange('caseNumber', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !editableMetadata.caseNumber
                        ? "border-orange-300 bg-orange-50" 
                        : "border-green-300 bg-green-50"
                    }`}
                    placeholder="Enter case number (e.g., C. R., GaUe, 3,945)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    Court
                    {editableMetadata.court === "Unknown Court" ? (
                      <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
                    ) : (
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    )}
                  </label>
                  <input
                    type="text"
                    value={editableMetadata.court}
                    onChange={(e) => handleMetadataChange('court', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      editableMetadata.court === "Unknown Court" 
                        ? "border-orange-300 bg-orange-50" 
                        : "border-green-300 bg-green-50"
                    }`}
                    placeholder="Enter court name (e.g., Singapore High Court)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    Judgment Date
                    {!editableMetadata.judgmentDate ? (
                      <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
                    ) : (
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    )}
                  </label>
                  <input
                    type="text"
                    value={editableMetadata.judgmentDate || ""}
                    onChange={(e) => handleMetadataChange('judgmentDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !editableMetadata.judgmentDate
                        ? "border-orange-300 bg-orange-50" 
                        : "border-green-300 bg-green-50"
                    }`}
                    placeholder="Enter judgment date (e.g., 21st September, 1896)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    Year
                    {editableMetadata.year === new Date().getFullYear() ? (
                      <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
                    ) : (
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    )}
                  </label>
                  <input
                    type="number"
                    value={editableMetadata.year}
                    onChange={(e) => handleMetadataChange('year', parseInt(e.target.value) || '')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      editableMetadata.year === new Date().getFullYear() 
                        ? "border-orange-300 bg-orange-50" 
                        : "border-green-300 bg-green-50"
                    }`}
                    placeholder="Enter year"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>
                

                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    Case Type
                    {(!editableMetadata.caseType || editableMetadata.caseType === "Unknown") ? (
                      <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
                    ) : (
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    )}
                  </label>
                  <select
                    value={editableMetadata.caseType || "Unknown"}
                    onChange={(e) => handleMetadataChange('caseType', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      (!editableMetadata.caseType || editableMetadata.caseType === "Unknown")
                        ? "border-orange-300 bg-orange-50" 
                        : "border-green-300 bg-green-50"
                    }`}
                  >
                    <option value="Unknown">Select case type</option>
                    <option value="Civil">Civil</option>
                    <option value="Criminal">Criminal</option>
                    <option value="Appeal">Appeal</option>
                    <option value="Constitutional">Constitutional</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Family">Family</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Labour">Labour</option>
                    <option value="Property">Property</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    Judges
                    {(!editableMetadata.judges || editableMetadata.judges.length === 0) ? (
                      <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
                    ) : (
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    )}
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(editableMetadata.judges) ? editableMetadata.judges.join(', ') : (editableMetadata.judges || "")}
                    onChange={(e) => handleMetadataChange('judges', e.target.value.split(',').map(j => j.trim()).filter(j => j))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      (!editableMetadata.judges || editableMetadata.judges.length === 0)
                        ? "border-orange-300 bg-orange-50" 
                        : "border-green-300 bg-green-50"
                    }`}
                    placeholder="Enter judges (e.g., BONSER, C.J., Smith J.)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple judges with commas</p>
                </div>
              </div>
            </div>

            {/* Content Preview */}
            <div className="bg-yellow-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-2">Content Preview</h4>
              <div className="text-sm text-gray-700 max-h-60 overflow-y-auto border border-gray-200 p-3 rounded bg-white">
                {previewData.fullTextPreview}
              </div>
            </div>

            {/* Section Preview */}
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium mb-2">Sample Sections (First 3)</h4>
              {previewData.sections.map((section, index) => (
                <div key={index} className="mb-3 p-3 bg-white border border-gray-200 rounded">
                  <h5 className="font-medium text-sm text-gray-600 mb-1">Section {index + 1}</h5>
                  <p className="text-sm">{section.text.substring(0, 200)}...</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2"
            >
              {loading ? loadingMessage || "Saving..." : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  Approve & Save
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4 flex justify-center">
            <CheckCircleIcon className="w-24 h-24 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-green-600 mb-2">Document Saved Successfully!</h3>
          <p className="text-gray-600">The document has been processed and added to the database.</p>
          <p className="text-sm text-gray-500 mt-2">Returning to upload form...</p>
        </div>
      )}
    </div>
  );
}