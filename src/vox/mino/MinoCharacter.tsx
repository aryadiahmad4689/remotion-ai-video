import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export type MinoPose =
  | "idle"
  | "curious"
  | "confused"
  | "pointing"
  | "searching"
  | "shocked"
  | "waving";

export interface CaptionWord {
  word: string;
  start: number;
  end: number;
}

interface MinoCharacterProps {
  pose?: MinoPose;
  scale?: number;
  flip?: boolean;
  isSpeaking?: boolean;
  words?: CaptionWord[];
  style?: React.CSSProperties;
}

const BLUE_JACKET = "#2563EB";
const BLUE_HOODIE_DARK = "#1D4ED8";
const BLUE_ZIPPER = "#FFFFFF";
const SKIN = "#FDE68A"; // warm soft skin tone
const SKIN_SHADOW = "#F59E0B";
const INK = "#18181B";
const WHITE = "#FFFFFF";
const RED = "#E63946";
const YELLOW = "#FFE600";

interface MinoMouthProps {
  pose: MinoPose;
  talkOpen: number;
}

const MinoMouth: React.FC<MinoMouthProps> = ({ pose, talkOpen }) => {
  if (pose === "shocked") {
    // Shocked wide open mouth that pulses with voice
    const rx = 13 + talkOpen * 3;
    const ry = 16 + talkOpen * 7;
    const cy = 165 + talkOpen * 1.5;
    return (
      <g id="mino-mouth-shocked">
        <ellipse cx="190" cy={cy} rx={rx} ry={ry} fill={INK} stroke={INK} strokeWidth="3" />
        {/* Upper teeth curve */}
        <path
          d={`M ${190 - rx + 3.5} ${cy - ry + 4} Q 190 ${cy - ry + 7} ${190 + rx - 3.5} ${cy - ry + 4} L ${190 + rx - 4.5} ${cy - ry + 8} Q 190 ${cy - ry + 10} ${190 - rx + 4.5} ${cy - ry + 8} Z`}
          fill={WHITE}
        />
        {/* Tongue */}
        <ellipse cx="190" cy={cy + ry * 0.45} rx={rx * 0.65} ry={ry * 0.4} fill="#FB7185" />
        {/* Chin crease */}
        <path d="M 187 187 Q 190 189.5 193 187" stroke={SKIN_SHADOW} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
      </g>
    );
  }

  if (pose === "confused") {
    if (talkOpen <= 0.12) {
      return (
        <g id="mino-mouth-confused-resting">
          <path
            d="M 176 162 Q 183 157 190 161 Q 197 165 204 161"
            stroke={INK}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path d="M 187 180 Q 190 182.5 193 180" stroke={SKIN_SHADOW} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
        </g>
      );
    }
    // Confused talking mouth (slightly tilted)
    const halfW = 10 + talkOpen * 4.5;
    const topY = 158;
    const drop = 5 + talkOpen * 12;
    const botY = topY + drop;
    return (
      <g id="mino-mouth-confused-talking" transform="rotate(-3 190 160)">
        <path
          d={`M ${190 - halfW} ${topY}
              Q 190 ${topY + 1} ${190 + halfW} ${topY + 2}
              Q ${190 + halfW + 1} ${botY} 190 ${botY}
              Q ${190 - halfW - 1} ${botY - 1} ${190 - halfW} ${topY} Z`}
          fill={INK}
          stroke={INK}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Teeth */}
        <path
          d={`M ${190 - halfW + 2} ${topY + 1}
              Q 190 ${topY + 2} ${190 + halfW - 2} ${topY + 3}
              L ${190 + halfW - 3} ${topY + 4 + talkOpen * 1.2}
              Q 190 ${topY + 4} ${190 - halfW + 3} ${topY + 3.5} Z`}
          fill={WHITE}
        />
        {talkOpen > 0.25 && (
          <ellipse
            cx="189"
            cy={botY - 2}
            rx={halfW * 0.68}
            ry={2 + talkOpen * 3}
            fill="#FB7185"
          />
        )}
        <path d="M 187 180 Q 190 182.5 193 180" stroke={SKIN_SHADOW} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
      </g>
    );
  }

  if (pose === "curious") {
    if (talkOpen <= 0.12) {
      return (
        <g id="mino-mouth-curious-resting">
          <path
            d="M 180 159 Q 192 166 204 156"
            stroke={INK}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <line x1="204" y1="155" x2="206" y2="158" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 187 180 Q 190 182.5 193 180" stroke={SKIN_SHADOW} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
        </g>
      );
    }
    // Curious talking mouth (slightly quizzical smirk flap)
    const halfW = 10.5 + talkOpen * 4.5;
    const topY = 157;
    const drop = 5 + talkOpen * 13;
    const botY = topY + drop;
    return (
      <g id="mino-mouth-curious-talking" transform="rotate(3 190 160)">
        <path
          d={`M ${190 - halfW} ${topY + 1}
              Q 191 ${topY + 2.5} ${190 + halfW} ${topY - 1}
              Q ${190 + halfW + 1} ${botY} 190 ${botY}
              Q ${190 - halfW - 1} ${botY} ${190 - halfW} ${topY + 1} Z`}
          fill={INK}
          stroke={INK}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Teeth */}
        <path
          d={`M ${190 - halfW + 2} ${topY + 2}
              Q 191 ${topY + 3.5} ${190 + halfW - 2} ${topY}
              L ${190 + halfW - 3} ${topY + 3.5 + talkOpen * 1.5}
              Q 191 ${topY + 5.5} ${190 - halfW + 3} ${topY + 4} Z`}
          fill={WHITE}
        />
        {talkOpen > 0.25 && (
          <ellipse
            cx="191"
            cy={botY - 2.5}
            rx={halfW * 0.7}
            ry={2 + talkOpen * 3.5}
            fill="#FB7185"
          />
        )}
        <path d="M 187 180 Q 190 182.5 193 180" stroke={SKIN_SHADOW} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
      </g>
    );
  }

  // Standard (idle, pointing, searching, waving)
  if (talkOpen <= 0.12) {
    return (
      <g id="mino-mouth-standard-resting">
        <path
          d="M 178 157 Q 190 167 202 157"
          stroke={INK}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <line x1="177" y1="156" x2="178.5" y2="159" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="203" y1="156" x2="201.5" y2="159" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 187 180 Q 190 182.5 193 180" stroke={SKIN_SHADOW} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
      </g>
    );
  }

  // Active talking mouth with organic syllable opening
  const halfW = 11 + talkOpen * 5;
  const topY = 156;
  const drop = 5 + talkOpen * 14;
  const botY = topY + drop;
  const midCurve = 2 + talkOpen * 1.5;

  return (
    <g id="mino-mouth-standard-talking">
      {/* Dark ink mouth cavity */}
      <path
        d={`M ${190 - halfW} ${topY}
            Q 190 ${topY + midCurve} ${190 + halfW} ${topY}
            Q ${190 + halfW + 1} ${botY} 190 ${botY}
            Q ${190 - halfW - 1} ${botY} ${190 - halfW} ${topY} Z`}
        fill={INK}
        stroke={INK}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Clean white upper teeth */}
      <path
        d={`M ${190 - halfW + 2.5} ${topY + 1}
            Q 190 ${topY + midCurve + 1} ${190 + halfW - 2.5} ${topY + 1}
            L ${190 + halfW - 3.5} ${topY + 3.5 + talkOpen * 1.5}
            Q 190 ${topY + midCurve + 3.5} ${190 - halfW + 3.5} ${topY + 3.5 + talkOpen * 1.5} Z`}
        fill={WHITE}
      />

      {/* Soft pink tongue */}
      {talkOpen > 0.25 && (
        <ellipse
          cx="190"
          cy={botY - 2.5}
          rx={halfW * 0.72}
          ry={2 + talkOpen * 3.5}
          fill="#FB7185"
        />
      )}

      {/* Corner smile accents */}
      <line
        x1={190 - halfW - 1}
        y1={topY - 1}
        x2={190 - halfW + 0.5}
        y2={topY + 2.5}
        stroke={INK}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1={190 + halfW + 1}
        y1={topY - 1}
        x2={190 + halfW - 0.5}
        y2={topY + 2.5}
        stroke={INK}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Chin crease */}
      <path d="M 187 180 Q 190 182.5 193 180" stroke={SKIN_SHADOW} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
    </g>
  );
};

export const MinoCharacter: React.FC<MinoCharacterProps> = ({
  pose = "idle",
  scale = 1,
  flip = false,
  isSpeaking,
  words,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Natural breathing and idle sway
  const breath = Math.sin((frame / fps) * 3.2) * 5;
  const sway = Math.sin((frame / fps) * 1.6) * 2;

  // Eye blinking every ~3.5 seconds
  const blinkCycle = frame % 105;
  const isBlinking = blinkCycle >= 98 && blinkCycle <= 103;
  const eyeScaleY = isBlinking ? 0.1 : 1;

  // Dynamic arm / head motion physics based on frame
  const waveCycle = Math.sin(frame * 0.35) * 22;
  const searchHead = Math.sin(frame * 0.12) * 12;
  const scratchArm = Math.sin(frame * 0.4) * 8;
  const shockBounce = spring({
    frame: frame % 45,
    fps,
    config: { damping: 10, mass: 0.5, stiffness: 120 },
  });

  // Dynamic speaking & mouth flapping physics
  const currentSeconds = frame / fps;
  let speaking = true;
  if (typeof isSpeaking === "boolean") {
    speaking = isSpeaking;
  } else if (words && words.length > 0) {
    speaking = words.some(
      (w) => currentSeconds >= w.start - 0.05 && currentSeconds <= w.end + 0.08
    );
  } else {
    // Natural speech cadence with conversational breath pauses (~2.4s talk / 0.35s pause)
    const phraseCycle = (frame / fps) % 6.0;
    const isPause =
      (phraseCycle >= 2.4 && phraseCycle < 2.75) ||
      (phraseCycle >= 5.3 && phraseCycle < 5.7);
    speaking = !isPause;
  }

  // Mouth flap opening factor (0 = closed, 1 = wide open)
  // Combines fundamental syllable rate (~4.6Hz) with consonant harmonic flutter (~9.2Hz)
  const t = frame / fps;
  const vowelWave = Math.sin(t * 29.0);
  const consonantWave = Math.sin(t * 58.0);
  const dynamics = Math.sin(t * 9.5) * 0.3 + 0.7;
  const rawHarmonic = (vowelWave * 0.65 + consonantWave * 0.35) * dynamics;

  const talkOpen = speaking ? Math.max(0, Math.min(1, (rawHarmonic + 0.28) * 1.25)) : 0;
  const chinDip = talkOpen * 2.5;

  return (
    <div
      style={{
        display: "inline-block",
        transform: `scale(${scale}) scaleX(${flip ? -1 : 1})`,
        transformOrigin: "bottom center",
        pointerEvents: "none",
        ...style,
      }}
    >
      <svg
        width="380"
        height="520"
        viewBox="0 0 380 520"
        fill="none"
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* Subtle drop shadow beneath Mino */}
          <radialGradient id="mino-ground-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={INK} stopOpacity="0.25" />
            <stop offset="100%" stopColor={INK} stopOpacity="0" />
          </radialGradient>

          {/* Hoodie shading */}
          <linearGradient id="mino-jacket-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor={BLUE_HOODIE_DARK} />
          </linearGradient>
        </defs>

        {/* 1. Ground Contact Shadow */}
        <ellipse cx="190" cy="505" rx="110" ry="16" fill="url(#mino-ground-shadow)" />

        {/* 2. Legs and Sneakers */}
        <g id="mino-legs">
          {/* Left leg */}
          <path
            d="M165 370 L158 475"
            stroke={INK}
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Left sneaker */}
          <rect
            x="128"
            y="470"
            width="42"
            height="22"
            rx="8"
            fill={WHITE}
            stroke={INK}
            strokeWidth="4"
          />
          <path d="M128 484 H170" stroke={BLUE_JACKET} strokeWidth="5" />

          {/* Right leg */}
          <path
            d="M215 370 L222 475"
            stroke={INK}
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Right sneaker */}
          <rect
            x="210"
            y="470"
            width="42"
            height="22"
            rx="8"
            fill={WHITE}
            stroke={INK}
            strokeWidth="4"
          />
          <path d="M210 484 H252" stroke={BLUE_JACKET} strokeWidth="5" />
        </g>

        {/* 3. Main Torso Group with Breathing Bobbing */}
        <g
          id="mino-torso-group"
          transform={`translate(${sway} ${breath})`}
        >
          {/* Blue Jacket Torso */}
          <path
            d="M135 240 C135 210, 245 210, 245 240 L255 375 C255 385, 125 385, 125 375 Z"
            fill="url(#mino-jacket-grad)"
            stroke={INK}
            strokeWidth="5"
          />

          {/* Hoodie pocket */}
          <path
            d="M150 330 C150 315, 230 315, 230 330 L235 365 C235 370, 145 370, 145 365 Z"
            fill={BLUE_HOODIE_DARK}
            stroke={INK}
            strokeWidth="4"
          />

          {/* Center White Zipper */}
          <line
            x1="190"
            y1="225"
            x2="190"
            y2="370"
            stroke={BLUE_ZIPPER}
            strokeWidth="4"
            strokeDasharray="8 3"
          />

          {/* Hoodie drawstrings */}
          <line x1="178" y1="230" x2="175" y2="280" stroke={WHITE} strokeWidth="3" strokeLinecap="round" />
          <circle cx="175" cy="282" r="3" fill={WHITE} />
          <line x1="202" y1="230" x2="205" y2="280" stroke={WHITE} strokeWidth="3" strokeLinecap="round" />
          <circle cx="205" cy="282" r="3" fill={WHITE} />

          {/* 4. Left Arm (Dynamic Pose) */}
          {pose === "waving" ? (
            /* Waving Left Hand */
            <g transform={`rotate(${waveCycle} 135 245)`}>
              <path
                d="M135 245 L95 190 L85 130"
                stroke={BLUE_JACKET}
                strokeWidth="18"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Hand */}
              <circle cx="85" cy="120" r="14" fill={SKIN} stroke={INK} strokeWidth="4" />
              {/* Wave speed lines */}
              <path d="M60 115 C55 125 55 135 60 145" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M50 110 C42 125 42 140 50 155" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
            </g>
          ) : pose === "confused" ? (
            /* Left hand scratching head */
            <g transform={`translate(${scratchArm * 0.5} 0)`}>
              <path
                d="M135 245 L95 210 L135 120"
                stroke={BLUE_JACKET}
                strokeWidth="18"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="140" cy="115" r="13" fill={SKIN} stroke={INK} strokeWidth="4" />
            </g>
          ) : pose === "shocked" ? (
            /* Hands up in shock */
            <g transform={`translate(0 ${-shockBounce * 8})`}>
              <path
                d="M135 245 L90 200 L115 155"
                stroke={BLUE_JACKET}
                strokeWidth="18"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="118" cy="150" r="14" fill={SKIN} stroke={INK} strokeWidth="4" />
            </g>
          ) : (
            /* Standard resting left arm */
            <g>
              <path
                d="M135 245 L115 305 L130 350"
                stroke={BLUE_JACKET}
                strokeWidth="18"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="132" cy="355" r="13" fill={SKIN} stroke={INK} strokeWidth="4" />
            </g>
          )}

          {/* 5. Right Arm (Dynamic Pose) */}
          {pose === "pointing" ? (
            /* Pointing Upwards towards the Vox diagram */
            <g>
              <path
                d="M245 245 L290 190 L310 110"
                stroke={BLUE_JACKET}
                strokeWidth="18"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Hand with pointing index finger */}
              <circle cx="310" cy="105" r="13" fill={SKIN} stroke={INK} strokeWidth="4" />
              <line x1="310" y1="105" x2="310" y2="85" stroke={SKIN} strokeWidth="6" strokeLinecap="round" />
              {/* Highlight sparkles */}
              <path d="M310 65 L310 75 M300 70 L320 70" stroke={YELLOW} strokeWidth="3" strokeLinecap="round" />
            </g>
          ) : pose === "curious" ? (
            /* Hand on chin thinking */
            <g>
              <path
                d="M245 245 L275 220 L210 170"
                stroke={BLUE_JACKET}
                strokeWidth="18"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="205" cy="168" r="13" fill={SKIN} stroke={INK} strokeWidth="4" />
            </g>
          ) : pose === "searching" ? (
            /* Hand holding a magnifying glass */
            <g>
              <path
                d="M245 245 L295 240 L285 200"
                stroke={BLUE_JACKET}
                strokeWidth="18"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="285" cy="195" r="13" fill={SKIN} stroke={INK} strokeWidth="4" />
              {/* Magnifying Glass */}
              <circle cx="310" cy="170" r="22" stroke={INK} strokeWidth="5" fill="#DBEAFE" fillOpacity="0.45" />
              <line x1="295" y1="185" x2="280" y2="200" stroke={INK} strokeWidth="6" strokeLinecap="round" />
            </g>
          ) : pose === "shocked" ? (
            /* Hands up in shock */
            <g transform={`translate(0 ${-shockBounce * 8})`}>
              <path
                d="M245 245 L290 200 L265 155"
                stroke={BLUE_JACKET}
                strokeWidth="18"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="262" cy="150" r="14" fill={SKIN} stroke={INK} strokeWidth="4" />
            </g>
          ) : (
            /* Standard resting right arm */
            <g>
              <path
                d="M245 245 L265 305 L250 350"
                stroke={BLUE_JACKET}
                strokeWidth="18"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="248" cy="355" r="13" fill={SKIN} stroke={INK} strokeWidth="4" />
            </g>
          )}

          {/* 6. Mino's Bald Head Group */}
          <g
            id="mino-head"
            transform={
              pose === "curious"
                ? "rotate(7 190 145)"
                : pose === "confused"
                ? `rotate(${searchHead} 190 145)`
                : "none"
            }
          >
            {/* Neck */}
            <rect x="178" y="190" width="24" height="24" fill={SKIN} stroke={INK} strokeWidth="4" rx="4" />

            {/* Smooth Round Bald Head */}
            <circle
              cx="190"
              cy="135"
              r="62"
              fill={SKIN}
              stroke={INK}
              strokeWidth="5"
            />

            {/* Bald head shine highlight */}
            <path
              d="M152 100 C162 88, 185 85, 205 90"
              stroke={WHITE}
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
              opacity="0.85"
            />

            {/* Left Ear */}
            <circle cx="127" cy="140" r="11" fill={SKIN} stroke={INK} strokeWidth="4" />
            <path d="M127 136 C129 140 128 144 125 145" stroke={SKIN_SHADOW} strokeWidth="2" fill="none" />

            {/* Right Ear */}
            <circle cx="253" cy="140" r="11" fill={SKIN} stroke={INK} strokeWidth="4" />
            <path d="M253 136 C251 140 252 144 255 145" stroke={SKIN_SHADOW} strokeWidth="2" fill="none" />

            {/* Facial Expressions based on Pose */}
            {pose === "shocked" ? (
              <>
                {/* Shocked Eyes (Wide open) */}
                <circle cx="170" cy="130" r="11" fill={WHITE} stroke={INK} strokeWidth="3" />
                <circle cx="170" cy="130" r="5" fill={INK} />
                <circle cx="210" cy="130" r="11" fill={WHITE} stroke={INK} strokeWidth="3" />
                <circle cx="210" cy="130" r="5" fill={INK} />

                {/* Arched Raised Eyebrows */}
                <path d="M158 112 Q170 102 182 112" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
                <path d="M198 112 Q210 102 222 112" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />

                {/* Blushing red cheeks */}
                <circle cx="152" cy="148" r="10" fill={RED} opacity="0.45" />
                <circle cx="228" cy="148" r="10" fill={RED} opacity="0.45" />

                {/* Dynamic Talking Mouth & Jaw with Chin Dip */}
                <g transform={`translate(0 ${chinDip})`}>
                  <MinoMouth pose={pose} talkOpen={talkOpen} />
                </g>
              </>
            ) : pose === "confused" ? (
              <>
                {/* Confused Eyes (one small, one big) */}
                <ellipse
                  cx="170"
                  cy="132"
                  rx="6"
                  ry={8 * eyeScaleY}
                  fill={INK}
                />
                <circle cx="212" cy="130" r="9" fill={WHITE} stroke={INK} strokeWidth="3" />
                <circle cx="212" cy="130" r={4 * eyeScaleY} fill={INK} />

                {/* Asymmetric Eyebrows */}
                <path d="M160 118 L180 124" stroke={INK} strokeWidth="4" strokeLinecap="round" />
                <path d="M200 114 Q212 104 224 115" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />

                {/* Sweat Drop on Head */}
                <path
                  d="M228 100 C234 94, 238 98, 238 106 C238 112, 232 115, 228 115 C224 115, 218 112, 218 106 C218 98, 222 94, 228 100 Z"
                  fill="#60A5FA"
                  stroke={INK}
                  strokeWidth="2"
                />

                {/* Question mark above head */}
                <text x="236" y="80" fontFamily="sans-serif" fontSize="32" fontWeight="900" fill={RED}>?</text>

                {/* Dynamic Talking Mouth & Jaw with Chin Dip */}
                <g transform={`translate(0 ${chinDip})`}>
                  <MinoMouth pose={pose} talkOpen={talkOpen} />
                </g>
              </>
            ) : pose === "curious" ? (
              <>
                {/* Curious Thinking Eyes looking up */}
                <ellipse cx="170" cy="128" rx="6" ry={8 * eyeScaleY} fill={INK} />
                <ellipse cx="210" cy="128" rx="6" ry={8 * eyeScaleY} fill={INK} />
                <circle cx="172" cy="125" r="2" fill={WHITE} />
                <circle cx="212" cy="125" r="2" fill={WHITE} />

                {/* Raised Eyebrows */}
                <path d="M160 114 Q170 106 180 114" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
                <path d="M200 114 Q210 106 220 114" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />

                {/* Lightbulb / Idea sparkle above head */}
                <path d="M190 40 L190 52 M176 46 L184 54 M204 46 L196 54" stroke={YELLOW} strokeWidth="4" strokeLinecap="round" />
                <circle cx="190" cy="62" r="10" fill={YELLOW} stroke={INK} strokeWidth="3" />

                {/* Dynamic Talking Mouth & Jaw with Chin Dip */}
                <g transform={`translate(0 ${chinDip})`}>
                  <MinoMouth pose={pose} talkOpen={talkOpen} />
                </g>
              </>
            ) : (
              <>
                {/* Standard Friendly Eyes */}
                <ellipse cx="172" cy="132" rx="6" ry={8 * eyeScaleY} fill={INK} />
                <ellipse cx="208" cy="132" rx="6" ry={8 * eyeScaleY} fill={INK} />
                <circle cx="174" cy="129" r="2" fill={WHITE} />
                <circle cx="210" cy="129" r="2" fill={WHITE} />

                {/* Friendly Eyebrows */}
                <path d="M162 118 Q172 113 182 118" stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none" />
                <path d="M198 118 Q208 113 218 118" stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none" />

                {/* Soft Cheerful Blushing Cheeks */}
                <circle cx="152" cy="148" r="8" fill={RED} opacity="0.16" />
                <circle cx="228" cy="148" r="8" fill={RED} opacity="0.16" />

                {/* Dynamic Talking Mouth & Jaw with Chin Dip */}
                <g transform={`translate(0 ${chinDip})`}>
                  <MinoMouth pose={pose} talkOpen={talkOpen} />
                </g>
              </>
            )}
          </g>
        </g>
      </svg>
    </div>
  );
};
