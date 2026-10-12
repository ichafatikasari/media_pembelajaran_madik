import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { StudentRecord, TypingSnippet, TournamentConfig, ActiveDuelMatch } from '../types/typingBattle';
import { sound } from '../utils/audio';
import { 
  Keyboard, 
  Timer, 
  Flame, 
  Award, 
  Sparkles, 
  Gauge, 
  User, 
  Users, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Trophy,
  Swords,
  Zap,
  Scale,
  HelpCircle,
  Crown
} from 'lucide-react';
import { PlayoffRulesInfoModal } from './PlayoffRulesInfoModal';

export interface PlayoffCandidate {
  student: StudentRecord;
  rankLabel: string;
  targetScore: number;
  tier?: 1 | 2 | 3;
}

interface TypingArenaProps {
  snippet: TypingSnippet;
  config: TournamentConfig;
  onRecordFinished: (record: StudentRecord) => void;
  bestScoreInClass: number;
  playoffCandidate?: PlayoffCandidate | null;
  onCancelPlayoff?: () => void;
  activeDuel?: ActiveDuelMatch | null;
  onDuelFinished?: (result: {
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
  }) => void;
  onCancelDuel?: () => void;
}

type ArenaState = 'NAME_INPUT' | 'COUNTDOWN' | 'ACTIVE_TYPING' | 'SUMMARY';

export interface DuelPlayerResult {
  name: string;
  group?: string;
  score: number;
  wpm: number;
  accuracy: number;
  typos: number;
  correctChars: number;
}

export const TypingArena: React.FC<TypingArenaProps> = ({
  snippet,
  config,
  onRecordFinished,
  bestScoreInClass,
  playoffCandidate,
  onCancelPlayoff,
  activeDuel,
  onDuelFinished,
  onCancelDuel
}) => {
  const [arenaState, setArenaState] = useState<ArenaState>('NAME_INPUT');
  const [studentName, setStudentName] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('Umum');
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

  // Duel State & Refs (Guaranteed no stale closure bugs!)
  const duelTurnRef = useRef<1 | 2>(1);
  const duelP1ResultRef = useRef<DuelPlayerResult | null>(null);
  const duelP2ResultRef = useRef<DuelPlayerResult | null>(null);

  const [duelTurn, setDuelTurn] = useState<1 | 2>(1);
  const [duelP1Result, setDuelP1Result] = useState<DuelPlayerResult | null>(null);
  const [duelP2Result, setDuelP2Result] = useState<DuelPlayerResult | null>(null);

  // Sync candidate if in single-candidate playoff mode
  useEffect(() => {
    if (playoffCandidate) {
      setStudentName(playoffCandidate.student.name);
      if (playoffCandidate.student.groupOrTeam) {
        setSelectedGroup(playoffCandidate.student.groupOrTeam);
      }
      setArenaState('NAME_INPUT');
      setTypedInput('');
      typedInputRef.current = '';
      setFinalRecord(null);
    }
  }, [playoffCandidate]);

  // Sync duel if activeDuel starts
  useEffect(() => {
    if (activeDuel) {
      duelTurnRef.current = 1;
      duelP1ResultRef.current = null;
      duelP2ResultRef.current = null;
      setDuelTurn(1);
      setDuelP1Result(null);
      setDuelP2Result(null);
      setStudentName(activeDuel.player1.name);
      if (activeDuel.player1.groupOrTeam) {
        setSelectedGroup(activeDuel.player1.groupOrTeam);
      }
      setArenaState('NAME_INPUT');
      setTypedInput('');
      typedInputRef.current = '';
      setFinalRecord(null);
    }
  }, [activeDuel?.title, activeDuel?.player1.id, activeDuel?.player2.id]);

  // Countdown timer
  const [countdownVal, setCountdownVal] = useState<number>(3);

  // Typing session states
  const [typedInput, setTypedInput] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(config.timeLimit);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [wpm, setWpm] = useState<number>(0);
  const [cpm, setCpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [typoCount, setTypoCount] = useState<number>(0);
  const [correctCharsCount, setCorrectCharsCount] = useState<number>(0);
  const [finalRecord, setFinalRecord] = useState<StudentRecord | null>(null);

  // Record breaker celebration state
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);
  const [previousRecordScore, setPreviousRecordScore] = useState<number>(0);

  // Audio & Input Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const typedInputRef = useRef<string>('');
  typedInputRef.current = typedInput;

  const targetChars = snippet.text;

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Autofocus input when active typing starts
  useEffect(() => {
    if (arenaState === 'ACTIVE_TYPING') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [arenaState]);

  // Helper: Run countdown and start active typing
  const runCountdownToStart = (targetName?: string, targetGroup?: string) => {
    if (targetName) setStudentName(targetName);
    if (targetGroup) setSelectedGroup(targetGroup);
    sound.playKeyClick();
    setArenaState('COUNTDOWN');
    setCountdownVal(3);
    sound.playCountdownTick();

    if (timerRef.current) clearInterval(timerRef.current);

    let current = 3;
    const countTimer = setInterval(() => {
      current--;
      if (current > 0) {
        setCountdownVal(current);
        sound.playCountdownTick();
      } else {
        clearInterval(countTimer);
        sound.playGoFanfare();
        startActiveTyping();
      }
    }, 1000);
  };

  // 1. START COUNTDOWN
  const handleStartCountdown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;
    runCountdownToStart(studentName, selectedGroup);
  };

  // 2. START ACTIVE TYPING SESSION
  const startActiveTyping = () => {
    setArenaState('ACTIVE_TYPING');
    setTypedInput('');
    typedInputRef.current = '';
    setTimeLeft(config.timeLimit);
    setElapsedSeconds(0);
    setWpm(0);
    setCpm(0);
    setAccuracy(100);
    setTypoCount(0);
    setCorrectCharsCount(0);
    setIsNewHighScore(false);

    const startTime = Date.now();

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      const secondsPassed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(secondsPassed);

      if (config.mode === 'fixed_time') {
        const remaining = Math.max(0, config.timeLimit - secondsPassed);
        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          handleCompleteSession(secondsPassed, typedInputRef.current);
        }
      }
    }, 250);
  };

  // 3. HANDLE TYPING INPUT (Live Calculation)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    // 🛡️ PERLINDUNGAN RAMAH SISWA:
    // Jika teks target tidak mengandung huruf besar (semua huruf kecil & angka),
    // otomatis jadikan input huruf kecil agar siswa tidak kena penalti jika tombol CapsLock aktif!
    if (targetChars === targetChars.toLowerCase()) {
      val = val.toLowerCase();
    }

    if (val.length > targetChars.length) return;

    const lastChar = val[val.length - 1];
    const prevLen = typedInput.length;

    if (val.length > prevLen) {
      const expectedChar = targetChars[val.length - 1];
      if (lastChar === expectedChar) {
        sound.playKeyClick();
      } else {
        sound.playFail();
      }
    }

    setTypedInput(val);

    let errors = 0;
    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === targetChars[i]) {
        correct++;
      } else {
        errors++;
      }
    }

    setTypoCount(errors);
    setCorrectCharsCount(correct);

    const effectiveTimeMin = Math.max(1 / 60, elapsedSeconds / 60);
    const calculatedCpm = Math.round(correct / effectiveTimeMin);
    const calculatedWpm = Math.round((correct / 5) / effectiveTimeMin);
    setCpm(calculatedCpm);
    setWpm(calculatedWpm);

    const acc = val.length > 0 ? Math.round((correct / val.length) * 100) : 100;
    setAccuracy(acc);

    if (val.length === targetChars.length) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      handleCompleteSession(elapsedSeconds, val);
    }
  };

  // 4. COMPLETE SESSION & EVALUATE SCORE
  const handleCompleteSession = (timeSpentSec: number, currentInput: string) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    let errors = 0;
    let correctChars = 0;
    for (let i = 0; i < currentInput.length; i++) {
      if (currentInput[i] === targetChars[i]) {
        correctChars++;
      } else {
        errors++;
      }
    }

    const durationMin = Math.max(1 / 60, timeSpentSec / 60);
    const finalCpm = Math.round(correctChars / durationMin);
    const finalWpm = Math.round((correctChars / 5) / durationMin);
    const finalAcc = currentInput.length > 0 ? Math.round((correctChars / currentInput.length) * 100) : 100;

    const typoPenalty = errors * 3;
    const finalScore = Math.max(0, correctChars - typoPenalty);

    const currentDuelTurn = duelTurnRef.current;
    const effectiveStudentName = activeDuel 
      ? (currentDuelTurn === 1 ? activeDuel.player1.name : activeDuel.player2.name)
      : studentName.trim();
    const effectiveGroup = activeDuel
      ? (currentDuelTurn === 1 ? activeDuel.player1.groupOrTeam : activeDuel.player2.groupOrTeam)
      : selectedGroup;

    const record: StudentRecord = {
      id: `rec-${Date.now()}`,
      name: effectiveStudentName,
      groupOrTeam: effectiveGroup !== 'Umum' ? effectiveGroup : undefined,
      charsTyped: currentInput.length,
      correctChars: correctChars,
      cpm: finalCpm,
      wpm: finalWpm,
      accuracy: finalAcc,
      typos: errors,
      score: finalScore,
      timeSpent: timeSpentSec,
      timestamp: Date.now(),
      snippetTitle: snippet.title,
      isPlayoff: !!playoffCandidate || !!activeDuel,
      playoffTargetRank: activeDuel ? activeDuel.tier : playoffCandidate?.tier,
      playoffNotes: activeDuel 
        ? `${activeDuel.isGrandFinal ? 'Grand Final' : 'Playoff Duel'} Ronde ${currentDuelTurn}` 
        : playoffCandidate ? `Playoff: ${playoffCandidate.rankLabel}` : undefined
    };

    setFinalRecord(record);
    setArenaState('SUMMARY');

    // Save duel results explicitly using Refs + State
    if (activeDuel) {
      if (currentDuelTurn === 1) {
        const p1Data: DuelPlayerResult = {
          name: activeDuel.player1.name,
          group: activeDuel.player1.groupOrTeam,
          score: finalScore,
          wpm: finalWpm,
          accuracy: finalAcc,
          typos: errors,
          correctChars: correctChars
        };
        duelP1ResultRef.current = p1Data;
        setDuelP1Result(p1Data);
      } else {
        const p2Data: DuelPlayerResult = {
          name: activeDuel.player2.name,
          group: activeDuel.player2.groupOrTeam,
          score: finalScore,
          wpm: finalWpm,
          accuracy: finalAcc,
          typos: errors,
          correctChars: correctChars
        };
        duelP2ResultRef.current = p2Data;
        setDuelP2Result(p2Data);
      }
    } else {
      onRecordFinished(record);
    }

    // Check if student breaks the record or is the new champion
    const isRecordBreaker = finalScore > bestScoreInClass && finalScore > 0;
    setIsNewHighScore(isRecordBreaker);
    setPreviousRecordScore(bestScoreInClass);

    if (isRecordBreaker || playoffCandidate || activeDuel) {
      sound.playGrandVictoryTrumpet();
      launchSuperCelebration();
    } else {
      sound.playSuccess();
    }
  };

  // Reset for next student
  const handleNextStudent = () => {
    sound.playKeyClick();
    setArenaState('NAME_INPUT');
    setStudentName('');
    setTypedInput('');
    typedInputRef.current = '';
    setFinalRecord(null);
  };

  // Confetti helper
  const launchSuperCelebration = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 90,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 90,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 300);
    } catch {}
  };

  // Resolve duel players safely
  const resolvedP1 = duelP1Result || duelP1ResultRef.current || (
    activeDuel ? {
      name: activeDuel.player1.name,
      group: activeDuel.player1.groupOrTeam,
      score: activeDuel.player1Score?.score ?? activeDuel.player1.score,
      wpm: activeDuel.player1Score?.wpm ?? activeDuel.player1.wpm,
      accuracy: activeDuel.player1Score?.accuracy ?? activeDuel.player1.accuracy,
      typos: activeDuel.player1Score?.typos ?? activeDuel.player1.typos,
      correctChars: activeDuel.player1.correctChars
    } : null
  );
  const resolvedP2 = duelP2Result || duelP2ResultRef.current || (
    activeDuel && (duelTurn === 2 || duelTurnRef.current === 2) && finalRecord ? {
      name: activeDuel.player2.name,
      group: activeDuel.player2.groupOrTeam,
      score: finalRecord.score,
      wpm: finalRecord.wpm,
      accuracy: finalRecord.accuracy,
      typos: finalRecord.typos,
      correctChars: finalRecord.correctChars
    } : null
  );

  // Evaluate duel winner if both results are available
  let duelWinnerData: {
    winner: StudentRecord;
    runnerUp: StudentRecord;
    winnerScore: number;
    winnerWpm: number;
    winnerAccuracy: number;
    runnerUpScore: number;
    runnerUpWpm: number;
    runnerUpAccuracy: number;
    winnerIsP1: boolean;
  } | null = null;

  if (activeDuel && resolvedP1 && resolvedP2) {
    const p1 = resolvedP1;
    const p2 = resolvedP2;

    let winnerIsP1 = true;
    if (p2.score > p1.score) {
      winnerIsP1 = false;
    } else if (p2.score === p1.score) {
      if (p2.accuracy > p1.accuracy) winnerIsP1 = false;
      else if (p2.accuracy === p1.accuracy) {
        if (p2.typos < p1.typos) winnerIsP1 = false;
        else if (p2.wpm > p1.wpm) winnerIsP1 = false;
      }
    }

    duelWinnerData = {
      winner: winnerIsP1 ? activeDuel.player1 : activeDuel.player2,
      runnerUp: winnerIsP1 ? activeDuel.player2 : activeDuel.player1,
      winnerScore: winnerIsP1 ? p1.score : p2.score,
      winnerWpm: winnerIsP1 ? p1.wpm : p2.wpm,
      winnerAccuracy: winnerIsP1 ? p1.accuracy : p2.accuracy,
      runnerUpScore: winnerIsP1 ? p2.score : p1.score,
      runnerUpWpm: winnerIsP1 ? p2.wpm : p1.wpm,
      runnerUpAccuracy: winnerIsP1 ? p2.accuracy : p1.accuracy,
      winnerIsP1
    };
  }

  return (
    <div className="relative">
      
      {/* 1. NAME & GROUP INPUT STAGE */}
      {arenaState === 'NAME_INPUT' && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-6 sm:p-10 max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95">
          
          {/* ACTIVE DUEL MATCH BANNER (GRAND FINAL OR PLAYOFF) */}
          {activeDuel && (
            <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-amber-500 text-white rounded-2xl p-4 sm:p-5 shadow-lg border-2 border-yellow-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-2xs">
                  {activeDuel.isGrandFinal ? '👑 BABAK GRAND FINAL 1 VS 1' : '⚔️ DUEL PLAYOFF 1 VS 1'}
                </span>
                {onCancelDuel && (
                  <button
                    type="button"
                    onClick={onCancelDuel}
                    className="text-xs text-white/90 hover:text-white underline cursor-pointer"
                  >
                    Batal Duel
                  </button>
                )}
              </div>
              <div className="text-base sm:text-lg font-black tracking-tight">
                {activeDuel.title}
              </div>
              <div className="p-3 bg-black/25 rounded-xl text-xs space-y-1">
                <div className="font-bold flex items-center justify-between text-yellow-200">
                  <span>Ronde 1: {activeDuel.player1.name} (Juara 1 Bertahan)</span>
                  <span>vs</span>
                  <span>Ronde 2: {activeDuel.player2.name} (Penantang)</span>
                </div>
                <p className="text-white/95 text-[11px] leading-relaxed">
                  {duelTurn === 1
                    ? `Giliran 1: ${activeDuel.player1.name} maju ke depan laptop guru! Pasang skor setinggi mungkin untuk mempertahankan mahkota Juara 1!`
                    : `Giliran 2: ${activeDuel.player2.name} maju ke depan laptop guru! Kalahkan skor ${resolvedP1?.score} poin milik ${activeDuel.player1.name}!`}
                </p>
              </div>
            </div>
          )}

          {/* PLAYOFF REMATCH BANNER */}
          {!activeDuel && playoffCandidate && (
            <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-2xl p-4 sm:p-5 shadow-md border-2 border-amber-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded-full">
                  ⚔️ MODE TANDING ULANG (PLAYOFF)
                </span>
                {onCancelPlayoff && (
                  <button
                    type="button"
                    onClick={onCancelPlayoff}
                    className="text-xs text-white/90 hover:text-white underline cursor-pointer"
                  >
                    Batal Playoff
                  </button>
                )}
              </div>
              <div className="text-base sm:text-lg font-black tracking-tight">
                Perebutan {playoffCandidate.rankLabel}
              </div>
              <p className="text-xs text-amber-100 leading-relaxed font-medium">
                Giliran <strong className="text-white underline">{playoffCandidate.student.name}</strong> tanding ulang! Cetak skor terbanyak dan ketik secepat mungkin (kalahkan skor imbang {playoffCandidate.targetScore} poin) untuk memenangkan posisi podium!
              </p>
            </div>
          )}

          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-md">
              {activeDuel ? <Crown className="w-9 h-9" /> : <Keyboard className="w-9 h-9" />}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {activeDuel 
                ? `${activeDuel.isGrandFinal ? 'Grand Final' : 'Duel Playoff'}: Giliran ${studentName}`
                : playoffCandidate 
                ? `Babak Playoff: ${playoffCandidate.student.name}` 
                : 'Giliran Siswa Maju ke Depan'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              {activeDuel
                ? `Giliran ${duelTurn} dari 2. Silakan ${studentName} duduk di depan keyboard dan bersiap!`
                : playoffCandidate 
                ? 'Pastikan jari-jari tangan di posisi home row keyboard. Klik tombol siap untuk memulai duel!'
                : 'Silakan perwakilan siswa maju ke depan laptop guru, masukkan nama panggilanmu, lalu tekan tombol siap untuk memulai balapan!'}
            </p>
          </div>

          <form onSubmit={handleStartCountdown} className="space-y-4">
            
            {/* Input Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Panggilan Siswa:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={!!activeDuel}
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Contoh: Budi, Siti, Rian, Dina..."
                  className={`w-full text-lg sm:text-xl font-extrabold px-4 py-3.5 rounded-xl border-2 border-slate-300 focus:border-orange-500 focus:outline-none shadow-inner ${
                    activeDuel ? 'bg-amber-50 text-amber-950 font-black cursor-not-allowed' : 'bg-slate-50 focus:bg-white text-slate-900'
                  }`}
                  autoFocus
                />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
            </div>

            {/* Optional Group / Team Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kelompok / Tim (Opsional):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Umum', 'Tim Putri 👧', 'Tim Putra 👦', 'Kelompok 1', 'Kelompok 2', 'Kelompok 3', 'Kelompok 4'].map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setSelectedGroup(grp)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                      selectedGroup === grp
                        ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {grp}
                  </button>
                ))}
              </div>
            </div>

            {/* Challenge Info Preview */}
            <div className="p-3.5 bg-emerald-50/90 border border-emerald-300 rounded-xl text-xs space-y-1.5">
              <div className="font-extrabold text-emerald-950 flex items-center justify-between">
                <span className="flex items-center gap-1.5 truncate">
                  <span>📖</span>
                  <span>{snippet.title}</span>
                </span>
                <span className="font-mono text-emerald-800 bg-emerald-200/80 px-2.5 py-0.5 rounded-full font-black text-[11px] shrink-0">
                  {config.mode === 'fixed_time' ? `${config.timeLimit} Detik` : 'Sampai Selesai'}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap text-[11px] text-emerald-900 font-medium">
                <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-emerald-300 font-bold text-emerald-800 text-[10px]">
                  🟢 100% Huruf Kecil & Angka
                </span>
                <span className="text-emerald-900 leading-relaxed">
                  Tidak perlu tekan tombol Shift! Ketik santai seperti membaca cerita pendek.
                </span>
              </div>
            </div>

            {/* Playoff & Tie Rules Info Tooltip Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 bg-amber-50/90 border border-amber-300 rounded-xl text-xs">
              <div className="flex items-center gap-2 text-amber-950 font-bold">
                <Scale className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Bagaimana jika skormu sama dengan teman lain?</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playKeyClick();
                  setShowRulesModal(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-100 border border-amber-400 text-amber-950 font-black rounded-lg text-xs shadow-2xs transition-colors cursor-pointer shrink-0"
                title="Buka transparansi aturan penanganan skor seri & playoff"
              >
                <HelpCircle className="w-3.5 h-3.5 text-orange-600" />
                <span>Sistem Playoff & Aturan Seri ℹ️</span>
              </button>
            </div>

            {/* Start Button */}
            <button
              type="submit"
              disabled={!studentName.trim()}
              className={`w-full py-4 rounded-xl font-black text-base sm:text-lg text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                studentName.trim()
                  ? 'bg-orange-500 hover:bg-orange-600 active:scale-98 cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed opacity-70'
              }`}
            >
              <Play className="w-5 h-5 fill-white" />
              <span>SIAP KETIK! MULAI HITUNG MUNDUR</span>
            </button>

          </form>
        </div>
      )}

      {/* 2. DRAMATIC 3-2-1 COUNTDOWN OVERLAY */}
      {arenaState === 'COUNTDOWN' && (
        <div className="bg-white rounded-2xl border-2 border-slate-300 p-12 shadow-xl max-w-xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
            Persiapan untuk: {studentName} ({selectedGroup})
          </span>
          <div className="text-8xl sm:text-9xl font-black font-mono text-orange-500 animate-pulse my-4">
            {countdownVal}
          </div>
          <div className="max-w-md mx-auto p-3.5 bg-amber-50/80 border border-amber-300 rounded-xl space-y-1">
            <p className="text-xs sm:text-sm font-black text-amber-950">
              💡 Posisi Kunci Mengetik 10 Jari (Home Row):
            </p>
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              Raba <strong>garis timbul kecil</strong> di tombol <span className="font-mono font-bold bg-white text-slate-900 px-1.5 py-0.5 rounded border border-amber-300">F</span> (telunjuk kiri) & <span className="font-mono font-bold bg-white text-slate-900 px-1.5 py-0.5 rounded border border-amber-300">J</span> (telunjuk kanan) agar bisa mengetik cepat tanpa melihat keyboard!
            </p>
          </div>
        </div>
      )}

      {/* 3. ACTIVE TYPING ARENA */}
      {arenaState === 'ACTIVE_TYPING' && (
        <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl p-5 sm:p-8 max-w-4xl mx-auto space-y-6">
          
          {/* Top Live Metrics Dashboard */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
                {studentName}
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                {selectedGroup}
              </span>
            </div>

            {/* Live Stats */}
            <div className="flex items-center gap-3 sm:gap-6 font-mono">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">WPM</span>
                <span className="text-xl sm:text-2xl font-black text-blue-900">{wpm}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Akurasi</span>
                <span className={`text-xl sm:text-2xl font-black ${accuracy >= 90 ? 'text-emerald-600' : 'text-orange-600'}`}>
                  {accuracy}%
                </span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Salah (Typo)</span>
                <span className={`text-xl sm:text-2xl font-black ${typoCount === 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {typoCount}
                </span>
              </div>
              {config.mode === 'fixed_time' && (
                <div className="text-center bg-orange-50 px-3 py-1 rounded-xl border border-orange-200">
                  <span className="text-[10px] text-orange-600 font-bold uppercase block flex items-center gap-1 justify-center">
                    <Timer className="w-3 h-3" /> Sisa Waktu
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-orange-600">
                    {timeLeft}s
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Target Text Display Box with Word/Char Highlights */}
          <div className="relative p-6 sm:p-8 bg-slate-50 rounded-2xl border-2 border-slate-200 text-lg sm:text-2xl font-mono leading-relaxed tracking-wide select-none">
            <div className="whitespace-pre-wrap break-words">
              {targetChars.split('').map((char, index) => {
                let colorClass = 'text-slate-400';
                let bgClass = '';
                const isCurrent = index === typedInput.length;

                if (index < typedInput.length) {
                  if (typedInput[index] === char) {
                    colorClass = 'text-emerald-700 font-bold';
                  } else {
                    colorClass = 'text-red-600 font-black';
                    bgClass = 'bg-red-100 rounded';
                  }
                }

                return (
                  <span
                    key={index}
                    className={`${colorClass} ${bgClass} ${
                      isCurrent ? 'border-b-4 border-orange-500 bg-orange-100 text-slate-900 rounded-xs animate-pulse' : ''
                    }`}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Hidden/Real Input Handler */}
          <div className="space-y-2">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={typedInput}
                onChange={handleInputChange}
                className="w-full text-base sm:text-lg font-mono px-4 py-3.5 rounded-xl border-2 border-orange-400 focus:border-orange-600 focus:outline-none bg-white text-slate-900 shadow-md"
                placeholder="Ketik teks di atas di sini..."
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>
            
            {/* Real-time Progress Bar */}
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-150"
                style={{
                  width: `${Math.min(100, (typedInput.length / targetChars.length) * 100)}%`
                }}
              />
            </div>
          </div>

        </div>
      )}

      {/* 4. FINISHED SESSION RESULTS SCREEN */}
      {arenaState === 'SUMMARY' && finalRecord && (
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* SPECIAL DUEL ROUND 1 FINISHED SCREEN (WAITING FOR PLAYER 2) */}
          {activeDuel && (duelTurn === 1 && !duelP2Result && !duelP2ResultRef.current) && resolvedP1 && (
            <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-amber-50 border-3 border-amber-400 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95">
              <span className="text-xs font-black uppercase tracking-widest text-purple-900 bg-purple-200 px-3.5 py-1 rounded-full shadow-2xs font-mono">
                ✅ RONDE 1 SELESAI
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                Skor {resolvedP1.name}: <span className="text-orange-600">{resolvedP1.score} Poin</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-mono">
                {resolvedP1.wpm} WPM · {resolvedP1.accuracy}% Akurasi · {resolvedP1.typos} Typo
              </p>

              {/* Hype Box for Round 2 */}
              <div className="p-5 bg-white rounded-2xl border-2 border-purple-200 shadow-sm text-xs text-slate-800 space-y-2">
                <div className="flex items-center justify-center gap-2 text-purple-950 font-black text-base">
                  <Swords className="w-5 h-5 text-purple-700 animate-pulse" />
                  <span>SEKARANG GILIRAN 2: {activeDuel.player2.name.toUpperCase()} MAJU!</span>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {resolvedP1.name} sudah memasang target <strong>{resolvedP1.score} Poin</strong>. Sekarang giliran <strong>{activeDuel.player2.name}</strong> untuk maju ke depan laptop guru dan membuktikan apakah bisa melampaui skor ini!
                </p>
              </div>

              <button
                onClick={() => {
                  sound.playBattleGong();
                  duelTurnRef.current = 2;
                  setDuelTurn(2);
                  runCountdownToStart(
                    activeDuel.player2.name,
                    activeDuel.player2.groupOrTeam || 'Umum'
                  );
                }}
                className="w-full py-4 rounded-xl font-black text-base sm:text-lg text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Swords className="w-5 h-5 fill-white" />
                <span>MULAI GILIRAN 2: {activeDuel.player2.name} MAJU KE LAPTOP! 🚀</span>
              </button>
            </div>
          )}

          {/* SPECIAL DUEL ROUND 2 FINISHED (FINAL HEAD-TO-HEAD WINNER ANNOUNCEMENT) */}
          {activeDuel && (duelTurn === 2 || duelP2Result !== null || duelP2ResultRef.current !== null) && resolvedP1 && resolvedP2 && duelWinnerData && (
            <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-4 border-amber-400 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-5 animate-in zoom-in-95">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center font-black text-4xl shadow-xl ring-4 ring-amber-300 animate-bounce">
                👑
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-amber-950 bg-amber-300 px-4 py-1 rounded-full shadow-2xs font-mono">
                {activeDuel.isGrandFinal ? 'HASIL RESMI BABAK GRAND FINAL 1 VS 1' : 'HASIL DUEL PLAYOFF 1 VS 1'}
              </span>
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  PEMENANG: <span className="text-amber-600">{duelWinnerData.winner.name}! 🏆</span>
                </h2>
                <p className="text-sm font-extrabold text-amber-800 mt-1">
                  {activeDuel.isGrandFinal 
                    ? `${duelWinnerData.winner.name} Resmi Dinobatkan Sebagai JUARA 1 SEJATI Turnamen Kelas!` 
                    : `${duelWinnerData.winner.name} Berhak Mendapatkan Posisi Juara ${activeDuel.tier}!`}
                </p>
              </div>

              {/* Side-by-Side Head to Head Score Cards */}
              <div className="grid grid-cols-2 gap-3.5 max-w-md mx-auto text-xs pt-2">
                
                {/* Contender 1 */}
                <div className={`p-4 rounded-2xl border-2 text-center space-y-1 shadow-sm ${
                  duelWinnerData.winnerIsP1 
                    ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-300' 
                    : 'bg-white border-slate-200 opacity-90'
                }`}>
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Ronde 1: {resolvedP1.name}</span>
                  <div className="text-3xl font-black font-mono text-slate-900">{resolvedP1.score} pt</div>
                  <div className="text-[11px] text-slate-600 font-mono">{resolvedP1.wpm} WPM · {resolvedP1.accuracy}%</div>
                  {duelWinnerData.winnerIsP1 && (
                    <span className="inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white">
                      PEMENANG 👑
                    </span>
                  )}
                </div>

                {/* Contender 2 */}
                <div className={`p-4 rounded-2xl border-2 text-center space-y-1 shadow-sm ${
                  !duelWinnerData.winnerIsP1 
                    ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-300' 
                    : 'bg-white border-slate-200 opacity-90'
                }`}>
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Ronde 2: {resolvedP2.name}</span>
                  <div className="text-3xl font-black font-mono text-slate-900">{resolvedP2.score} pt</div>
                  <div className="text-[11px] text-slate-600 font-mono">{resolvedP2.wpm} WPM · {resolvedP2.accuracy}%</div>
                  {!duelWinnerData.winnerIsP1 && (
                    <span className="inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white">
                      PEMENANG 👑
                    </span>
                  )}
                </div>

              </div>

              {/* Confirm & Ratify Button */}
              {onDuelFinished && (
                <button
                  onClick={() => {
                    onDuelFinished({
                      winner: duelWinnerData!.winner,
                      runnerUp: duelWinnerData!.runnerUp,
                      isGrandFinal: activeDuel.isGrandFinal,
                      tier: activeDuel.tier,
                      winnerScore: duelWinnerData!.winnerScore,
                      winnerWpm: duelWinnerData!.winnerWpm,
                      winnerAccuracy: duelWinnerData!.winnerAccuracy,
                      runnerUpScore: duelWinnerData!.runnerUpScore,
                      runnerUpWpm: duelWinnerData!.runnerUpWpm,
                      runnerUpAccuracy: duelWinnerData!.runnerUpAccuracy
                    });
                    setArenaState('NAME_INPUT');
                    setStudentName('');
                    setTypedInput('');
                    typedInputRef.current = '';
                    setFinalRecord(null);
                  }}
                  className="w-full py-4 rounded-xl font-black text-base sm:text-lg text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trophy className="w-5 h-5 fill-white" />
                  <span>🎉 SAHKAN HASIL JUARA KE PAPAN PERINGKAT!</span>
                </button>
              )}
            </div>
          )}

          {/* STANDARD RESULTS SCREEN (WHEN NOT IN ACTIVE DUEL) */}
          {!activeDuel && (
            <div
              className={`rounded-3xl p-6 sm:p-10 shadow-2xl max-w-2xl mx-auto space-y-6 text-center transition-all animate-in fade-in zoom-in-95 duration-200 ${
                isNewHighScore
                  ? 'bg-gradient-to-b from-amber-50 via-yellow-50/70 to-orange-50/90 border-4 border-amber-400 ring-8 ring-amber-300/40 shadow-amber-200/80 scale-[1.02]'
                  : 'bg-white border-2 border-slate-300'
              }`}
            >
              {isNewHighScore ? (
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-md animate-bounce">
                    <span>👑</span>
                    <span>WINNER! REKOR BARU KELAS TERPECAHKAN!</span>
                    <span>👑</span>
                  </div>

                  <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center font-black text-3xl shadow-lg ring-4 ring-amber-300 animate-pulse">
                    🏆
                  </div>

                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                      SELAMAT, {finalRecord.name}!
                    </h2>
                    <p className="text-sm sm:text-base font-extrabold text-amber-700 mt-1 flex items-center justify-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Kamu Resmi Menjadi Juara 1 Sementara di Papan Peringkat!</span>
                      <Sparkles className="w-4 h-4 text-amber-600" />
                    </p>
                    {previousRecordScore > 0 && (
                      <p className="text-xs font-semibold text-slate-600 mt-0.5">
                        Berhasil melampaui rekor kelas sebelumnya ({previousRecordScore} Poin)!
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold shadow-xs">
                    {finalRecord.isPlayoff ? <Swords className="w-9 h-9 text-orange-600" /> : <Trophy className="w-9 h-9" />}
                  </div>
                  {finalRecord.isPlayoff && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-800 text-xs font-black rounded-full mb-1">
                      <Swords className="w-3.5 h-3.5" />
                      <span>HASIL BABAK PLAYOFF / PENENTUAN JUARA</span>
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                    Hasil Sesi Mengetik
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Kerja Bagus, {finalRecord.name}! 🎉
                  </h2>
                  {finalRecord.groupOrTeam && (
                    <span className="text-xs font-semibold text-slate-500">
                      Mewakili {finalRecord.groupOrTeam}
                    </span>
                  )}
                </div>
              )}

              {/* Big Score Spotlight */}
              <div
                className={`rounded-2xl p-6 shadow-sm border-2 ${
                  isNewHighScore
                    ? 'bg-white/90 border-amber-400 shadow-amber-100'
                    : 'bg-gradient-to-b from-amber-50 to-orange-50 border-amber-300'
                }`}
              >
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
                  Skor Akhir Turnamen ({finalRecord.timeSpent} Detik)
                </span>
                <div className="text-5xl sm:text-6xl font-black font-mono text-amber-600 my-1">
                  {finalRecord.score} <span className="text-base font-semibold text-slate-500">Poin</span>
                </div>
                <p className="text-xs font-semibold text-slate-600 mt-1">
                  {finalRecord.correctChars} Karakter Benar – Penalti {finalRecord.typos * 3} Poin ({finalRecord.typos} Typo Salah)
                </p>
              </div>

              {/* Breakdown Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 bg-white/90 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-400 font-semibold block mb-0.5">Karakter / {finalRecord.timeSpent}s</span>
                  <div className="text-2xl font-black font-mono text-emerald-600">
                    {finalRecord.correctChars} <span className="text-xs font-normal text-slate-500">huruf</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Total: {finalRecord.charsTyped} ketikan</span>
                </div>
                <div className="p-3 bg-white/90 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-400 font-semibold block mb-0.5">Typo (Dinilai)</span>
                  <div className={`text-2xl font-black font-mono ${finalRecord.typos === 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {finalRecord.typos} <span className="text-xs font-normal text-slate-500">typo</span>
                  </div>
                  <span className="text-[10px] text-red-500 font-medium">-{finalRecord.typos * 3} Poin penalti</span>
                </div>
                <div className="p-3 bg-white/90 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-400 font-semibold block mb-0.5">Akurasi Ketik</span>
                  <div className="text-2xl font-black font-mono text-blue-900">{finalRecord.accuracy}%</div>
                  <span className="text-[10px] text-slate-400">Presisi tombol</span>
                </div>
                <div className="p-3 bg-white/90 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-400 font-semibold block mb-0.5">Kecepatan</span>
                  <div className="text-2xl font-black font-mono text-orange-600">{finalRecord.wpm}</div>
                  <span className="text-[10px] text-slate-400">Kata per Menit</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {isNewHighScore && (
                  <button
                    onClick={launchSuperCelebration}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Tembak Konfeti Pemenang Lagi! 🎉</span>
                  </button>
                )}

                <button
                  onClick={handleNextStudent}
                  className="w-full py-4 rounded-xl font-black text-base sm:text-lg text-white bg-orange-500 hover:bg-orange-600 active:scale-98 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>SISWA BERIKUTNYA MAJU!</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* PLAYOFF RULES TRANSPARENCY MODAL */}
      <PlayoffRulesInfoModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />

    </div>
  );
};
