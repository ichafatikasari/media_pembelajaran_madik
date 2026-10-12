import React, { useState } from 'react';
import { StudentProfile } from '../types/wordGame';
import { sound } from '../utils/audio';
import { 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  User, 
  Gamepad2, 
  Keyboard, 
  FileText, 
  TrendingUp, 
  Edit3, 
  Check 
} from 'lucide-react';

interface AchievementsProps {
  profile: StudentProfile;
  onUpdateProfile: (newProfile: StudentProfile) => void;
}

export const AchievementsView: React.FC<AchievementsProps> = ({
  profile,
  onUpdateProfile
}) => {
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(profile.name);

  const handleSaveName = () => {
    sound.playKeyClick();
    if (tempName.trim()) {
      onUpdateProfile({ ...profile, name: tempName.trim() });
    }
    setIsEditingName(false);
  };

  const getRankTitle = (lvl: number) => {
    switch (lvl) {
      case 1: return 'Siswa Pemula Microsoft Word';
      case 2: return 'Operator Dokumen Terampil';
      case 3: return 'Spesialis Tata Letak & Ribbon';
      case 4: return 'Ahli Mail Merge & Referensi';
      default: return 'Grandmaster MS Word Kelas 10 👑';
    }
  };

  const nextLevelXp = profile.level * 250;
  const currentLevelBaseXp = (profile.level - 1) * 250;
  const levelProgress = Math.min(
    100,
    Math.round(((profile.xp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100)
  );

  const badges = [
    {
      id: 'b1',
      title: 'Jari Kilat Informatika',
      desc: 'Capai kecepatan mengetik minimal 35 WPM di Balap Ketik',
      icon: '⚡',
      isUnlocked: profile.bestWpm >= 35,
      progress: `${profile.bestWpm}/35 WPM`
    },
    {
      id: 'b2',
      title: 'Penakluk Ular Tangga',
      desc: 'Menangkan minimal 1 permainan Ular Tangga Informatika',
      icon: '🪜',
      isUnlocked: profile.snakesWon >= 1,
      progress: `${profile.snakesWon}/1 Menang`
    },
    {
      id: 'b3',
      title: 'Arsitek Dokumen',
      desc: 'Selesaikan minimal 3 misi praktikum di Simulator MS Word',
      icon: '📄',
      isUnlocked: profile.missionsCompleted.length >= 3,
      progress: `${profile.missionsCompleted.length}/3 Misi`
    },
    {
      id: 'b4',
      title: 'Master Ribbon Word',
      desc: 'Kuasai seluruh 5 misi praktikum di Simulator MS Word',
      icon: '👑',
      isUnlocked: profile.missionsCompleted.length >= 5,
      progress: `${profile.missionsCompleted.length}/5 Misi`
    },
    {
      id: 'b5',
      title: 'Penjelajah Shortcut',
      desc: 'Mainkan game dan raih akumulasi minimal 300 XP',
      icon: '🌟',
      isUnlocked: profile.xp >= 300,
      progress: `${profile.xp}/300 XP`
    },
    {
      id: 'b6',
      title: 'Siswa Teladan Kelas 10',
      desc: 'Kumpulkan total 600 XP di platform pembelajaran',
      icon: '🎓',
      isUnlocked: profile.xp >= 600,
      progress: `${profile.xp}/600 XP`
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-5">
      
      {/* Student Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          
          {/* Avatar with Mascot */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-orange-500 shadow-md bg-blue-900 flex items-center justify-center">
              <img
                src="/src/assets/images/mascot_word_student_1791122329253.jpg"
                alt="Mascot Siswa Informatika"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to avatar letter if image fails
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="w-full h-full flex items-center justify-center text-white text-3xl font-extrabold">
                {profile.name.charAt(0)}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white font-extrabold text-[11px] px-2 py-0.5 rounded-full border-2 border-white shadow-xs">
              Lv.{profile.level}
            </div>
          </div>

          {/* Student Info */}
          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="border border-slate-300 rounded px-2.5 py-1 text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                    title="Simpan Nama"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {profile.name}
                  </h2>
                  <button
                    onClick={() => {
                      setTempName(profile.name);
                      setIsEditingName(true);
                    }}
                    className="text-slate-400 hover:text-slate-700 p-1"
                    title="Ubah Nama Siswa"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                {profile.classGrade}
              </span>
            </div>

            <p className="text-xs font-semibold text-orange-600">
              {getRankTitle(profile.level)}
            </p>

            {/* Level XP Progress Bar */}
            <div className="pt-2 max-w-md">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progress Level {profile.level}</span>
                <span className="font-mono font-bold text-blue-900">{profile.xp} / {nextLevelXp} XP</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="bg-blue-900 h-full rounded-full transition-all duration-300"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl min-w-[90px]">
              <div className="text-slate-400 text-[10px] font-semibold">Total XP</div>
              <div className="text-base font-extrabold text-blue-950 font-mono">{profile.xp}</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl min-w-[90px]">
              <div className="text-slate-400 text-[10px] font-semibold">Rekor WPM</div>
              <div className="text-base font-extrabold text-orange-600 font-mono">{profile.bestWpm}</div>
            </div>
          </div>

        </div>
      </div>

      {/* Badges Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Lencana Pencapaian Siswa
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {badges.filter(b => b.isUnlocked).length} dari {badges.length} Terbuka
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                b.isUnlocked
                  ? 'bg-white border-emerald-300 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200 opacity-70'
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                b.isUnlocked ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-400'
              }`}>
                {b.isUnlocked ? b.icon : <Lock className="w-5 h-5 text-slate-400" />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-900">{b.title}</h4>
                  {b.isUnlocked && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {b.desc}
                </p>
                <div className="text-[10px] font-mono font-semibold text-slate-400 pt-0.5">
                  Progres: {b.progress}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
