import React from "react";
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from "remotion";

/**
 * Composition settings: 3840 × 2160, 30 fps, durationInFrames: 180.
 * A single, slowly breathing golden silk surface.
 * Dust and lighting remain stationary to preserve a calm focal point.
 */
export const ActiveStockVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  const W = 3840;
  const H = 2160;
  const loopFrame = ((frame % 180) + 180) % 180;
  const loopAngle = (loopFrame / 180) * Math.PI * 2;
  const harmonic1 = Math.sin(loopAngle);
  const harmonic2 = Math.cos(loopAngle);

  const random = (seed: number): number => {
    const n = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
    return n - Math.floor(n);
  };

  // All strands belong to the same surface and share its restrained motion.
  const surfacePoint = (u: number, strand: number) => {
    const x = -220 + u * 4280;
    const envelope = Math.pow(Math.sin(Math.PI * u), 1.15);

    const spine =
      1090 +
      258 * Math.sin(u * Math.PI * 2.12 + 0.38) -
      125 * Math.sin(u * Math.PI * 3.72 - 0.8);

    const breath =
      envelope *
      (48 * harmonic1 * Math.sin(u * Math.PI * 2.1 + 0.25) +
        33 * (harmonic2 - 1) * Math.cos(u * Math.PI * 1.55));

    const spread =
      145 +
      355 * Math.pow(Math.sin(Math.PI * u), 2) +
      85 * Math.sin(u * Math.PI * 3.1 + 0.8);

    const fold =
      74 *
      envelope *
      Math.sin(u * Math.PI * 4.15 + strand * 1.7 + 0.4);

    const twist =
      strand *
      envelope *
      (21 * harmonic1 * Math.cos(u * Math.PI * 2.4) +
        15 * (harmonic2 - 1) * Math.sin(u * Math.PI * 2));

    return {
      x,
      y: spine + breath + strand * spread + fold + twist,
    };
  };

  const strandPath = (strand: number): string => {
    const points: string[] = [];

    for (let i = 0; i <= 112; i++) {
      const point = surfacePoint(i / 112, strand);
      points.push(
        `${i === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`,
      );
    }

    return points.join(" ");
  };

  const ribbons = Array.from({length: 116}, (_, i) => {
    const strand = (i / 115) * 2 - 1;
    const edge = Math.abs(strand);
    const prominence = Math.pow(Math.max(0, 1 - edge), 0.65);
    const fineVariation = random(i + 70);

    return {
      path: strandPath(strand),
      opacity: 0.2 + prominence * 0.46 + fineVariation * 0.13,
      strokeWidth: 0.8 + fineVariation * 0.85,
    };
  });

  const glowPaths = [-0.78, -0.48, -0.19, 0.08, 0.38, 0.68].map(
    strandPath,
  );

  const dust = Array.from({length: 240}, (_, i) => {
    const x = random(i * 7 + 5) * W;
    const y = 400 + random(i * 11 + 16) * 1430;
    const distance = Math.abs(y - 1100) / 1000;
    const radius = 0.65 + Math.pow(random(i + 219), 4) * 3.9;
    const opacity =
      (0.12 + random(i + 904) * 0.5) *
      Math.max(0.22, 1 - distance * 0.75);

    return {x, y, radius, opacity};
  });

  return (
    <AbsoluteFill
      style={{
        width,
        height,
        backgroundColor: "#070604",
        overflow: "hidden",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        style={{display: "block"}}
        aria-label="Abstract flowing golden luxury wave"
      >
        <defs>
          <radialGradient id="gold-background" cx="52%" cy="49%" r="73%">
            <stop offset="0%" stopColor="#1D150A" />
            <stop offset="43%" stopColor="#100C07" />
            <stop offset="100%" stopColor="#030405" />
          </radialGradient>

          <radialGradient id="gold-atmosphere" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#BD7E28" stopOpacity="0.105" />
            <stop offset="45%" stopColor="#83531B" stopOpacity="0.055" />
            <stop offset="100%" stopColor="#83531B" stopOpacity="0" />
          </radialGradient>

          <linearGradient
            id="gold-thread"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="1430"
            x2="3840"
            y2="800"
          >
            <stop offset="0%" stopColor="#6F4617" stopOpacity="0.16" />
            <stop offset="14%" stopColor="#C98B37" stopOpacity="0.65" />
            <stop offset="31%" stopColor="#FFE4A0" />
            <stop offset="46%" stopColor="#AF6B1D" />
            <stop offset="59%" stopColor="#EABB62" />
            <stop offset="71%" stopColor="#FFF1C1" />
            <stop offset="84%" stopColor="#D89739" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7B4D18" stopOpacity="0.22" />
          </linearGradient>

          <linearGradient
            id="gold-glow"
            gradientUnits="userSpaceOnUse"
            x1="200"
            y1="1300"
            x2="3650"
            y2="900"
          >
            <stop offset="0%" stopColor="#B66D1E" stopOpacity="0" />
            <stop offset="28%" stopColor="#E5AF4F" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#BC771F" stopOpacity="0.35" />
            <stop offset="73%" stopColor="#FFD786" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#AF6A1F" stopOpacity="0" />
          </linearGradient>

          <radialGradient id="gold-vignette" cx="50%" cy="48%" r="66%">
            <stop offset="44%" stopColor="#000000" stopOpacity="0" />
            <stop offset="77%" stopColor="#000000" stopOpacity="0.23" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.76" />
          </radialGradient>

          <filter
            id="gold-wide-bloom"
            x="-20%"
            y="-100%"
            width="140%"
            height="300%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="27" />
          </filter>

          <filter
            id="gold-fine-bloom"
            x="-15%"
            y="-50%"
            width="130%"
            height="200%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="5.5" />
          </filter>

          <filter
            id="gold-dust-soft"
            x="-150%"
            y="-150%"
            width="400%"
            height="400%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>

        <rect width={W} height={H} fill="url(#gold-background)" />

        <ellipse
          cx="1980"
          cy="1120"
          rx="1760"
          ry="780"
          fill="url(#gold-atmosphere)"
        />

        {/* Stationary, softly defocused dust behind the silk. */}
        <g filter="url(#gold-dust-soft)">
          {dust
            .filter((_, i) => i % 4 === 0)
            .map((particle, i) => (
              <circle
                key={`soft-${i}`}
                cx={particle.x}
                cy={particle.y}
                r={particle.radius * 2.2}
                fill="#E3B76A"
                opacity={particle.opacity * 0.3}
              />
            ))}
        </g>

        {/* Broad reflected light follows the same single moving surface. */}
        <g
          fill="none"
          stroke="url(#gold-glow)"
          strokeWidth="19"
          opacity="0.31"
          filter="url(#gold-wide-bloom)"
        >
          {glowPaths.map((path, i) => (
            <path key={`bloom-${i}`} d={path} />
          ))}
        </g>

        <g
          fill="none"
          stroke="url(#gold-glow)"
          strokeWidth="5"
          opacity="0.38"
          filter="url(#gold-fine-bloom)"
        >
          {glowPaths.map((path, i) => (
            <path key={`light-${i}`} d={path} />
          ))}
        </g>

        {/* Fine, individually resolved filaments form one continuous ribbon. */}
        <g
          fill="none"
          stroke="url(#gold-thread)"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {ribbons.map((ribbon, i) => (
            <path
              key={`thread-${i}`}
              d={ribbon.path}
              strokeWidth={ribbon.strokeWidth}
              opacity={ribbon.opacity}
            />
          ))}
        </g>

        {/* A few restrained specular seams; no independent animation. */}
        <g
          fill="none"
          stroke="url(#gold-thread)"
          strokeWidth="2.15"
          opacity="0.73"
        >
          <path d={strandPath(-0.81)} />
          <path d={strandPath(-0.16)} />
          <path d={strandPath(0.63)} />
        </g>

        <g>
          {dust.map((particle, i) => (
            <circle
              key={`dust-${i}`}
              cx={particle.x}
              cy={particle.y}
              r={particle.radius}
              fill={i % 7 === 0 ? "#FFF0CC" : "#D5AA5F"}
              opacity={particle.opacity}
            />
          ))}
        </g>

        {/* Tiny fixed glints provide photographic depth without flickering. */}
        <g stroke="#FFE8B2" strokeLinecap="round">
          {dust
            .filter((particle, i) => i % 31 === 0 && particle.radius > 1.4)
            .map((particle, i) => (
              <g key={`glint-${i}`} opacity={particle.opacity * 0.48}>
                <path
                  d={`M ${particle.x - 8} ${particle.y} H ${particle.x + 8}`}
                  strokeWidth="0.75"
                />
                <path
                  d={`M ${particle.x} ${particle.y - 5} V ${particle.y + 5}`}
                  strokeWidth="0.65"
                />
              </g>
            ))}
        </g>

        <rect
          width={W}
          height={H}
          fill="url(#gold-vignette)"
          pointerEvents="none"
        />
      </svg>
    </AbsoluteFill>
  );
};