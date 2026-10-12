import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { TYPING_CHALLENGES } from '../data/typingSnippets';
import { sound } from '../utils/audio';
import { 
  Keyboard, 
  Timer, 
  Flame, 
  Award, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Gauge, 
  Lightbulb,
  ArrowRight
} from 'lucide-react';

interface TypingGameProps {
  onAddXp: (amount: number, reason: string) => void;
  onRecordWpm: (wpm: number) => void;
}

export const TypingGame: React.FC<TypingGameProps> = ({
  onAddXp,
  onRecordWpm
}) => {
  const [selectedChallengeIdx, setSelectedChallengeIdx] = useState<number>(0);
  const activeChallenge = TYPING_CHALLENGES[selectedChallengeIdx];

  const [inputVal, setInputVal] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(activeChallenge.timeLimit);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [errorsCount, setErrorsCount] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Switch challenge
  const handleSelectChallenge = (idx: number) => {
    sound.playKeyClick();
    setSelectedChallengeIdx(idx);
    resetGame(TYPING_CHALLENGES[idx]);
  };

  const resetGame = (challenge = activeChallenge) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setInputVal('');
    setTimeLeft(challenge.timeLimit);
    setIsRunning(false);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(100);
    setStreak(0);
    setMaxStreak(0);
    setErrorsCount(0);
    startTimeRef.current = null;
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Timer countdown hook
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            finishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  // Finish game handler
  const finishGame = () => {
    setIsRunning(false);
    setIsFinished(true);
    sound.playLevelUp();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    const calculatedXp = Math.max(50, Math.round(wpm * 2 + (accuracy > 90 ? 40 : 10)));
    onAddXp(calculatedXp, `Balap Ketik MS Word: ${wpm} WPM (${accuracy}% Akurasi)`);
    onRecordWpm(wpm);
  };

  // Keystroke handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (isFinished) return;

    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now();
    }

    sound.playKeyClick();
    setInputVal(val);

    const targetText = activeChallenge.text;
    let correctCount = 0;
    let totalErrors = 0;
    let currentStreakCount = 0;

    for (let i = 0; i < val.length; i++) {
      if (val[i] === targetText[i]) {
        correctCount++;
        currentStreakCount++;
      } else {
        totalErrors++;
        currentStreakCount = 0;
      }
    }

    setStreak(currentStreakCount);
    if (currentStreakCount > maxStreak) {
      setMaxStreak(currentStreakCount);
    }
    setErrorsCount(totalErrors);

    // Calculate live WPM
    const timeElapsedSec = startTimeRef.current
      ? (Date.now() - startTimeRef.current) / 1000
      : 1;
    const timeElapsedMin = Math.max(timeElapsedSec / 60, 0.05);
    const calculatedWpm = Math.round((correctCount / 5) / timeElapsedMin);
    setWpm(calculatedWpm);

    // Calculate live Accuracy
    const calculatedAcc = val.length > 0
      ? Math.max(0, Math.round((correctCount / val.length) * 100))
      : 100;
    setAccuracy(calculatedAcc);

    // If fully typed target text
    if (val === targetText) {
      if (timerRef.current) clearInterval(timerRef.current);
      finishGame();
    }
  };

  // Render character colored stream
  const targetChars = activeChallenge.text.split('');
  const inputChars = inputVal.split('');

  // Performance Rating Badge
  const getRating = () => {
    if (wpm >= 50 && accuracy >= 95) return { title: 'Pembalap Kilat MS Word ⚡', color: 'text-amber-600', badge: 'Master Keyboard' };
    if (wpm >= 35 && accuracy >= 90) return { title: 'Operator Terampil Informatika 🚀', color: 'text-blue-600', badge: 'Mahir' };
    return { title: 'Pengetik Pemula Berbakat 💡', color: 'text-emerald-600', badge: 'Terus Berlatih' };
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold">
            <Keyboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">
                Balap Mengetik Cepat & Shortcut MS Word
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-orange-100 text-orange-800">
                Uji Kecepatan & Akurasi
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Ketikkan teks materi dan kombinasi shortcut keyboard Microsoft Word secepat dan seakurat mungkin sebelum waktu habis!
            </p>
          </div>
        </div>

        {/* Challenge Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedChallengeIdx}
            onChange={(e) => handleSelectChallenge(Number(e.target.value))}
            className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            {TYPING_CHALLENGES.map((ch, idx) => (
              <option key={ch.id} value={idx}>
                {ch.title} ({ch.timeLimit}s)
              </option>
            ))}
          </select>
          <button
            onClick={() => resetGame()}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200"
            title="Ulangi Tantangan"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Metrics HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kecepatan</div>
            <div className="text-lg font-black text-slate-900 font-mono">
              {wpm} <span className="text-xs font-semibold text-slate-500">WPM</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Akurasi</div>
            <div className="text-lg font-black text-slate-900 font-mono">
              {accuracy}%
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Waktu Sisa</div>
            <div className={`text-lg font-black font-mono ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-slate-900'}`}>
              {timeLeft} <span className="text-xs font-semibold text-slate-500">detik</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Combo Streak</div>
            <div className="text-lg font-black text-slate-900 font-mono">
              {streak} <span className="text-xs font-semibold text-slate-500">karakter</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Typing Arena */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        
        {/* Hint Banner */}
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
          <span><strong>Petunjuk Materi:</strong> {activeChallenge.hint}</span>
        </div>

        {/* Text Display Canvas with Highlight */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="min-h-[140px] p-5 bg-slate-50 border border-slate-300 rounded-xl text-base sm:text-lg leading-relaxed font-mono select-none cursor-text tracking-wide relative overflow-hidden"
        >
          {targetChars.map((char, idx) => {
            const isTyped = idx < inputChars.length;
            const isCorrect = isTyped && inputChars[idx] === char;
            const isCurrent = idx === inputChars.length;

            return (
              <span
                key={idx}
                className={`transition-colors ${
                  isCurrent
                    ? 'bg-blue-600 text-white rounded-xs px-0.5 animate-pulse font-bold'
                    : isTyped
                    ? isCorrect
                      ? 'text-emerald-700 bg-emerald-100/60 font-semibold'
                      : 'text-red-600 bg-red-100 underline decoration-red-500 font-bold'
                    : 'text-slate-400'
                }`}
              >
                {char}
              </span>
            );
          })}
        </div>

        {/* Real typing input box */}
        <div>
          <input
            ref={inputRef}
            type="text"
            disabled={isFinished}
            value={inputVal}
            onChange={handleInputChange}
            placeholder={
              isRunning
                ? 'Terus ketikkan teks di atas...'
                : 'Ketik di sini untuk memulai balapan...'
            }
            className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 focus:border-orange-500 focus:outline-none font-mono text-base text-slate-900 shadow-inner bg-white"
            autoFocus
          />
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-orange-500 h-full transition-all duration-150"
            style={{
              width: `${Math.min(100, (inputVal.length / targetChars.length) * 100)}%`
            }}
          />
        </div>
      </div>

      {/* FINISHED SUMMARY MODAL */}
      {isFinished && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-300 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            
            <div className="text-center space-y-1">
              <div className="w-14 h-14 mx-auto rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold mb-2">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Balap Ketik Selesai! 🎉
              </h3>
              <p className={`text-xs font-bold ${getRating().color}`}>
                {getRating().title}
              </p>
            </div>

            {/* Performance Stats Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs">
              <div className="p-2">
                <div className="text-slate-400 font-semibold mb-0.5">Kecepatan Ketik</div>
                <div className="text-xl font-black text-slate-900 font-mono">
                  {wpm} <span className="text-xs font-medium text-slate-500">WPM</span>
                </div>
              </div>
              <div className="p-2">
                <div className="text-slate-400 font-semibold mb-0.5">Akurasi Karakter</div>
                <div className="text-xl font-black text-emerald-600 font-mono">
                  {accuracy}%
                </div>
              </div>
              <div className="p-2">
                <div className="text-slate-400 font-semibold mb-0.5">Streak Tertinggi</div>
                <div className="text-base font-bold text-orange-600 font-mono">
                  {maxStreak} Karakter
                </div>
              </div>
              <div className="p-2">
                <div className="text-slate-400 font-semibold mb-0.5">Kesalahan Ketik</div>
                <div className="text-base font-bold text-red-500 font-mono">
                  {errorsCount} Typo
                </div>
              </div>
            </div>

            {/* Shortcut Cheatsheet Card */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-1">
              <div className="font-bold text-blue-950 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                <span>Pengingat Shortcut MS Word:</span>
              </div>
              <p className="text-blue-900 text-[11px] leading-relaxed">
                Ctrl+B (Bold), Ctrl+I (Italic), Ctrl+U (Underline), Ctrl+J (Justify), Ctrl+H (Replace), Ctrl+S (Save), F12 (Save As).
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => resetGame()}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Coba Lagi
              </button>
              <button
                onClick={() => {
                  const nextIdx = (selectedChallengeIdx + 1) % TYPING_CHALLENGES.length;
                  handleSelectChallenge(nextIdx);
                }}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                Tantangan Berikutnya
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
