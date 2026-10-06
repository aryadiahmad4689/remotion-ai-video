# Remotion: GPT-6.1 Sol × Solana Motion Graphics

Proyek video motion graphics terprogram menggunakan **Remotion (React + TypeScript)** dengan tema **GPT-6.1 Sol x Solana**. Dibuat mengikuti standar resmi Remotion & panduan tutorial Claude Code.

---

## 🚀 Fitur Unggulan

- **Deterministik & Tanpa Halusinasi**: Setiap animasi dihitung matematis berdasarkan frame (`useCurrentFrame()`).
- **Spring Physics**: Animasi halus dengan `damping: 12-15`, `mass: 0.4-0.7`, dan `stiffness: 100-140`.
- **Kinetic Typography**: Teks muncul staggered (kata-demi-kata) dengan filter blur dinamis dan spring scale.
- **Glassmorphic Metric Cards**: Angka berhitung otomatis (*count-up*) dari 0 ke target dengan progress bar interaktif.
- **Tema Visual Solana High-Tech**: Obsidian background (`#07090E`), Solana Green (`#14F195`), Cyber Purple (`#9945FF`), dan Cyan Glow (`#00F0FF`).

---

## 🛠️ Perintah Utama

### 1. Jalankan Remotion Studio (Preview Interaktif)
Buka UI web interaktif untuk memutar, menggeser timeline per-frame, dan inspeksi komponen:
```bash
npm run start
```
*(Buka URL yang muncul di browser, biasanya `http://localhost:3000`)*

### 2. Render 1 Frame Gambar (Thumbnail / Still)
```bash
npm run still
```
*(Hasil disimpan di `out/thumbnail.png`)*

### 3. Render Video Penuh (MP4)
```bash
npm run build
```
*(Hasil video MP4 1080p 30fps akan dirender ke `out/video.mp4`)*

---

## 📁 Struktur Komponen
- `src/Root.tsx`: Definisi resolusi (1920x1080), framerate (30 FPS), dan durasi (300 frames / 10 detik).
- `src/Composition.tsx`: Timeline master yang menyusun scene dengan `<Sequence>`.
- `src/components/Background.tsx`: Animated cyber grid dan ambient aurora glow.
- `src/components/SolanaBadge.tsx`: Badge pill resmi dengan micro-animation.
- `src/components/KineticText.tsx`: Generator kinetic typography per-kata.
- `src/components/MetricCard.tsx`: Card metrik data dinamis dengan animasi count-up.
- `src/scenes/`: 4 scene berurutan (Intro, Capabilities, Benchmarks, Outro).
- `REMOTION_RULES.md`: Panduan aturan animasi untuk AI agent dan developer.
