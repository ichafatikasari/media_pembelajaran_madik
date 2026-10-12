export interface StudentRecord {
  id: string;
  name: string;
  groupOrTeam?: string; // Optional: Tim Putra / Tim Putri / Kelompok
  charsTyped: number; // Total characters typed in 15 seconds
  correctChars: number; // Correct characters successfully typed
  cpm: number; // Characters Per Minute
  wpm: number; // Words Per Minute (chars / 5 / minutes)
  accuracy: number; // percentage
  typos: number; // error count
  score: number; // Formula based on correct characters & typo penalty
  timeSpent: number; // in seconds (usually 15s)
  timestamp: number;
  snippetTitle: string;
  isPlayoff?: boolean;
  playoffNotes?: string;
  playoffScore?: number;
  playoffWpm?: number;
  playoffAccuracy?: number;
  playoffWinner?: boolean;
  baselineRank?: number; // Guaranteed minimum podium rank
  lockedRank?: number; // 1 = Juara 1 Sah, 2 = Juara 2 Sah, 3 = Juara 3 Sah (Cannot be displaced by other tiers!)
  playoffTargetRank?: number; // Tier being contested: 1 for Juara 1, 2 for Juara 2, 3 for Juara 3
  originalScore?: number; // Skor awal babak reguler sebelum duel (misal 111 pt)
  playoffOpponent?: string; // Nama lawan tanding saat duel
  playoffOpponentScore?: number; // Skor lawan saat duel
}

export interface TypingSnippet {
  id: string;
  title: string;
  category: string;
  text: string;
  targetWpm: number;
  hint: string;
}

export interface TournamentConfig {
  snippetId: string;
  timeLimit: number; // 0 = unlimited (type until done), 30, 45, 60 seconds
  mode: 'fixed_time' | 'complete_text';
  soundEnabled: boolean;
  rewardNotes: string;
}

export interface ActiveDuelMatch {
  title: string; // e.g. "👑 GRAND FINAL: Andi (Juara 1) vs Icha (Penantang)"
  tier: 1 | 2 | 3;
  player1: StudentRecord;
  player2: StudentRecord;
  player1Score?: { score: number; wpm: number; accuracy: number; typos: number };
  player2Score?: { score: number; wpm: number; accuracy: number; typos: number };
  currentTurn: 1 | 2; // 1 = player1, 2 = player2
  isGrandFinal?: boolean;
}

export interface DuelHistoryItem {
  id: string;
  timestamp: number;
  title: string;
  tier: 1 | 2 | 3;
  isGrandFinal?: boolean;
  baseScore: number; // e.g. 111 pt (skor seri awal)
  winnerName: string;
  winnerScore: number;
  winnerWpm: number;
  winnerAccuracy: number;
  winnerRankAwarded: number;
  runnerUpName: string;
  runnerUpScore: number;
  runnerUpWpm: number;
  runnerUpAccuracy: number;
  runnerUpRankAwarded: number;
}
