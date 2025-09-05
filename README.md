# Proyek Manajemen Inventaris (Civintory)

Selamat datang di Civintory, sebuah sistem manajemen inventaris interaktif dan responsif yang dibangun dengan tumpukan teknologi modern. Aplikasi ini memungkinkan pengguna untuk melacak item, mengelola pergerakan stok, dan melihat laporan analitik.

## Fitur Utama

- **Dashboard Utama**: Ringkasan statistik inventaris, bagan pergerakan stok, dan daftar barang yang hampir habis.
- **Manajemen Inventaris**: Operasi CRUD (Create, Read, Update, Delete) penuh untuk item inventaris.
- **Pencatatan Stok**: Formulir untuk mencatat barang masuk dan keluar.
- **Laporan & Analitik**: Halaman laporan dengan pemfilteran canggih berdasarkan periode dan jenis transaksi.
- **Impor/Ekspor**: Fungsionalitas untuk mengimpor dan mengekspor data inventaris menggunakan file CSV.
- **Notifikasi Real-time**: Peringatan otomatis saat stok barang menipis.

## Teknologi yang Digunakan

- **Kerangka Kerja**: [Next.js](https://nextjs.org/) (App Router)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Komponen UI**: [Shadcn/ui](https://ui.shadcn.com/)
- **Database & Backend**: [Supabase](https://supabase.io/)
- **Bagan (Charts)**: [Recharts](https://recharts.org/)
- **Notifikasi**: [Sonner](https://sonner.emilkowal.ski/)
- **Parsing CSV**: [Papa Parse](https://www.papaparse.com/)

## Struktur Proyek

Berikut adalah gambaran umum struktur direktori utama:

```
.
├── src/
│   ├── app/                # Halaman dan rute utama aplikasi (App Router)
│   ├── components/         # Komponen React yang dapat digunakan kembali
│   │   ├── dashboard/      # Komponen khusus untuk halaman Dashboard
│   │   ├── inventory/      # Komponen untuk fitur manajemen inventaris
│   │   ├── layout/         # Komponen layout (Header, Sidebar)
│   │   ├── reports/        # Komponen untuk halaman Laporan
│   │   ├── stock/          # Komponen untuk pencatatan stok
│   │   └── ui/             # Komponen UI dari Shadcn (Button, Card, dll.)
│   ├── hooks/              # Custom React hooks (cth. useAudio)
│   └── lib/                # Logika, utilitas, dan koneksi Supabase
│       ├── supabase.ts     # Inisialisasi klien Supabase
│       ├── types.ts        # Definisi tipe TypeScript
│       └── utils.ts        # Fungsi utilitas umum
├── .env.local.example      # Contoh file environment variable
└── ...
```

## Menjalankan Proyek Secara Lokal

Ikuti langkah-langkah ini untuk menjalankan proyek di lingkungan pengembangan lokal Anda.

### 1. Prasyarat

- [Node.js](https://nodejs.org/) (versi 18 atau lebih baru)
- [npm](https://www.npmjs.com/) atau [yarn](https://yarnpkg.com/)

### 2. Kloning Repositori

```bash
git clone https://github.com/USERNAME/REPO_NAME.git
cd REPO_NAME
```

### 3. Instal Dependensi

Jalankan perintah berikut untuk menginstal semua paket yang diperlukan:

```bash
npm install
```

### 4. Konfigurasi Environment Variables

Aplikasi ini memerlukan koneksi ke proyek Supabase. Anda perlu menyediakan URL proyek dan kunci `anon` (publik).

1.  Buat salinan dari file `.env.local.example` dan beri nama `.env.local`.
    ```bash
    cp .env.local.example .env.local
    ```

2.  Buka file `.env.local` dan isi dengan kredensial Supabase Anda. Anda bisa mendapatkan nilai-nilai ini dari dasbor proyek Supabase Anda di bawah **Settings > API**.

    ```env
    NEXT_PUBLIC_SUPABASE_URL=https://<YOUR_PROJECT_ID>.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
    ```

    **Penting:** File `.env.local` sudah ada di dalam `.gitignore` untuk memastikan kunci API Anda tidak terekspos di repositori Git.

### 5. Jalankan Server Pengembangan

Setelah konfigurasi selesai, jalankan perintah berikut untuk memulai server pengembangan Next.js:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) (atau port yang ditampilkan di terminal) di browser Anda untuk melihat aplikasi berjalan.
