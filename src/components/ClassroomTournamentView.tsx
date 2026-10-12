import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ClassroomTeam, TabType } from '../types/wordGame';
import { sound } from '../utils/audio';
import { 
  Trophy, 
  Tv, 
  Users, 
  Sparkles, 
  Volume2, 
  RotateCcw, 
  Play, 
  Dice5, 
  Flame, 
  HelpCircle, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Shuffle, 
  ArrowRight,
  Shield,
  Layers,
  Keyboard,
  FileText
} from 'lucide-react';

interface TournamentProps {
  teams: ClassroomTeam[];
  setTeams: React.Dispatch<React.SetStateAction<ClassroomTeam[]>>;
  onNavigateTab: (tab: TabType) => void;
}

export const ClassroomTournamentView: React.FC<TournamentProps> = ({
  teams,
  setTeams,
  onNavigateTab
}) => {
  // Random Student Caller (Nomor Absen / Roda Acak)
  const [totalStudents, setTotalStudents] = useState<number>(36);
  const [selectedStudentNumber, setSelectedStudentNumber] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  // Active Round Tab
  const [activeRound, setActiveRound] = useState<'panduan' | 'ronde1' | 'ronde2' | 'ronde3'>('panduan');

  // Edit Team Name Modal
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editNameVal, setEditNameVal] = useState<string>('');

  // Add / Subtract score helper
  const adjustScore = (teamId: string, delta: number) => {
    sound.playKeyClick();
    if (delta > 0) sound.playTeamBell();
    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        return { ...t, score: Math.max(0, t.score + delta) };
      }
      return t;
    }));
  };

  // Reset all scores
  const resetScores = () => {
    sound.playKeyClick();
    setTeams(prev => prev.map(t => ({ ...t, score: 0 })));
  };

  // Switch between 2 Teams and 4 Teams
  const setTeamCountPreset = (count: 2 | 4) => {
    sound.playKeyClick();
    if (count === 2) {
      setTeams([
        { id: 't1', name: 'Tim Putri 👧', color: 'bg-pink-600', bgLight: 'bg-pink-50', borderColor: 'border-pink-300', badge: 'Tim A', score: 0 },
        { id: 't2', name: 'Tim Putra 👦', color: 'bg-blue-600', bgLight: 'bg-blue-50', borderColor: 'border-blue-300', badge: 'Tim B', score: 0 }
      ]);
    } else {
      setTeams([
        { id: 't1', name: 'Tim Calibri 🔵', color: 'bg-blue-600', bgLight: 'bg-blue-50', borderColor: 'border-blue-300', badge: 'Tim 1', score: 0 },
        { id: 't2', name: 'Tim Arial 🟠', color: 'bg-orange-500', bgLight: 'bg-orange-50', borderColor: 'border-orange-300', badge: 'Tim 2', score: 0 },
        { id: 't3', name: 'Tim Times 🟢', color: 'bg-emerald-600', bgLight: 'bg-emerald-50', borderColor: 'border-emerald-300', badge: 'Tim 3', score: 0 },
        { id: 't4', name: 'Tim Georgia 🟣', color: 'bg-purple-600', bgLight: 'bg-purple-50', borderColor: 'border-purple-300', badge: 'Tim 4', score: 0 }
      ]);
    }
  };

  // Random Student Caller Spin
  const spinRandomStudent = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    sound.playDiceRoll();

    let count = 0;
    const interval = setInterval(() => {
      setSelectedStudentNumber(Math.floor(Math.random() * totalStudents) + 1);
      count++;
      if (count >= 15) {
        clearInterval(interval);
        const finalNum = Math.floor(Math.random() * totalStudents) + 1;
        setSelectedStudentNumber(finalNum);
        setIsSpinning(false);
        sound.playTeamBell();
      }
    }, 80);
  };

  // Play Bell sound
  const handlePlayBuzzer = () => {
    sound.playBuzzer();
  };

  const handlePlayChime = () => {
    sound.playTeamBell();
  };

  // Winner calculation
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const leadingTeam = sortedTeams[0];

  const handleDeclareWinner = () => {
    sound.playLevelUp();
    try {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.4 }
      });
    } catch {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-5">
      
      {/* Smart TV Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-2xl p-6 border border-blue-800 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-500 text-white">
                <Tv className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Mode Turnamen Kelas (Smart TV / Proyektor)
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                1 Laptop · Cerdas Cermat
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              Dirancang khusus untuk guru memandu pertandingan interaktif di depan kelas. Bagikan siswa ke dalam 2 atau 4 kelompok, panggil perwakilan maju ke laptop guru secara bergilir, dan raih poin tertinggi!
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setTeamCountPreset(2)}
              className="px-3.5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>2 Tim (Putri vs Putra)</span>
            </button>
            <button
              onClick={() => setTeamCountPreset(4)}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>4 Kelompok</span>
            </button>
            <button
              onClick={resetScores}
              title="Reset Semua Skor ke 0"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* LIVE PROJECTOR SCOREBOARD (GIANT & CLEAR FROM BACK OF CLASS) */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">
              Papan Skor Turnamen Kelas Informatika
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayBuzzer}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-colors"
              title="Bunyikan Bel Salah / Rebutan"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Bel Salah (Buzzer)</span>
            </button>
            <button
              onClick={handlePlayChime}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold transition-colors"
              title="Bunyikan Lonceng Benar"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lonceng Benar (Chime)</span>
            </button>
            <button
              onClick={handleDeclareWinner}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Rayakan Pemenang 🎉</span>
            </button>
          </div>
        </div>

        {/* Teams Score Cards */}
        <div className={`grid gap-4 ${teams.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
          {teams.map((team, idx) => {
            const isLeading = leadingTeam && leadingTeam.score > 0 && leadingTeam.id === team.id;
            return (
              <div
                key={team.id}
                className={`relative rounded-2xl border-2 p-5 transition-all shadow-sm ${team.bgLight} ${team.borderColor} ${
                  isLeading ? 'ring-4 ring-amber-400/60 scale-[1.02]' : ''
                }`}
              >
                {isLeading && (
                  <div className="absolute -top-3 right-4 bg-amber-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    👑 Memimpin
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-full ${team.color}`} />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{team.badge}</span>
                  </div>
                  <button
                    onClick={() => {
                      setEditingTeamId(team.id);
                      setEditNameVal(team.name);
                    }}
                    className="text-[11px] text-slate-400 hover:text-slate-700 underline font-semibold"
                  >
                    Ganti Nama
                  </button>
                </div>

                {/* Team Name */}
                <h3 className="text-lg font-black text-slate-900 truncate mb-2">
                  {team.name}
                </h3>

                {/* Big Score Display */}
                <div className="bg-white/90 rounded-xl p-3 border border-slate-200/80 text-center my-2 shadow-inner">
                  <span className="text-4xl sm:text-5xl font-black font-mono text-slate-900 tracking-tight">
                    {team.score}
                  </span>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase mt-0.5">Poin Tim</span>
                </div>

                {/* Quick Score Adjustment Buttons */}
                <div className="flex items-center justify-between gap-1 pt-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => adjustScore(team.id, -10)}
                      className="p-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold"
                      title="Kurang 10 Poin"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => adjustScore(team.id, 10)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold"
                    >
                      +10
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => adjustScore(team.id, 25)}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold"
                    >
                      +25
                    </button>
                    <button
                      onClick={() => adjustScore(team.id, 50)}
                      className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs"
                    >
                      +50
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* CLASSROOM ORCHESTRATION TOOLKIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Side: Game Master Navigation (3 Rounds) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          
          {/* Round Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => setActiveRound('panduan')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeRound === 'panduan' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📖 Panduan & Konsep Guru
            </button>
            <button
              onClick={() => setActiveRound('ronde1')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeRound === 'ronde1' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ronde 1: Ular Tangga Tim</span>
            </button>
            <button
              onClick={() => setActiveRound('ronde2')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeRound === 'ronde2' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5 text-orange-500" />
              <span>Ronde 2: Relay Balap Ketik</span>
            </button>
            <button
              onClick={() => setActiveRound('ronde3')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeRound === 'ronde3' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-700" />
              <span>Ronde 3: Misi Lab Simulator</span>
            </button>
          </div>

          {/* Tab Content: Panduan & Konsep Mengajar 1 Laptop */}
          {activeRound === 'panduan' && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <h3 className="text-sm font-extrabold text-blue-950 flex items-center gap-2">
                  <Tv className="w-4 h-4 text-blue-700" />
                  Konsep Alur Pembelajaran (1 Laptop + Smart TV / Proyektor)
                </h3>
                <p>
                  Agar semua siswa aktif berpikir dan tidak hanya diam menonton, gunakan metode <strong>"Perwakilan Bergilir dengan Diskusi Kelompok (Team Relay & Huddle)"</strong>:
                </p>
                <ol className="list-decimal pl-5 space-y-1.5 font-medium text-slate-800">
                  <li>
                    <strong>Bagi Kelas:</strong> Bagi menjadi 2 kelompok besar (Tim Putri vs Tim Putra) atau 4 kelompok (4-8 siswa per kelompok).
                  </li>
                  <li>
                    <strong>Maju Bergilir:</strong> Gunakan alat <em>"Putar Nomor Absen Acak"</em> di sebelah kanan untuk memanggil siapa yang maju ke depan laptop guru. Ini membuat semua siswa fokus dan siap siaga!
                  </li>
                  <li>
                    <strong>Hak Diskusi 15 Detik:</strong> Saat perwakilan di depan laptop menghadapi kuis atau misi Word, berikan waktu 15 detik bagi timnya untuk memberikan instruksi/bantuan dari bangku masing-masing.
                  </li>
                  <li>
                    <strong>Poin Masuk Otomatis/Manual:</strong> Guru mengklik tombol tambah poin (+10 / +25 / +50) pada papan skor besar di atas.
                  </li>
                </ol>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>Ronde 1: Ular Tangga</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Bidak tim bergerak bergantian di papan 100 kotak. Menjawab kuis materi Word saat kena tangga/ular.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                    <Keyboard className="w-4 h-4 text-orange-600" />
                    <span>Ronde 2: Balap Ketik</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Perwakilan adu cepat mengetik shortcut Word selama 45 detik. WPM tertinggi menyumbang poin!
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                    <FileText className="w-4 h-4 text-blue-700" />
                    <span>Ronde 3: Misi Word</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Siswa maju mempraktikkan tombol ribbon (Margin, Justify, Table) di Simulator dokumen Word asli.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Ronde 1 */}
          {activeRound === 'ronde1' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-emerald-950">
                    Ronde 1: Petualangan Ular Tangga Antar Tim (100 Kotak)
                  </h3>
                  <button
                    onClick={() => onNavigateTab('ular_tangga')}
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs flex items-center gap-1"
                  >
                    <span>Buka Papan Ular Tangga</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-emerald-900">
                  <strong>Aturan Main di Kelas:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1 text-emerald-900">
                  <li>Perwakilan tim maju ke depan laptop guru untuk mengocok dadu.</li>
                  <li>Jika mendarat di kaki tangga: Soal tampil di Smart TV! Tim boleh berdiskusi sebentar sebelum perwakilan memilih jawaban. Jika benar, bidak tim memanjat tangga! (+50 Poin)</li>
                  <li>Jika kena kepala ular: Tim berusaha menjawab soal perisai agar tidak melorot ke ekor ular!</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab Content: Ronde 2 */}
          {activeRound === 'ronde2' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-orange-950">
                    Ronde 2: Relay Balap Ketik & Shortcut Sprint
                  </h3>
                  <button
                    onClick={() => onNavigateTab('mengetik')}
                    className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-xs shadow-xs flex items-center gap-1"
                  >
                    <span>Mulai Balap Ketik</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-orange-900">
                  <strong>Aturan Main di Kelas:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1 text-orange-900">
                  <li>Setiap tim memilih 1 perwakilan pengetik tercepat (atau diacak guru).</li>
                  <li>Perwakilan maju bergilir mengetik teks shortcut Word di laptop guru selama 45 detik.</li>
                  <li>Teman sekelas melihat layar Smart TV secara live! Tim yang meraih WPM tertinggi mendapatkan +100 Poin, posisi kedua +50 Poin.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab Content: Ronde 3 */}
          {activeRound === 'ronde3' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-blue-950">
                    Ronde 3: Misi Lab Interaktif Simulator MS Word
                  </h3>
                  <button
                    onClick={() => onNavigateTab('simulator')}
                    className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-bold text-xs shadow-xs flex items-center gap-1"
                  >
                    <span>Buka Simulator Word</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-blue-900">
                  <strong>Aturan Main di Kelas:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1 text-blue-900">
                  <li>Guru memilih satu misi (misal Misi 1: Judul Tebal & Center, atau Misi 2: Landscape & Margin Narrow).</li>
                  <li>Perwakilan kelompok maju ke laptop guru dan mengeksekusi fitur Word yang diminta.</li>
                  <li>Jika sistem memvalidasi misi tuntas dengan ceklis hijau di Smart TV, tim bersorak dan mendapatkan +150 Poin!</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Random Student Caller (Roda Acak Siswa) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <Shuffle className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              Pemanggil Siswa Acak (Nomor Absen)
            </h3>
          </div>

          <p className="text-xs text-slate-500">
            Putar untuk memilih nomor absen siswa yang bertugas maju ke laptop guru mewakili kelompoknya.
          </p>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600 font-semibold">Total Siswa di Kelas:</span>
            <input
              type="number"
              min={10}
              max={50}
              value={totalStudents}
              onChange={(e) => setTotalStudents(Number(e.target.value))}
              className="w-16 border border-slate-300 rounded px-2 py-1 font-mono font-bold text-slate-900 text-center focus:outline-none"
            />
          </div>

          {/* Wheel / Number Display Box */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Nomor Absen Terpilih
            </span>
            <div className={`text-5xl font-black font-mono my-2 ${isSpinning ? 'text-orange-500 animate-bounce' : 'text-blue-950'}`}>
              {selectedStudentNumber !== null ? `#${selectedStudentNumber}` : '—'}
            </div>
            {selectedStudentNumber !== null && !isSpinning && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full inline-block">
                Siswa Absen {selectedStudentNumber} Silakan Maju! 🙋
              </span>
            )}
          </div>

          <button
            onClick={spinRandomStudent}
            disabled={isSpinning}
            className={`w-full py-3 rounded-xl font-bold text-xs text-white shadow-md transition-all flex items-center justify-center gap-2 ${
              isSpinning ? 'bg-orange-400 cursor-wait' : 'bg-orange-500 hover:bg-orange-600 active:scale-98'
            }`}
          >
            <Dice5 className="w-4 h-4" />
            <span>{isSpinning ? 'Mengacak Siswa...' : 'Acak Siswa Sekarang!'}</span>
          </button>
        </div>

      </div>

      {/* Edit Team Name Modal */}
      {editingTeamId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 border border-slate-300 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Ubah Nama Tim</h3>
            <input
              type="text"
              value={editNameVal}
              onChange={(e) => setEditNameVal(e.target.value)}
              placeholder="Contoh: Tim Putri, Tim Alpha..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingTeamId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (editNameVal.trim()) {
                    setTeams(prev => prev.map(t => t.id === editingTeamId ? { ...t, name: editNameVal.trim() } : t));
                  }
                  setEditingTeamId(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
