# Portfolio - Muhammad Fauzan Raffa Al-Habsy

Situs portofolio pribadi untuk Muhammad Fauzan Raffa Al-Habsy, web developer dari SMKN 1 Tenggarong. Dibangun dengan Tailwind CSS v4, sepenuhnya statis, dwibahasa Indonesia/Inggris, dan siap dipasang sebagai PWA.

**Live: <https://fauzan-raffa.page.gd/>**

![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8) ![PWA](https://img.shields.io/badge/PWA-ready-5a0fc8)

## Fitur

- **Dwibahasa Indonesia / Inggris** - teks ditandai atribut `data-id` / `data-en` dan ditukar tanpa reload.
- **Bagian lengkap** - proyek terpilih, keahlian, perjalanan, dan ajakan kolaborasi.
- **PWA** - dapat dipasang dan berfungsi offline melalui manifest dan service worker.
- **Statis dan cepat** - tanpa framework JavaScript; satu berkas CSS hasil build Tailwind yang sudah di-minify.

## Persyaratan

- Node.js 18 atau lebih baru (hanya untuk development)

## Development

```bash
# Pasang dependensi
npm install

# Mode watch - CSS dibangun ulang otomatis saat src/input.css berubah
npm run watch:css

# Build produksi - generate ikon dan minify CSS
npm run build
```

Hasil build ditulis ke `assets/css/main.css` dan ikut di-commit, sehingga situs dapat dibuka langsung tanpa membangun ulang.

## Struktur Proyek

```
CV web saya/
├── index.html               # Halaman utama (single page)
├── src/input.css            # Sumber Tailwind CSS
├── assets/css/main.css      # Hasil build (di-commit)
├── tools/generate-icons.mjs # Generator ikon PWA
├── manifest.webmanifest     # Manifest PWA
├── sw.js                    # Service worker
└── package.json
```

## Deploy

Situs ini sepenuhnya statis dan dapat di-hosting di mana saja:

- **GitHub Pages**: Settings, Pages, pilih branch `main`.
- **Netlify / Vercel**: unggah folder tanpa build command.
- **Shared hosting**: salin seluruh berkas ke `public_html/`.

## Lisensi

Hak cipta 2026 Muhammad Fauzan Raffa Al-Habsy.
