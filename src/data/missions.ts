import { Mission } from '../types/wordGame';

export const WORD_MISSIONS: Mission[] = [
  {
    id: 'm1',
    title: 'Misi 1: Format Judul Dokumen Praktikum',
    description: 'Budi diminta guru informatika untuk memformat judul dokumen laporan agar terlihat tegas, besar, dan berada tepat di tengah halaman.',
    targetRibbonTab: 'Home',
    xpReward: 150,
    steps: [
      {
        id: 'm1-s1',
        text: 'Aktifkan format Tebal (Bold) pada teks dokumen',
        isCompleted: (doc) => doc.isBold
      },
      {
        id: 'm1-s2',
        text: 'Perbesar ukuran font menjadi minimal 16pt (klik font size)',
        isCompleted: (doc) => doc.fontSize >= 16
      },
      {
        id: 'm1-s3',
        text: 'Ubah perataan teks menjadi Rata Tengah (Align Center)',
        isCompleted: (doc) => doc.alignment === 'center'
      }
    ]
  },
  {
    id: 'm2',
    title: 'Misi 2: Tata Letak Halaman & Orientasi Kertas',
    description: 'Dokumen berisi tabel data lebar sehingga membutuhkan ruang mendatar. Ubah orientasi dan margin dokumen.',
    targetRibbonTab: 'Layout',
    xpReward: 180,
    steps: [
      {
        id: 'm2-s1',
        text: 'Buka tab Layout dan ubah Orientasi kertas menjadi Landscape',
        isCompleted: (doc) => doc.orientation === 'landscape'
      },
      {
        id: 'm2-s2',
        text: 'Atur Margin dokumen menjadi "Narrow" (Margin Sempit)',
        isCompleted: (doc) => doc.marginType === 'narrow'
      },
      {
        id: 'm2-s3',
        text: 'Pastikan Ukuran Kertas adalah A4',
        isCompleted: (doc) => doc.pageSize === 'A4'
      }
    ]
  },
  {
    id: 'm3',
    title: 'Misi 3: Kerapian Paragraf & Drop Cap Editorial',
    description: 'Buat paragraf teks laporan menjadi rapi seperti standar buku dan tambahkan huruf Drop Cap di awal kalimat.',
    targetRibbonTab: 'Home',
    xpReward: 200,
    steps: [
      {
        id: 'm3-s1',
        text: 'Atur perataan paragraf menjadi Rata Kanan-Kiri (Justify)',
        isCompleted: (doc) => doc.alignment === 'justify'
      },
      {
        id: 'm3-s2',
        text: 'Ubah spasi baris (Line Spacing) menjadi 1.5 spasi',
        isCompleted: (doc) => doc.lineSpacing === 1.5
      },
      {
        id: 'm3-s3',
        text: 'Buka tab Insert dan aktifkan fitur Drop Cap (Huruf besar majalah)',
        isCompleted: (doc) => doc.hasDropCap
      }
    ]
  },
  {
    id: 'm4',
    title: 'Misi 4: Sisipkan Tabel & Header Dokumen',
    description: 'Lengkapi dokumen informatika dengan tabel data spesifikasi komputer dan header penanda sekolah.',
    targetRibbonTab: 'Insert',
    xpReward: 220,
    steps: [
      {
        id: 'm4-s1',
        text: 'Buka tab Insert dan sisipkan Tabel (Insert Table) ke dalam lembar kerja',
        isCompleted: (doc) => doc.hasTable
      },
      {
        id: 'm4-s2',
        text: 'Aktifkan Header Dokumen (klik tombol Header)',
        isCompleted: (doc) => doc.hasHeader
      },
      {
        id: 'm4-s3',
        text: 'Aktifkan Bullets atau Numbering pada paragraf',
        isCompleted: (doc) => doc.hasBullets || doc.hasNumbering
      }
    ]
  },
  {
    id: 'm5',
    title: 'Misi 5: Struktur Referensi & Daftar Isi',
    description: 'Laporan resmi membutuhkan Daftar Isi Otomatis (Table of Contents) agar mudah dinavigasi oleh penguji.',
    targetRibbonTab: 'References',
    xpReward: 250,
    steps: [
      {
        id: 'm5-s1',
        text: 'Buka tab References pada Ribbon',
        isCompleted: (_doc) => true // user navigates to tab
      },
      {
        id: 'm5-s2',
        text: 'Klik tombol Table of Contents untuk menyisipkan Daftar Isi Otomatis',
        isCompleted: (doc) => doc.hasTableOfContents
      },
      {
        id: 'm5-s3',
        text: 'Beri warna teks bernuansa Biru (#1E3A5F atau #2563EB)',
        isCompleted: (doc) => doc.textColor.includes('#1E3A5F') || doc.textColor.includes('#2563EB') || doc.textColor.includes('blue')
      }
    ]
  }
];
