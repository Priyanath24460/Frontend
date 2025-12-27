import React, { useState } from 'react';
import Header from '../components/Header';
import UploadWithPreview from '../components/UploadWithPreview';

const Upload = () => {
  const [uploadData, setUploadData] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-stone-800 mb-4">Upload Documents</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Upload your legal documents with preview and approval. Review extracted content and metadata before saving to ensure accuracy.
            </p>
          </div>
          
          <UploadWithPreview onUpload={setUploadData} />
          
          {uploadData && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Upload Successful!</h3>
              <p className="text-green-700 mb-2">
                Your document has been uploaded and is being processed. Case ID: <strong>{uploadData.caseId}</strong>
              </p>
              <p className="text-green-600 text-sm">
                You can now search through it using the Search page.
              </p>
            </div>
          )}
          
          <div className="mt-12 bg-stone-50 border border-stone-200 rounded-lg p-6 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-stone-800 mb-3">New Preview Features:</h3>
            <ul className="list-disc list-inside text-stone-700 space-y-2">
              <li>Preview extracted content before saving</li>
              <li>Edit and correct metadata (title, court, year, citation)</li>
              <li>Review document sections and text extraction</li>
              <li>Approve or cancel before database storage</li>
              <li>AI-powered text extraction and semantic indexing</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upload;