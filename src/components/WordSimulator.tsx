import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { DocumentState, Mission } from '../types/wordGame';
import { WORD_MISSIONS } from '../data/missions';
import { sound } from '../utils/audio';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  List, 
  ListOrdered, 
  Table, 
  Image as ImageIcon, 
  FileText, 
  Columns, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  RotateCcw, 
  Save, 
  Undo, 
  Redo, 
  Maximize2, 
  HelpCircle, 
  Search, 
  Highlighter, 
  Type, 
  Eye, 
  Check, 
  ChevronRight,
  BookMarked
} from 'lucide-react';

interface WordSimulatorProps {
  onAddXp: (amount: number, reason: string) => void;
  completedMissions: string[];
  onCompleteMission: (missionId: string) => void;
}

export const WordSimulator: React.FC<WordSimulatorProps> = ({
  onAddXp,
  completedMissions,
  onCompleteMission
}) => {
  // Active Ribbon Tab
  const [activeTab, setActiveTab] = useState<'Home' | 'Insert' | 'Layout' | 'References' | 'Review' | 'View'>('Home');

  // Mission State
  const [selectedMissionIndex, setSelectedMissionIndex] = useState<number>(0);
  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(false);
  const [showFindReplaceModal, setShowFindReplaceModal] = useState<boolean>(false);
  const [findWord, setFindWord] = useState<string>('Informatika');
  const [replaceWord, setReplaceWord] = useState<string>('Komputer');
  const [showWordCountModal, setShowWordCountModal] = useState<boolean>(false);
  const [showHelpGuide, setShowHelpGuide] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showRuler, setShowRuler] = useState<boolean>(true);

  // Document State
  const initialDocState: DocumentState = {
    fontFamily: 'Calibri',
    fontSize: 12,
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    textColor: '#1E3A5F',
    highlightColor: 'transparent',
    alignment: 'left',
    lineSpacing: 1.15,
    hasBullets: false,
    hasNumbering: false,
    orientation: 'portrait',
    marginType: 'normal',
    pageSize: 'A4',
    columns: 1,
    hasTable: false,
    tableRows: 3,
    tableCols: 3,
    hasHeader: false,
    headerText: 'Laporan Praktik Informatika X - Microsoft Word',
    hasFooter: false,
    hasDropCap: false,
    hasWordArt: false,
    hasImage: false,
    hasTableOfContents: false,
    selectedTextIndex: 0
  };

  const [docState, setDocState] = useState<DocumentState>(initialDocState);

  // Current Mission logic
  const currentMission = WORD_MISSIONS[selectedMissionIndex];
  const isCurrentMissionDone = currentMission && currentMission.steps.every(s => s.isCompleted(docState));
  const isAlreadyClaimed = currentMission && completedMissions.includes(currentMission.id);

  const handleClaimMission = () => {
    if (!currentMission || isAlreadyClaimed) return;
    sound.playLevelUp();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
    onCompleteMission(currentMission.id);
    onAddXp(currentMission.xpReward, `Menyelesaikan ${currentMission.title}`);
  };

  const resetDocument = () => {
    sound.playKeyClick();
    setDocState(initialDocState);
  };

  // Document manipulation helpers
  const toggleBold = () => {
    sound.playKeyClick();
    setDocState(prev => ({ ...prev, isBold: !prev.isBold }));
  };

  const toggleItalic = () => {
    sound.playKeyClick();
    setDocState(prev => ({ ...prev, isItalic: !prev.isItalic }));
  };

  const toggleUnderline = () => {
    sound.playKeyClick();
    setDocState(prev => ({ ...prev, isUnderline: !prev.isUnderline }));
  };

  const toggleStrikethrough = () => {
    sound.playKeyClick();
    setDocState(prev => ({ ...prev, isStrikethrough: !prev.isStrikethrough }));
  };

  const setAlignment = (align: 'left' | 'center' | 'right' | 'justify') => {
    sound.playKeyClick();
    setDocState(prev => ({ ...prev, alignment: align }));
  };

  const setLineSpacing = (spacing: number) => {
    sound.playKeyClick();
    setDocState(prev => ({ ...prev, lineSpacing: spacing }));
  };

  const setFontSize = (size: number) => {
    sound.playKeyClick();
    setDocState(prev => ({ ...prev, fontSize: size }));
  };

  const setFontFamily = (family: string) => {
    sound.playKeyClick();
    setDocState(prev => ({ ...prev, fontFamily: family }));
  };

  const setTextColor = (color: string) => {
    sound.playKeyClick();
    setDocState(prev => ({ ...prev, textColor: color }));
  };

  const setHighlightColor = (color: string) => {
    sound.playKeyClick();
    setDocState(prev => ({ ...prev, highlightColor: color }));
  };

  const toggleOrientation = (orient: 'portrait' | 'landscape') => {
    sound.playKeyClick();
    setDocState(prev => ({ ...prev, orientation: orient }));
  };

  const setMarginType = (margin: 'normal' | 'narrow' | 'wide') => {
    sound.playKeyClick();
    setDocState(prev => ({ ...prev, marginType: margin }));
  };

  const setPageSize = (size: 'A4' | 'Letter' | 'Legal') => {
    sound.playKeyClick();
    setDocState(prev => ({ ...prev, pageSize: size }));
  };

  const setColumns = (cols: 1 | 2 | 3) => {
    sound.playKeyClick();
    setDocState(prev => ({ ...prev, columns: cols }));
  };

  const toggleTable = () => {
    sound.playSuccess();
    setDocState(prev => ({ ...prev, hasTable: !prev.hasTable }));
  };

  const toggleHeader = () => {
    sound.playKeyClick();
    setDocState(prev => ({ ...prev, hasHeader: !prev.hasHeader }));
  };

  const toggleFooter = () => {
    sound.playKeyClick();
    setDocState(prev => ({ ...prev, hasFooter: !prev.hasFooter }));
  };

  const toggleDropCap = () => {
    sound.playSuccess();
    setDocState(prev => ({ ...prev, hasDropCap: !prev.hasDropCap }));
  };

  const toggleTableOfContents = () => {
    sound.playSuccess();
    setDocState(prev => ({ ...prev, hasTableOfContents: !prev.hasTableOfContents }));
  };

  const toggleImage = () => {
    sound.playSuccess();
    setDocState(prev => ({ ...prev, hasImage: !prev.hasImage }));
  };

  const toggleBullets = () => {
    sound.playKeyClick();
    setDocState(prev => ({ ...prev, hasBullets: !prev.hasBullets, hasNumbering: false }));
  };

  const toggleNumbering = () => {
    sound.playKeyClick();
    setDocState(prev => ({ ...prev, hasNumbering: !prev.hasNumbering, hasBullets: false }));
  };

  // Margin CSS mapping
  const getMarginPadding = () => {
    switch (docState.marginType) {
      case 'narrow': return 'p-6';
      case 'wide': return 'p-14';
      default: return 'p-10';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      
      {/* Top Banner / Quest Controller */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold">
              <FileText className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900">
                  Simulator Antarmuka & Lab Dokumen MS Word
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-orange-100 text-orange-800">
                  Interaktif 100%
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Klik tombol Ribbon di bawah dan perhatikan perubahan dokumen secara langsung! Selesaikan misi untuk meraih XP.
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <button
              onClick={() => {
                sound.playKeyClick();
                setIsSandboxMode(false);
              }}
              className={`flex-1 lg:flex-none px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                !isSandboxMode
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Mode Misi Terpandu ({completedMissions.length}/{WORD_MISSIONS.length})
            </button>
            <button
              onClick={() => {
                sound.playKeyClick();
                setIsSandboxMode(true);
              }}
              className={`flex-1 lg:flex-none px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                isSandboxMode
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Mode Bebas (Sandbox)
            </button>
            <button
              onClick={resetDocument}
              title="Reset Dokumen ke Awal"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Guided Mission Panel */}
        {!isSandboxMode && currentMission && (
          <div className="mt-3.5 pt-3.5 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            <div className="lg:col-span-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Pilih Misi:
                </span>
                <select
                  value={selectedMissionIndex}
                  onChange={(e) => {
                    sound.playKeyClick();
                    setSelectedMissionIndex(Number(e.target.value));
                  }}
                  className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {WORD_MISSIONS.map((m, idx) => (
                    <option key={m.id} value={idx}>
                      {m.title} {completedMissions.includes(m.id) ? '✓' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                {currentMission.description}
              </p>
            </div>

            {/* Checklist of steps */}
            <div className="lg:col-span-6 flex flex-wrap sm:flex-nowrap items-center gap-2">
              {currentMission.steps.map((step) => {
                const done = step.isCompleted(docState);
                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border flex-1 transition-all ${
                      done
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${done ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span className="truncate">{step.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Mission Action / XP */}
            <div className="lg:col-span-3 flex items-center justify-end gap-2">
              {isAlreadyClaimed ? (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg">
                  <Check className="w-3.5 h-3.5" /> Misi Berhasil Dikuasai
                </span>
              ) : isCurrentMissionDone ? (
                <button
                  onClick={handleClaimMission}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow-sm animate-pulse transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Klaim +{currentMission.xpReward} XP!
                </button>
              ) : (
                <span className="text-xs text-slate-500 font-medium">
                  Petunjuk: Buka tab <strong className="text-blue-900 font-bold">{currentMission.targetRibbonTab}</strong>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Microsoft Word Window */}
      <div className="bg-slate-100 rounded-xl border border-slate-300 shadow-md overflow-hidden flex flex-col">
        
        {/* Word Title Bar (Navy Blue #1E3A5F) */}
        <div className="bg-[#1E3A5F] text-white px-4 py-2 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-3">
            {/* Quick Access Toolbar */}
            <div className="flex items-center gap-2 text-slate-200">
              <button 
                onClick={() => { sound.playSuccess(); onAddXp(10, 'Menyimpan Dokumen (Ctrl+S)'); }}
                title="Simpan Dokumen (Ctrl + S)" 
                className="hover:text-white transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={resetDocument} 
                title="Undo (Ctrl + Z)" 
                className="hover:text-white transition-colors"
              >
                <Undo className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => sound.playKeyClick()} 
                title="Redo (Ctrl + Y)" 
                className="hover:text-white transition-colors"
              >
                <Redo className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="h-3 w-px bg-blue-800" />
            <span className="font-semibold tracking-wide text-white truncate">
              Laporan_Praktikum_Informatika_10.docx - Microsoft Word
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHelpGuide(!showHelpGuide)}
              className="flex items-center gap-1 text-[11px] bg-blue-800/80 hover:bg-blue-700 px-2 py-0.5 rounded text-white"
            >
              <HelpCircle className="w-3 h-3" />
              <span className="hidden sm:inline">Bantuan Word</span>
            </button>
            <div className="flex items-center gap-1.5 opacity-80">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
            </div>
          </div>
        </div>

        {/* Word Ribbon Tab Header */}
        <div className="bg-[#1E3A5F] border-t border-blue-900/60 px-2 flex items-center gap-0.5 text-xs select-none">
          <button 
            className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-blue-800 font-medium rounded-t-sm"
            onClick={() => sound.playKeyClick()}
          >
            File
          </button>
          {(['Home', 'Insert', 'Layout', 'References', 'Review', 'View'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  sound.playKeyClick();
                  setActiveTab(tab);
                }}
                className={`px-3.5 py-1.5 font-semibold transition-colors rounded-t-sm ${
                  isActive
                    ? 'bg-slate-100 text-blue-950 border-t-2 border-orange-500'
                    : 'text-slate-200 hover:text-white hover:bg-blue-800/60'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Word Ribbon Toolbar Area */}
        <div className="bg-slate-100 border-b border-slate-300 p-2 text-slate-800 text-xs">
          
          {/* HOME TAB CONTROLS */}
          {activeTab === 'Home' && (
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Clipboard Group */}
              <div className="flex items-center gap-1 pr-3 border-r border-slate-300">
                <button
                  onClick={() => { sound.playKeyClick(); onAddXp(5, 'Paste Shortcut'); }}
                  className="flex flex-col items-center justify-center p-1.5 hover:bg-slate-200 rounded text-slate-700"
                  title="Paste (Ctrl + V)"
                >
                  <FileText className="w-4 h-4 text-orange-600" />
                  <span className="text-[10px] mt-0.5">Paste</span>
                </button>
                <div className="flex flex-col gap-0.5">
                  <button 
                    onClick={() => { sound.playKeyClick(); onAddXp(5, 'Cut Shortcut'); }}
                    className="px-1.5 py-0.5 text-[11px] hover:bg-slate-200 rounded flex items-center gap-1"
                    title="Cut (Ctrl + X)"
                  >
                    Cut
                  </button>
                  <button 
                    onClick={() => { sound.playKeyClick(); onAddXp(5, 'Copy Shortcut'); }}
                    className="px-1.5 py-0.5 text-[11px] hover:bg-slate-200 rounded flex items-center gap-1"
                    title="Copy (Ctrl + C)"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Font Group */}
              <div className="flex flex-col gap-1 pr-3 border-r border-slate-300">
                {/* Font selector & Size */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={docState.fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-800 font-medium w-28 focus:outline-none"
                  >
                    <option value="Calibri">Calibri</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Poppins">Poppins</option>
                  </select>

                  <select
                    value={docState.fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-800 font-medium w-14 focus:outline-none"
                  >
                    {[10, 11, 12, 14, 16, 18, 20, 24, 28].map(sz => (
                      <option key={sz} value={sz}>{sz} pt</option>
                    ))}
                  </select>

                  <button
                    onClick={() => setFontSize(Math.min(docState.fontSize + 2, 32))}
                    className="p-1 hover:bg-slate-200 rounded font-bold text-xs"
                    title="Grow Font (Perbesar)"
                  >
                    A+
                  </button>
                  <button
                    onClick={() => setFontSize(Math.max(docState.fontSize - 2, 8))}
                    className="p-1 hover:bg-slate-200 rounded font-bold text-xs"
                    title="Shrink Font (Perkecil)"
                  >
                    A-
                  </button>
                </div>

                {/* Font Styling Buttons: Bold, Italic, Underline, etc */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={toggleBold}
                    className={`p-1.5 rounded transition-colors ${
                      docState.isBold ? 'bg-blue-200 text-blue-900 font-black' : 'hover:bg-slate-200 text-slate-700'
                    }`}
                    title="Tebal / Bold (Ctrl + B)"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={toggleItalic}
                    className={`p-1.5 rounded transition-colors ${
                      docState.isItalic ? 'bg-blue-200 text-blue-900 font-bold' : 'hover:bg-slate-200 text-slate-700'
                    }`}
                    title="Miring / Italic (Ctrl + I)"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={toggleUnderline}
                    className={`p-1.5 rounded transition-colors ${
                      docState.isUnderline ? 'bg-blue-200 text-blue-900' : 'hover:bg-slate-200 text-slate-700'
                    }`}
                    title="Garis Bawah / Underline (Ctrl + U)"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={toggleStrikethrough}
                    className={`p-1.5 rounded transition-colors ${
                      docState.isStrikethrough ? 'bg-blue-200 text-blue-900' : 'hover:bg-slate-200 text-slate-700'
                    }`}
                    title="Coret / Strikethrough"
                  >
                    <Strikethrough className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-3.5 w-px bg-slate-300 mx-0.5" />

                  {/* Highlight Color */}
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => setHighlightColor(docState.highlightColor === '#fef08a' ? 'transparent' : '#fef08a')}
                      className={`p-1 rounded flex items-center ${docState.highlightColor !== 'transparent' ? 'bg-yellow-200' : 'hover:bg-slate-200'}`}
                      title="Warna Stabilo (Text Highlight)"
                    >
                      <Highlighter className="w-3.5 h-3.5 text-yellow-600" />
                    </button>

                    {/* Font Color */}
                    <button
                      onClick={() => setTextColor(docState.textColor === '#1E3A5F' ? '#e11d48' : '#1E3A5F')}
                      className="p-1 rounded hover:bg-slate-200 flex items-center"
                      title="Warna Font"
                    >
                      <Type className="w-3.5 h-3.5" style={{ color: docState.textColor }} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Paragraph Group */}
              <div className="flex flex-col gap-1 pr-3 border-r border-slate-300">
                <div className="flex items-center gap-1">
                  <button
                    onClick={toggleBullets}
                    className={`p-1.5 rounded transition-colors ${
                      docState.hasBullets ? 'bg-blue-200 text-blue-900' : 'hover:bg-slate-200 text-slate-700'
                    }`}
                    title="Bullets (Daftar Titik)"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={toggleNumbering}
                    className={`p-1.5 rounded transition-colors ${
                      docState.hasNumbering ? 'bg-blue-200 text-blue-900' : 'hover:bg-slate-200 text-slate-700'
                    }`}
                    title="Numbering (Penomoran Angka)"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-3.5 w-px bg-slate-300 mx-1" />

                  {/* Line Spacing Selector */}
                  <select
                    value={docState.lineSpacing}
                    onChange={(e) => setLineSpacing(Number(e.target.value))}
                    className="bg-white border border-slate-300 rounded px-1 py-0.5 text-xs text-slate-800 focus:outline-none"
                    title="Spasi Antar Baris (Line Spacing)"
                  >
                    <option value={1.0}>1.0 Spasi</option>
                    <option value={1.15}>1.15 Spasi</option>
                    <option value={1.5}>1.5 Spasi</option>
                    <option value={2.0}>2.0 Spasi (Ganda)</option>
                  </select>
                </div>

                {/* Alignment buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setAlignment('left')}
                    className={`p-1.5 rounded transition-colors ${
                      docState.alignment === 'left' ? 'bg-blue-200 text-blue-900' : 'hover:bg-slate-200 text-slate-700'
                    }`}
                    title="Rata Kiri (Ctrl + L)"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setAlignment('center')}
                    className={`p-1.5 rounded transition-colors ${
                      docState.alignment === 'center' ? 'bg-blue-200 text-blue-900' : 'hover:bg-slate-200 text-slate-700'
                    }`}
                    title="Rata Tengah (Ctrl + E)"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setAlignment('right')}
                    className={`p-1.5 rounded transition-colors ${
                      docState.alignment === 'right' ? 'bg-blue-200 text-blue-900' : 'hover:bg-slate-200 text-slate-700'
                    }`}
                    title="Rata Kanan (Ctrl + R)"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setAlignment('justify')}
                    className={`p-1.5 rounded transition-colors ${
                      docState.alignment === 'justify' ? 'bg-blue-200 text-blue-900' : 'hover:bg-slate-200 text-slate-700'
                    }`}
                    title="Rata Kanan Kiri / Justify (Ctrl + J)"
                  >
                    <AlignJustify className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Styles Group */}
              <div className="flex items-center gap-1 pr-3 border-r border-slate-300">
                <button
                  onClick={() => {
                    setFontSize(12);
                    setDocState(p => ({ ...p, isBold: false, alignment: 'justify', textColor: '#1E3A5F' }));
                  }}
                  className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-50 rounded text-center"
                >
                  <div className="text-[10px] text-slate-400">Gaya</div>
                  <div className="font-medium text-xs">Normal</div>
                </button>
                <button
                  onClick={() => {
                    setFontSize(18);
                    setDocState(p => ({ ...p, isBold: true, textColor: '#1E3A5F' }));
                  }}
                  className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-50 rounded text-center"
                >
                  <div className="text-[10px] text-blue-600">Judul Bab</div>
                  <div className="font-bold text-xs text-blue-900">Heading 1</div>
                </button>
                <button
                  onClick={() => {
                    setFontSize(14);
                    setDocState(p => ({ ...p, isBold: true, isItalic: true }));
                  }}
                  className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-50 rounded text-center"
                >
                  <div className="text-[10px] text-blue-600">Sub-Bab</div>
                  <div className="font-semibold text-xs text-blue-800">Heading 2</div>
                </button>
              </div>

              {/* Find & Replace Group */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowFindReplaceModal(true)}
                  className="flex flex-col items-center justify-center p-1.5 hover:bg-slate-200 rounded text-slate-700"
                  title="Find & Replace (Ctrl + H)"
                >
                  <Search className="w-4 h-4 text-blue-700" />
                  <span className="text-[10px] mt-0.5">Find & Replace</span>
                </button>
              </div>
            </div>
          )}

          {/* INSERT TAB CONTROLS */}
          {activeTab === 'Insert' && (
            <div className="flex flex-wrap items-center gap-3">
              {/* Tables Group */}
              <div className="flex items-center gap-2 pr-3 border-r border-slate-300">
                <button
                  onClick={toggleTable}
                  className={`flex flex-col items-center justify-center p-2 rounded transition-colors ${
                    docState.hasTable ? 'bg-blue-200 text-blue-900' : 'bg-white hover:bg-slate-200 border border-slate-300'
                  }`}
                  title="Sisipkan Tabel 3x3 ke Dokumen"
                >
                  <Table className="w-5 h-5 text-blue-800" />
                  <span className="text-[10px] font-semibold mt-0.5">
                    {docState.hasTable ? 'Hapus Tabel' : 'Sisipkan Tabel'}
                  </span>
                </button>
              </div>

              {/* Illustrations Group */}
              <div className="flex items-center gap-2 pr-3 border-r border-slate-300">
                <button
                  onClick={toggleImage}
                  className={`flex flex-col items-center justify-center p-2 rounded transition-colors ${
                    docState.hasImage ? 'bg-blue-200 text-blue-900' : 'bg-white hover:bg-slate-200 border border-slate-300'
                  }`}
                  title="Sisipkan Ilustrasi Gambar"
                >
                  <ImageIcon className="w-5 h-5 text-emerald-700" />
                  <span className="text-[10px] font-semibold mt-0.5">
                    {docState.hasImage ? 'Hapus Gambar' : 'Gambar / Foto'}
                  </span>
                </button>
              </div>

              {/* Header & Footer Group */}
              <div className="flex items-center gap-1.5 pr-3 border-r border-slate-300">
                <button
                  onClick={toggleHeader}
                  className={`px-3 py-1.5 rounded text-xs font-medium border ${
                    docState.hasHeader ? 'bg-blue-200 border-blue-400 text-blue-900 font-bold' : 'bg-white border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  Header Dokumen
                </button>
                <button
                  onClick={toggleFooter}
                  className={`px-3 py-1.5 rounded text-xs font-medium border ${
                    docState.hasFooter ? 'bg-blue-200 border-blue-400 text-blue-900 font-bold' : 'bg-white border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  Footer / Halaman
                </button>
              </div>

              {/* Text Group (Drop Cap & WordArt) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleDropCap}
                  className={`px-3 py-1.5 rounded text-xs font-medium border ${
                    docState.hasDropCap ? 'bg-orange-100 border-orange-400 text-orange-900 font-bold' : 'bg-white border-slate-300 hover:bg-slate-200'
                  }`}
                  title="Jadikan huruf pertama besar (Drop Cap)"
                >
                  Drop Cap (Huruf Besar Awal)
                </button>
              </div>
            </div>
          )}

          {/* LAYOUT TAB CONTROLS */}
          {activeTab === 'Layout' && (
            <div className="flex flex-wrap items-center gap-4">
              {/* Margins */}
              <div className="flex flex-col gap-1 pr-3 border-r border-slate-300">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Margin Dokumen</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setMarginType('normal')}
                    className={`px-2.5 py-1 rounded text-xs font-medium ${
                      docState.marginType === 'normal' ? 'bg-blue-900 text-white' : 'bg-white border border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Normal (2.54 cm)
                  </button>
                  <button
                    onClick={() => setMarginType('narrow')}
                    className={`px-2.5 py-1 rounded text-xs font-medium ${
                      docState.marginType === 'narrow' ? 'bg-blue-900 text-white' : 'bg-white border border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Narrow (1.27 cm)
                  </button>
                  <button
                    onClick={() => setMarginType('wide')}
                    className={`px-2.5 py-1 rounded text-xs font-medium ${
                      docState.marginType === 'wide' ? 'bg-blue-900 text-white' : 'bg-white border border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Wide (5 cm)
                  </button>
                </div>
              </div>

              {/* Orientation */}
              <div className="flex flex-col gap-1 pr-3 border-r border-slate-300">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Orientasi Kertas</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleOrientation('portrait')}
                    className={`px-2.5 py-1 rounded text-xs font-medium ${
                      docState.orientation === 'portrait' ? 'bg-blue-900 text-white' : 'bg-white border border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Portrait (Tegak)
                  </button>
                  <button
                    onClick={() => toggleOrientation('landscape')}
                    className={`px-2.5 py-1 rounded text-xs font-medium ${
                      docState.orientation === 'landscape' ? 'bg-blue-900 text-white' : 'bg-white border border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Landscape (Mendatar)
                  </button>
                </div>
              </div>

              {/* Paper Size */}
              <div className="flex flex-col gap-1 pr-3 border-r border-slate-300">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ukuran Kertas</span>
                <div className="flex items-center gap-1">
                  {(['A4', 'Letter', 'Legal'] as const).map(sz => (
                    <button
                      key={sz}
                      onClick={() => setPageSize(sz)}
                      className={`px-2.5 py-1 rounded text-xs font-medium ${
                        docState.pageSize === sz ? 'bg-blue-900 text-white' : 'bg-white border border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Columns */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Format Kolom</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setColumns(1)}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      docState.columns === 1 ? 'bg-blue-900 text-white' : 'bg-white border border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    1 Kolom
                  </button>
                  <button
                    onClick={() => setColumns(2)}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      docState.columns === 2 ? 'bg-blue-900 text-white' : 'bg-white border border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    2 Kolom (Koran)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* REFERENCES TAB */}
          {activeTab === 'References' && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={toggleTableOfContents}
                className={`flex items-center gap-2 px-3.5 py-2 rounded text-xs font-semibold border ${
                  docState.hasTableOfContents
                    ? 'bg-blue-200 border-blue-400 text-blue-900'
                    : 'bg-white border-slate-300 hover:bg-slate-200 text-slate-800'
                }`}
              >
                <BookMarked className="w-4 h-4 text-blue-800" />
                <span>{docState.hasTableOfContents ? 'Hapus Daftar Isi' : 'Sisipkan Table of Contents (Daftar Isi Otomatis)'}</span>
              </button>

              <button
                onClick={() => {
                  sound.playSuccess();
                  setDocState(p => ({ ...p, hasFooter: true }));
                  onAddXp(20, 'Menyisipkan Catatan Kaki (Footnote)');
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-200 rounded text-xs font-medium text-slate-800"
              >
                <BookOpen className="w-4 h-4 text-orange-600" />
                <span>Insert Footnote (Catatan Kaki)</span>
              </button>
            </div>
          )}

          {/* REVIEW TAB */}
          {activeTab === 'Review' && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  sound.playSuccess();
                  alert('Ejaan & Tata Bahasa (Spelling & Grammar): Tidak ditemukan kesalahan ejaan pada dokumen!');
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-200 rounded text-xs font-medium"
              >
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Spelling & Grammar Check</span>
              </button>

              <button
                onClick={() => setShowWordCountModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-200 rounded text-xs font-medium"
              >
                <Eye className="w-4 h-4 text-blue-600" />
                <span>Word Count (Hitung Kata)</span>
              </button>
            </div>
          )}

          {/* VIEW TAB */}
          {activeTab === 'View' && (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Penggaris (Ruler):</span>
                <button
                  onClick={() => setShowRuler(!showRuler)}
                  className={`px-2.5 py-1 rounded text-xs font-medium ${showRuler ? 'bg-blue-900 text-white' : 'bg-white border border-slate-300'}`}
                >
                  {showRuler ? 'Tampilkan' : 'Sembunyikan'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Zoom:</span>
                {[80, 100, 120].map((z) => (
                  <button
                    key={z}
                    onClick={() => setZoomLevel(z)}
                    className={`px-2.5 py-1 rounded text-xs font-medium ${zoomLevel === z ? 'bg-blue-900 text-white' : 'bg-white border border-slate-300'}`}
                  >
                    {z}%
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Ruler Bar (optional visual authenticity) */}
        {showRuler && (
          <div className="bg-slate-200 border-b border-slate-300 h-5 flex items-center px-8 text-[9px] font-mono text-slate-600 select-none overflow-hidden">
            <div className="w-4 h-full bg-slate-300 border-r border-slate-400" />
            <div className="flex-1 flex justify-between px-4">
              {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20].map(cm => (
                <span key={cm} className="relative">
                  <span className="absolute -top-2 text-slate-500">|</span>
                  <span className="mt-1 block">{cm}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Document Workspace Area (Gray Desktop with centered paper page) */}
        <div className="bg-slate-300/80 p-4 sm:p-8 min-h-[560px] flex justify-center items-start overflow-x-auto">
          
          {/* THE PAPER SHEET */}
          <div
            style={{
              fontFamily: docState.fontFamily,
              color: docState.textColor,
              backgroundColor: '#FFFFFF',
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              transition: 'all 0.25s ease'
            }}
            className={`shadow-xl rounded-xs border border-slate-200 transition-all ${getMarginPadding()} ${
              docState.orientation === 'landscape'
                ? 'w-full max-w-4xl min-h-[460px]'
                : 'w-full max-w-2xl min-h-[640px]'
            }`}
          >
            {/* Header Area */}
            {docState.hasHeader && (
              <div className="border-b border-dashed border-slate-400 pb-2 mb-6 flex justify-between items-center text-xs text-slate-500 italic select-none">
                <span>{docState.headerText}</span>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                  Header Dokumen
                </span>
              </div>
            )}

            {/* Table of Contents Block */}
            {docState.hasTableOfContents && (
              <div className="mb-6 p-4 bg-slate-50 border border-slate-300 rounded-sm">
                <div className="text-sm font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2 tracking-wide">
                  DAFTAR ISI
                </div>
                <div className="space-y-1.5 text-xs text-slate-700 font-mono">
                  <div className="flex items-end justify-between">
                    <span className="font-semibold">BAB 1: PENGENALAN MICROSOFT WORD</span>
                    <span className="flex-1 mx-2 border-b border-dotted border-slate-400" />
                    <span>Halaman 1</span>
                  </div>
                  <div className="flex items-end justify-between pl-4">
                    <span>1.1 Fungsi Ribbon & Antarmuka Dokumen</span>
                    <span className="flex-1 mx-2 border-b border-dotted border-slate-400" />
                    <span>Halaman 2</span>
                  </div>
                  <div className="flex items-end justify-between pl-4">
                    <span>1.2 Pengaturan Margin dan Tata Letak Halaman</span>
                    <span className="flex-1 mx-2 border-b border-dotted border-slate-400" />
                    <span>Halaman 3</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="font-semibold">BAB 2: TABEL, GAMBAR & FITUR LANJUT</span>
                    <span className="flex-1 mx-2 border-b border-dotted border-slate-400" />
                    <span>Halaman 4</span>
                  </div>
                </div>
              </div>
            )}

            {/* Document Content */}
            <div className={docState.columns === 2 ? 'columns-2 gap-6' : 'columns-1'}>
              
              {/* Document Title */}
              <h1
                style={{
                  fontSize: `${docState.fontSize + 4}px`,
                  fontWeight: docState.isBold ? 800 : 400,
                  fontStyle: docState.isItalic ? 'italic' : 'normal',
                  textDecoration: docState.isUnderline ? 'underline' : 'none',
                  textAlign: docState.alignment,
                  backgroundColor: docState.highlightColor
                }}
                className="tracking-tight mb-3 transition-all"
              >
                Praktikum Informatika Kelas 10: Eksplorasi Fitur Microsoft Word
              </h1>

              {/* Sub-heading */}
              <div 
                style={{ textAlign: docState.alignment }}
                className="text-xs text-slate-500 mb-4 font-medium"
              >
                Disusun oleh: Siswa Kelas X Informatika · Semester Genap
              </div>

              {/* Paragraph 1 */}
              <p
                style={{
                  fontSize: `${docState.fontSize}px`,
                  textAlign: docState.alignment,
                  lineHeight: docState.lineSpacing,
                  textDecoration: docState.isStrikethrough ? 'line-through' : 'none',
                  backgroundColor: docState.highlightColor
                }}
                className="mb-4 transition-all"
              >
                {docState.hasDropCap ? (
                  <>
                    <span className="float-left text-5xl font-black leading-none pr-3 pt-1 text-blue-900 select-none">
                      M
                    </span>
                    <span>
                      icrosoft Word adalah aplikasi pengolah kata paling populer dalam ekosistem perkantoran dan pendidikan. Bagi siswa kelas 10 Informatika, kemampuan mengatur tata letak paragraf, mengubah ukuran margin kertas, dan memanfaatkan shortcut keyboard merupakan kompetensi esensial untuk menyusun laporan praktikum maupun karya ilmiah yang terstandar.
                    </span>
                  </>
                ) : (
                  <span>
                    Microsoft Word adalah aplikasi pengolah kata paling populer dalam ekosistem perkantoran dan pendidikan. Bagi siswa kelas 10 Informatika, kemampuan mengatur tata letak paragraf, mengubah ukuran margin kertas, dan memanfaatkan shortcut keyboard merupakan kompetensi esensial untuk menyusun laporan praktikum maupun karya ilmiah yang terstandar.
                  </span>
                )}
              </p>

              {/* Optional Inline Image Illustration */}
              {docState.hasImage && (
                <div className="my-4 p-3 bg-slate-100 border border-slate-300 rounded flex items-center gap-3">
                  <div className="w-20 h-20 bg-blue-900 text-white rounded flex items-center justify-center font-bold text-xs shrink-0">
                    <FileText className="w-8 h-8 text-orange-400" />
                  </div>
                  <div className="text-xs text-slate-700">
                    <div className="font-bold text-blue-950">Gambar 1.1: Diagram Alur Pemrosesan Dokumen</div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Text wrapping: In line with text. Menggabungkan unsur visual memperjelas penyampaian materi informatika.
                    </p>
                  </div>
                </div>
              )}

              {/* Bullets / Numbering List */}
              {(docState.hasBullets || docState.hasNumbering) && (
                <div className="my-3 pl-6 text-xs space-y-1">
                  <div className="font-semibold text-slate-800">Shortcut Penting yang Wajib Diketahui:</div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-900 font-bold">{docState.hasNumbering ? '1.' : '•'}</span>
                    <span><strong>Ctrl + S</strong> : Menyimpan dokumen kerja</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-900 font-bold">{docState.hasNumbering ? '2.' : '•'}</span>
                    <span><strong>Ctrl + J</strong> : Merapikan teks dengan Justify (rata kanan-kiri)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-900 font-bold">{docState.hasNumbering ? '3.' : '•'}</span>
                    <span><strong>Ctrl + H</strong> : Menjalankan fitur Find and Replace</span>
                  </div>
                </div>
              )}

              {/* Optional Table */}
              {docState.hasTable && (
                <div className="my-4 overflow-x-auto">
                  <table className="w-full text-xs border-collapse border border-slate-400">
                    <thead>
                      <tr className="bg-blue-900 text-white text-left">
                        <th className="border border-slate-400 p-2 w-12 text-center">No</th>
                        <th className="border border-slate-400 p-2">Tab Ribbon</th>
                        <th className="border border-slate-400 p-2">Fungsi Utama Dokumen</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white">
                        <td className="border border-slate-400 p-2 text-center font-bold">1</td>
                        <td className="border border-slate-400 p-2 font-medium">Home</td>
                        <td className="border border-slate-400 p-2">Clipboard, Font, Paragraf, Styles</td>
                      </tr>
                      <tr className="bg-slate-50">
                        <td className="border border-slate-400 p-2 text-center font-bold">2</td>
                        <td className="border border-slate-400 p-2 font-medium">Insert</td>
                        <td className="border border-slate-400 p-2">Tabel, Gambar, Header/Footer, Drop Cap</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="border border-slate-400 p-2 text-center font-bold">3</td>
                        <td className="border border-slate-400 p-2 font-medium">Layout</td>
                        <td className="border border-slate-400 p-2">Margin, Orientasi, Ukuran Kertas A4</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Paragraph 2 */}
              <p
                style={{
                  fontSize: `${docState.fontSize}px`,
                  textAlign: docState.alignment,
                  lineHeight: docState.lineSpacing,
                  textDecoration: docState.isStrikethrough ? 'line-through' : 'none'
                }}
                className="mt-4 text-xs transition-all"
              >
                Pemanfaatan fitur otomatisasi seperti pembuatan daftar isi melalui integrasi Paragraph Styles memudahkan pembaca menelusuri bab penting. Selain itu, fitur Mail Merge sangat efektif diterapkan untuk keperluan administrasi surat menyurat massal tanpa perlu menyunting nama penerima satu demi satu.
              </p>

            </div>

            {/* Footer Area */}
            {docState.hasFooter && (
              <div className="border-t border-dashed border-slate-400 pt-3 mt-8 flex justify-between items-center text-xs text-slate-500 italic select-none">
                <span>Informatika X · Modul Pengolah Kata</span>
                <span className="font-mono font-semibold">Halaman 1 dari 1</span>
              </div>
            )}
          </div>
        </div>

        {/* Word Status Bar at Bottom */}
        <div className="bg-[#1E3A5F] text-slate-200 px-4 py-1.5 flex items-center justify-between text-[11px] font-medium border-t border-blue-900 select-none">
          <div className="flex items-center gap-3">
            <span>Halaman 1 dari 1</span>
            <span className="hidden sm:inline">184 kata</span>
            <span className="hidden md:inline">Bahasa Indonesia</span>
            <span>Akurasi: 100%</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-orange-400">{docState.pageSize} · {docState.orientation.toUpperCase()}</span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setZoomLevel(Math.max(zoomLevel - 10, 60))}
                className="px-1 hover:text-white"
              >
                -
              </button>
              <span className="w-10 text-center font-mono">{zoomLevel}%</span>
              <button 
                onClick={() => setZoomLevel(Math.min(zoomLevel + 10, 140))}
                className="px-1 hover:text-white"
              >
                +
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Find & Replace Modal Dialog */}
      {showFindReplaceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-slate-300 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-900" />
                <h3 className="font-bold text-sm text-slate-900">Find and Replace (Ctrl + H)</h3>
              </div>
              <button
                onClick={() => setShowFindReplaceModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Find what (Kata yang dicari):</label>
                <input
                  type="text"
                  value={findWord}
                  onChange={(e) => setFindWord(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Replace with (Ganti dengan):</label>
                <input
                  type="text"
                  value={replaceWord}
                  onChange={(e) => setReplaceWord(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="p-2.5 bg-blue-50 border border-blue-100 rounded text-blue-900 text-[11px]">
                💡 <strong>Tips Informatika:</strong> Shortcut <code>Ctrl + H</code> berguna untuk mengganti istilah teknis di seluruh dokumen secara instan tanpa perlu mencari satu per satu.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setShowFindReplaceModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  sound.playSuccess();
                  setShowFindReplaceModal(false);
                  onAddXp(30, 'Menggunakan Fitur Find and Replace (Ctrl+H)');
                }}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded shadow-xs"
              >
                Replace All (Ganti Semua)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Word Count Modal */}
      {showWordCountModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 border border-slate-300 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">Statistik Dokumen (Word Count)</h3>
              <button onClick={() => setShowWordCountModal(false)} className="text-slate-400 font-bold text-xs">✕</button>
            </div>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Halaman:</span>
                <span className="font-mono font-bold">1</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Kata (Words):</span>
                <span className="font-mono font-bold">184</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Karakter (tanpa spasi):</span>
                <span className="font-mono font-bold">1,120</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Paragraf:</span>
                <span className="font-mono font-bold">3</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Baris:</span>
                <span className="font-mono font-bold">22</span>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setShowWordCountModal(false)}
                className="px-4 py-1.5 bg-blue-900 text-white rounded text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Guide Modal */}
      {showHelpGuide && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 border border-slate-300 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-900" />
                <h3 className="font-bold text-sm text-slate-900">Panduan Fitur Microsoft Word Kelas 10</h3>
              </div>
              <button onClick={() => setShowHelpGuide(false)} className="text-slate-400 font-bold text-xs">✕</button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <strong className="text-blue-950 font-bold block mb-1">1. Tab Home:</strong>
                Fokus pada pemformatan font (Bold, Italic, Underline), perataan paragraf (Left, Center, Right, Justify), spasi baris, dan penomoran (Bullets/Numbering).
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <strong className="text-emerald-950 font-bold block mb-1">2. Tab Insert:</strong>
                Menyisipkan elemen pendukung dokumen seperti Tabel, Gambar, Header & Footer, serta efek Drop Cap (huruf awal besar).
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <strong className="text-amber-950 font-bold block mb-1">3. Tab Layout:</strong>
                Mengatur batas kertas (Margins), orientasi kertas (Portrait/Landscape), dan membagi teks menjadi kolom koran.
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <strong className="text-purple-950 font-bold block mb-1">4. Tab References:</strong>
                Membuat Daftar Isi Otomatis (Table of Contents) dan Catatan Kaki (Footnote) untuk karya ilmiah sekolah.
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setShowHelpGuide(false)}
                className="px-4 py-1.5 bg-blue-900 text-white rounded text-xs font-semibold"
              >
                Paham! Lanjut Praktik
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
