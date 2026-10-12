import { TypingChallenge } from '../types/wordGame';

export const TYPING_CHALLENGES: TypingChallenge[] = [
  {
    id: 'type-1',
    title: 'Shortcut Kilat MS Word',
    category: 'Shortcut Word',
    text: 'Ctrl+B membuat teks tebal, Ctrl+I miring, Ctrl+U garis bawah, Ctrl+S simpan dokumen, Ctrl+Z batalkan aksi, Ctrl+Y ulangi aksi, Ctrl+C salin, Ctrl+V tempel.',
    targetWpm: 35,
    timeLimit: 45,
    hint: 'Latih jari tanganmu menghafal kombinasi shortcut keyboard paling sering digunakan di Microsoft Word!'
  },
  {
    id: 'type-2',
    title: 'Perataan & Tata Letak Paragraf',
    category: 'Fitur & Fungsi',
    text: 'Ctrl+L untuk rata kiri, Ctrl+E untuk rata tengah, Ctrl+R untuk rata kanan, dan Ctrl+J untuk rata kanan kiri. Gunakan tab Layout untuk mengatur batas margin dan orientasi kertas.',
    targetWpm: 40,
    timeLimit: 50,
    hint: 'Ingat akronim: L=Left, E=Center (tengah), R=Right, J=Justify (kanan-kiri).'
  },
  {
    id: 'type-3',
    title: 'Fitur Dokumen Tingkat Lanjut',
    category: 'Fitur & Fungsi',
    text: 'Fitur Mail Merge mempermudah pengiriman surat massal secara otomatis. Fitur Table of Contents membaca format Heading untuk menyusun daftar isi tanpa perlu mengetik manual.',
    targetWpm: 45,
    timeLimit: 60,
    hint: 'Dua fitur unggulan Microsoft Word yang wajib dikuasai siswa kelas 10 Informatika!'
  },
  {
    id: 'type-4',
    title: 'Penyusunan Makalah Informatika',
    category: 'Paragraf Dokumen',
    text: 'Dalam membuat laporan praktikum informatika, kita menggunakan ukuran kertas A4 dengan margin 4-4-3-3 cm. Header dan Footer disisipkan untuk nomor halaman dan identitas sekolah.',
    targetWpm: 42,
    timeLimit: 60,
    hint: 'Format baku makalah ilmiah di sekolah dan perguruan tinggi.'
  },
  {
    id: 'type-5',
    title: 'Tabel & Grafis Dokumen',
    category: 'Fitur & Fungsi',
    text: 'Sisipkan tabel melalui tab Insert lalu atur baris dan kolom. Gunakan Merge Cells untuk menyatukan sel dan Text Wrapping Tight agar teks mengalir rapi di samping gambar.',
    targetWpm: 40,
    timeLimit: 55,
    hint: 'Kombinasi tabel dan gambar memperjelas sajian data dalam dokumen tugas.'
  }
];
