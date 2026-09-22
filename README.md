# Portfolio — Muhammad Fauzan Raffa Al-Habsy

> Situs portofolio pribadi — Web Developer. Dibangun dengan **Tailwind CSS v4**, statis, dwibahasa (ID/EN), dan PWA-ready.

## ✨ Fitur

- **Dwibahasa ID / EN** — teks ditandai atribut `data-id` / `data-en` dan ditukar tanpa reload.
- **Section lengkap** — Proyek Terpilih, Keahlian, Perjalanan, dan CTA kolaborasi.
- **PWA** — installable & offline-ready (`manifest.webmanifest` + `sw.js`, ikon dari generator).
- **Statis & cepat** — tanpa framework JS; satu file CSS hasil build Tailwind yang sudah di-minify.

## 🛠️ Teknologi

- HTML5 + Tailwind CSS v4 (`@tailwindcss/cli`)
- Vanilla JavaScript
- Service Worker + Web App Manifest (PWA)

## 🚀 Development

Butuh [Node.js](https://nodejs.org/).

```bash
# Install dependensi
npm install

# Mode watch — CSS di-rebuild otomatis saat src/input.css berubah
npm run watch:css

# Build produksi — generate ikon + minify CSS
npm run build
```

Hasil build ditulis ke `assets/css/main.css` (sudah di-commit, jadi situs bisa dibuka langsung tanpa build ulang).

## 📁 Struktur

```
CV web saya/
├── index.html              # Halaman utama (single page)
├── src/input.css           # Sumber Tailwind CSS
├── assets/css/main.css     # Hasil build (committed)
├── tools/generate-icons.mjs# Generator ikon PWA
├── manifest.webmanifest    # Manifest PWA
├── sw.js                   # Service worker
└── package.json
```

## ☁️ Deploy

Situs ini 100% statis — bisa di-hosting di mana saja:

- **GitHub Pages**: Settings → Pages → pilih branch `main`.
- **Netlify / Vercel**: drag & drop folder, tanpa build command.
- **Shared hosting**: upload semua file ke `public_html/`.

---

Hak cipta © 2026 Muhammad Fauzan Raffa Al-Habsy · mahakammoonlightstudio@gmail.com
