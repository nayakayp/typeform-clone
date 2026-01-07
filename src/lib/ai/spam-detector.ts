export interface SpamCheckResult {
  isSpam: boolean;
  confidence: number;
  reasons: string[];
}

// Simple pattern-based spam detection
export function checkForSpamPatterns(text: string): SpamCheckResult {
  const reasons: string[] = [];
  let spamScore = 0;

  // Check for gibberish (random characters)
  const gibberishPattern = /^[a-z]{20,}$/i;
  if (gibberishPattern.test(text.replace(/\s/g, ""))) {
    reasons.push("Contains gibberish text");
    spamScore += 0.4;
  }

  // Check for excessive repetition
  const words = text.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  if (words.length > 5 && uniqueWords.size / words.length < 0.3) {
    reasons.push("Excessive word repetition");
    spamScore += 0.3;
  }

  // Check for suspicious URLs
  const urlPattern = /https?:\/\/[^\s]+/g;
  const urls = text.match(urlPattern) || [];
  if (urls.length > 2) {
    reasons.push("Contains multiple URLs");
    spamScore += 0.2;
  }

  // Check for common spam keywords
  const spamKeywords = [
    "click here",
    "free money",
    "act now",
    "limited time",
    "winner",
    "congratulations",
    "earn money fast",
    "work from home",
    "casino",
    "lottery",
  ];

  for (const keyword of spamKeywords) {
    if (text.toLowerCase().includes(keyword)) {
      reasons.push(`Contains spam keyword: "${keyword}"`);
      spamScore += 0.15;
    }
  }

  // Check for all caps
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (text.length > 10 && capsRatio > 0.7) {
    reasons.push("Excessive use of capital letters");
    spamScore += 0.2;
  }

  // Check for excessive punctuation
  const punctuationPattern = /[!?]{3,}/;
  if (punctuationPattern.test(text)) {
    reasons.push("Excessive punctuation");
    spamScore += 0.1;
  }

  // Check for email patterns (might be harvesting)
  const emailPattern = /[\w.-]+@[\w.-]+\.\w+/g;
  const emails = text.match(emailPattern) || [];
  if (emails.length > 2) {
    reasons.push("Contains multiple email addresses");
    spamScore += 0.2;
  }

  const confidence = Math.min(spamScore, 1);
  const isSpam = confidence > 0.5;

  return {
    isSpam,
    confidence,
    reasons,
  };
}

// Check submission speed (too fast might be bot)
export function checkSubmissionSpeed(
  startTime: Date,
  submitTime: Date,
  questionCount: number
): SpamCheckResult {
  const reasons: string[] = [];
  const seconds = (submitTime.getTime() - startTime.getTime()) / 1000;

  // Average 5 seconds per question minimum
  const minimumTime = questionCount * 5;

  if (seconds < minimumTime) {
    const speedRatio = seconds / minimumTime;
    const confidence = Math.max(0, 1 - speedRatio);

    if (confidence > 0.5) {
      reasons.push(`Submitted in ${seconds}s (expected minimum ${minimumTime}s)`);
      return {
        isSpam: true,
        confidence,
        reasons,
      };
    }
  }

  return {
    isSpam: false,
    confidence: 0,
    reasons: [],
  };
}

// Combine multiple spam checks
export function combineSpamChecks(checks: SpamCheckResult[]): SpamCheckResult {
  const allReasons = checks.flatMap(c => c.reasons);
  const avgConfidence = checks.reduce((sum, c) => sum + c.confidence, 0) / checks.length;
  const maxConfidence = Math.max(...checks.map(c => c.confidence));

  // Use weighted combination
  const finalConfidence = avgConfidence * 0.4 + maxConfidence * 0.6;

  return {
    isSpam: finalConfidence > 0.5,
    confidence: finalConfidence,
    reasons: allReasons,
  };
}
