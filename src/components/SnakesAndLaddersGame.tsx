import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Player, QuizQuestion } from '../types/wordGame';
import { WORD_QUESTIONS } from '../data/wordQuestions';
import { sound } from '../utils/audio';
import { 
  Dice1, 
  Dice2, 
  Dice3, 
  Dice4, 
  Dice5, 
  Dice6, 
  Sparkles, 
  ShieldAlert, 
  TrendingUp, 
  RotateCcw, 
  Users, 
  Bot, 
  HelpCircle, 
  Award,
  Zap,
  Volume2
} from 'lucide-react';

interface SnakesAndLaddersProps {
  onAddXp: (amount: number, reason: string) => void;
  onWinGame: () => void;
}

// Ladders: [start, end]
const LADDERS: Record<number, number> = {
  4: 25,
  13: 46,
  33: 68,
  50: 89,
  62: 81,
  74: 92
};

// Snakes: [head, tail]
const SNAKES: Record<number, number> = {
  98: 78,
  95: 56,
  64: 42,
  48: 26,
  34: 8
};

// Bonus Tiles: grant extra surprise
const BONUS_TILES = [19, 41, 58, 85];

export const SnakesAndLaddersGame: React.FC<SnakesAndLaddersProps> = ({
  onAddXp,
  onWinGame
}) => {
  // Game Mode: 'vs_bot' | '2_teams' | '3_teams' | '4_teams'
  const [gameMode, setGameMode] = useState<'vs_bot' | '2_teams' | '3_teams' | '4_teams'>('2_teams');

  const [players, setPlayers] = useState<Player[]>([
    { id: 'p1', name: 'Tim Putri 👧', position: 1, color: 'bg-pink-600', isBot: false, score: 0 },
    { id: 'p2', name: 'Tim Putra 👦', position: 1, color: 'bg-blue-600', isBot: false, score: 0 }
  ]);

  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [diceValue, setDiceValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [gameLog, setGameLog] = useState<string[]>([
    'Selamat datang di Ular Tangga Informatika MS Word! Lempar dadu untuk memulai permainan.'
  ]);

  // Quiz Modal State
  const [activeQuiz, setActiveQuiz] = useState<{
    question: QuizQuestion;
    type: 'ladder' | 'snake' | 'bonus' | 'normal';
    targetPos?: number;
    fallbackPos?: number;
    playerIndex: number;
  } | null>(null);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);

  // Switch game mode
  const handleModeChange = (mode: 'vs_bot' | '2_teams' | '3_teams' | '4_teams') => {
    sound.playKeyClick();
    setGameMode(mode);
    if (mode === 'vs_bot') {
      setPlayers([
        { id: 'p1', name: 'Kamu (Siswa)', position: 1, color: 'bg-blue-600', isBot: false, score: 0 },
        { id: 'p2', name: 'Informatika-Bot 🤖', position: 1, color: 'bg-orange-500', isBot: true, score: 0 }
      ]);
    } else if (mode === '2_teams') {
      setPlayers([
        { id: 'p1', name: 'Tim Putri 👧', position: 1, color: 'bg-pink-600', isBot: false, score: 0 },
        { id: 'p2', name: 'Tim Putra 👦', position: 1, color: 'bg-blue-600', isBot: false, score: 0 }
      ]);
    } else if (mode === '3_teams') {
      setPlayers([
        { id: 'p1', name: 'Kelompok 1 🔵', position: 1, color: 'bg-blue-600', isBot: false, score: 0 },
        { id: 'p2', name: 'Kelompok 2 🟠', position: 1, color: 'bg-orange-500', isBot: false, score: 0 },
        { id: 'p3', name: 'Kelompok 3 🟢', position: 1, color: 'bg-emerald-600', isBot: false, score: 0 }
      ]);
    } else if (mode === '4_teams') {
      setPlayers([
        { id: 'p1', name: 'Tim Calibri 🔵', position: 1, color: 'bg-blue-600', isBot: false, score: 0 },
        { id: 'p2', name: 'Tim Arial 🟠', position: 1, color: 'bg-orange-500', isBot: false, score: 0 },
        { id: 'p3', name: 'Tim Times 🟢', position: 1, color: 'bg-emerald-600', isBot: false, score: 0 },
        { id: 'p4', name: 'Tim Georgia 🟣', position: 1, color: 'bg-purple-600', isBot: false, score: 0 }
      ]);
    }
    setActivePlayerIndex(0);
    setWinner(null);
    setGameLog([`Mode diubah: ${mode.replace('_', ' ').toUpperCase()}.`]);
  };

  const restartGame = () => {
    sound.playKeyClick();
    setPlayers(prev => prev.map(p => ({ ...p, position: 1, score: 0 })));
    setActivePlayerIndex(0);
    setWinner(null);
    setActiveQuiz(null);
    setGameLog(['Permainan dimulai kembali. Lempar dadu!']);
  };

  // Bot Turn Automation
  useEffect(() => {
    const currentPlayer = players[activePlayerIndex];
    if (currentPlayer && currentPlayer.isBot && !winner && !isRolling && !activeQuiz) {
      const timer = setTimeout(() => {
        rollDice();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [activePlayerIndex, isRolling, activeQuiz, winner, players]);

  // Dice Icon Component
  const renderDiceIcon = (val: number) => {
    const props = { className: 'w-10 h-10 text-white' };
    switch (val) {
      case 1: return <Dice1 {...props} />;
      case 2: return <Dice2 {...props} />;
      case 3: return <Dice3 {...props} />;
      case 4: return <Dice4 {...props} />;
      case 5: return <Dice5 {...props} />;
      case 6: return <Dice6 {...props} />;
      default: return <Dice1 {...props} />;
    }
  };

  // Roll Dice Action
  const rollDice = () => {
    if (isRolling || winner || activeQuiz) return;
    setIsRolling(true);
    sound.playDiceRoll();

    let rollCount = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount >= 8) {
        clearInterval(interval);
        const finalVal = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalVal);
        setIsRolling(false);
        processMove(finalVal);
      }
    }, 60);
  };

  // Process player movement
  const processMove = (steps: number) => {
    const player = players[activePlayerIndex];
    let newPos = player.position + steps;

    if (newPos > 100) {
      // Bounce back if over 100
      newPos = 100 - (newPos - 100);
    }

    setGameLog(prev => [
      `${player.name} melempar angka ${steps}, melangkah ke kotak ${newPos}.`,
      ...prev.slice(0, 5)
    ]);

    // Check Victory
    if (newPos === 100) {
      handleVictory(player);
      return;
    }

    // Check Ladder
    if (LADDERS[newPos]) {
      const ladderTop = LADDERS[newPos];
      if (player.isBot) {
        // Bot automatically climbs with 70% chance
        const botSuccess = Math.random() < 0.7;
        if (botSuccess) {
          updatePlayerPosition(activePlayerIndex, ladderTop);
          setGameLog(prev => [`${player.name} berhasil menaiki tangga dari ${newPos} ke ${ladderTop}! 🪜`, ...prev.slice(0, 5)]);
        } else {
          updatePlayerPosition(activePlayerIndex, newPos);
          setGameLog(prev => [`${player.name} gagal menaiki tangga di kotak ${newPos}.`, ...prev.slice(0, 5)]);
        }
        finishTurn();
      } else {
        // Trigger Ladder Challenge Question
        const randomQ = WORD_QUESTIONS[Math.floor(Math.random() * WORD_QUESTIONS.length)];
        setActiveQuiz({
          question: randomQ,
          type: 'ladder',
          targetPos: ladderTop,
          fallbackPos: newPos,
          playerIndex: activePlayerIndex
        });
        setSelectedOption(null);
        setQuizAnswered(false);
      }
      return;
    }

    // Check Snake
    if (SNAKES[newPos]) {
      const snakeTail = SNAKES[newPos];
      if (player.isBot) {
        // Bot avoids snake with 50% chance
        const botShield = Math.random() < 0.5;
        if (botShield) {
          updatePlayerPosition(activePlayerIndex, newPos);
          setGameLog(prev => [`${player.name} berhasil menjawab kuis dan selamat dari ular di kotak ${newPos}! 🛡️`, ...prev.slice(0, 5)]);
        } else {
          updatePlayerPosition(activePlayerIndex, snakeTail);
          sound.playFail();
          setGameLog(prev => [`${player.name} tergigit ular dan melorot dari ${newPos} ke ${snakeTail}! 🐍`, ...prev.slice(0, 5)]);
        }
        finishTurn();
      } else {
        // Trigger Snake Rescue Shield Challenge
        const randomQ = WORD_QUESTIONS[Math.floor(Math.random() * WORD_QUESTIONS.length)];
        setActiveQuiz({
          question: randomQ,
          type: 'snake',
          targetPos: newPos, // Safe position
          fallbackPos: snakeTail, // Slid down position
          playerIndex: activePlayerIndex
        });
        setSelectedOption(null);
        setQuizAnswered(false);
      }
      return;
    }

    // Check Bonus Tile
    if (BONUS_TILES.includes(newPos)) {
      if (player.isBot) {
        updatePlayerPosition(activePlayerIndex, newPos);
        setGameLog(prev => [`${player.name} mendarat di Kotak Bonus ${newPos}! ⭐`, ...prev.slice(0, 5)]);
        finishTurn();
      } else {
        const randomQ = WORD_QUESTIONS[Math.floor(Math.random() * WORD_QUESTIONS.length)];
        setActiveQuiz({
          question: randomQ,
          type: 'bonus',
          targetPos: newPos,
          playerIndex: activePlayerIndex
        });
        setSelectedOption(null);
        setQuizAnswered(false);
      }
      return;
    }

    // Normal move
    updatePlayerPosition(activePlayerIndex, newPos);
    finishTurn();
  };

  const updatePlayerPosition = (pIdx: number, pos: number) => {
    setPlayers(prev => prev.map((p, idx) => idx === pIdx ? { ...p, position: pos } : p));
  };

  const finishTurn = () => {
    setActivePlayerIndex(prev => (prev === 0 ? 1 : 0));
  };

  // Victory celebration
  const handleVictory = (player: Player) => {
    updatePlayerPosition(activePlayerIndex, 100);
    setWinner(player);
    sound.playLevelUp();
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch {}

    if (!player.isBot) {
      onAddXp(300, 'Memenangkan Permainan Ular Tangga Informatika MS Word');
      onWinGame();
    }

    setGameLog(prev => [
      `🏆 LUAR BIASA! ${player.name} memenangkan pertandingan di kotak 100!`,
      ...prev
    ]);
  };

  // Submit Answer in Quiz Modal
  const handleAnswerSubmit = (optionIdx: number) => {
    if (quizAnswered || !activeQuiz) return;
    setSelectedOption(optionIdx);
    setQuizAnswered(true);

    const isCorrect = optionIdx === activeQuiz.question.correctIndex;

    if (isCorrect) {
      sound.playSuccess();
      if (activeQuiz.type === 'ladder') {
        sound.playLadderClimb();
        updatePlayerPosition(activeQuiz.playerIndex, activeQuiz.targetPos!);
        onAddXp(50, 'Jawaban Benar: Naik Tangga Ular Tangga');
        setGameLog(prev => [
          `Kamu menjawab BENAR! 🪜 Memanjat tangga ke kotak ${activeQuiz.targetPos}! (+50 XP)`,
          ...prev.slice(0, 5)
        ]);
      } else if (activeQuiz.type === 'snake') {
        updatePlayerPosition(activeQuiz.playerIndex, activeQuiz.targetPos!);
        onAddXp(40, 'Jawaban Benar: Perisai Anti-Ular');
        setGameLog(prev => [
          `HEBAT! Jawabanmu BENAR! 🛡️ Perisai aktif, kamu TIDAK melorot ke ekor ular! (+40 XP)`,
          ...prev.slice(0, 5)
        ]);
      } else if (activeQuiz.type === 'bonus') {
        updatePlayerPosition(activeQuiz.playerIndex, activeQuiz.targetPos!);
        onAddXp(60, 'Jawaban Benar: Kotak Bonus Bintang');
        setGameLog(prev => [
          `BONUS TERTANGKAP! ⭐ Jawaban benar memberi kamu +60 XP ekstra!`,
          ...prev.slice(0, 5)
        ]);
      }
    } else {
      sound.playFail();
      if (activeQuiz.type === 'ladder') {
        updatePlayerPosition(activeQuiz.playerIndex, activeQuiz.fallbackPos!);
        setGameLog(prev => [
          `Jawaban salah. Kamu tetap berada di kotak ${activeQuiz.fallbackPos}.`,
          ...prev.slice(0, 5)
        ]);
      } else if (activeQuiz.type === 'snake') {
        updatePlayerPosition(activeQuiz.playerIndex, activeQuiz.fallbackPos!);
        setGameLog(prev => [
          `Jawaban salah! 🐍 Terkena sengatan ular dan melorot ke kotak ${activeQuiz.fallbackPos}.`,
          ...prev.slice(0, 5)
        ]);
      } else if (activeQuiz.type === 'bonus') {
        updatePlayerPosition(activeQuiz.playerIndex, activeQuiz.targetPos!);
        setGameLog(prev => [
          `Jawaban bonus salah. Tetap di kotak ${activeQuiz.targetPos}.`,
          ...prev.slice(0, 5)
        ]);
      }
    }
  };

  const handleCloseQuiz = () => {
    setActiveQuiz(null);
    finishTurn();
  };

  // Generate 100 cells (10x10) in serpentine order
  const renderBoardGrid = () => {
    const rows = [];
    for (let r = 9; r >= 0; r--) {
      const cells = [];
      const isEvenRowFromBottom = r % 2 === 0;
      for (let c = 0; c < 10; c++) {
        const cellNum = isEvenRowFromBottom
          ? r * 10 + c + 1
          : r * 10 + (9 - c) + 1;

        const isLadderStart = LADDERS[cellNum] !== undefined;
        const isLadderEnd = Object.values(LADDERS).includes(cellNum);
        const isSnakeHead = SNAKES[cellNum] !== undefined;
        const isSnakeTail = Object.values(SNAKES).includes(cellNum);
        const isBonus = BONUS_TILES.includes(cellNum);

        // Check players in cell
        const playersHere = players.filter(p => p.position === cellNum);

        cells.push(
          <div
            key={cellNum}
            className={`relative flex flex-col justify-between p-1 border border-slate-200 text-[10px] font-bold select-none transition-colors ${
              cellNum % 2 === 0 ? 'bg-white' : 'bg-slate-50'
            } ${
              isSnakeHead ? 'bg-red-50/80 border-red-200' : ''
            } ${
              isLadderStart ? 'bg-emerald-50/80 border-emerald-200' : ''
            } ${
              isBonus ? 'bg-amber-50/80 border-amber-200' : ''
            } ${
              cellNum === 100 ? 'bg-blue-100 border-blue-300 font-extrabold' : ''
            }`}
          >
            {/* Tile Number */}
            <div className="flex items-center justify-between">
              <span className={`font-mono ${cellNum === 100 ? 'text-blue-900 font-black' : 'text-slate-400'}`}>
                {cellNum}
              </span>

              {/* Special Indicators */}
              {isLadderStart && (
                <span className="text-[10px] text-emerald-600 font-bold" title={`Tangga naik ke ${LADDERS[cellNum]}`}>
                  🪜+{LADDERS[cellNum] - cellNum}
                </span>
              )}
              {isSnakeHead && (
                <span className="text-[10px] text-red-600 font-bold" title={`Ular turun ke ${SNAKES[cellNum]}`}>
                  🐍-{cellNum - SNAKES[cellNum]}
                </span>
              )}
              {isBonus && (
                <span className="text-[10px] text-amber-500 font-bold" title="Kotak Bonus XP">
                  ⭐
                </span>
              )}
            </div>

            {/* Cell Middle Feature label */}
            <div className="text-center text-[9px] font-medium text-slate-500 truncate">
              {cellNum === 100 && '🏆 FINISH'}
              {cellNum === 1 && '🚀 START'}
              {cellNum === 4 && 'Ctrl+B'}
              {cellNum === 13 && 'Align'}
              {cellNum === 33 && 'Table'}
              {cellNum === 50 && 'Margin'}
              {cellNum === 74 && 'Mail'}
              {cellNum === 34 && 'Typo!'}
              {cellNum === 64 && 'Unsaved'}
              {cellNum === 95 && 'Error!'}
            </div>

            {/* Players Pawns / Tokens */}
            <div className="flex items-center justify-center gap-1 min-h-[18px]">
              {playersHere.map((p) => (
                <div
                  key={p.id}
                  title={p.name}
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${p.color} text-white flex items-center justify-center text-[9px] sm:text-[10px] font-black shadow-md border-2 border-white ring-1 ring-slate-400/50 animate-bounce`}
                >
                  {p.isBot ? '🤖' : '👤'}
                </div>
              ))}
            </div>
          </div>
        );
      }
      rows.push(
        <div key={r} className="grid grid-cols-10 h-12 sm:h-14">
          {cells}
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">
                Petualangan Ular Tangga Informatika MS Word
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800">
                100 Kotak Kuis
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Jawab kuis Microsoft Word saat mendarat di tangga untuk memanjat, atau selamatkan diri dari gigitan ular dengan Perisai Kuis!
            </p>
          </div>
        </div>

        {/* Mode & Reset Controls */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => handleModeChange('2_teams')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              gameMode === '2_teams' ? 'bg-pink-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>2 Tim (Putri vs Putra)</span>
          </button>
          <button
            onClick={() => handleModeChange('3_teams')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              gameMode === '3_teams' ? 'bg-blue-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>3 Kelompok</span>
          </button>
          <button
            onClick={() => handleModeChange('4_teams')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              gameMode === '4_teams' ? 'bg-purple-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>4 Kelompok</span>
          </button>
          <button
            onClick={() => handleModeChange('vs_bot')}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              gameMode === 'vs_bot' ? 'bg-blue-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Vs Bot</span>
          </button>
          <button
            onClick={restartGame}
            title="Mulai Ulang Permainan"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 ml-1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Game Layout: Board + Control HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Side: 10x10 Board Grid */}
        <div className="lg:col-span-8 bg-white p-3 rounded-xl border border-slate-300 shadow-md">
          <div className="border border-slate-300 rounded-lg overflow-hidden bg-slate-100">
            {renderBoardGrid()}
          </div>

          {/* Board Legend */}
          <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2 px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-300 inline-block" />
              <span>🪜 <strong>Tangga</strong>: Kuis Naik Cepat</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-300 inline-block" />
              <span>🐍 <strong>Ular</strong>: Kuis Penyelamat Perisai</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-300 inline-block" />
              <span>⭐ <strong>Bonus</strong>: Poin XP Ekstra</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-300 inline-block" />
              <span>🏆 <strong>Kotak 100</strong>: Garis Finish</span>
            </div>
          </div>
        </div>

        {/* Right Side: Player HUD, Dice Roller & Event Log */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Active Turn & Dice Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs text-center space-y-4">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Giliran Saat Ini
              </div>
              <div className="flex items-center justify-center gap-2 mt-1">
                <div className={`w-3.5 h-3.5 rounded-full ${players[activePlayerIndex]?.color}`} />
                <h3 className="text-base font-extrabold text-slate-900">
                  {players[activePlayerIndex]?.name}
                </h3>
              </div>
            </div>

            {/* Animated Dice Display */}
            <div className="flex flex-col items-center justify-center py-2">
              <div
                className={`w-20 h-20 rounded-2xl bg-blue-900 text-white flex items-center justify-center shadow-lg border-2 border-blue-700 transition-transform ${
                  isRolling ? 'animate-spin scale-110' : 'hover:scale-105'
                }`}
              >
                {renderDiceIcon(diceValue)}
              </div>
              <span className="text-xs font-bold text-slate-700 mt-2 font-mono">
                Angka Dadu: {diceValue}
              </span>
            </div>

            {/* Roll Button */}
            <div>
              {winner ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-bold">
                  🎉 {winner.name} telah memenangkan permainan!
                  <button
                    onClick={restartGame}
                    className="mt-2 block w-full py-2 bg-emerald-600 text-white rounded-md text-xs font-bold hover:bg-emerald-700"
                  >
                    Main Lagi
                  </button>
                </div>
              ) : (
                <button
                  onClick={rollDice}
                  disabled={isRolling || (players[activePlayerIndex]?.isBot && !winner)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                    players[activePlayerIndex]?.isBot
                      ? 'bg-slate-400 cursor-not-allowed opacity-80'
                      : isRolling
                      ? 'bg-orange-400 cursor-wait'
                      : 'bg-orange-500 hover:bg-orange-600 active:scale-98'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>
                    {isRolling
                      ? 'Mengocok Dadu...'
                      : players[activePlayerIndex]?.isBot
                      ? 'Bot sedang berpikir...'
                      : 'Kocok Dadu Sekarang!'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Player Position Tracker */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Posisi Bidak Pemain
            </h4>
            <div className="space-y-2">
              {players.map((p, idx) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                    activePlayerIndex === idx ? 'bg-blue-50/70 border-blue-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-full ${p.color}`} />
                    <span className="font-semibold text-slate-800">{p.name}</span>
                    {activePlayerIndex === idx && (
                      <span className="text-[10px] font-bold bg-blue-200 text-blue-900 px-1.5 py-0.2 rounded">
                        Giliran
                      </span>
                    )}
                  </div>
                  <div className="font-mono font-bold text-slate-700">
                    Kotak {p.position} / 100
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Game Event Feed */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Aktivitas Permainan
            </h4>
            <div className="space-y-1.5 text-xs text-slate-600 max-h-40 overflow-y-auto pr-1">
              {gameLog.map((log, i) => (
                <div key={i} className="py-1 border-b border-slate-100 last:border-0 leading-tight">
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* QUIZ CHALLENGE MODAL (LADDER / SNAKE / BONUS) */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-300 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                {activeQuiz.type === 'ladder' && (
                  <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                    🪜 Tantangan Naik Tangga
                  </span>
                )}
                {activeQuiz.type === 'snake' && (
                  <span className="px-2.5 py-1 rounded bg-red-100 text-red-800 text-xs font-bold flex items-center gap-1">
                    🐍 Kuis Penyelamat Perisai Ular
                  </span>
                )}
                {activeQuiz.type === 'bonus' && (
                  <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1">
                    ⭐ Kotak Bonus Informatika
                  </span>
                )}
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                {activeQuiz.question.category}
              </span>
            </div>

            {/* Instruction Callout */}
            <div className="text-xs text-slate-600">
              {activeQuiz.type === 'ladder' && (
                <p>
                  Jawab pertanyaan seputar Microsoft Word ini dengan benar untuk langsung memanjat tangga ke kotak{' '}
                  <strong className="text-emerald-700 font-bold">{activeQuiz.targetPos}</strong> (+50 XP)!
                </p>
              )}
              {activeQuiz.type === 'snake' && (
                <p>
                  Kamu menginjak kepala ular! Jawab benar pertanyaan berikut untuk mengaktifkan perisai dan{' '}
                  <strong className="text-emerald-700 font-bold">TIDAK melorot ke kotak {activeQuiz.fallbackPos}</strong>!
                </p>
              )}
              {activeQuiz.type === 'bonus' && (
                <p>
                  Pertanyaan kejutan! Dapatkan hadiah bonus XP jika berhasil menjawab dengan tepat.
                </p>
              )}
            </div>

            {/* Question Text */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {activeQuiz.question.question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {activeQuiz.question.options.map((opt, idx) => {
                const isCorrect = idx === activeQuiz.question.correctIndex;
                const isSelected = selectedOption === idx;

                let optStyle = 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800';
                if (quizAnswered) {
                  if (isCorrect) {
                    optStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                  } else if (isSelected) {
                    optStyle = 'bg-red-50 border-red-400 text-red-900 font-semibold';
                  } else {
                    optStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={quizAnswered}
                    onClick={() => handleAnswerSubmit(idx)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${optStyle}`}
                  >
                    <span>{opt}</span>
                    {quizAnswered && isCorrect && (
                      <span className="text-emerald-600 font-bold text-xs shrink-0 ml-2">✓ Benar</span>
                    )}
                    {quizAnswered && isSelected && !isCorrect && (
                      <span className="text-red-500 font-bold text-xs shrink-0 ml-2">✕ Salah</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation when answered */}
            {quizAnswered && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-1">
                <span className="font-bold text-blue-950 block">💡 Pembahasan Materi:</span>
                <p className="text-blue-900 leading-relaxed">
                  {activeQuiz.question.explanation}
                </p>
              </div>
            )}

            {/* Footer / Continue button */}
            {quizAnswered && (
              <div className="flex justify-end pt-2 border-t">
                <button
                  onClick={handleCloseQuiz}
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  Lanjutkan Permainan ➔
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
