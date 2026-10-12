import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { TypingSnippet, TournamentConfig, StudentRecord } from '../types/typingBattle';
import { TYPING_SNIPPETS } from '../data/typingTexts';
import { sound } from '../utils/audio';
import { 
  Settings, 
  Trophy, 
  Gift, 
  Clock, 
  FileText, 
  Check, 
  X, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Award
} from 'lucide-react';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TournamentConfig;
  onChangeConfig: (newConfig: TournamentConfig) => void;
  records: StudentRecord[];
  onClearRecords?: () => void;
}

export const TeacherSettingsModal: React.FC<TeacherModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  records,
  onClearRecords
}) => {
  if (!isOpen) return null;

  const [activeSnippetId, setActiveSnippetId] = useState<string>(config.snippetId);
  const [timeLimit, setTimeLimit] = useState<number>(config.timeLimit);
  const [mode, setMode] = useState<'fixed_time' | 'complete_text'>(config.mode);
  const [rewardNotes, setRewardNotes] = useState<string>(config.rewardNotes);
  const [showCeremony, setShowCeremony] = useState<boolean>(false);

  // Sorted records
  const sortedRecords = [...records].sort((a, b) => b.score - a.score);
  const winner = sortedRecords[0];

  const handleSave = () => {
    sound.playKeyClick();
    onChangeConfig({
      ...config,
      snippetId: activeSnippetId,
      timeLimit,
      mode,
      rewardNotes
    });
    onClose();
  };

  const handleTriggerCelebration = () => {
    sound.playLevelUp();
    try {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.4 }
      });
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 border-2 border-slate-300 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Pengaturan Turnamen & Hadiah Guru
              </h3>
              <p className="text-[11px] text-slate-500">
                Sesuaikan teks materi Word dan durasi untuk giliran siswa di kelas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Select Text Snippet */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pilih Paket Cerita Mengetik:
            </label>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
              🟢 Tanpa Huruf Besar (Semua Huruf Kecil & Angka)
            </span>
          </div>
          <div className="space-y-2">
            {TYPING_SNIPPETS.map((snip) => (
              <div
                key={snip.id}
                onClick={() => setActiveSnippetId(snip.id)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  activeSnippetId === snip.id
                    ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-400'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold flex items-center gap-1.5">
                    <span>📖</span>
                    <span>{snip.title}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                    {snip.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-normal line-clamp-2 mt-1 leading-relaxed bg-white/60 p-1.5 rounded border border-slate-200/60 font-mono">
                  "{snip.text}"
                </p>
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                  <span>{snip.hint}</span>
                  <span className="font-bold text-emerald-700 font-mono">Target: {snip.targetWpm} WPM</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Select Duration */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Batas Waktu per Siswa:
          </label>
          <div className="grid grid-cols-4 gap-2 text-xs font-bold">
            {[20, 30, 45].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => {
                  setTimeLimit(sec);
                  setMode('fixed_time');
                }}
                className={`py-2 rounded-lg border transition-colors ${
                  mode === 'fixed_time' && timeLimit === sec
                    ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {sec} Detik {sec === 20 ? '⚡' : ''}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setMode('complete_text')}
              className={`py-2 rounded-lg border transition-colors ${
                mode === 'complete_text'
                  ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Sampai Selesai
            </button>
          </div>
        </div>

        {/* 3. Reward Notes */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Catatan Reward / Hadiah dari Guru:
          </label>
          <input
            type="text"
            value={rewardNotes}
            onChange={(e) => setRewardNotes(e.target.value)}
            placeholder="Contoh: Hadiah Snack & Nilai Plus Informatika 100 untuk Juara 1, 2, 3!"
            className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* 4. Ceremony Awarding Button if records exist */}
        {records.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <Gift className="w-4 h-4 text-amber-600" />
                <span>Umumkan Penyerahan Reward</span>
              </div>
              <button
                onClick={handleTriggerCelebration}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold shadow-xs text-xs"
              >
                Tembak Konfeti 🎉
              </button>
            </div>
            {winner && (
              <p className="text-amber-900">
                Peringkat 1 saat ini dipegang oleh <strong>{winner.name}</strong> dengan skor <strong>{winner.score} Poin</strong> ({winner.wpm} WPM · {winner.accuracy}% Akurasi).
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t">
          {onClearRecords && records.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                sound.playKeyClick();
                onClearRecords();
                onClose();
              }}
              className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 cursor-pointer"
            >
              Reset Skor Turnamen
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-sm cursor-pointer"
            >
              Simpan Pengaturan
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
