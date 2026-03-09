/**
 * Frontend validation for legal question input
 * Provides immediate feedback before submitting to backend
 */

export const validateQuestion = (question) => {
  const errors = [];
  const warnings = [];
  
  // Check if question exists and is a string
  if (!question || typeof question !== 'string') {
    return {
      isValid: false,
      errors: ['Question is required'],
      warnings: []
    };
  }

  // Trim whitespace
  const trimmedQuestion = question.trim();

  // Check minimum length
  if (trimmedQuestion.length < 10) {
    errors.push('Question must be at least 10 characters long');
  }

  // Check maximum length
  if (trimmedQuestion.length > 1000) {
    errors.push('Question is too long (maximum 1000 characters)');
  }

  // Check for repeated characters (like KKKKKK)
  const repeatedCharPattern = /(.)\1{5,}/;
  if (repeatedCharPattern.test(trimmedQuestion)) {
    errors.push('Question contains too many repeated characters. Please enter a meaningful question.');
  }

  // Check if question contains meaningful words
  const wordPattern = /\b[a-zA-Z]{2,}\b/g;
  const words = trimmedQuestion.match(wordPattern);
  if (!words || words.length < 2) {
    errors.push('Question must contain at least 2 meaningful words');
  }

  // Check for gibberish - ratio of consonants to vowels
  const letters = trimmedQuestion.replace(/[^a-zA-Z]/g, '');
  const vowels = letters.match(/[aeiouAEIOU]/g);
  
  if (letters.length > 5) {
    const vowelRatio = vowels ? vowels.length / letters.length : 0;
    if (vowelRatio < 0.10 || vowelRatio > 0.70) {
      errors.push('Question appears to be nonsensical. Please enter a clear legal question.');
    }
  }

  // Check for spaces (word separation)
  const spaceCount = (trimmedQuestion.match(/\s/g) || []).length;
  if (spaceCount < 1 && trimmedQuestion.length > 20) {
    errors.push('Question should contain spaces between words');
  }

  // Check for minimum alphabetic content
  const alphabeticChars = (trimmedQuestion.match(/[a-zA-Z]/g) || []).length;
  const alphaRatio = alphabeticChars / trimmedQuestion.length;
  if (alphaRatio < 0.5) {
    errors.push('Question should contain primarily text characters');
  }

  // Check for question words or legal terms (warning only)
  const hasQuestionPattern = /\b(what|when|where|who|why|how|can|is|are|was|were|will|would|should|does|do|did|explain|tell|find|show|cases|case|law|legal|rights|contracts?|dispute|violation|precedent|court|section|act|ruling|judgment)\b/i;
  const hasLegalContext = hasQuestionPattern.test(trimmedQuestion);
  
  if (!hasLegalContext && errors.length === 0) {
    warnings.push('Consider including specific legal terms or clear question words (what, how, why, etc.) for better results');
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    warnings: warnings,
    sanitizedQuestion: trimmedQuestion
  };
};

/**
 * Get a user-friendly error message
 */
export const getValidationMessage = (validation) => {
  if (validation.isValid) {
    return null;
  }
  
  if (validation.errors.length > 0) {
    return validation.errors[0]; // Show the first error
  }
  
  return 'Please enter a valid question';
};

/**
 * Real-time validation for typing feedback
 */
export const validateQuestionRealTime = (question) => {
  if (!question || question.trim().length === 0) {
    return { isValid: true, message: null }; // Don't show errors for empty field
  }

  const trimmed = question.trim();
  
  // Only show critical errors in real-time
  if (trimmed.length > 1000) {
    return { 
      isValid: false, 
      message: 'Question is too long (maximum 1000 characters)' 
    };
  }

  const repeatedCharPattern = /(.)\1{5,}/;
  if (repeatedCharPattern.test(trimmed)) {
    return { 
      isValid: false, 
      message: 'Please avoid excessive repeated characters' 
    };
  }

  return { isValid: true, message: null };
};
