import React, { useState } from 'react';
import { 
  Swords, 
  Trophy, 
  HelpCircle, 
  X, 
  Coins, 
  ShieldCheck, 
  Scale, 
  Crown, 
  Zap, 
  CheckCircle2, 
  Flame, 
  Info,
  ChevronRight
} from 'lucide-react';
import { sound } from '../utils/audio';

interface PlayoffRulesInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlayoffRulesInfoModal: React.FC<PlayoffRulesInfoModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeSection, setActiveSection] = useState<'ALUR' | 'GILIRAN' | 'TIEBREAKER' | 'GRAND_FINAL'>('ALUR');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border-2 border-orange-400 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 text-white flex items-center justify-center shadow-md shrink-0">
              <Scale className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full">
                  Panduan Transparansi Siswa
                </span>
                <span className="text-xs text-slate-500 font-bold">Standar Keadilan Kelas</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Sistem Playoff & Aturan Penentuan Juara
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tutup Panduan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Short Summary Banner */}
        <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-amber-300 rounded-2xl text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-black text-amber-950 text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Prinsip Keadilan Turnamen:</span>
          </div>
          <p className="text-slate-700 leading-relaxed font-medium">
            Aturan ini dibacakan dan ditampilkan terbuka di depan layar kelas sebelum pertandingan dimulai, agar seluruh siswa mengetahui hak dan mekanisme penentuan juara tanpa ada kecurigaan.
          </p>
        </div>

        {/* Category Navigation Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-bold border-b border-slate-100 pb-3">
          <button
            type="button"
            onClick={() => setActiveSection('ALUR')}
            className={`py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
              activeSection === 'ALUR'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>1. Alur Playoff</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('GILIRAN')}
            className={`py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
              activeSection === 'GILIRAN'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>2. Undian Giliran</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('TIEBREAKER')}
            className={`py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
              activeSection === 'TIEBREAKER'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>3. Jika Masih Seri</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('GRAND_FINAL')}
            className={`py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
              activeSection === 'GRAND_FINAL'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>4. Grand Final</span>
          </button>
        </div>

        {/* SECTION 1: ALUR PLAYOFF */}
        {activeSection === 'ALUR' && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Swords className="w-4 h-4 text-orange-600" />
              <span>Kapan Babak Playoff Diperlukan?</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-extrabold text-slate-900 block text-xs">
                  ⚡ Kondisi Skor Seri di Podium:
                </span>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Jika ada 2 siswa atau lebih memiliki <strong>skor akhir yang persis sama</strong> di posisi perebutan Juara 1, Juara 2, atau Juara 3, status posisi tersebut <strong>belum ditentukan</strong> dan membutuhkan tanding ulang 1 sesi sprint lagi.
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1">
                <span className="font-extrabold text-emerald-950 block text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Jaminan Perlindungan Hak Podium (Floor Protection):
                </span>
                <p className="text-emerald-900 leading-relaxed font-medium">
                  Siswa yang memperebutkan <strong>Juara 1</strong> dijamin minimal mendapatkan <strong>Juara 2</strong>! Walaupun di babak penentuan grogi atau salah ketik, skor terbaik babak penyisihan mereka tetap dilindungi, sehingga <strong>TIDAK PERNAH</strong> terlempar ke Juara 4 di bawah siswa lain.
                </p>
              </div>

              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <span className="font-extrabold text-blue-950 block text-xs">
                  🎯 Batas Maksimal Tier (Bracket Ceiling):
                </span>
                <p className="text-blue-900 leading-relaxed font-medium">
                  Siswa yang bertanding di perebutan Juara 3 hanya bertanding untuk menentukan Juara 3 & 4. Nilai tanding ulang mereka adalah skor duel internal yang tidak menggeser Juara 1 dan 2 yang sudah sah.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: UNDIAN GILIRAN MAIN */}
        {activeSection === 'GILIRAN' && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-600" />
              <span>Bagaimana Menentukan Siapa yang Maju Duluan?</span>
            </h3>

            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs space-y-2">
              <span className="font-black text-amber-950 block text-sm">
                🪙 Lempar Koin Digital Otomatis
              </span>
              <p className="text-slate-700 leading-relaxed font-medium">
                Agar adil dan tidak ada perdebatan mengenai siapa yang maju pertama atau kedua, aplikasi menyediakan tombol <strong>"Lempar Koin Giliran"</strong> di hadapan seluruh siswa:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium pl-1">
                <li>Komputer mengundi secara acak dan langsung memberi tanda hijau: <strong>GILIRAN KE-1</strong> dan <strong>GILIRAN KE-2</strong>.</li>
                <li>Tidak ada siswa yang dianggap otomatis turun peringkat saat skor imbang terjadi.</li>
                <li>Kedua siswa mengetik dengan durasi dan tingkat kesulitan teks yang sama.</li>
              </ul>
            </div>
          </div>
        )}

        {/* SECTION 3: JIKA SKOR PLAYOFF MASIH SAMA */}
        {activeSection === 'TIEBREAKER' && (
          <div className="space-y-3 animate-in fade-in">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Scale className="w-4 h-4 text-orange-600" />
              <span>5 Tingkat Penilaian Jika Skor Playoff Masih Sama</span>
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Jika setelah bermain 1 kali lagi skornya ternyata tetap imbang, sistem menerapkan hierarki penilaian bertingkat yang baku:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-white border-2 border-orange-300 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-black text-slate-900 text-xs">1. Skor Poin Playoff Utama</span>
                  <p className="text-slate-500 text-[11px]">Karakter benar dikurangi penalti typo</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800">Prioritas 1</span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-black text-slate-900 text-xs">2. Akurasi Ketikan (%) Tertinggi</span>
                  <p className="text-slate-500 text-[11px]">Siswa yang lebih teliti & persentase lebih tinggi menang</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">Prioritas 2</span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-black text-slate-900 text-xs">3. Typo Paling Sedikit</span>
                  <p className="text-slate-500 text-[11px]">Siswa dengan 0 kesalahan atau typo lebih sedikit menang</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">Prioritas 3</span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-black text-slate-900 text-xs">4. Kecepatan Murni (WPM / CPM)</span>
                  <p className="text-slate-500 text-[11px]">Kecepatan rata-rata ketukan kata per menit</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">Prioritas 4</span>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-black text-amber-950 text-xs">5. Juara Bersama (Dual Winners) 🤝</span>
                  <p className="text-amber-800 text-[11px]">Jika semua angka identik, keduanya sah juara kembar</p>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-200 text-amber-900">Podium Ganda</span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: GRAND FINAL SHOWDOWN */}
        {activeSection === 'GRAND_FINAL' && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Crown className="w-4 h-4 text-purple-600" />
              <span>Bagaimana Jika Skor Playoff Melebihi Juara 1?</span>
            </h3>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-2xl text-xs space-y-2">
              <span className="font-black text-purple-950 block text-sm">
                👑 Tantangan Grand Final (Duel 1 vs 1)
              </span>
              <p className="text-purple-900 leading-relaxed font-medium">
                Jika peserta perebutan Juara 2 atau 3 tiba-tiba bermain luar biasa dan skornya <strong>lebih tinggi dari Juara 1 awal</strong>, sistem menyediakan 2 opsi bijak bagi Guru:
              </p>
              <div className="space-y-2 pt-1">
                <div className="p-2.5 bg-white rounded-xl border border-purple-200">
                  <strong className="text-purple-950 block">Opsi A: Gelar Grand Final 1 vs 1</strong>
                  <span className="text-slate-600 text-[11px]">
                    Juara 1 Bertahan diadu 1 ronde penentu melawan Penantang Baru. Pemenangnya sah menjadi Juara 1 Sejati!
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-purple-200">
                  <strong className="text-purple-950 block">Opsi B: Sahkan Sesuai Bracket Awal</strong>
                  <span className="text-slate-600 text-[11px]">
                    Juara 1 awal tetap sah sebagai Juara 1, dan penantang dinobatkan sebagai Juara 2 dengan gelar Performa Playoff Terbaik.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200 text-xs">
          <div className="text-slate-500 flex items-center gap-1.5 font-medium">
            <Info className="w-4 h-4 text-orange-600" />
            <span>Transparan & dapat dijelaskan ke seluruh siswa</span>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playKeyClick();
              onClose();
            }}
            className="px-5 py-2.5 text-xs font-black text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Mengerti, Siap Bertanding! 🚀
          </button>
        </div>

      </div>
    </div>
  );
};
