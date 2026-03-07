/**
 * Simple word count: splits on whitespace and filters out empty strings.
 */
export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Simple token estimation:
 * For English text, 1 token is roughly 4 characters or 0.75 words.
 * A more accurate approach without a full tokenizer is to split on
 * whitespace and punctuation, treating each as a token.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  
  // Method 1: Character-based (simple but often decent for LLM context)
  // return Math.ceil(text.length / 4);

  // Method 2: Word-based multiplier
  // return Math.ceil(countWords(text) * 1.35);

  // Method 3: Regex-based (splitting on word boundaries and special characters)
  // This is a common heuristic for a "rough" token count
  const tokens = text.match(/\w+|[^\w\s]/g);
  return tokens ? tokens.length : 0;
}
