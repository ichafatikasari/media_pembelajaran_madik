import { QuizQuestion } from '../types/wordGame';

export const WORD_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Kombinasi tombol keyboard (shortcut) manakah yang digunakan untuk membuat perataan teks menjadi rata kanan-kiri (Justify)?',
    options: ['Ctrl + J', 'Ctrl + E', 'Ctrl + L', 'Ctrl + R'],
    correctIndex: 0,
    explanation: 'Ctrl + J digunakan untuk Justify (rata kanan-kiri). Ctrl + E untuk Center, Ctrl + L untuk Left, dan Ctrl + R untuk Right.',
    category: 'Shortcut',
    difficulty: 'Mudah'
  },
  {
    id: 'q2',
    question: 'Pada tab ribbon manakah kamu dapat menemukan fitur untuk mengubah orientasi halaman dari Portrait ke Landscape?',
    options: ['Home', 'Insert', 'Layout (Page Layout)', 'References'],
    correctIndex: 2,
    explanation: 'Pengaturan orientasi (Portrait/Landscape), margin, ukuran kertas, dan kolom berada pada tab Layout (atau Page Layout).',
    category: 'Page Layout',
    difficulty: 'Mudah'
  },
  {
    id: 'q3',
    question: 'Fitur Microsoft Word yang digunakan untuk membuat surat masal dengan format sama namun data penerima berbeda-beda secara otomatis adalah...',
    options: ['Mail Merge', 'Track Changes', 'Table of Contents', 'Macros'],
    correctIndex: 0,
    explanation: 'Mail Merge (Surat Massal) pada tab Mailings menghubungkan dokumen utama dengan sumber data (seperti Excel/Access) untuk mencetak banyak surat secara otomatis.',
    category: 'Mail Merge & Fitur Lanjut',
    difficulty: 'Sedang'
  },
  {
    id: 'q4',
    question: 'Untuk menyisipkan huruf kapital berukuran besar di awal paragraf seperti pada artikel majalah atau koran, fitur yang digunakan adalah...',
    options: ['WordArt', 'Drop Cap', 'Subscript', 'Text Effect'],
    correctIndex: 1,
    explanation: 'Drop Cap (pada tab Insert > grup Text) membuat huruf pertama dari paragraf berukuran besar dan jatuh (dropped) ke beberapa baris di bawahnya.',
    category: 'Ribbon & Menu',
    difficulty: 'Sedang'
  },
  {
    id: 'q5',
    question: 'Shortcut keyboard yang digunakan untuk melakukan Find and Replace (Mencari dan Mengganti teks sekaligus) secara cepat adalah...',
    options: ['Ctrl + F', 'Ctrl + H', 'Ctrl + G', 'Ctrl + R'],
    correctIndex: 1,
    explanation: 'Ctrl + H membuka dialog Find & Replace secara langsung. Sedangkan Ctrl + F biasanya hanya membuka panel Find (Pencarian).',
    category: 'Shortcut',
    difficulty: 'Sedang'
  },
  {
    id: 'q6',
    question: 'Jika ingin membuat Daftar Isi secara otomatis di Microsoft Word, syarat utama pemformatan judul dan sub-judul dokumen adalah...',
    options: [
      'Menuliskan nomor halaman secara manual di akhir baris',
      'Menggunakan format Paragraph Styles seperti Heading 1, Heading 2, dan Heading 3',
      'Membuat tabel khusus bergaris transparan',
      'Mengubah ukuran font setiap bab menjadi 24pt'
    ],
    correctIndex: 1,
    explanation: 'Fitur Table of Contents (Daftar Isi Otomatis) membaca teks yang telah diformat menggunakan Paragraph Styles Heading 1, Heading 2, dll.',
    category: 'Mail Merge & Fitur Lanjut',
    difficulty: 'Tantangan'
  },
  {
    id: 'q7',
    question: 'Kombinasi tombol keyboard untuk memotong (Cut) teks yang dipilih lalu menyimpannya di clipboard adalah...',
    options: ['Ctrl + C', 'Ctrl + X', 'Ctrl + V', 'Ctrl + Z'],
    correctIndex: 1,
    explanation: 'Ctrl + X berfungsi untuk Cut (memotong teks), Ctrl + C untuk Copy (menyalin), dan Ctrl + V untuk Paste (menempelkan).',
    category: 'Shortcut',
    difficulty: 'Mudah'
  },
  {
    id: 'q8',
    question: 'Fitur yang terletak di tab "References" dan berguna untuk menambahkan catatan penjelasan atau rujukan di bagian paling bawah halaman dokumen disebut...',
    options: ['Footer', 'Footnote (Catatan Kaki)', 'Watermark', 'Endnote'],
    correctIndex: 1,
    explanation: 'Footnote (Catatan Kaki) disisipkan di bagian bawah halaman tempat rujukan berada, sedangkan Endnote diletakkan di akhir seluruh dokumen.',
    category: 'Ribbon & Menu',
    difficulty: 'Sedang'
  },
  {
    id: 'q9',
    question: 'Tombol fungsi (Function Key) pada keyboard yang berguna untuk membuka dialog "Save As" secara langsung di Microsoft Word adalah...',
    options: ['F4', 'F7', 'F12', 'Ctrl + S'],
    correctIndex: 2,
    explanation: 'Menekan tombol F12 akan langsung membuka dialog Save As. Tombol F7 digunakan untuk Spelling and Grammar check.',
    category: 'Shortcut',
    difficulty: 'Tantangan'
  },
  {
    id: 'q10',
    question: 'Untuk membagi teks dokumen menjadi format 2 kolom atau 3 kolom seperti pada artikel koran, menu yang digunakan adalah...',
    options: [
      'Tab Layout > Columns',
      'Tab Insert > Table',
      'Tab View > Split',
      'Tab Home > Paragraph Spacing'
    ],
    correctIndex: 0,
    explanation: 'Menu Tab Layout > Columns digunakan untuk membagi teks menjadi 1, 2, 3 kolom atau kolom Left/Right.',
    category: 'Page Layout',
    difficulty: 'Mudah'
  },
  {
    id: 'q11',
    question: 'Apakah perbedaan mendasar antara "Header" dan "Watermark" pada dokumen Microsoft Word?',
    options: [
      'Header muncul di atas halaman sebagai identitas berkas, sedangkan Watermark adalah teks/gambar samar latar belakang',
      'Header hanya bisa berisi angka, Watermark hanya bisa berisi tabel',
      'Header tidak bisa dicetak, sedangkan Watermark bisa dicetak',
      'Tidak ada perbedaan, keduanya fungsi yang sama persis'
    ],
    correctIndex: 0,
    explanation: 'Header adalah area atas setiap halaman dokumen untuk judul atau bab, sedangkan Watermark (tanda air) adalah teks/gambar transparan di belakang teks utama.',
    category: 'Page Layout',
    difficulty: 'Sedang'
  },
  {
    id: 'q12',
    question: 'Shortcut keyboard yang sangat berguna untuk langsung membuat halaman baru (Page Break) tanpa menekan Enter berkali-kali adalah...',
    options: ['Shift + Enter', 'Ctrl + Enter', 'Alt + Enter', 'Ctrl + Shift + Enter'],
    correctIndex: 1,
    explanation: 'Ctrl + Enter langsung menyisipkan Page Break dan melompatkan kursor ke awal halaman baru yang bersih.',
    category: 'Shortcut',
    difficulty: 'Mudah'
  },
  {
    id: 'q13',
    question: 'Ketika kamu menyisipkan tabel ke dalam dokumen, lalu ingin menggabungkan 2 sel atau lebih menjadi 1 sel besar, perintah yang digunakan adalah...',
    options: ['Split Cells', 'Merge Cells', 'Distribute Columns', 'AutoFit'],
    correctIndex: 1,
    explanation: 'Merge Cells digunakan untuk menyatukan beberapa sel yang disorot menjadi satu sel tunggal.',
    category: 'Tabel & Gambar',
    difficulty: 'Mudah'
  },
  {
    id: 'q14',
    question: 'Fitur pengaturan posisi gambar terhadap teks (Text Wrapping) yang membuat teks mengelilingi batas bentuk gambar secara rapat adalah...',
    options: ['In Line with Text', 'Tight', 'Behind Text', 'In Front of Text'],
    correctIndex: 1,
    explanation: 'Wrapping "Tight" membuat teks mengalir rapat mengikuti kontur/lekukan gambar grafis.',
    category: 'Tabel & Gambar',
    difficulty: 'Sedang'
  },
  {
    id: 'q15',
    question: 'Untuk menyalin format suatu teks (seperti jenis font, warna, ukuran, dan ketebalan) ke teks lain tanpa mengubah isinya, ikon alat yang dipakai adalah...',
    options: ['Format Painter (gambar kuas)', 'Paste Special', 'Change Case', 'Clear Formatting'],
    correctIndex: 0,
    explanation: 'Format Painter (ikon kuas cat di tab Home) memungkinkan kamu menyalin gaya pemformatan dari satu teks ke teks lain dengan sekali klik.',
    category: 'Ribbon & Menu',
    difficulty: 'Mudah'
  },
  {
    id: 'q16',
    question: 'Shortcut untuk membatalkan perintah terakhir yang dilakukan (Undo) di Microsoft Word adalah...',
    options: ['Ctrl + Z', 'Ctrl + Y', 'Ctrl + U', 'Ctrl + W'],
    correctIndex: 0,
    explanation: 'Ctrl + Z untuk Undo (membatalkan aksi), sedangkan Ctrl + Y untuk Redo / Repeat (mengulang aksi).',
    category: 'Shortcut',
    difficulty: 'Mudah'
  },
  {
    id: 'q17',
    question: 'Jika ingin mengubah teks berhuruf kecil semua menjadi huruf BESAR SEMUA (Kapital) sekaligus, opsi Change Case manakah yang dipilih?',
    options: ['Sentence case', 'lowercase', 'UPPERCASE', 'Capitalize Each Word'],
    correctIndex: 2,
    explanation: 'UPPERCASE mengubah semua huruf yang disorot menjadi huruf kapital. Shortcut cepatnya adalah Shift + F3.',
    category: 'Ribbon & Menu',
    difficulty: 'Mudah'
  },
  {
    id: 'q18',
    question: 'Satuan ukuran standar yang umum digunakan untuk margin halaman dokumen di Indonesia dalam Microsoft Word adalah...',
    options: ['Pixel (px)', 'Centimeter (cm) / Inci (inch)', 'Kilogram (kg)', 'Hertz (Hz)'],
    correctIndex: 1,
    explanation: 'Margin dokumen menggunakan satuan Centimeter (cm) atau Inch (in). Format standar makalah sering kali 4-4-3-3 cm (Top-Left-Bottom-Right).',
    category: 'Page Layout',
    difficulty: 'Mudah'
  },
  {
    id: 'q19',
    question: 'Ikon bertuliskan tanda "x²" (angka 2 kecil di atas) pada tab Home kelompok Font digunakan untuk membuat...',
    options: ['Subscript', 'Superscript', 'Strikethrough', 'Double Underline'],
    correctIndex: 1,
    explanation: 'Superscript membuat karakter kecil di atas garis teks (misal: pangkat m² atau x²). Sedangkan Subscript (x₂) membuat karakter kecil di bawah (misal: H₂O).',
    category: 'Ribbon & Menu',
    difficulty: 'Sedang'
  },
  {
    id: 'q20',
    question: 'Perintah cepat untuk menyimpan dokumen yang sedang dikerjakan agar data tidak hilang adalah...',
    options: ['Ctrl + S', 'Ctrl + P', 'Ctrl + O', 'Ctrl + N'],
    correctIndex: 0,
    explanation: 'Ctrl + S berfungsi untuk Save (menyimpan dokumen). Ctrl + P untuk Print, Ctrl + O untuk Open, dan Ctrl + N untuk New Document.',
    category: 'Shortcut',
    difficulty: 'Mudah'
  }
];
