# Panduan Menjalankan Aplikasi SecureHive

SecureHive adalah aplikasi dashboard keamanan siber yang dibangun dengan React + Express.js, menggunakan PostgreSQL sebagai database dan AI untuk analisis ancaman.

## Prasyarat Sistem

1. **Node.js** (versi 18 atau lebih tinggi)
2. **npm** (biasanya terinstal dengan Node.js)
3. **PostgreSQL** (versi 12 atau lebih tinggi)
4. **Git** (untuk cloning repository)

## Langkah-langkah Instalasi dan Menjalankan

### 1. Persiapan Environment

Setelah masuk ke direktori project, copy file environment example:
```bash
cp .env.example .env
```

Edit file `.env` dan sesuaikan konfigurasi:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/securehive

# OpenAI API Configuration (untuk fitur AI analysis)
OPENAI_API_KEY=your_openai_api_key_here

# Node Environment
NODE_ENV=development
```

**Konfigurasi Database:**
- Ganti `username`, `password`, `localhost`, `5432`, dan `securehive` sesuai dengan setup PostgreSQL Anda
- Pastikan database `securehive` sudah dibuat

**OpenAI API Key:**
- Daftar di [OpenAI Platform](https://platform.openai.com/)
- Buat API key dan masukkan ke `OPENAI_API_KEY`
- Jika tidak ingin menggunakan fitur AI, biarkan `default_key`

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

Jalankan migrasi database untuk membuat tabel-tabel yang dibutuhkan:
```bash
npm run db:push
```

### 4. Verifikasi Setup

Cek apakah tidak ada error TypeScript:
```bash
npm run check
```

### 5. Menjalankan Aplikasi

#### Mode Development (dengan hot reload):
```bash
npm run dev
```

#### Mode Production:
```bash
# Build aplikasi terlebih dahulu
npm run build

# Jalankan dalam mode production
npm run start
```

### 6. Akses Aplikasi

- Buka browser dan akses: `http://localhost:5000`
- Aplikasi akan serve frontend dan backend API dalam satu port

## Troubleshooting

### Error: "DATABASE_URL must be set"
- Pastikan file `.env` ada dan berisi `DATABASE_URL` yang valid
- Verifikasi PostgreSQL berjalan dan database sudah dibuat
- Test koneksi database dengan tool seperti psql atau pgAdmin

### Error: "EADDRINUSE: address already in use"
- Port 5000 sudah digunakan
- Tutup aplikasi lain yang menggunakan port 5000
- Atau ubah port di `server/index.ts` (baris 58)

### Error saat npm install
- Hapus folder `node_modules` dan file `package-lock.json`
- Jalankan `npm cache clean --force`
- Install ulang dengan `npm install`

### Error TypeScript
- Jalankan `npm run check` untuk melihat error detail
- Pastikan semua dependencies terinstall dengan benar

### Database Connection Error
1. Pastikan PostgreSQL service berjalan:
   ```bash
   # Ubuntu/Debian
   sudo systemctl status postgresql
   
   # Windows (jika menggunakan WSL)
   sudo service postgresql status
   ```

2. Verifikasi user dan database:
   ```bash
   psql -U username -d securehive -h localhost
   ```

3. Buat database jika belum ada:
   ```sql
   CREATE DATABASE securehive;
   ```

## Struktur Aplikasi

```
/
├── client/          # Frontend React app
├── server/          # Backend Express.js API
├── shared/          # Shared types dan schema
├── package.json     # Dependencies dan scripts
├── .env            # Environment variables
└── drizzle.config.ts # Database configuration
```

## Scripts yang Tersedia

- `npm run dev` - Jalankan dalam mode development
- `npm run build` - Build aplikasi untuk production
- `npm run start` - Jalankan dalam mode production
- `npm run check` - Type checking TypeScript
- `npm run db:push` - Push schema ke database

## Fitur Utama

1. **Dashboard Keamanan** - Monitor aktivitas keamanan real-time
2. **Traffic Logs** - Log dan analisis traffic yang masuk
3. **Attack Patterns** - Deteksi dan analisis pola serangan
4. **AI Analysis** - Analisis ancaman menggunakan OpenAI
5. **System Metrics** - Monitoring performa sistem

## Catatan Keamanan

- Jangan commit file `.env` ke repository
- Gunakan password yang kuat untuk database
- Jaga kerahasiaan OpenAI API key
- Untuk production, gunakan HTTPS dan konfigurasi keamanan tambahan

## Support

Jika mengalami masalah:
1. Periksa logs di terminal
2. Pastikan semua prasyarat terpenuhi
3. Verifikasi konfigurasi environment
4. Check dokumentasi di folder `honeypot-security/` untuk informasi tambahan