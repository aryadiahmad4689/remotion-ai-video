import React from "react";
import { Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "./components/Background";
import { SolanaBadge } from "./components/SolanaBadge";
import { KineticText } from "./components/KineticText";
import { MetricCard } from "./components/MetricCard";
import { VideoData } from "./types/schema";
import defaultData from "./dynamic-props.json";

export const DynamicComposition: React.FC<Partial<VideoData>> = (props) => {
  const data: VideoData = {
    ...defaultData,
    ...props,
  } as VideoData;

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene 1: 0 - 80
  const scene1Exit = spring({
    frame: frame - 65,
    fps,
    config: { damping: 15, mass: 0.5, stiffness: 120 },
  });
  const scene1Opacity = interpolate(scene1Exit, [0, 1], [1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const scene1Scale = interpolate(scene1Exit, [0, 1], [1, 1.05], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const subSpr = spring({
    frame: frame - 22,
    fps,
    config: { damping: 14, mass: 0.5, stiffness: 100 },
  });
  const subOpacity = interpolate(subSpr, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const subY = interpolate(subSpr, [0, 1], [25, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Scene 2: 75 - 160
  const scene2Frame = frame - 75;
  const scene2Exit = spring({
    frame: scene2Frame - 72,
    fps,
    config: { damping: 14, mass: 0.5, stiffness: 120 },
  });
  const scene2Opacity = interpolate(scene2Exit, [0, 1], [1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const scene2Y = interpolate(scene2Exit, [0, 1], [0, -30], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Scene 3: 155 - 235
  const scene3Frame = frame - 155;
  const scene3Exit = spring({
    frame: scene3Frame - 70,
    fps,
    config: { damping: 15, mass: 0.5, stiffness: 120 },
  });
  const scene3Opacity = interpolate(scene3Exit, [0, 1], [1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const scene3Scale = interpolate(scene3Exit, [0, 1], [1, 0.95], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Scene 4: 230 - 300
  const scene4Frame = frame - 230;
  const btnSpr = spring({
    frame: scene4Frame - 25,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 120 },
  });
  const btnScale = interpolate(btnSpr, [0, 1], [0.8, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const btnOpacity = interpolate(btnSpr, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#07090E",
      }}
    >
      <Background />

      {/* Scene 1: Intro */}
      <Sequence from={0} durationInFrames={80} name="Scene 1: Intro Hook">
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
            opacity: scene1Opacity,
            transform: `scale(${scene1Scale})`,
          }}
        >
          <div style={{ marginBottom: 32 }}>
            <SolanaBadge label={data.badge} delay={5} />
          </div>

          <div style={{ marginBottom: 28, textAlign: "center" }}>
            <KineticText
              text={data.scene1.title}
              fontSize={68}
              highlightWords={data.scene1.highlightWords}
              delay={12}
              staggerFrames={3}
            />
          </div>

          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: 24,
              color: "#94A3B8",
              letterSpacing: "0.02em",
              opacity: subOpacity,
              transform: `translateY(${subY}px)`,
              textAlign: "center",
              maxWidth: 850,
              lineHeight: 1.4,
            }}
          >
            {data.scene1.subtitle}
          </div>
        </div>
      </Sequence>

      {/* Scene 2: Capabilities */}
      <Sequence from={75} durationInFrames={85} name="Scene 2: Capabilities">
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
            opacity: scene2Opacity,
            transform: `translateY(${scene2Y}px)`,
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <SolanaBadge label="CORE CAPABILITIES" delay={2} />
          </div>

          <div style={{ marginBottom: 48, textAlign: "center" }}>
            <KineticText
              text={data.scene2.sectionTitle}
              fontSize={54}
              highlightWords={data.scene2.highlightWords}
              delay={6}
              staggerFrames={2}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: 24,
              width: "100%",
              maxWidth: 1100,
              justifyContent: "center",
            }}
          >
            {data.scene2.features.map((feat, idx) => {
              const cardSpring = spring({
                frame: scene2Frame - (18 + idx * 7),
                fps,
                config: { damping: 14, mass: 0.6, stiffness: 110 },
              });

              const scale = interpolate(cardSpring, [0, 1], [0.85, 1], {
                extrapolateRight: "clamp",
                extrapolateLeft: "clamp",
              });
              const opacity = interpolate(cardSpring, [0, 1], [0, 1], {
                extrapolateRight: "clamp",
                extrapolateLeft: "clamp",
              });
              const translateY = interpolate(cardSpring, [0, 1], [40, 0], {
                extrapolateRight: "clamp",
                extrapolateLeft: "clamp",
              });

              return (
                <div
                  key={`${feat.title}-${idx}`}
                  style={{
                    flex: 1,
                    padding: "36px 30px",
                    borderRadius: 24,
                    background: "rgba(15, 23, 42, 0.65)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    boxShadow: `0 15px 35px -10px rgba(0, 0, 0, 0.6), 0 0 15px ${feat.color}22`,
                    backdropFilter: "blur(16px)",
                    transform: `translateY(${translateY}px) scale(${scale})`,
                    opacity,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      fontSize: 32,
                      marginBottom: 16,
                      padding: 12,
                      borderRadius: 16,
                      background: `${feat.color}15`,
                      border: `1px solid ${feat.color}33`,
                    }}
                  >
                    {feat.icon}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#FFFFFF",
                      marginBottom: 12,
                    }}
                  >
                    {feat.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "system-ui, sans-serif",
                      fontSize: 15,
                      color: "#94A3B8",
                      lineHeight: 1.5,
                    }}
                  >
                    {feat.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Sequence>

      {/* Scene 3: Stats */}
      <Sequence from={155} durationInFrames={80} name="Scene 3: Stats">
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
            opacity: scene3Opacity,
            transform: `scale(${scene3Scale})`,
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <SolanaBadge label="PERFORMANCE BENCHMARKS" delay={2} />
          </div>

          <div style={{ marginBottom: 48, textAlign: "center" }}>
            <KineticText
              text={data.scene3.sectionTitle}
              fontSize={54}
              highlightWords={data.scene3.highlightWords}
              delay={6}
              staggerFrames={2}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: 28,
              width: "100%",
              maxWidth: 1100,
              justifyContent: "center",
            }}
          >
            {data.scene3.metrics.map((m, idx) => (
              <MetricCard
                key={`${m.label}-${idx}`}
                label={m.label}
                targetValue={m.targetValue}
                prefix={m.prefix}
                suffix={m.suffix}
                decimals={m.decimals}
                subtext={m.subtext}
                delay={12 + idx * 8}
                accentColor={m.accentColor || "#14F195"}
              />
            ))}
          </div>
        </div>
      </Sequence>

      {/* Scene 4: Outro */}
      <Sequence from={230} durationInFrames={70} name="Scene 4: Outro">
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
          }}
        >
          <div style={{ marginBottom: 28 }}>
            <SolanaBadge label={data.scene4.badge} delay={2} />
          </div>

          <div style={{ marginBottom: 36, textAlign: "center" }}>
            <KineticText
              text={data.scene4.headline}
              fontSize={62}
              highlightWords={data.scene4.highlightWords}
              delay={8}
              staggerFrames={3}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              transform: `scale(${btnScale})`,
              opacity: btnOpacity,
            }}
          >
            <div
              style={{
                padding: "18px 48px",
                borderRadius: 999,
                background: `linear-gradient(135deg, ${data.theme.secondaryColor} 0%, ${data.theme.primaryColor} 100%)`,
                boxShadow: `0 0 35px ${data.theme.primaryColor}88, 0 0 45px ${data.theme.secondaryColor}66`,
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#0B0E14",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {data.scene4.ctaText}
              </span>
              <span style={{ fontSize: 22 }}>🚀</span>
            </div>

            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 16,
                color: "#64748B",
                letterSpacing: "0.05em",
              }}
            >
              {data.scene4.url}
            </div>
          </div>
        </div>
      </Sequence>
    </div>
  );
};
