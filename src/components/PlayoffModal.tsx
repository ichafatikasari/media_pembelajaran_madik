import React, { useState } from 'react';
import { TieGroup } from '../utils/tiebreaker';
import { StudentRecord, ActiveDuelMatch } from '../types/typingBattle';
import { sound } from '../utils/audio';
import { 
  Swords, 
  Trophy, 
  Zap, 
  Play, 
  X, 
  Sparkles, 
  Coins, 
  Scale, 
  CheckCircle2, 
  ShieldCheck,
  Crown
} from 'lucide-react';

interface PlayoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  tieGroups: TieGroup[];
  onSelectCandidateForPlayoff: (student: StudentRecord, group: TieGroup) => void;
  onAwardPlayoffWinner?: (winner: StudentRecord, group: TieGroup) => void;
  onStartDuelMatch?: (duel: ActiveDuelMatch) => void;
}

export const PlayoffModal: React.FC<PlayoffModalProps> = ({
  isOpen,
  onClose,
  tieGroups,
  onSelectCandidateForPlayoff,
  onAwardPlayoffWinner,
  onStartDuelMatch
}) => {
  if (!isOpen || tieGroups.length === 0) return null;

  // State to track coin toss results for each tie group (keyed by group index)
  const [tossResults, setTossResults] = useState<{ [groupIndex: number]: { firstStudentId: string; tossing: boolean } }>({});
  const [activeTab, setActiveTab] = useState<'ARENA' | 'FAIRNESS_RULES'>('ARENA');

  const handleCoinToss = (groupIndex: number, students: StudentRecord[]) => {
    sound.playDiceRoll();
    setTossResults(prev => ({
      ...prev,
      [groupIndex]: { firstStudentId: '', tossing: true }
    }));

    setTimeout(() => {
      // Pick random student
      const randomIndex = Math.floor(Math.random() * students.length);
      const chosenStudent = students[randomIndex];
      sound.playTeamBell();
      setTossResults(prev => ({
        ...prev,
        [groupIndex]: { firstStudentId: chosenStudent.id, tossing: false }
      }));
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border-2 border-orange-400 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md">
              <Swords className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full">
                  Sudden Death Duel
                </span>
                <span className="text-xs text-slate-500 font-bold">Prosedur Keadilan Turnamen</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Babak Penentuan Juara (Playoff)
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('ARENA')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ARENA'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Pilih Giliran Tanding</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('FAIRNESS_RULES')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'FAIRNESS_RULES'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Aturan Keadilan & Perlindungan Podium</span>
          </button>
        </div>

        {/* TAB 1: ARENA GILIRAN PLAYOFF */}
        {activeTab === 'ARENA' && (
          <div className="space-y-5">
            
            {/* Quick Fairness & Floor Protection Banner */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-amber-900 text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>🛡️ Jaminan Perlindungan Podium:</span>
                </div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                  Hak Podium Terkunci
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed font-medium">
                Finalis yang memperebutkan <strong>Juara 1</strong> dijamin minimal mendapatkan <strong>Juara 2</strong>! Skor dasar mereka tidak akan turun sehingga tidak akan pernah terlempar ke Juara 4 di bawah non-finalis.
              </p>
            </div>

            {/* List of Tied Groups */}
            <div className="space-y-6">
              {tieGroups.map((group, gIdx) => {
                const toss = tossResults[gIdx];
                return (
                  <div key={gIdx} className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                    
                    {/* Group Title & Coin Toss Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-amber-500" />
                          <h3 className="font-extrabold text-base text-slate-900">
                            Perebutan {group.rankLabel}
                          </h3>
                        </div>
                        <span className="text-xs text-orange-600 font-bold">
                          Skor Imbang: {group.score} Poin (Baseline Aman)
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {group.students.length === 2 && onStartDuelMatch && (
                          <button
                            type="button"
                            onClick={() => {
                              sound.playBattleGong();
                              onClose();
                              onStartDuelMatch({
                                title: `⚔️ DUEL PLAYOFF: Perebutan ${group.rankLabel}`,
                                tier: group.tier,
                                player1: group.students[0],
                                player2: group.students[1],
                                currentTurn: 1,
                                isGrandFinal: false
                              });
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-black transition-all shadow-xs active:scale-95 cursor-pointer"
                            title="Mulai duel 1 vs 1 di mana kedua siswa mengetik bergiliran"
                          >
                            <Swords className="w-4 h-4" />
                            <span>⚔️ Duel 1 vs 1 (Keduanya Main Bergiliran)</span>
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={toss?.tossing}
                          onClick={() => handleCoinToss(gIdx, group.students)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-amber-50 border-2 border-amber-400 text-amber-900 rounded-xl text-xs font-black transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                          <Coins className={`w-4 h-4 text-amber-600 ${toss?.tossing ? 'animate-spin' : ''}`} />
                          <span>{toss?.tossing ? 'Sedang Mengundi...' : '🪙 Lempar Koin Giliran'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Contenders Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {group.students.map((student, sIdx) => {
                        const isChosenFirst = toss && toss.firstStudentId === student.id;
                        const isChosenSecond = toss && toss.firstStudentId && toss.firstStudentId !== student.id;
                        const hasPlayoffScore = student.playoffScore !== undefined;

                        return (
                          <div
                            key={student.id || sIdx}
                            className={`rounded-2xl border-2 p-4 transition-all flex flex-col justify-between space-y-3 ${
                              student.playoffWinner
                                ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400 shadow-md'
                                : isChosenFirst
                                ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-300 shadow-md scale-[1.02]'
                                : isChosenSecond
                                ? 'bg-white border-slate-200 opacity-90'
                                : 'bg-white border-slate-200 hover:border-orange-400 shadow-xs'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                {student.playoffWinner ? (
                                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-1">
                                    <Crown className="w-3 h-3" />
                                    PEMENANG PLAYOFF 👑
                                  </span>
                                ) : isChosenFirst ? (
                                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1 animate-pulse">
                                    <CheckCircle2 className="w-3 h-3" />
                                    GILIRAN KE-1 (HASIL UNDIAN)
                                  </span>
                                ) : isChosenSecond ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                    GILIRAN KE-2
                                  </span>
                                ) : (
                                  <span className="text-xs font-extrabold text-slate-400">Penantang #{sIdx + 1}</span>
                                )}

                                {student.groupOrTeam && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                    {student.groupOrTeam}
                                  </span>
                                )}
                              </div>

                              <h4 className="text-lg font-black text-slate-900 mt-2">
                                {student.name}
                              </h4>
                              <div className="mt-1 text-xs text-slate-600 font-mono space-x-1.5">
                                <span>Skor Utama: <strong className="text-orange-600">{student.score} Poin</strong></span>
                                <span>·</span>
                                <span>{student.wpm} WPM</span>
                              </div>

                              {/* Playoff Specific Score Badge if they played rematch */}
                              {hasPlayoffScore && (
                                <div className="mt-2 p-2 bg-orange-100/80 rounded-lg text-xs font-mono text-orange-950 font-bold border border-orange-200">
                                  ⚡ Skor Playoff: {student.playoffScore} pt ({student.playoffWpm} WPM · {student.playoffAccuracy}%)
                                </div>
                              )}
                            </div>

                            <div className="space-y-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  sound.playKeyClick();
                                  onSelectCandidateForPlayoff(student, group);
                                }}
                                className={`w-full py-2 px-3 rounded-xl text-xs font-black shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                                  isChosenFirst
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
                                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                                }`}
                              >
                                <Play className="w-3.5 h-3.5 fill-white" />
                                <span>{hasPlayoffScore ? `Tanding Ulang Lagi: ${student.name}` : `Mulai Giliran: ${student.name}`}</span>
                              </button>

                              {/* Direct Crown Button to make them the official winner */}
                              {onAwardPlayoffWinner && (
                                <button
                                  type="button"
                                  onClick={() => onAwardPlayoffWinner(student, group)}
                                  className="w-full py-1.5 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-[11px] font-black transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                  title={`Sahkan ${student.name} sebagai pemenang posisi ini`}
                                >
                                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Sahkan {student.name} Menang 🏆</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 2: ATURAN KEADILAN JIKA SKOR TERNYATA MASIH SAMA (HEAD-TO-HEAD TIEBREAKER CRITERIA) */}
        {activeTab === 'FAIRNESS_RULES' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-2 font-black text-sm text-slate-900">
                <Scale className="w-5 h-5 text-orange-600" />
                <span>Prinsip Perlindungan Posisi Podium</span>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                Untuk memastikan turnamen 100% adil dan tidak ada siswa yang dirugikan saat babak penentuan:
              </p>
            </div>

            {/* 5-Level Fairness Hierarchy */}
            <div className="space-y-2.5 text-xs font-medium">
              
              <div className="p-3.5 bg-emerald-50 rounded-xl border-2 border-emerald-300 shadow-2xs flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                  🛡️
                </div>
                <div>
                  <h4 className="font-black text-emerald-950 text-sm">Hak Podium Terlindungi (Tidak Pernah Jatuh ke Juara 4)</h4>
                  <p className="text-emerald-900 mt-0.5">
                    Jika Siswa A dan Siswa B memperebutkan <strong>Juara 1</strong>, maka pemenang otomatis menjadi <strong>Juara 1</strong> dan yang kalah menjadi <strong>Juara 2</strong>. Mereka <strong>TIDAK BISA</strong> terlempar ke Juara 4 di bawah siswa lain yang skor awalnya lebih rendah.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border-2 border-orange-300 shadow-2xs flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-orange-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Prioritas 1: Skor Poin Playoff Terbanyak</h4>
                  <p className="text-slate-600 mt-0.5">
                    Siswa dengan jumlah karakter benar paling banyak dalam babak playoff dikurangi penalti kesalahan (typo) langsung memenangkan posisi puncak.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border-2 border-blue-200 shadow-2xs flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-900 text-white font-black text-sm flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Prioritas 2 (Jika Poin Sama): Akurasi Mengetik (%)</h4>
                  <p className="text-slate-600 mt-0.5">
                    Jika poin playoff sama, sistem memenangkan siswa yang <strong>Akurasi Ketikannya Lebih Tinggi</strong> (misal 98% vs 95%), karena pengetikannya lebih teliti dan bersih.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border-2 border-purple-200 shadow-2xs flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-purple-700 text-white font-black text-sm flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Prioritas 3: Kecepatan Murni (WPM / CPM)</h4>
                  <p className="text-slate-600 mt-0.5">
                    Siswa yang mencatat kecepatan rata-rata ketukan kata per menit (*Words Per Minute*) lebih tinggi otomatis diutamakan.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-xl border-2 border-amber-300 shadow-2xs flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-black text-amber-950 text-sm">Prioritas 4: Juara Bersama (Dual Champions) 🤝</h4>
                  <p className="text-amber-900 mt-0.5">
                    Jika seluruh angka benar-benar identik, Guru dapat menetapkan <strong>"Juara Kembar / Bersama"</strong> dan keduanya berhak mendapatkan reward juara yang setara!
                  </p>
                </div>
              </div>

              {/* Special Case: Challenger scores higher than Rank 1 */}
              <div className="p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-300 shadow-2xs flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-purple-700 text-white font-black text-sm flex items-center justify-center shrink-0">
                  👑
                </div>
                <div>
                  <h4 className="font-black text-purple-950 text-sm">Kasus Khusus: Jika Skor Penantang Juara 2/3 Melebihi Juara 1</h4>
                  <p className="text-purple-900 mt-0.5 leading-relaxed">
                    Jika siswa yang memperebutkan Juara 2 atau 3 tiba-tiba mencetak skor spektakuler yang melebihi Juara 1, sistem akan otomatis membuka opsi <strong>"Tantangan Grand Final (1 vs 1)"</strong>. Guru dapat memilih:
                    <br />
                    1. <strong>Tanding Grand Final:</strong> Adu Juara 1 bertahan vs Penantang baru untuk merebut Juara 1 Sejati.
                    <br />
                    2. <strong>Tetapkan Sesuai Bracket:</strong> Juara 1 bertahan tetap Juara 1, penantang disahkan sebagai Juara 2 Terbaik.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs">
          <div className="text-slate-500 flex items-center gap-1.5 font-medium">
            <Coins className="w-4 h-4 text-amber-600" />
            <span>Hasil koin dapat disaksikan transparan di layar proyektor</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Tutup Dialog
          </button>
        </div>

      </div>
    </div>
  );
};
