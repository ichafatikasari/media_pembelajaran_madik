import React from 'react';
import { TabType, StudentProfile } from '../types/wordGame';
import { sound } from '../utils/audio';
import { 
  FileText, 
  Gamepad2, 
  Keyboard, 
  Award, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Layers,
  Trophy,
  Tv
} from 'lucide-react';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  profile: StudentProfile;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  soundEnabled,
  setSoundEnabled,
  onOpenProfile
}) => {
  const handleTabClick = (tab: TabType) => {
    sound.playKeyClick();
    setActiveTab(tab);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playKeyClick();
  };

  const navItems = [
    { id: 'turnamen' as TabType, label: 'Mode Turnamen Kelas 📺', icon: Trophy, desc: 'Smart TV Proyektor 2-4 Tim' },
    { id: 'simulator' as TabType, label: 'Simulator Word', icon: FileText, desc: 'Praktik Ribbon & Dokumen' },
    { id: 'ular_tangga' as TabType, label: 'Ular Tangga Kuis', icon: Layers, desc: 'Petualangan Board Game' },
    { id: 'mengetik' as TabType, label: 'Balap Ketik', icon: Keyboard, desc: 'Speed & Shortcut Sprint' },
    { id: 'kuis' as TabType, label: 'Kuis Kilat', icon: Gamepad2, desc: 'Tantangan 10 Soal' },
    { id: 'prestasi' as TabType, label: 'Profil Siswa', icon: Award, desc: 'XP & Lencana' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Zone */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-xl shadow-inner border border-blue-800">
              <span className="text-orange-400 mr-0.5">&lt;</span>
              <span className="text-white">W</span>
              <span className="text-orange-400">/&gt;</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-blue-950">
                  WordQuest<span className="text-orange-500">10</span>
                </span>
                <span className="hidden sm:inline text-xs font-semibold px-2 py-0.5 rounded-sm bg-blue-50 text-blue-800 border border-blue-200">
                  Informatika X
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Media Belajar Interaktif MS Word · Kelas 10 SMA/SMK
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-blue-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Zone: XP, Level & Sound */}
          <div className="flex items-center gap-2.5">
            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Matikan Suara FX' : 'Aktifkan Suara FX'}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Toggle Sound"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Profile & XP Widget */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs">
                {profile.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1 leading-tight">
                  <span>{profile.name}</span>
                  <span className="text-orange-600 font-extrabold">Lv.{profile.level}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{profile.xp} XP</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center overflow-x-auto py-2 px-4 gap-1 border-t border-slate-100 bg-slate-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-blue-900 text-white'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
