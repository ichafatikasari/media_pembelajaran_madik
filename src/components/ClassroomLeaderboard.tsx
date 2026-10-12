import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { StudentRecord, ActiveDuelMatch, DuelHistoryItem } from '../types/typingBattle';
import { 
  Trophy, 
  Sparkles, 
  Trash2, 
  AlertTriangle, 
  Check, 
  X, 
  Swords, 
  Crown, 
  Edit3, 
  Save, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Flame, 
  ArrowRight,
  Scale,
  HelpCircle,
  History,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { sound } from '../utils/audio';
import { detectPodiumTies, TieGroup } from '../utils/tiebreaker';
import { PlayoffModal } from './PlayoffModal';
import { PlayoffRulesInfoModal } from './PlayoffRulesInfoModal';

interface LeaderboardProps {
  records: StudentRecord[];
  onClearRecords: () => void;
  onDeleteSingleRecord: (recordId: string) => void;
  activeSnippetTitle: string;
  timeLimit?: number;
  onTriggerPlayoff: (student: StudentRecord, group?: TieGroup) => void;
  onUpdateRecord: (updatedRecord: StudentRecord) => void;
  onStartDuelMatch: (duel: ActiveDuelMatch) => void;
  duelHistory?: DuelHistoryItem[];
  onClearDuelHistory?: () => void;
}

export const ClassroomLeaderboard: React.FC<LeaderboardProps> = ({
  records,
  onClearRecords,
  onDeleteSingleRecord,
  activeSnippetTitle,
  timeLimit = 20,
  onTriggerPlayoff,
  onUpdateRecord,
  onStartDuelMatch,
  duelHistory = [],
  onClearDuelHistory
}) => {
  // Modal states for in-app confirmation (replacing blocked window.confirm)
  const [recordToDelete, setRecordToDelete] = useState<StudentRecord | null>(null);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [showPlayoffModal, setShowPlayoffModal] = useState<boolean>(false);
  const [showRulesInfoModal, setShowRulesInfoModal] = useState<boolean>(false);
  const [showDuelHistory, setShowDuelHistory] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Edit / Restore Score Modal State
  const [recordToEdit, setRecordToEdit] = useState<StudentRecord | null>(null);
  const [editScore, setEditScore] = useState<number>(0);
  const [editWpm, setEditWpm] = useState<number>(0);
  const [editAccuracy, setEditAccuracy] = useState<number>(100);
  const [editTypos, setEditTypos] = useState<number>(0);
  const [editIsPlayoffWinner, setEditIsPlayoffWinner] = useState<boolean>(false);
  const [editLockedRank, setEditLockedRank] = useState<number | undefined>(undefined);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Urutan Peringkat Berdasarkan Keadilan Turnamen:
  // 1. LOCKED PODIUM RANKS (PRIORITAS MUTLAK):
  //    Jika Juara 1, 2, atau 3 sudah disahkan/dikunci (lockedRank: 1, 2, atau 3),
  //    posisi mereka TERLINDUNGI PERMANEN dan TIDAK BISA digeser oleh peserta dari tier bawah!
  // 2. Jika skor seri dan ada status pemenang playoff, pemenang playoff otomatis di atas!
  // 3. Jika keduanya punya skor duel playoff di tier yang sama, skor playoff tertinggi di atas
  // 4. Skor Poin Terbanyak
  // 5. Akurasi Ketikan (%) Tertinggi (lebih presisi & bersih)
  // 6. Typo Paling Sedikit (0 kesalahan diutamakan)
  // 7. Kecepatan Kata per Menit (WPM)
  const sortedRecords = [...records].sort((a, b) => {
    // Priority 1: Locked Rank (1, 2, 3)
    if (a.lockedRank !== undefined && b.lockedRank !== undefined) {
      if (a.lockedRank !== b.lockedRank) return a.lockedRank - b.lockedRank;
    }
    if (a.lockedRank !== undefined && b.lockedRank === undefined) {
      return -1; // Locked student stays ahead
    }
    if (a.lockedRank === undefined && b.lockedRank !== undefined) {
      return 1;
    }

    // Priority 2: Playoff duel decider within same baseline score
    if (a.score === b.score) {
      if (a.playoffWinner && !b.playoffWinner) return -1;
      if (!a.playoffWinner && b.playoffWinner) return 1;
      if (a.playoffScore !== undefined && b.playoffScore !== undefined) {
        if (b.playoffScore !== a.playoffScore) return b.playoffScore - a.playoffScore;
        if ((b.playoffWpm ?? 0) !== (a.playoffWpm ?? 0)) return (b.playoffWpm ?? 0) - (a.playoffWpm ?? 0);
      }
    }

    // Priority 3: Main tournament score & metrics
    if (b.score !== a.score) return b.score - a.score;
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
    if ((a.typos ?? 0) !== (b.typos ?? 0)) return (a.typos ?? 0) - (b.typos ?? 0);
    if (b.wpm !== a.wpm) return b.wpm - a.wpm;
    return (b.cpm ?? 0) - (a.cpm ?? 0);
  });

  const top1 = sortedRecords[0];
  const top2 = sortedRecords[1];
  const top3 = sortedRecords[2];

  // Detect ties for podium
  const tieGroups = detectPodiumTies(sortedRecords);
  const isStudentInTieGroup = (studentId: string) => {
    return tieGroups.some(g => g.students.some(s => s.id === studentId));
  };

  const getStudentTieGroup = (studentId: string) => {
    return tieGroups.find(g => g.students.some(s => s.id === studentId));
  };

  // Cek apakah ada peserta playoff di bawah tier 1 yang mencetak skor playoff LEBIH TINGGI dari Juara 1
  const grandFinalCandidate = records.find(r => 
    top1 && 
    r.id !== top1.id && 
    r.playoffScore !== undefined && 
    r.playoffScore > top1.score &&
    r.lockedRank !== 1
  );

  // Cek apakah Juara 2 & 3 sedang seri murni tanpa penguncian / pemenang
  const isTop2And3Tied = top2 && top3 && top2.score === top3.score && !top2.lockedRank && !top3.lockedRank && !top2.playoffWinner && !top3.playoffWinner;

  const handleConfirmDeleteSingle = () => {
    if (!recordToDelete) return;
    const name = recordToDelete.name;
    sound.playKeyClick();
    onDeleteSingleRecord(recordToDelete.id);
    setRecordToDelete(null);
    showToast(`Data nilai "${name}" berhasil dihapus.`);
  };

  const handleConfirmResetAll = () => {
    sound.playKeyClick();
    onClearRecords();
    setShowResetModal(false);
    showToast('Seluruh data nilai dan nama berhasil di-reset.');
  };

  // Open edit score dialog
  const handleOpenEdit = (rec: StudentRecord) => {
    sound.playKeyClick();
    setRecordToEdit(rec);
    setEditScore(rec.score);
    setEditWpm(rec.wpm);
    setEditAccuracy(rec.accuracy);
    setEditTypos(rec.typos);
    setEditIsPlayoffWinner(!!rec.playoffWinner);
    setEditLockedRank(rec.lockedRank);
  };

  // Save edited score
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordToEdit) return;

    // If setting a locked rank, remove that locked rank from other students to avoid conflict
    if (editLockedRank !== undefined) {
      records.forEach(r => {
        if (r.id !== recordToEdit.id && r.lockedRank === editLockedRank) {
          onUpdateRecord({ ...r, lockedRank: undefined });
        }
      });
    }

    const updated: StudentRecord = {
      ...recordToEdit,
      score: Number(editScore),
      wpm: Number(editWpm),
      accuracy: Number(editAccuracy),
      typos: Number(editTypos),
      playoffWinner: editIsPlayoffWinner,
      isPlayoff: editIsPlayoffWinner || recordToEdit.isPlayoff,
      lockedRank: editLockedRank,
      playoffNotes: editLockedRank 
        ? `🔒 Juara ${editLockedRank} Sah (Terkunci)` 
        : editIsPlayoffWinner 
        ? `👑 Juara Playoff` 
        : recordToEdit.playoffNotes
    };

    onUpdateRecord(updated);
    setRecordToEdit(null);
    showToast(`Posisi & skor "${recordToEdit.name}" berhasil disimpan!`);
  };

  // Toggle lock for a specific podium position
  const handleToggleLockRank = (rec: StudentRecord, rankToLock: number) => {
    sound.playTeamBell();
    if (rec.lockedRank === rankToLock) {
      // Unlock
      onUpdateRecord({ ...rec, lockedRank: undefined });
      showToast(`Kunci Juara ${rankToLock} untuk "${rec.name}" telah dilepas.`);
    } else {
      // Lock: clear rankToLock from any other student first
      records.forEach(r => {
        if (r.id !== rec.id && r.lockedRank === rankToLock) {
          onUpdateRecord({ ...r, lockedRank: undefined });
        }
      });
      onUpdateRecord({
        ...rec,
        lockedRank: rankToLock,
        playoffNotes: `🔒 Juara ${rankToLock} Sah`
      });
      showToast(`"${rec.name}" RESMI DIKUNCI sebagai Juara ${rankToLock} Sah! 👑`);
      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
      } catch {}
    }
  };

  // Award playoff winner directly from modal
  const handleAwardPlayoffWinner = (winner: StudentRecord, group: TieGroup) => {
    sound.playGrandVictoryTrumpet();
    try {
      confetti({ particleCount: 130, spread: 80, origin: { y: 0.5 } });
    } catch {}

    const otherStudents = group.students.filter(s => s.id !== winner.id);
    
    // Assign locked ranks according to group.tier
    const winnerRank = group.tier;
    const loserRank = group.tier + 1;

    // Clear conflicting locked ranks
    records.forEach(r => {
      if (r.id !== winner.id && r.lockedRank === winnerRank) {
        onUpdateRecord({ ...r, lockedRank: undefined });
      }
    });

    onUpdateRecord({
      ...winner,
      lockedRank: winnerRank,
      playoffWinner: true,
      isPlayoff: true,
      playoffNotes: `👑 Pemenang Playoff: Juara ${winnerRank} Sah`
    });

    otherStudents.forEach(other => {
      onUpdateRecord({
        ...other,
        lockedRank: loserRank <= 3 ? loserRank : undefined,
        playoffWinner: false,
        isPlayoff: true,
        playoffNotes: `🥈 Runner-Up Playoff: Juara ${loserRank}`
      });
    });

    showToast(`Selamat! ${winner.name} resmi disahkan sebagai Juara ${winnerRank}! 👑`);
    setShowPlayoffModal(false);
  };

  // Grand Final Duel between Champion and Challenger
  const handleStartGrandFinal = (champion: StudentRecord, challenger: StudentRecord) => {
    sound.playBattleGong();
    onStartDuelMatch({
      title: '👑 GRAND FINAL: Juara 1 Bertahan vs Penantang Baru',
      tier: 1,
      player1: champion,
      player2: challenger,
      currentTurn: 1,
      isGrandFinal: true
    });
  };

  // Sahkan Sesuai Bracket (Champion remains Juara 1, Challenger is Juara 2)
  const handleSahkanSesuaiBracket = (champion: StudentRecord, challenger: StudentRecord) => {
    sound.playGrandVictoryTrumpet();
    onUpdateRecord({
      ...champion,
      lockedRank: 1,
      playoffNotes: `👑 Juara 1 Sah (Mempertahankan Gelar)`
    });
    onUpdateRecord({
      ...challenger,
      lockedRank: 2,
      playoffNotes: `🥈 Juara 2 Sah (Performa Terbaik Playoff: ${challenger.playoffScore} pt)`
    });
    showToast(`Selesai! ${champion.name} tetap Juara 1, ${challenger.name} Juara 2!`);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-5 sm:p-6 space-y-6 relative">
      
      {/* Toast Notification */}
      {notification && (
        <div className="absolute top-4 right-4 z-30 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Papan Peringkat Turnamen Kelas
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
              {records.length} Siswa Terdaftar
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tantangan: <strong className="text-slate-800">{activeSnippetTitle}</strong> · Penilaian: Karakter Benar dalam {timeLimit}s dikurangi Penalti Typo
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Informative Playoff Rules Modal Trigger */}
          <button
            type="button"
            onClick={() => {
              sound.playKeyClick();
              setShowRulesInfoModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-98 rounded-xl transition-all border border-slate-300 shadow-2xs cursor-pointer"
            title="Pelajari sistem keadilan & penanganan skor seri turnamen"
          >
            <Scale className="w-3.5 h-3.5 text-orange-600" />
            <span>Aturan Playoff ℹ️</span>
          </button>

          {tieGroups.length > 0 && (
            <button
              type="button"
              onClick={() => {
                sound.playBattleGong();
                setShowPlayoffModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer animate-pulse"
              title="Ada skor seri di podium! Buka babak penentuan juara"
            >
              <Swords className="w-4 h-4" />
              <span>Babak Playoff ({tieGroups.length} Seri)</span>
            </button>
          )}

          {records.length > 0 && (
            <button
              type="button"
              onClick={() => {
                sound.playKeyClick();
                setShowResetModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 active:scale-98 rounded-xl transition-all border border-red-200 shadow-2xs cursor-pointer"
              title="Hapus semua data turnamen dan mulai dari awal"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
              <span>Reset Semua Skor</span>
            </button>
          )}
        </div>
      </div>

      {/* SPECIAL: GRAND FINAL CHALLENGE BANNER (WHEN PLAYOFF SCORE BEATS CHAMPION) */}
      {grandFinalCandidate && top1 && (
        <div className="bg-gradient-to-r from-purple-800 via-indigo-700 to-amber-600 text-white rounded-2xl p-5 shadow-xl border-2 border-yellow-300 space-y-3 animate-in fade-in slide-in-from-top-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 shadow-md">
                <Crown className="w-8 h-8 text-yellow-300 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-2xs">
                    👑 TANTANGAN GRAND FINAL TERBUKA!
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black tracking-tight mt-0.5 text-white">
                  {grandFinalCandidate.name} Menembus Rekor ({grandFinalCandidate.playoffScore} pt), Melampaui Juara 1 ({top1.name}: {top1.score} pt)!
                </h3>
                <p className="text-xs text-yellow-100 font-medium mt-0.5 max-w-xl leading-relaxed">
                  Siswa penantang mencetak skor spektakuler saat tanding ulang! Mau gelar <strong>Grand Final 1 vs 1</strong> ({top1.name} vs {grandFinalCandidate.name}) untuk menentukan Juara 1 Sejati?
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleStartGrandFinal(top1, grandFinalCandidate)}
                className="px-4 py-3 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-slate-950 rounded-xl font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Swords className="w-4 h-4 text-slate-950" />
                <span>⚔️ Mainkan Grand Final (1 vs 1)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSahkanSesuaiBracket(top1, grandFinalCandidate)}
                className="px-3.5 py-2.5 bg-black/30 hover:bg-black/40 border border-white/20 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer text-center"
                title="Tetapkan juara 1 tetap aman, penantang dinobatkan sebagai Juara 2"
              >
                <span>🏆 Tetapkan Juara 1 Tetap Sah</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TIE BREAKER / PLAYOFF NOTICE BANNER WITH BRACKET CEILING PROTECTION */}
      {tieGroups.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white rounded-2xl p-4 sm:p-5 shadow-lg border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <Swords className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded-full">
                  ⚡ SKOR SERI TERDETEKSI!
                </span>
                <span className="text-xs text-amber-100 font-bold">
                  {tieGroups.map(g => g.rankLabel).join(', ')}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight mt-0.5">
                Babak Penentuan Juara (Playoff) Diperlukan!
              </h3>
              <p className="text-xs text-amber-100 font-medium mt-0.5">
                🛡️ <strong>Keadilan Giliran:</strong> Siswa yang skornya imbang posisinya belum diputuskan sebelum Playoff. Tidak ada yang otomatis diturunkan peringkatnya!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playBattleGong();
              setShowPlayoffModal(true);
            }}
            className="px-5 py-3 bg-white text-orange-700 hover:bg-amber-50 rounded-xl font-black text-xs shadow-md transition-all active:scale-95 shrink-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Swords className="w-4 h-4 text-orange-600" />
            <span>ATUR PLAYOFF SEKARANG ⚔️</span>
          </button>
        </div>
      )}

      {records.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 text-amber-500 flex items-center justify-center font-bold mb-3">
            <Trophy className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Belum Ada Siswa yang Maju
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Siapa siswa pertama yang berani maju ke depan laptop guru? Masukkan nama panggilan dan mulai balapan mengetik {timeLimit} detik!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* PODIUM TOP 3 (PROMINENT FOR PROJECTOR / SMART TV) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-2">
            
            {/* Rank 2 (Silver) */}
            {top2 ? (
              <div className={`rounded-xl border-2 p-4 text-center order-2 sm:order-1 transition-all relative group ${
                top2.lockedRank === 2
                  ? 'bg-slate-100 border-slate-400 ring-3 ring-slate-300 shadow-md'
                  : isTop2And3Tied
                  ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-300 shadow-sm'
                  : isStudentInTieGroup(top2.id)
                  ? 'bg-orange-50/60 border-orange-400 ring-2 ring-orange-300 shadow-sm'
                  : 'bg-slate-50 border-slate-300'
              }`}>
                {/* Action buttons (Edit & Delete) */}
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(top2)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title={`Edit / Pulihkan skor ${top2.name}`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecordToDelete(top2)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title={`Hapus entri ${top2.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="w-9 h-9 mx-auto rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-black text-sm mb-2 shadow-xs">
                  {isTop2And3Tied ? '⚔️' : '🥈 2'}
                </div>
                <h4 className="text-base font-extrabold text-slate-900 truncate">
                  {top2.name}
                </h4>
                {top2.groupOrTeam && (
                  <span className="text-[11px] font-semibold text-slate-500 block truncate">
                    {top2.groupOrTeam}
                  </span>
                )}

                {/* Badge if locked, tied or playoff winner */}
                {top2.lockedRank === 2 ? (
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-700 text-white shadow-2xs">
                      <Lock className="w-3 h-3 text-slate-300" />
                      JUARA 2 SAH (TERKUNCI)
                    </span>
                  </div>
                ) : isTop2And3Tied ? (
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 animate-pulse">
                      <Swords className="w-3 h-3 text-amber-700" />
                      Seri Posisi 2 & 3 (Menunggu Playoff)
                    </span>
                  </div>
                ) : isStudentInTieGroup(top2.id) ? (
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-200 text-orange-900 animate-pulse">
                      <Swords className="w-3 h-3 text-orange-700" />
                      Skor Seri (Perlu Playoff)
                    </span>
                  </div>
                ) : top2.playoffWinner ? (
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-300 text-amber-950 shadow-2xs">
                      👑 Pemenang Playoff
                    </span>
                  </div>
                ) : null}

                <div className="mt-2 py-1.5 px-3 bg-white rounded-lg border border-slate-200 inline-block font-mono">
                  <div className="text-xl font-black text-slate-900">{top2.score} <span className="text-xs font-semibold text-slate-400">Poin</span></div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {top2.correctChars !== undefined ? `${top2.correctChars} Huruf (${timeLimit}s)` : `${top2.wpm} WPM`} · {top2.typos} Typo
                  </div>
                </div>

                {/* Lock button */}
                <div className="mt-2 flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleLockRank(top2, 2)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-colors cursor-pointer ${
                      top2.lockedRank === 2 
                        ? 'bg-slate-700 text-white' 
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    }`}
                    title="Kunci posisi siswa ini sebagai Juara 2 agar tidak bisa disalip tier bawah"
                  >
                    {top2.lockedRank === 2 ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    <span>{top2.lockedRank === 2 ? 'Lepas Kunci Juara 2' : 'Kunci Juara 2'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden sm:block p-4 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400 order-2 sm:order-1">
                Posisi Juara 2 Menunggu...
              </div>
            )}

            {/* Rank 1 (Gold - Big and Tall) */}
            {top1 && (
              <div className={`rounded-2xl border-2 p-5 text-center order-1 sm:order-2 shadow-md relative scale-105 group ${
                top1.lockedRank === 1
                  ? 'bg-gradient-to-b from-amber-200 via-amber-100 to-yellow-100 border-amber-600 ring-4 ring-amber-400 shadow-xl'
                  : isStudentInTieGroup(top1.id)
                  ? 'bg-gradient-to-b from-amber-100 to-orange-100 border-orange-500 ring-4 ring-orange-400/50'
                  : 'bg-gradient-to-b from-amber-50 to-orange-50/40 border-amber-400'
              }`}>
                {/* Action buttons (Edit & Delete) */}
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(top1)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title={`Edit / Pulihkan skor ${top1.name}`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecordToDelete(top1)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title={`Hapus entri ${top1.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[11px] font-black px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                  👑 {top1.lockedRank === 1 ? 'JUARA 1 SAH (TERKUNCI)' : 'JUARA 1 SEMENTARA'}
                </div>
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-400 text-white flex items-center justify-center font-black text-xl mb-2 shadow-md mt-1">
                  🥇
                </div>
                <h3 className="text-xl font-black text-slate-900 truncate">
                  {top1.name}
                </h3>
                {top1.groupOrTeam && (
                  <span className="text-xs font-bold text-amber-800 block truncate">
                    {top1.groupOrTeam}
                  </span>
                )}

                {/* Badge if locked, tied or playoff winner */}
                {top1.lockedRank === 1 ? (
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-3 py-0.5 rounded-full bg-amber-600 text-white shadow-sm font-mono animate-pulse">
                      <Lock className="w-3 h-3 text-amber-200" />
                      TERKUNCI: TIDAK BISA DISALIP!
                    </span>
                  </div>
                ) : isStudentInTieGroup(top1.id) ? (
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 animate-pulse">
                      <Swords className="w-3 h-3 text-red-600" />
                      Skor Seri Juara 1 (Harus Playoff!)
                    </span>
                  </div>
                ) : top1.playoffWinner ? (
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-300 text-amber-950 shadow-2xs font-mono">
                      🏆 Pemenang Playoff Sah
                    </span>
                  </div>
                ) : null}

                <div className="mt-3 py-2 px-4 bg-white rounded-xl border border-amber-300 shadow-inner font-mono inline-block">
                  <div className="text-3xl font-black text-amber-600">{top1.score} <span className="text-sm font-bold text-slate-500">Poin</span></div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">
                    {top1.correctChars !== undefined ? `${top1.correctChars} Karakter Benar (${timeLimit}s)` : `${top1.wpm} WPM`} · {top1.typos} Typo · {top1.accuracy}% Akurasi
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-center gap-2">
                  {/* Lock button */}
                  <button
                    type="button"
                    onClick={() => handleToggleLockRank(top1, 1)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer ${
                      top1.lockedRank === 1 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-amber-200 hover:bg-amber-300 text-amber-950'
                    }`}
                    title="Kunci posisi siswa ini sebagai Juara 1 Sah agar tidak bisa disalip oleh siapapun"
                  >
                    {top1.lockedRank === 1 ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{top1.lockedRank === 1 ? 'Buka Kunci Juara 1' : 'Kunci Juara 1 Sah 🔒'}</span>
                  </button>

                  {/* Confetti button */}
                  <button
                    type="button"
                    onClick={() => {
                      sound.playGrandVictoryTrumpet();
                      try {
                        confetti({
                          particleCount: 130,
                          spread: 90,
                          origin: { y: 0.4 },
                          colors: ['#FFD700', '#F59E0B', '#F97316', '#FFFFFF']
                        });
                      } catch {}
                    }}
                    className="inline-flex items-center gap-1 p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors cursor-pointer"
                    title="Rayakan Juara 1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  </button>
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {top3 ? (
              <div className={`rounded-xl border-2 p-4 text-center order-3 sm:order-3 transition-all relative group ${
                top3.lockedRank === 3
                  ? 'bg-orange-100 border-orange-400 ring-3 ring-orange-300 shadow-md'
                  : isTop2And3Tied
                  ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-300 shadow-sm'
                  : isStudentInTieGroup(top3.id)
                  ? 'bg-orange-50/60 border-orange-400 ring-2 ring-orange-300 shadow-sm'
                  : 'bg-slate-50 border-orange-200'
              }`}>
                {/* Action buttons (Edit & Delete) */}
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(top3)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title={`Edit / Pulihkan skor ${top3.name}`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecordToDelete(top3)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title={`Hapus entri ${top3.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="w-9 h-9 mx-auto rounded-full bg-orange-100 text-orange-800 flex items-center justify-center font-black text-sm mb-2 shadow-xs">
                  {isTop2And3Tied ? '⚔️' : '🥉 3'}
                </div>
                <h4 className="text-base font-extrabold text-slate-900 truncate">
                  {top3.name}
                </h4>
                {top3.groupOrTeam && (
                  <span className="text-[11px] font-semibold text-slate-500 block truncate">
                    {top3.groupOrTeam}
                  </span>
                )}

                {/* Badge if locked, tied or playoff winner */}
                {top3.lockedRank === 3 ? (
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-orange-800 text-white shadow-2xs">
                      <Lock className="w-3 h-3 text-orange-200" />
                      JUARA 3 SAH (TERKUNCI)
                    </span>
                  </div>
                ) : isTop2And3Tied ? (
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 animate-pulse">
                      <Swords className="w-3 h-3 text-amber-700" />
                      Seri Posisi 2 & 3 (Menunggu Playoff)
                    </span>
                  </div>
                ) : isStudentInTieGroup(top3.id) ? (
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-200 text-orange-900 animate-pulse">
                      <Swords className="w-3 h-3 text-orange-700" />
                      Skor Seri (Perlu Playoff)
                    </span>
                  </div>
                ) : top3.playoffWinner ? (
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                      ⚡ Juara Playoff
                    </span>
                  </div>
                ) : null}

                <div className="mt-2 py-1.5 px-3 bg-white rounded-lg border border-slate-200 inline-block font-mono">
                  <div className="text-xl font-black text-slate-900">{top3.score} <span className="text-xs font-semibold text-slate-400">Poin</span></div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {top3.correctChars !== undefined ? `${top3.correctChars} Huruf (${timeLimit}s)` : `${top3.wpm} WPM`} · {top3.typos} Typo
                  </div>
                </div>

                {/* Lock button */}
                <div className="mt-2 flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleLockRank(top3, 3)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-colors cursor-pointer ${
                      top3.lockedRank === 3 
                        ? 'bg-orange-800 text-white' 
                        : 'bg-orange-200 hover:bg-orange-300 text-orange-950'
                    }`}
                    title="Kunci posisi siswa ini sebagai Juara 3"
                  >
                    {top3.lockedRank === 3 ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    <span>{top3.lockedRank === 3 ? 'Lepas Kunci Juara 3' : 'Kunci Juara 3'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden sm:block p-4 border border-slate-200 border-dashed rounded-xl text-center text-xs text-slate-400 order-3 sm:order-3">
                Posisi Juara 3 Menunggu...
              </div>
            )}

          </div>

          {/* DUEL & PLAYOFF MATCH HISTORY LOG (TRANSPARANSI SKOR SETELAH DUEL) */}
          {duelHistory && duelHistory.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 via-indigo-50/60 to-blue-50 border-2 border-purple-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowDuelHistory(!showDuelHistory)}
                  className="flex items-center gap-2 font-black text-sm sm:text-base text-purple-950 hover:text-purple-800 transition-colors cursor-pointer text-left"
                >
                  <History className="w-5 h-5 text-purple-700 shrink-0" />
                  <span>📜 Riwayat Pertandingan Duel & Playoff ({duelHistory.length} Pertandingan)</span>
                  {showDuelHistory ? (
                    <ChevronUp className="w-4 h-4 text-purple-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-purple-600" />
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-[11px] font-bold text-purple-700 bg-purple-100/90 px-2.5 py-0.5 rounded-full border border-purple-300">
                    Transparansi Nilai Duel Siswa
                  </span>
                  {onClearDuelHistory && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playKeyClick();
                        onClearDuelHistory();
                      }}
                      className="text-[10px] text-purple-500 hover:text-red-600 underline font-semibold cursor-pointer"
                    >
                      Hapus Riwayat
                    </button>
                  )}
                </div>
              </div>

              {showDuelHistory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {duelHistory.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-purple-200 p-3.5 shadow-2xs space-y-2 hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-purple-950 flex items-center gap-1.5">
                          {item.isGrandFinal ? '👑' : '⚔️'} {item.title}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono">
                          Skor Seri Awal: {item.baseScore} pt
                        </span>
                      </div>

                      {/* Head to Head Results Box */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {/* Winner */}
                        <div className="p-2.5 bg-amber-50/90 rounded-lg border-2 border-amber-400 space-y-1">
                          <div className="flex items-center justify-between font-black text-amber-950">
                            <span className="truncate">{item.winnerName}</span>
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                              Juara {item.winnerRankAwarded} 👑
                            </span>
                          </div>
                          <div className="text-xl font-black font-mono text-amber-700">
                            {item.winnerScore} <span className="text-[11px] font-semibold text-slate-500">pt</span>
                          </div>
                          <div className="text-[10px] text-slate-600 font-mono">
                            {item.winnerWpm} WPM · {item.winnerAccuracy}%
                          </div>
                        </div>

                        {/* Runner Up */}
                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between font-bold text-slate-800">
                            <span className="truncate">{item.runnerUpName}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                              Juara {item.runnerUpRankAwarded}
                            </span>
                          </div>
                          <div className="text-xl font-black font-mono text-slate-700">
                            {item.runnerUpScore} <span className="text-[11px] font-semibold text-slate-500">pt</span>
                          </div>
                          <div className="text-[10px] text-slate-600 font-mono">
                            {item.runnerUpWpm} WPM · {item.runnerUpAccuracy}%
                          </div>
                        </div>
                      </div>

                      {/* Footer match summary */}
                      <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="font-semibold text-purple-700">
                          {item.winnerName} unggul +{item.winnerScore - item.runnerUpScore} Poin di babak duel!
                        </span>
                        <span className="font-mono text-slate-400">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FULL RANKINGS TABLE */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 text-center w-14">Rank</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-3 text-center">Karakter / {timeLimit}s</th>
                  <th className="py-3 px-3 text-center">Typo (Salah)</th>
                  <th className="py-3 px-3 text-center">Akurasi</th>
                  <th className="py-3 px-3 text-center">Kecepatan</th>
                  <th className="py-3 px-4 text-center">Skor Akhir</th>
                  <th className="py-3 px-3 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedRecords.map((rec, index) => {
                  const isTop = index === 0;
                  const isTied = isStudentInTieGroup(rec.id);
                  const tieGroup = getStudentTieGroup(rec.id);

                  return (
                    <tr
                      key={rec.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        rec.lockedRank === 1
                          ? 'bg-amber-100/60 font-bold ring-1 ring-amber-300'
                          : isTied 
                          ? 'bg-orange-50/70 font-semibold' 
                          : isTop ? 'bg-amber-50/50 font-bold' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        {rec.lockedRank === 1 && '🥇 1 🔒'}
                        {rec.lockedRank === 2 && '🥈 2 🔒'}
                        {rec.lockedRank === 3 && '🥉 3 🔒'}
                        {rec.lockedRank === undefined && (
                          <>
                            {index === 0 && '🥇 1'}
                            {index === 1 && '🥈 2'}
                            {index === 2 && '🥉 3'}
                            {index > 2 && `#${index + 1}`}
                          </>
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>{rec.name}</span>
                          {rec.groupOrTeam && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                              {rec.groupOrTeam}
                            </span>
                          )}
                          {rec.lockedRank && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-800 text-white flex items-center gap-1 shadow-2xs">
                              <Lock className="w-2.5 h-2.5" />
                              Juara {rec.lockedRank} Sah
                            </span>
                          )}
                          {isTied && !rec.lockedRank && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                              <Swords className="w-2.5 h-2.5" />
                              Seri ({rec.score} pt)
                            </span>
                          )}
                          {rec.playoffWinner && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-300 text-amber-950 border border-amber-400">
                              👑 Juara Playoff
                            </span>
                          )}
                        </div>

                        {/* RIWAYAT SKOR SETELAH DUEL */}
                        {rec.playoffScore !== undefined && (
                          <div className="flex items-center gap-1.5 flex-wrap mt-1 text-[11px] font-normal">
                            <span className="inline-flex items-center gap-1 font-bold text-purple-900 bg-purple-100/90 px-2 py-0.5 rounded-md border border-purple-300 shadow-2xs">
                              <Swords className="w-3 h-3 text-purple-600" />
                              <span>Skor Duel: <strong>{rec.playoffScore} pt</strong></span>
                              {rec.playoffOpponent && (
                                <span className="text-purple-700 font-semibold">
                                  (vs {rec.playoffOpponent}{rec.playoffOpponentScore !== undefined ? `: ${rec.playoffOpponentScore} pt` : ''})
                                </span>
                              )}
                            </span>
                            {rec.originalScore !== undefined && (
                              <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                Skor Awal: {rec.originalScore} pt
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-extrabold text-emerald-700 text-sm">
                        {rec.correctChars !== undefined ? `${rec.correctChars} huruf` : `${rec.score} pt`}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        <span className={rec.typos === 0 ? 'text-emerald-600' : 'text-red-500'}>
                          {rec.typos} {rec.typos > 0 ? `(-${rec.typos * 3})` : '✓'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        <span className={rec.accuracy >= 95 ? 'text-emerald-700' : 'text-slate-700'}>
                          {rec.accuracy}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                        {rec.wpm} WPM {rec.cpm ? `(${rec.cpm} CPM)` : ''}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono">
                        <div className="flex flex-col items-center justify-center">
                          <span className="font-black text-sm text-orange-600">{rec.score} pt</span>
                          {rec.playoffScore !== undefined && (
                            <span 
                              className="inline-flex items-center gap-0.5 text-[10px] font-black text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded-md border border-purple-200 mt-0.5 shadow-2xs"
                              title={`Skor setelah duel: ${rec.playoffScore} poin (skor reguler: ${rec.originalScore ?? rec.score} pt)`}
                            >
                              <Swords className="w-2.5 h-2.5 text-purple-600" />
                              <span>Duel: {rec.playoffScore} pt</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {isTied && (
                            <button
                              type="button"
                              onClick={() => onTriggerPlayoff(rec, tieGroup)}
                              className="p-1.5 text-orange-600 hover:text-white hover:bg-orange-600 rounded-lg transition-colors cursor-pointer"
                              title={`Tanding ulang (Playoff) untuk ${rec.name}`}
                            >
                              <Swords className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(rec)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title={`Koreksi / Pulihkan / Kunci posisi ${rec.name}`}
                          >
                            <Edit3 className="w-4 h-4 text-blue-500" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setRecordToDelete(rec)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title={`Hapus baris data untuk ${rec.name}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* PLAYOFF DIALOG MODAL */}
      <PlayoffModal
        isOpen={showPlayoffModal}
        onClose={() => setShowPlayoffModal(false)}
        tieGroups={tieGroups}
        onSelectCandidateForPlayoff={(student, group) => {
          setShowPlayoffModal(false);
          onTriggerPlayoff(student, group);
        }}
        onAwardPlayoffWinner={handleAwardPlayoffWinner}
        onStartDuelMatch={onStartDuelMatch}
      />

      {/* PLAYOFF RULES TRANSPARENCY INFO MODAL */}
      <PlayoffRulesInfoModal
        isOpen={showRulesInfoModal}
        onClose={() => setShowRulesInfoModal(false)}
      />

      {/* MODAL 1: EDIT / PULIHKAN NILAI & KUNCI POSISI SISWA */}
      {recordToEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveEdit}
            className="bg-white rounded-2xl max-w-md w-full p-6 border-2 border-slate-300 shadow-2xl space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Koreksi & Kunci Posisi Juara
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRecordToEdit(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
              💡 <strong>Solusi Mudah:</strong> Jika ada siswa yang salah posisi peringkat (misal perebutan Juara 3 malah melompat jadi Juara 1), Bapak/Ibu dapat memilih <strong>"Kunci Posisi Podium"</strong> di bawah untuk langsung menempatkan siswa di posisi Juara 1, 2, atau 3 yang sah!
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Siswa:</label>
                <input
                  type="text"
                  disabled
                  value={recordToEdit.name}
                  className="w-full font-bold px-3 py-2 bg-slate-100 rounded-lg text-slate-700 border border-slate-200"
                />
              </div>

              {/* Locked Podium Rank Dropdown */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 space-y-1.5">
                <label className="block font-black text-amber-950">
                  🔒 Kunci Posisi Podium Juara (Prioritas Sah):
                </label>
                <select
                  value={editLockedRank === undefined ? '' : String(editLockedRank)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditLockedRank(val === '' ? undefined : Number(val));
                  }}
                  className="w-full font-bold px-3 py-2 bg-white rounded-lg text-slate-900 border-2 border-amber-400 focus:outline-none"
                >
                  <option value="">Bebas (Otomatis berdasarkan poin normal)</option>
                  <option value="1">🥇 Kunci Sebagai JUARA 1 SAH (Tidak Bisa Digeser)</option>
                  <option value="2">🥈 Kunci Sebagai JUARA 2 SAH</option>
                  <option value="3">🥉 Kunci Sebagai JUARA 3 SAH</option>
                </select>
                <p className="text-[11px] text-amber-800">
                  Siswa yang dikunci sebagai Juara 1/2/3 tidak akan pernah tergeser oleh peserta duel dari tier bawah.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Skor Poin:</label>
                  <input
                    type="number"
                    required
                    value={editScore}
                    onChange={(e) => setEditScore(Number(e.target.value))}
                    className="w-full font-mono font-black text-lg px-3 py-2 bg-white rounded-lg text-orange-600 border-2 border-slate-300 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kecepatan (WPM):</label>
                  <input
                    type="number"
                    required
                    value={editWpm}
                    onChange={(e) => setEditWpm(Number(e.target.value))}
                    className="w-full font-mono font-bold px-3 py-2 bg-white rounded-lg text-slate-900 border-2 border-slate-300 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Akurasi (%):</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={editAccuracy}
                    onChange={(e) => setEditAccuracy(Number(e.target.value))}
                    className="w-full font-mono font-bold px-3 py-2 bg-white rounded-lg text-slate-900 border-2 border-slate-300 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jumlah Typo:</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editTypos}
                    onChange={(e) => setEditTypos(Number(e.target.value))}
                    className="w-full font-mono font-bold px-3 py-2 bg-white rounded-lg text-slate-900 border-2 border-slate-300 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setRecordToEdit(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan & Sahkan Posisi</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: KONFIRMASI HAPUS 1 SISWA (IN-APP MODAL) */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border-2 border-slate-300 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  Hapus Data Siswa?
                </h3>
                <p className="text-xs text-slate-500">
                  Data nilai berikut akan dihapus dari papan skor.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900 text-sm">
                Nama: {recordToDelete.name}
              </div>
              <div className="text-slate-600 font-mono">
                Skor: <strong className="text-orange-600">{recordToDelete.score} Poin</strong> ({recordToDelete.correctChars || 0} karakter · {recordToDelete.typos} typo)
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSingle}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Siswa Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: KONFIRMASI RESET SEMUA SKOR (IN-APP MODAL) */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border-2 border-slate-300 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  Reset Semua Data Turnamen?
                </h3>
                <p className="text-xs text-slate-500">
                  Tindakan ini akan mengosongkan seluruh {records.length} data siswa dari papan peringkat.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 leading-relaxed">
              ⚠️ <strong>Perhatian:</strong> Semua skor siswa akan dihapus dan peringkat akan dimulai dari awal lagi untuk sesi kelas baru.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmResetAll}
                className="px-5 py-2.5 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>YA, RESET SEMUA DATA</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
