import { useState, useEffect } from "react";
import { SECONDARY_API_URL } from "../config/api";
import { LightBulbIcon } from '@heroicons/react/24/outline';

export default function QuestionForm({ onAsk, setIsLoading, setError, selectedQuery, setSelectedQuery }) {
  const [question, setQuestion] = useState("");

  useEffect(() => {
    if (selectedQuery) {
      setQuestion(selectedQuery);
    }
  }, [selectedQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${SECONDARY_API_URL}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      
      if (!res.ok) {
        throw new Error(`Search failed: ${res.statusText}`);
      }
      
      const data = await res.json();
      onAsk(data);
      setSelectedQuery(""); // Clear selected query after submission
    } catch (err) {
      setError(err.message || "An error occurred while searching. Please try again.");
      onAsk(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <label htmlFor="question" className="block text-sm font-semibold text-stone-700 mb-3">
          Your Legal Question
        </label>
        <div className="relative">
          <textarea
            id="question"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="e.g., What are the legal precedents for property disputes in Sri Lanka?"
            className="w-full px-5 py-4 border-2 border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-800 placeholder-gray-400 transition-all duration-200 resize-none"
            rows="4"
            required
          />
          <div className="absolute right-4 bottom-4">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
          <LightBulbIcon className="w-4 h-4 text-amber-500" />
          <span>Tip: The more specific your question, the better the results</span>
        </p>
      </div>
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-stone-900 font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Search Legal Cases
      </button>
    </form>
  );
}
