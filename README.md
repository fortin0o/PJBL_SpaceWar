# 🚀 Space War : Shooting

> **Game arcade 2D bergaya retro cyberpunk** — kendalikan pesawat tempur luar angkasa dan hancurkan gelombang alien penyerang dengan laser neon!

---

## 📖 Deskripsi

**Space War : Shooting** adalah game tembak-menembak (shoot 'em up) 2D berbasis browser yang dibangun dengan **Phaser 3**. Pemain mengendalikan pesawat luar angkasa yang bertugas mempertahankan bumi dari serangan alien. Game ini menampilkan visual cyberpunk/synthwave dengan efek partikel neon, audio sintetis retro, dan sistem level yang progressif.

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🎮 **Kontrol Ganda** | Dukungan keyboard (WASD / Arrow Keys) dan kontrol sentuh mobile |
| 🔫 **Sistem Senjata** | Laser standar dan mode tembakan penyebaran (spread shot) |
| 🛡️ **Power-Up** | 3 jenis power-up: Spread Shot, Shield, dan Bomb Shockwave |
| 👾 **Tipe Musuh** | 3 varian alien: Scout (cepat), Fighter (standar), dan Cruiser (besar, membelah jadi 2 scout) |
| 📈 **Sistem Level** | Naik level otomatis setiap 1500 poin, kesulitan meningkat secara progresif |
| 🏆 **Skor Tertinggi** | Penyimpanan rekor tertinggi di localStorage |
| 🎵 **Audio Sintetis** | Efek suara retro menggunakan Web Audio API (laser, ledakan, power-up, dll.) |
| 📱 **Responsif** | Mendukung desktop dan perangkat mobile dengan kontrol sentuh D-pad |

---

## 🎮 Cara Bermain

### Kontrol Desktop
| Aksi | Tombol |
|------|--------|
| Gerak | `W` `A` `S` `D` atau `↑` `←` `↓` `→` |
| Tembak | `SPACE` atau **klik mouse** |
| Jeda | `P` |

### Kontrol Mobile
- **D-Pad virtual** di sisi kiri layar untuk bergerak
- **Tombol tembak** (ikon crosshair) di sisi kanan layar

### Mekanisme Permainan
1. **Musuh** turun dari atas layar — tembak sebelum mereka lolos ke bawah!
2. Setiap musuh yang lolos mengurangi **1 nyawa** (total 5 nyawa).
3. Kumpulkan **power-up** yang dijatuhkan musuh yang dihancurkan:
   - 🔵 **Spread Shot** — tembakan menyebar 3 arah + fire rate cepat (9 detik)
   - 🟡 **Shield** — perisai pelindung yang menyerap 2 serangan
   - 🔴 **Bomb** — gelombang kejut yang menghancurkan semua musuh di layar
4. **Naik level** setiap 1500 poin — musuh muncul lebih cepat dan bergerak lebih kencang.

---

## 🛠️ Teknologi

- **[Phaser 3](https://phaser.io/)** (v3.60.0) — framework game HTML5
- **HTML5 Canvas** — rendering grafis
- **Web Audio API** — audio sintetis prosedural
- **Vanilla CSS** — styling antarmuka dashboard
- **Font Awesome** — ikon tombol UI
- **Google Fonts** — Orbitron & Rajdhani (dimuat via CSS)

---

## 📁 Struktur Proyek

```
PJBL_SpaceWar/
├── index.html          # Halaman utama HTML + struktur UI dashboard
├── style.css           # Stylesheet untuk layout, tombol, dan kontrol mobile
├── game.js             # Seluruh logika game Phaser 3 (scenes, physics, audio)
├── assets/
│   ├── spaceship.png   # Sprite pesawat pemain
│   ├── alien.png       # Sprite musuh alien
│   └── powerup.png     # Sprite item power-up
└── README.md           # Dokumentasi proyek (file ini)
```

---

## 🚀 Cara Menjalankan

1. **Clone** repositori ini:
   ```bash
   git clone https://github.com/fortin0o/gameShooterSimple.git
   ```

2. **Buka** file `index.html` langsung di browser modern, **atau** gunakan local server:
   ```bash
   # Menggunakan ekstensi Live Server di VS Code
   # atau menggunakan Python:
   python -m http.server 8000
   ```

3. **Mainkan** — klik layar atau tekan `SPACE` untuk memulai dari menu utama.

> **Catatan:** Game memerlukan browser modern yang mendukung HTML5 Canvas dan Web Audio API (Chrome, Firefox, Edge, Safari terbaru).

4. Atau bisa akses link github-pages ini 'https://fortin0o.github.io/PJBL_SpaceWar/'

---

## 🎨 Arsitektur Game

Game ini terdiri dari **5 Scene** yang dikelola oleh Phaser Scene Manager:

```
BootScene → MenuScene → GameScene ⇄ PauseScene
                             ↓
                       GameOverScene
```

| Scene | Fungsi |
|-------|--------|
| `BootScene` | Memuat asset gambar, menerapkan filter transparansi (chroma-key), dan membuat tekstur prosedural |
| `MenuScene` | Tampilan menu utama dengan animasi starfield dan grid synthwave |
| `GameScene` | Scene utama gameplay — mengelola pemain, musuh, senjata, power-up, scoring, dan level |
| `PauseScene` | Overlay jeda game dengan latar semi-transparan |
| `GameOverScene` | Overlay akhir game menampilkan skor dan rekor tertinggi |

### Komponen Utama

- **`SoundSynth`** — Kelas synthesizer audio yang menghasilkan efek suara retro secara prosedural menggunakan Web Audio API
- **`makeTextureTransparent()`** — Fungsi utilitas untuk menghapus latar belakang hitam dari sprite menggunakan teknik chroma-key piksel
- **Mobile Controls** — Sistem kontrol sentuh yang memetakan tombol D-pad HTML ke input game Phaser

---

## 👥 Tim Pengembang

Proyek ini dibuat sebagai bagian dari **Project Based Learning (PJBL)**.

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan edukasi.
