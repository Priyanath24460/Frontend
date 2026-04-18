import { useState, useEffect, useRef } from "react";
import { PAST_CASE_API_URL as API_URL } from "../config/api";
import { LightBulbIcon, ExclamationCircleIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { validateQuestion, validateQuestionRealTime, getValidationMessage } from "../utils/questionValidator";

export default function QuestionForm({ onAsk, setIsLoading, setError, selectedQuery, setSelectedQuery, setLastQuestion }) {
  const [question, setQuestion] = useState("");
  const [validationError, setValidationError] = useState(null);
  const [validationWarning, setValidationWarning] = useState(null);
  const [realtimeError, setRealtimeError] = useState(null);
  
  // AI Rewrite feature states
  const [aiRewriteEnabled, setAiRewriteEnabled] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewrittenQuestion, setRewrittenQuestion] = useState(null);
  const [showRewrittenSuggestion, setShowRewrittenSuggestion] = useState(false);
  const [rewriteError, setRewriteError] = useState(null);
  
  // Rate limiting
  const lastRewriteTimeRef = useRef(0);
  const rewriteTimeoutRef = useRef(null);

  useEffect(() => {
    if (selectedQuery) {
      setQuestion(selectedQuery);
      setValidationError(null);
      setRealtimeError(null);
      setRewrittenQuestion(null);
      setShowRewrittenSuggestion(false);
      setRewriteError(null);
    }
  }, [selectedQuery]);

  // Function to call AI rewrite API with rate limiting
  const handleAiRewrite = async () => {
    if (!question || question.trim().length < 5) {
      return;
    }

    // Rate limiting: Check if enough time has passed since last request
    const now = Date.now();
    const timeSinceLastRewrite = now - lastRewriteTimeRef.current;
    const minInterval = 2000; // 2 seconds minimum between requests

    if (timeSinceLastRewrite < minInterval) {
      const waitTime = minInterval - timeSinceLastRewrite;
      setRewriteError(`Please wait ${Math.ceil(waitTime / 1000)} seconds before trying again`);
      
      // Clear error after wait time
      setTimeout(() => setRewriteError(null), waitTime);
      return;
    }

    setIsRewriting(true);
    setShowRewrittenSuggestion(false);
    setRewriteError(null);
    lastRewriteTimeRef.current = now;

    try {
      const res = await fetch(`${PAST_CASE_API_URL}/api/query/rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Handle rate limit specifically
        if (res.status === 429) {
          const retryAfter = data.retryAfter || 3000;
          setRewriteError("Too many requests. Please wait a moment and try again.");
          
          // Clear error after retry time
          setTimeout(() => setRewriteError(null), retryAfter);
          return;
        }
        
        throw new Error(data.message || "Failed to rewrite question");
      }
      
      if (data.success && data.rewrittenQuestion) {
        setRewrittenQuestion(data.rewrittenQuestion);
        setShowRewrittenSuggestion(true);
      }
    } catch (err) {
      console.error("Rewrite error:", err);
      setRewriteError("Unable to improve question right now. Please try again later.");
      
      // Clear error after 5 seconds
      setTimeout(() => setRewriteError(null), 5000);
    } finally {
      setIsRewriting(false);
    }
  };

  // Accept the rewritten question
  const handleAcceptRewrite = () => {
    if (rewrittenQuestion) {
      setQuestion(rewrittenQuestion);
      setShowRewrittenSuggestion(false);
      setRewrittenQuestion(null);
      setValidationError(null);
      setRealtimeError(null);
    }
  };

  // Reject the rewrite and keep original
  const handleRejectRewrite = () => {
    setShowRewrittenSuggestion(false);
    setRewrittenQuestion(null);
  };

  // Real-time validation as user types
  const handleQuestionChange = (e) => {
    const newQuestion = e.target.value;
    setQuestion(newQuestion);
    
    // Clear validation errors when user starts typing
    if (validationError) {
      setValidationError(null);
    }

    // Hide rewrite suggestion when user modifies question
    if (showRewrittenSuggestion) {
      setShowRewrittenSuggestion(false);
    }

    // Clear rewrite errors when user types
    if (rewriteError) {
      setRewriteError(null);
    }

    // Real-time validation for critical errors
    const realtimeValidation = validateQuestionRealTime(newQuestion);
    if (!realtimeValidation.isValid) {
      setRealtimeError(realtimeValidation.message);
    } else {
      setRealtimeError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate question before submission
    const validation = validateQuestion(question);
    
    if (!validation.isValid) {
      const errorMessage = getValidationMessage(validation);
      setValidationError(errorMessage);
      setError(errorMessage);
      return;
    }

    // Show warnings but continue
    if (validation.warnings && validation.warnings.length > 0) {
      setValidationWarning(validation.warnings[0]);
    }

    setIsLoading(true);
    setError(null);
    setValidationError(null);
    
    // Save the question before making the request
    if (setLastQuestion) {
      setLastQuestion(question);
    }
    
    try {
      const res = await fetch(`${PAST_CASE_API_URL}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: validation.sanitizedQuestion }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Search failed: ${res.statusText}`);
      }
      
      const data = await res.json();
      
      // Check if backend returned validation error
      if (data.error === "Invalid question") {
        setValidationError(data.message);
        setError(data.message);
        onAsk(null);
      } else {
        onAsk(data);
      }
      
      setSelectedQuery(""); // Clear selected query after submission
    } catch (err) {
      const errorMessage = err.message || "An error occurred while searching. Please try again.";
      setError(errorMessage);
      setValidationError(errorMessage);
      onAsk(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <label htmlFor="question" className="block text-sm font-semibold text-stone-700">
            Your Legal Question
          </label>
          
          {/* AI Rewrite Toggle */}
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-600">AI Improve</span>
            <button
              type="button"
              onClick={() => {
                const newState = !aiRewriteEnabled;
                setAiRewriteEnabled(newState);
                if (newState && question.trim().length >= 5) {
                  handleAiRewrite();
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                aiRewriteEnabled ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  aiRewriteEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        
        <div className="relative">
          <textarea
            id="question"
            value={question}
            onChange={handleQuestionChange}
            placeholder="e.g., What are the legal precedents for property disputes in Sri Lanka?"
            className={`w-full px-5 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 text-stone-800 placeholder-gray-400 transition-all duration-200 resize-none ${
              validationError || realtimeError
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-stone-200 focus:ring-amber-500 focus:border-amber-500'
            }`}
            rows="4"
            required
          />
          <div className="absolute right-4 bottom-4">
            {isRewriting ? (
              <ArrowPathIcon className="w-5 h-5 text-purple-500 animate-spin" />
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
        </div>

        {/* AI Rewritten Question Suggestion */}
        {showRewrittenSuggestion && rewrittenQuestion && (
          <div className="mt-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 shadow-sm animate-fade-in">
            <div className="flex items-start gap-3">
              <SparklesIcon className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-purple-900 mb-2">AI Improved Version:</p>
                <p className="text-sm text-gray-800 bg-white p-3 rounded-lg border border-purple-100 italic">
                  "{rewrittenQuestion}"
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handleAcceptRewrite}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Use This
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectRewrite}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    Keep Original
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Rewriting in progress message */}
        {isRewriting && (
          <div className="mt-2 flex items-center gap-2 text-purple-600 text-sm">
            <ArrowPathIcon className="w-4 h-4 animate-spin" />
            <span>AI is improving your question...</span>
          </div>
        )}

        {/* Rewrite error message */}
        {rewriteError && !isRewriting && (
          <div className="mt-2 flex items-start gap-2 text-amber-600 text-sm bg-amber-50 p-3 rounded-lg border border-amber-200">
            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{rewriteError}</span>
          </div>
        )}

        {/* Manual rewrite button (when AI improve is enabled) */}
        {aiRewriteEnabled && !isRewriting && !showRewrittenSuggestion && !rewriteError && question.trim().length >= 5 && (
          <div className="mt-2">
            <button
              type="button"
              onClick={handleAiRewrite}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 transition-colors"
            >
              <SparklesIcon className="w-4 h-4" />
              Improve my question with AI
            </button>
          </div>
        )}
        
        {/* Real-time error display */}
        {realtimeError && (
          <div className="mt-2 flex items-start gap-2 text-red-600 text-sm">
            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{realtimeError}</span>
          </div>
        )}
        
        {/* Validation error display */}
        {validationError && !realtimeError && (
          <div className="mt-2 flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{validationError}</span>
          </div>
        )}
        
        {/* Warning display */}
        {validationWarning && !validationError && !realtimeError && (
          <div className="mt-2 flex items-start gap-2 text-amber-600 text-sm bg-amber-50 p-3 rounded-lg border border-amber-200">
            <LightBulbIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{validationWarning}</span>
          </div>
        )}
        
        {/* Default tip (only show if no errors or warnings) */}
        {!validationError && !realtimeError && !validationWarning && (
          <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <LightBulbIcon className="w-4 h-4 text-amber-500" />
            <span>Tip: The more specific your question, the better the results</span>
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={!!realtimeError || question.trim().length === 0}
        className="w-full bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-stone-900 font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Search Legal Cases
      </button>
    </form>
  );
}
