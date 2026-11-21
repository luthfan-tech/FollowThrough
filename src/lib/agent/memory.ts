import { Decision } from "../types";
import { getApprovedDecisions } from "../db";

export interface RetrievedMemory {
  decision: Decision;
  relevanceScore: number;
  matchedKeywords: string[];
}

export function retrieveRelevantMemories(
  currentDecisions: { decision_text: string; context?: string; owner?: string }[],
  meetingTranscript: string
): RetrievedMemory[] {
  const approvedMemories = getApprovedDecisions();
  if (approvedMemories.length === 0) return [];

  const results: RetrievedMemory[] = [];
  const fullTextToQuery = (
    currentDecisions.map((d) => `${d.decision_text} ${d.context || ""} ${d.owner || ""}`).join(" ") +
    " " +
    meetingTranscript
  ).toLowerCase();

  for (const memory of approvedMemories) {
    const memoryText = `${memory.decision_text} ${memory.context || ""} ${memory.owner || ""}`.toLowerCase();
    const memoryWords = tokenize(memoryText);

    const matchedKeywords: string[] = [];
    let matchScore = 0;

    for (const word of memoryWords) {
      if (word.length > 3 && fullTextToQuery.includes(word)) {
        matchedKeywords.push(word);
        matchScore += 1;
      }
    }

    // High-value concept checks
    const keyPhrases = [
      "supabase", "auth0", "ios 15", "ios 17", "october 15", "november 25",
      "google ads", "freeze", "spend", "redis", "caching", "oauth2", "pkce"
    ];

    for (const phrase of keyPhrases) {
      if (memoryText.includes(phrase) && fullTextToQuery.includes(phrase)) {
        matchScore += 5;
        matchedKeywords.push(phrase);
      }
    }

    // Calculate normalized relevance (0.0 to 1.0)
    const normalizedScore = Math.min(1.0, matchScore / 10);

    if (normalizedScore > 0.1 || matchedKeywords.length > 0) {
      results.push({
        decision: memory,
        relevanceScore: parseFloat(normalizedScore.toFixed(2)),
        matchedKeywords: Array.from(new Set(matchedKeywords)),
      });
    }
  }

  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function tokenize(text: string): string[] {
  return text
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

const STOP_WORDS = new Set([
  "the", "and", "for", "that", "this", "with", "from", "have", "will", "are",
  "was", "were", "been", "our", "all", "any", "must", "can", "they", "we", "you",
  "what", "when", "where", "who", "which", "how", "why", "about", "into"
]);
