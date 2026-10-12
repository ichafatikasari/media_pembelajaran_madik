import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { StudentRecord, TournamentConfig, ActiveDuelMatch, DuelHistoryItem } from './types/typingBattle';
import { TYPING_SNIPPETS } from './data/typingTexts';
import { TypingArena, PlayoffCandidate } from './components/TypingArena';
import { ClassroomLeaderboard } from './components/ClassroomLeaderboard';
import { TeacherSettingsModal } from './components/TeacherSettingsModal';
import { sound } from './utils/audio';
import { TieGroup } from './utils/tiebreaker';
import { 
  Keyboard, 
  Trophy, 
  Settings, 
  Volume2, 
  VolumeX, 
  Gift, 
  Dice5, 
  Sparkles, 
  Shuffle, 
  Users, 
  Info,
  Tv,
  Scale
} from 'lucide-react';
import { PlayoffRulesInfoModal } from './components/PlayoffRulesInfoModal';

const RECORDS_STORAGE_KEY = 'wordspeed_records_v1';
const CONFIG_STORAGE_KEY = 'wordspeed_config_v3';
const DUEL_HISTORY_STORAGE_KEY = 'wordspeed_duel_history_v1';

export default function App() {
  // Sound state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Tournament Configuration (Default 20 detik)
  const [config, setConfig] = useState<TournamentConfig>(() => {
    try {
      const saved = localStorage.getItem('wordspeed_config_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.timeLimit === 45 || parsed.timeLimit === 15) {
          parsed.timeLimit = 20;
        }
        return parsed;
      }
      // Check legacy keys
      const oldSaved = localStorage.getItem('wordspeed_config_v1') || localStorage.getItem('wordspeed_config_v2');
      if (oldSaved) {
        const parsed = JSON.parse(oldSaved);
        parsed.timeLimit = 20;
        return parsed;
      }
    } catch {}
    return {
      snippetId: 'snip-1',
      timeLimit: 20,
      mode: 'fixed_time',
      soundEnabled: true,
      rewardNotes: 'Hadiah Spesial Guru & Nilai Tambahan Informatika 100 untuk Juara 1, 2, dan 3! 🎁'
    };
  });

  // Student Records / Leaderboard
  const [records, setRecords] = useState<StudentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(RECORDS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Settings Modal Open
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Playoff Duel State (When rank 1, 2, or 3 has a tie)
  const [playoffCandidate, setPlayoffCandidate] = useState<PlayoffCandidate | null>(null);
  const [activeDuel, setActiveDuel] = useState<ActiveDuelMatch | null>(null);

  // Playoff & Grand Final Duel History Log
  const [duelHistory, setDuelHistory] = useState<DuelHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(DUEL_HISTORY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Random Student Caller Modal
  const [showCallerModal, setShowCallerModal] = useState<boolean>(false);
  const [totalAbsen, setTotalAbsen] = useState<number>(36);
  const [pickedAbsen, setPickedAbsen] = useState<number | null>(null);
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [showRulesInfoModal, setShowRulesInfoModal] = useState<boolean>(false);

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch {}
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
    } catch {}
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem(DUEL_HISTORY_STORAGE_KEY, JSON.stringify(duelHistory));
    } catch {}
  }, [duelHistory]);

  // Active Snippet
  const activeSnippet = TYPING_SNIPPETS.find(s => s.id === config.snippetId) || TYPING_SNIPPETS[0];

  // Best score in class
  const bestScoreInClass = records.length > 0 ? Math.max(...records.map(r => r.score)) : 0;

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playKeyClick();
  };

  const handleRecordFinished = (newRecord: StudentRecord) => {
    setRecords(prev => {
      const existingIndex = prev.findIndex(
        r => r.name.trim().toLowerCase() === newRecord.name.trim().toLowerCase()
      );

      if (existingIndex !== -1) {
        const existing = prev[existingIndex];
        const updated = [...prev];

        const tier = playoffCandidate?.tier || newRecord.playoffTargetRank;

        // 🛡️ BATAS TIER PODIUM (CEILING & FLOOR BRACKET PROTECTION):
        // 1. Jika bertanding di Perebutan Juara 2:
        //    Skor dasar TIDAK BOLEH dinaikkan melebihi skor Juara 1!
        // 2. Jika bertanding di Perebutan Juara 3:
        //    Skor dasar TIDAK BOLEH dinaikkan melebihi skor Juara 1 atau Juara 2!
        // Nilai rematch disimpan sebagai playoffScore (penentu duel antar penantang tier tersebut saja).
        const original = existing.originalScore ?? existing.score;

        updated[existingIndex] = {
          ...existing,
          originalScore: original,
          score: newRecord.score, // Update skor akhir dengan skor baru hasil tanding ulang
          wpm: newRecord.wpm,
          accuracy: newRecord.accuracy,
          typos: newRecord.typos,
          correctChars: newRecord.correctChars,
          isPlayoff: true,
          playoffScore: newRecord.score,
          playoffWpm: newRecord.wpm,
          playoffAccuracy: newRecord.accuracy,
          playoffTargetRank: tier,
          playoffNotes: `Playoff ${tier ? `Juara ${tier}` : ''}: ${newRecord.score} pt (${newRecord.wpm} WPM · ${newRecord.accuracy}%)`
        };

        return updated;
      }

      return [newRecord, ...prev];
    });

    setPlayoffCandidate(null);
  };

  const handleUpdateRecord = (updatedRecord: StudentRecord) => {
    sound.playKeyClick();
    setRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
  };

  const handleTriggerPlayoff = (student: StudentRecord, group?: TieGroup) => {
    sound.playBattleGong();
    setPlayoffCandidate({
      student,
      rankLabel: group?.rankLabel || 'Podium Juara',
      targetScore: student.score,
      tier: group?.tier || 1
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartDuelMatch = (duel: ActiveDuelMatch) => {
    sound.playBattleGong();
    setActiveDuel(duel);
    setPlayoffCandidate(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDuelFinished = (result: {
    winner: StudentRecord;
    runnerUp: StudentRecord;
    isGrandFinal?: boolean;
    tier: 1 | 2 | 3;
    winnerScore: number;
    winnerWpm: number;
    winnerAccuracy: number;
    runnerUpScore: number;
    runnerUpWpm: number;
    runnerUpAccuracy: number;
  }) => {
    sound.playGrandVictoryTrumpet();
    try {
      confetti({ particleCount: 160, spread: 100, origin: { y: 0.5 } });
    } catch {}

    const winnerRank = result.tier;
    const loserRank = (result.tier + 1) as number;
    const initialBaseScore = result.winner.originalScore ?? result.winner.score;

    // Create match history entry for classroom transparency
    const historyEntry: DuelHistoryItem = {
      id: `duel-${Date.now()}`,
      timestamp: Date.now(),
      title: result.isGrandFinal 
        ? '👑 GRAND FINAL: Perebutan Juara 1 Sejati' 
        : `⚔️ Duel Playoff: Perebutan Juara ${result.tier}`,
      tier: result.tier,
      isGrandFinal: result.isGrandFinal,
      baseScore: initialBaseScore,
      winnerName: result.winner.name,
      winnerScore: result.winnerScore,
      winnerWpm: result.winnerWpm,
      winnerAccuracy: result.winnerAccuracy,
      winnerRankAwarded: winnerRank,
      runnerUpName: result.runnerUp.name,
      runnerUpScore: result.runnerUpScore,
      runnerUpWpm: result.runnerUpWpm,
      runnerUpAccuracy: result.runnerUpAccuracy,
      runnerUpRankAwarded: loserRank
    };

    setDuelHistory(prev => [historyEntry, ...prev]);

    setRecords(prev => {
      return prev.map(rec => {
        // Clear conflicting locked ranks from other students
        let currentRec = rec;
        if (currentRec.id !== result.winner.id && currentRec.lockedRank === winnerRank) {
          currentRec = { ...currentRec, lockedRank: undefined };
        }
        if (currentRec.id !== result.runnerUp.id && currentRec.lockedRank === loserRank) {
          currentRec = { ...currentRec, lockedRank: undefined };
        }

        if (currentRec.id === result.winner.id) {
          const original = currentRec.originalScore ?? currentRec.score;
          return {
            ...currentRec,
            originalScore: original,
            score: result.winnerScore, // Skor akhir di papan peringkat resmi diperbarui ke skor duel!
            wpm: result.winnerWpm,
            accuracy: result.winnerAccuracy,
            lockedRank: winnerRank,
            playoffWinner: true,
            isPlayoff: true,
            playoffScore: result.winnerScore,
            playoffWpm: result.winnerWpm,
            playoffAccuracy: result.winnerAccuracy,
            playoffOpponent: result.runnerUp.name,
            playoffOpponentScore: result.runnerUpScore,
            playoffNotes: result.isGrandFinal 
              ? `👑 Juara 1 Sejati (Grand Final: ${result.winnerScore} pt vs ${result.runnerUp.name} ${result.runnerUpScore} pt)` 
              : `👑 Pemenang Duel Juara ${winnerRank} (Duel: ${result.winnerScore} pt vs ${result.runnerUp.name} ${result.runnerUpScore} pt)`
          };
        }

        if (currentRec.id === result.runnerUp.id) {
          const original = currentRec.originalScore ?? currentRec.score;
          return {
            ...currentRec,
            originalScore: original,
            score: result.runnerUpScore, // Skor akhir di papan peringkat resmi diperbarui ke skor duel!
            wpm: result.runnerUpWpm,
            accuracy: result.runnerUpAccuracy,
            lockedRank: loserRank <= 3 ? loserRank : undefined,
            playoffWinner: false,
            isPlayoff: true,
            playoffScore: result.runnerUpScore,
            playoffWpm: result.runnerUpWpm,
            playoffAccuracy: result.runnerUpAccuracy,
            playoffOpponent: result.winner.name,
            playoffOpponentScore: result.winnerScore,
            playoffNotes: result.isGrandFinal
              ? `🥈 Juara 2 (Runner-Up Grand Final: ${result.runnerUpScore} pt vs ${result.winner.name} ${result.winnerScore} pt)`
              : `🥈 Runner-Up Duel Juara ${loserRank} (Duel: ${result.runnerUpScore} pt vs ${result.winner.name} ${result.winnerScore} pt)`
          };
        }

        return currentRec;
      });
    });

    setActiveDuel(null);
  };

  const handleClearRecords = () => {
    setRecords([]);
    setDuelHistory([]);
  };

  const handleDeleteSingleRecord = (id: string) => {
    sound.playKeyClick();
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  // Spin Random Absen
  const spinRandomAbsen = () => {
    if (isCalling) return;
    setIsCalling(true);
    sound.playDiceRoll();

    let count = 0;
    const interval = setInterval(() => {
      setPickedAbsen(Math.floor(Math.random() * totalAbsen) + 1);
      count++;
      if (count >= 14) {
        clearInterval(interval);
        const finalNum = Math.floor(Math.random() * totalAbsen) + 1;
        setPickedAbsen(finalNum);
        setIsCalling(false);
        sound.playTeamBell();
      }
    }, 70);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      
      {/* Top Projector Header */}
      <header className="sticky top-0 z-40 bg-white border-b-2 border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            
            {/* Brand Zone */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-xl shadow-inner border border-blue-800">
                <Keyboard className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-blue-950">
                    WordSpeed<span className="text-orange-500">10</span>
                  </span>
                  <span className="hidden sm:inline text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                    Kelas 10 & 12
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden md:block">
                  Turnamen Ketik Cerita Santai (Tanpa Huruf Besar, Angka Boleh) · 1 Laptop & Proyektor
                </p>
              </div>
            </div>

            {/* Quick Actions (Random Student & Settings) */}
            <div className="flex items-center gap-2">
              
              {/* Random Student Caller Button */}
              <button
                onClick={() => {
                  sound.playKeyClick();
                  setShowCallerModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-950 text-xs font-bold rounded-xl border border-blue-200 transition-colors"
                title="Panggil Siswa Secara Acak Menggunakan Nomor Absen"
              >
                <Shuffle className="w-4 h-4 text-blue-700" />
                <span className="hidden sm:inline">Panggil Siswa Acak</span>
              </button>

              {/* Playoff & Tie Rules Button */}
              <button
                onClick={() => {
                  sound.playKeyClick();
                  setShowRulesInfoModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold rounded-xl border border-amber-300 transition-colors cursor-pointer"
                title="Buka panduan transparansi sistem playoff & penanganan skor seri"
              >
                <Scale className="w-4 h-4 text-orange-600" />
                <span className="hidden md:inline">Aturan Playoff</span>
              </button>

              {/* Sound Toggle */}
              <button
                onClick={toggleSound}
                title={soundEnabled ? 'Matikan Suara FX' : 'Aktifkan Suara FX'}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* Teacher Settings Button */}
              <button
                onClick={() => {
                  sound.playKeyClick();
                  setIsSettingsOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <Settings className="w-4 h-4 text-orange-400" />
                <span>Pengaturan Guru</span>
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* Reward Announcement Strip (Always visible for motivation) */}
      {config.rewardNotes && (
        <div className="bg-amber-400 text-slate-950 py-2.5 px-4 shadow-xs text-xs font-black flex items-center justify-center gap-2 border-b border-amber-500 text-center">
          <Gift className="w-4 h-4 shrink-0 text-slate-900" />
          <span>REWARD DARI GURU: {config.rewardNotes}</span>
        </div>
      )}

      {/* Main Classroom Layout (Split: Arena & Leaderboard) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* 1. TYPING ARENA: SISWA MAJU 1 PER 1 */}
        <section>
          <TypingArena
            snippet={activeSnippet}
            config={config}
            onRecordFinished={handleRecordFinished}
            bestScoreInClass={bestScoreInClass}
            playoffCandidate={playoffCandidate}
            onCancelPlayoff={() => setPlayoffCandidate(null)}
            activeDuel={activeDuel}
            onDuelFinished={handleDuelFinished}
            onCancelDuel={() => setActiveDuel(null)}
          />
        </section>

        {/* 2. LIVE LEADERBOARD / HALL OF FAME */}
        <section>
          <ClassroomLeaderboard
            records={records}
            onClearRecords={handleClearRecords}
            onDeleteSingleRecord={handleDeleteSingleRecord}
            activeSnippetTitle={activeSnippet.title}
            timeLimit={config.timeLimit}
            onTriggerPlayoff={handleTriggerPlayoff}
            onUpdateRecord={handleUpdateRecord}
            onStartDuelMatch={handleStartDuelMatch}
            duelHistory={duelHistory}
            onClearDuelHistory={() => setDuelHistory([])}
          />
        </section>

      </main>

      {/* Teacher Settings Modal */}
      <TeacherSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onChangeConfig={setConfig}
        records={records}
        onClearRecords={handleClearRecords}
      />

      {/* Random Student Caller Modal */}
      {showCallerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border-2 border-slate-300 shadow-2xl space-y-4 text-center animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-blue-900" />
                <h3 className="font-extrabold text-sm text-slate-900">Pemanggil Nomor Absen Siswa</h3>
              </div>
              <button
                onClick={() => setShowCallerModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Putar roda untuk menentukan siswa mana yang maju berikutnya ke laptop guru!
            </p>

            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="text-slate-600 font-semibold">Total Siswa:</span>
              <input
                type="number"
                min={5}
                max={50}
                value={totalAbsen}
                onChange={(e) => setTotalAbsen(Number(e.target.value))}
                className="w-14 border border-slate-300 rounded px-2 py-1 font-mono font-bold text-center"
              />
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 my-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                Nomor Absen Terpilih
              </span>
              <div className={`text-6xl font-black font-mono ${isCalling ? 'text-orange-500 animate-bounce' : 'text-blue-950'}`}>
                {pickedAbsen !== null ? `#${pickedAbsen}` : '—'}
              </div>
              {pickedAbsen !== null && !isCalling && (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full inline-block mt-2">
                  Nomor Absen {pickedAbsen} Silakan Maju! 🙋
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCallerModal(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Tutup
              </button>
              <button
                onClick={spinRandomAbsen}
                disabled={isCalling}
                className={`flex-1 py-2.5 font-bold text-xs text-white rounded-xl shadow-sm ${
                  isCalling ? 'bg-orange-400' : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {isCalling ? 'Mengacak...' : 'Putar Acak!'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playoff Rules Transparency Modal */}
      <PlayoffRulesInfoModal
        isOpen={showRulesInfoModal}
        onClose={() => setShowRulesInfoModal(false)}
      />

      {/* Simple Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-bold text-slate-800">
            WordSpeed 10 · Media Pembelajaran Interaktif Microsoft Word Kelas 10
          </span>
          <span className="text-slate-400">
            Materi: Shortcut Keyboard, Tata Letak Halaman, Margin, Paragraf & Fitur Lanjut
          </span>
        </div>
      </footer>

    </div>
  );
}
