# Remotion AI Agent Rulebook & Guidelines
*Diturunkan dari best-practices resmi Remotion & panduan Claude Code/Antigravity.*

## 1. Golden Rules (Wajib Dipatuhi)
1. **Never use CSS Transitions / Animations**:
   - DILARANG menggunakan `transition: all 0.3s ease`, `animation: fadeIn`, `setTimeout`, atau `setInterval`.
   - SEMUA animasi WAJIB diturunkan dari `useCurrentFrame()` dan `useVideoConfig()`.
2. **Spring Physics Over Linear Movement**:
   - Gunakan `spring({ frame, fps, config: { damping: 12, mass: 0.5, stiffness: 100 } })` untuk pergerakan alami (bouncing/damping).
3. **Always Clamp Interpolations**:
   - Saat memakai `interpolate(frame, [0, 20], [0, 1])`, selalu sertakan `{ extrapolateRight: "clamp", extrapolateLeft: "clamp" }` agar nilai tidak meledak di luar rentang.
4. **Kinetic Typography (No Static Text Wall)**:
   - Teks tidak boleh muncul sekaligus secara kaku.
   - Animasikan per kata atau per karakter dengan stagger delay:
     `const delay = index * 3;`
     `const wordSpring = spring({ frame: frame - delay, fps, ... })`
5. **Multi-layer Scene Hierarchy**:
   - Susun komponen menggunakan `<Sequence>` dengan `from` dan `durationInFrames`.
   - Pisahkan layer: Background (animated glow/grid) -> Floating Elements -> Main Content -> Overlay Badges.
6. **Procedural Sound Effects (SFX)**:
   - Gunakan `<VoxSoundEffect type="pop" cue={frameCue} volume={0.4} />` untuk menyelaraskan efek suara dengan momen visual penting (pilihan: `paper_slide`, `highlighter`, `pop`, `click`, `camera`). Volume diatur lembut (0.35 - 0.5) agar tidak menutupi narator.

## 2. Struktur Proyek
- `src/index.ts` -> Registrasi root menggunakan `registerRoot(Root)`
- `src/Root.tsx` -> Definisi `<Composition>` dengan ID, component, duration, fps, width, height.
- `src/components/` -> Komponen visual reusable (Background, Badges, Typography, MetricCard).
- `src/scenes/` -> Scene modular berurutan.
