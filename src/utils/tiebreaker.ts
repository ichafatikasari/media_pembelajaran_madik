import { StudentRecord } from '../types/typingBattle';

export interface TieGroup {
  rankLabel: string; // e.g. "Juara 1", "Juara 2", "Juara 3"
  score: number;
  students: StudentRecord[];
  tier: 1 | 2 | 3; // 1 for Juara 1, 2 for Juara 2, 3 for Juara 3
}

/**
 * Mendeteksi apakah ada nilai seri/imbang di posisi podium (Juara 1, 2, atau 3)
 */
export function detectPodiumTies(records: StudentRecord[]): TieGroup[] {
  if (records.length < 2) return [];

  // Urutkan berdasarkan lockedRank dulu, lalu skor
  const sorted = [...records].sort((a, b) => {
    if (a.lockedRank !== undefined && b.lockedRank !== undefined) {
      if (a.lockedRank !== b.lockedRank) return a.lockedRank - b.lockedRank;
    }
    if (a.lockedRank !== undefined && b.lockedRank === undefined) return -1;
    if (a.lockedRank === undefined && b.lockedRank !== undefined) return 1;

    if (b.score !== a.score) return b.score - a.score;
    if (b.wpm !== a.wpm) return b.wpm - a.wpm;
    return b.accuracy - a.accuracy;
  });

  const ties: TieGroup[] = [];
  const processedScores = new Set<number>();

  const top1 = sorted[0];
  const top2 = sorted[1];
  const top3 = sorted[2];
  const top4 = sorted[3];

  // 1. Seri di Juara 1 (Juara 1 dan 2 memiliki skor sama dan belum dikunci)
  if (top1 && top2 && top1.score === top2.score && top1.score > 0) {
    // Jika salah satunya sudah terkunci di rank 1 dan yang lain tidak terkunci di rank 1, tidak perlu tiebreaker
    const bothLockedDifferently = top1.lockedRank === 1 && top2.lockedRank === 2;
    if (!bothLockedDifferently && (!top1.playoffWinner || !top2.isPlayoff)) {
      const list = sorted.filter(r => r.score === top1.score);
      processedScores.add(top1.score);
      ties.push({
        rankLabel: 'Juara 1 🥇 (Puncak Podium)',
        score: top1.score,
        students: list,
        tier: 1
      });
    }
  }

  // 2. Seri di Juara 2 (Juara 2 dan 3 memiliki skor sama, dan belum masuk grup juara 1)
  if (top2 && top3 && top2.score === top3.score && top2.score > 0 && !processedScores.has(top2.score)) {
    const bothLockedDifferently = top2.lockedRank === 2 && top3.lockedRank === 3;
    if (!bothLockedDifferently && (!top2.playoffWinner || !top3.isPlayoff)) {
      const list = sorted.filter(r => r.score === top2.score);
      processedScores.add(top2.score);
      ties.push({
        rankLabel: 'Juara 2 🥈 (Podium Perak)',
        score: top2.score,
        students: list,
        tier: 2
      });
    }
  }

  // 3. Seri di Juara 3 (Juara 3 dan penantang peringkat 4 memiliki skor sama)
  if (top3 && top4 && top3.score === top4.score && top3.score > 0 && !processedScores.has(top3.score)) {
    const bothLockedDifferently = top3.lockedRank === 3 && top4.lockedRank === 4;
    if (!bothLockedDifferently && (!top3.playoffWinner || !top4.isPlayoff)) {
      const list = sorted.filter(r => r.score === top3.score);
      processedScores.add(top3.score);
      ties.push({
        rankLabel: 'Juara 3 🥉 (Podium Perunggu)',
        score: top3.score,
        students: list,
        tier: 3
      });
    }
  }

  return ties;
}
