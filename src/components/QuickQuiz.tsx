import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { QuizQuestion } from '../types/wordGame';
import { WORD_QUESTIONS } from '../data/wordQuestions';
import { sound } from '../utils/audio';
import { 
  Gamepad2, 
  Timer, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Sparkles, 
  HelpCircle, 
  Award,
  ArrowRight
} from 'lucide-react';

interface QuickQuizProps {
  onAddXp: (amount: number, reason: string) => void;
}

export const QuickQuiz: React.FC<QuickQuizProps> = ({ onAddXp }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [isQuizComplete, setIsQuizComplete] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<{ qId: string; userIndex: number; isCorrect: boolean }[]>([]);

  // Shuffle 8 questions on start
  const startQuiz = () => {
    sound.playKeyClick();
    const shuffled = [...WORD_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 8);
    setQuestions(shuffled);
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setTimeLeft(20);
    setIsQuizComplete(false);
    setUserAnswers([]);
  };

  useEffect(() => {
    startQuiz();
  }, []);

  // Timer per question
  useEffect(() => {
    if (isAnswered || isQuizComplete || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIdx, isAnswered, isQuizComplete, questions]);

  const handleTimeOut = () => {
    if (isAnswered) return;
    sound.playFail();
    setIsAnswered(true);
    setSelectedOption(-1);
    const q = questions[currentIdx];
    setUserAnswers(prev => [...prev, { qId: q.id, userIndex: -1, isCorrect: false }]);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const q = questions[currentIdx];
    const isCorrect = idx === q.correctIndex;

    if (isCorrect) {
      sound.playSuccess();
      setScore(prev => prev + 10);
      onAddXp(20, 'Menjawab Benar Soal Kuis MS Word');
    } else {
      sound.playFail();
    }

    setUserAnswers(prev => [...prev, { qId: q.id, userIndex: idx, isCorrect }]);
  };

  const handleNextQuestion = () => {
    sound.playKeyClick();
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(20);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsQuizComplete(true);
    sound.playLevelUp();
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {}

    const totalXpEarned = score * 5 + 50;
    onAddXp(totalXpEarned, `Menyelesaikan Kuis Kilat MS Word (${score} Poin)`);
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
      
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold">
            <Gamepad2 className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              Arena Kuis Kilat MS Word
            </h1>
            <p className="text-xs text-slate-500">
              Uji pemahamanmu tentang Ribbon, Shortcut, Page Setup, & Fitur Lanjut Informatika.
            </p>
          </div>
        </div>

        <button
          onClick={startQuiz}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Kuis Baru</span>
        </button>
      </div>

      {!isQuizComplete && currentQ ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
          
          {/* Header Indicators: Progress & Timer */}
          <div className="flex items-center justify-between border-b pb-3 text-xs">
            <div className="font-semibold text-slate-600">
              Soal <strong className="text-blue-900 font-extrabold">{currentIdx + 1}</strong> dari {questions.length}
            </div>

            <div className="flex items-center gap-3">
              <span className="font-semibold text-blue-900">
                Skor: <strong className="font-mono text-sm">{score}</strong>
              </span>

              <div className={`flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded ${
                timeLeft <= 5 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-slate-100 text-slate-700'
              }`}>
                <Timer className="w-3.5 h-3.5" />
                <span>{timeLeft}s</span>
              </div>
            </div>
          </div>

          {/* Question Text */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider mb-1 font-mono">
              Kategori: {currentQ.category}
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">
              {currentQ.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let style = 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800';
              if (isAnswered) {
                if (isCorrect) {
                  style = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                } else if (isSelected) {
                  style = 'bg-red-50 border-red-400 text-red-900 font-semibold';
                } else {
                  style = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>
                  {isAnswered && isCorrect && (
                    <span className="text-emerald-600 font-bold text-xs shrink-0">✓ Benar</span>
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <span className="text-red-500 font-bold text-xs shrink-0">✕ Salah</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswered && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-1">
              <span className="font-bold text-blue-950 flex items-center gap-1">
                💡 Penjelasan Konsep Informatika:
              </span>
              <p className="text-blue-900 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                <span>{currentIdx + 1 < questions.length ? 'Soal Berikutnya' : 'Lihat Hasil Akhir'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>
      ) : isQuizComplete ? (
        
        /* Quiz Complete Results Screen */
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 text-blue-900 flex items-center justify-center font-bold mb-2">
            <Award className="w-8 h-8 text-orange-500" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Kuis Selesai! 🎉
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Kamu berhasil menyelesaikan 8 soal latihan Microsoft Word Kelas 10.
            </p>
          </div>

          {/* Score Card */}
          <div className="max-w-xs mx-auto p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="text-xs text-slate-400 font-semibold">Skor Akhir</div>
            <div className="text-3xl font-black text-blue-950 font-mono">
              {score} <span className="text-sm font-semibold text-slate-500">/ 80</span>
            </div>
            <div className="text-xs font-bold text-emerald-700">
              +{score * 5 + 50} XP Ditambahkan ke Akun Siswa!
            </div>
          </div>

          {/* Action */}
          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={startQuiz}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              Coba Kuis Lagi
            </button>
          </div>
        </div>

      ) : null}

    </div>
  );
};
