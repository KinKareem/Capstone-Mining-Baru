# Mining Value Chain Optimization — Project Capstone Asah

Project monorepo untuk sistem monitoring pertambangan, mencakup backend Node.js, frontend Vite, dan modul ML Python.

## Struktur Proyek

```
Capstone-Project-ASAH_Kareem-Team/
├── backend/
│   ├── package.json
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       └── services/
├── database/
│   └── schema.sql
├── docs/
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── public/
│   │   └── assets/
│   └── src/
│       ├── pages/
│       ├── style/
│       ├── components/
│       └── utils/
└── ml/
```

## Prasyarat

- Node.js `>=18`
- npm (atau yarn/pnpm)
- MySQL Server (untuk koneksi database backend)

## Instalasi Frontend

- Masuk ke folder frontend:
  - `cd frontend`
- Install dependencies:
  - `npm install`
- Jalankan dev server:
  - `npm run dev`
- Akses pengembangan:
  - `http://localhost:5173/`

## Instalasi Backend

- Masuk ke folder backend:
  - `cd backend`
- Install dependencies:
  - `npm install`
- Buat file `.env` di folder `backend/` berisi pengaturan koneksi database:
  ```env
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=
  DB_NAME=db_mining_app
  JWT_SECRET= (ini ganti sama yang klean mau aja)
  PORT=3000
  ```
- Jalankan server (development):
  - `npm run dev`
- Server akan berjalan di `http://localhost:3000/` (tergantung konfigurasi `PORT`).

## Database

- File `database/schema.sql` berisi skema `db_mining_app` (tabel `tb_roles`, `tb_users`).
- Jalankan query jangan lupa

## Fungsi Tiap Folder

- `backend/`: API server Express.
  - `src/routes/`: Definisi endpoint (`auth.js`).
  - `src/controllers/`: Logika request/response (`authController.js`).
  - `src/services/`: Koneksi/data access (`database.js`).
  - `src/models/`: Model/data structure.
- `frontend/`: Aplikasi Vite (pemilihan role, login/register, dashboard).
  - `public/assets/`: Aset publik (`/assets/...`).
  - `src/pages/`: Script halaman (`login.js`, `register.js`).
  - `src/style/`: CSS global tema hitam–putih `center-screen`.
- `database/`: Skema MySQL.
- `docs/`: Dokumentasi tambahan.
- `ml/`: Modul ML (Kerjaan Adam sama Khazel).

### Komponen Dashboard (`frontend/src/components`)

- Berisi komponen UI reusable untuk halaman `dashboard.html`.
- Contoh komponen yang umum:
  - Card informasi (KPI ringkas: produksi, shipment, anomali)
  - Tabel data (operasi penambangan, jadwal kapal, status alat)
  - Grafik/visualisasi (tren produksi, utilisasi alat, lead time)
  - Filter & controls (rentang tanggal, site, equipment, role-aware)

## Catatan Arsitektur

- Frontend mengikuti pola MVP (Model–View–Presenter).
- Gunakan praktik aksesibilitas: semantic HTML, ARIA, dan navigasi keyboard. (aku belum wkwkwkwkwkkwkw)
- Backend memakai arsitektur berlapis: `routes → controllers → services`.

## Pengembangan Bersamaan

- Jalankan frontend dan backend di terminal terpisah untuk pengembangan paralel.

