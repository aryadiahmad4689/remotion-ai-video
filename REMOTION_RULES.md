# Remotion AI Agent Rulebook & Guidelines
*Standar Resmi Motion Design Vox Documentary & Video Esai Remotion.*

## 1. Golden Rules (Wajib Dipatuhi)

1. **Satu Titik Fokus / Satu Gerakan pada Satu Waktu (Single Focal Point - Anti Pusing)**:
   - **DILARANG KERAS** menjalankan 2 atau lebih animasi secara bersamaan di layar (misalnya teks bergerak bersamaan dengan diagram membesar dan badge berdenyut). Ini membuat penonton pusing dan kehilangan arah pandang.
   - **Koreografi Berurutan (Sequential Choreography)**:
     - *Tahap 1*: Teks judul/pertanyaan meluncur masuk secara tenang (misal frame 0–25). Begitu masuk, teks **DIAM TOTAL** (*locked resting state*).
     - *Tahap 2*: Setelah teks diam, barulah kartu ilustrasi atau diagram utama meluncur masuk (misal frame 40–70). Teks tidak boleh ikut bergerak.
     - *Tahap 3*: Setelah diagram diam, barulah garis panah/koneksi ditarik perlahan (misal frame 90–120).
     - *Tahap 4*: Penekanan visual (stabilo kuning `#FFE600`, lingkaran spidol merah `#E63946`, atau evidence pill) muncul **hanya satu per satu** tepat saat narator mengucapkan kata penting tersebut.

2. **Ketenangan Visual / Resting State (No Sensory Overload)**:
   - Elemen yang sudah masuk ke layar **WAJIB DIAM/TENANG** (*resting state*).
   - DILARANG menggunakan efek looping yang heboh (muter-muter cepat, bergetar, berdenyut keras).
   - Ketenangan (*rest*) adalah ciri khas video dokumenter berkelas tinggi (Vox / Johnny Harris), memberikan penonton ruang dan waktu untuk membaca dan mencerna narasi.

3. **Tempo Dokumenter Tenang (Calm Pacing & Progressive Buildup)**:
   - Satu scene berdurasi ~50 detik HANYA boleh memiliki **2 sampai 3 komposisi utama (Visual Acts)**.
   - **DILARANG membuat slideshow cepat** yang berganti setiap 3–5 detik.
   - **Progressive Buildup**: Jangan membabat habis layar setiap ada kalimat baru. Pertahankan kartu/diagram yang sudah ada, lalu tambahkan highlight stabilo, panah SVG, atau badge perbandingan di sampingnya.

4. **Fisika Pegas Tenang (Documentary Spring Physics)**:
   - Gunakan konfigurasi spring yang tenang dan berbobot:
     `spring({ frame: Math.max(0, frame - cue), fps, config: { damping: 22, mass: 0.9, stiffness: 70 } })`
   - DILARANG menggunakan spring yang terlalu membal/snappy ala TikTok/Shorts (`damping: 10-12, stiffness: 100`).

5. **Transisi Halus Tanpa Patah (Smooth Crossfade Transitions)**:
   - DILARANG melakukan *hard cut / unmount* mendadak (`if (frame >= end) return null` tanpa fade-out).
   - Setiap pergantian kelompok visual WAJIB menggunakan crossfade halus 15–20 frame:
     `const fadeIn = interpolate(frame, [from, from + 16], [0, 1], CLAMP);`
     `const fadeOut = interpolate(frame, [to - 16, to], [1, 0], CLAMP);`
     `opacity = Math.min(fadeIn, fadeOut);`

6. **Never use CSS Transitions / Animations**:
   - DILARANG menggunakan `transition: all 0.3s ease`, `animation: fadeIn`, `setTimeout`, atau `setInterval`.
   - SEMUA animasi WAJIB diturunkan murni dari `useCurrentFrame()` dan `useVideoConfig()`.

7. **Always Clamp Interpolations**:
   - Saat memakai `interpolate(frame, [0, 20], [0, 1])`, SELALU sertakan `{ extrapolateRight: "clamp", extrapolateLeft: "clamp" }`.

8. **Kinetic Typography yang Terbaca**:
   - Teks muncul dengan stagger per kata yang lembut dan tenang (jarak antar kata 4–6 frame).
   - Ukuran teks proporsional, kontras tajam (misal tinta hitam pekat `#18181B` di atas kertas krem `#F5F2EB`).

9. **Procedural Sound Effects (SFX - Minimalis & Tidak Bising)**:
   - Default SFX adalah OFF. Jika diaktifkan, batasi maksimal 1–2 SFX per scene (volume 0.25 - 0.30) dan hanya untuk kejadian fisik nyata (misal stabilo atau kertas geser).
