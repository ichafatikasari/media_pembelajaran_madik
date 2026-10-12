export type TabType = 'simulator' | 'ular_tangga' | 'mengetik' | 'kuis' | 'prestasi' | 'turnamen';

export interface ClassroomTeam {
  id: string;
  name: string;
  color: string;
  bgLight: string;
  borderColor: string;
  badge: string;
  score: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: 'Shortcut' | 'Ribbon & Menu' | 'Page Layout' | 'Tabel & Gambar' | 'Mail Merge & Fitur Lanjut';
  difficulty: 'Mudah' | 'Sedang' | 'Tantangan';
}

export interface TypingChallenge {
  id: string;
  title: string;
  category: 'Shortcut Word' | 'Fitur & Fungsi' | 'Paragraf Dokumen';
  text: string;
  targetWpm: number;
  timeLimit: number; // in seconds
  hint: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  targetRibbonTab: 'Home' | 'Insert' | 'Layout' | 'References' | 'Review' | 'View';
  xpReward: number;
  steps: {
    id: string;
    text: string;
    isCompleted: (docState: DocumentState) => boolean;
  }[];
}

export interface DocumentState {
  fontFamily: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  textColor: string;
  highlightColor: string;
  alignment: 'left' | 'center' | 'right' | 'justify';
  lineSpacing: number; // 1.0, 1.15, 1.5, 2.0
  hasBullets: boolean;
  hasNumbering: boolean;
  orientation: 'portrait' | 'landscape';
  marginType: 'normal' | 'narrow' | 'wide';
  pageSize: 'A4' | 'Letter' | 'Legal';
  columns: 1 | 2 | 3;
  hasTable: boolean;
  tableRows: number;
  tableCols: number;
  hasHeader: boolean;
  headerText: string;
  hasFooter: boolean;
  hasDropCap: boolean;
  hasWordArt: boolean;
  hasImage: boolean;
  hasTableOfContents: boolean;
  selectedTextIndex: number; // 0: Title, 1: Subtitle, 2: Paragraph 1, 3: Paragraph 2
}

export interface Player {
  id: string;
  name: string;
  position: number;
  color: string;
  isBot: boolean;
  score: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export interface StudentProfile {
  name: string;
  classGrade: string;
  xp: number;
  level: number;
  gamesPlayed: number;
  bestWpm: number;
  snakesWon: number;
  missionsCompleted: string[];
  badges: string[];
}
