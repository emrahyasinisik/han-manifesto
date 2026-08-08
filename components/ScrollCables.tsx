"use client";

import { useEffect, useRef, useState } from "react";

type CableDef = {
  id: string;
  startX: number;
  bendX: number;
  endX: number;
  startY: number;
  accent?: boolean;
  width: number;
};

/** Strands fan out near the top and meet behind the HAN watermark. */
const CABLES: CableDef[] = [
  { id: "a", startX: 6, bendX: 14, endX: 47.2, startY: 1.5, width: 1.1 },
  {
    id: "b",
    startX: 18,
    bendX: 22,
    endX: 48.4,
    startY: 0.8,
    accent: true,
    width: 1.35,
  },
  { id: "c", startX: 32, bendX: 34, endX: 49.2, startY: 2.2, width: 1 },
  {
    id: "d",
    startX: 48,
    bendX: 49,
    endX: 50,
    startY: 0.4,
    accent: true,
    width: 1.45,
  },
  { id: "e", startX: 68, bendX: 66, endX: 50.8, startY: 1.8, width: 1.05 },
  {
    id: "f",
    startX: 82,
    bendX: 78,
    endX: 51.6,
    startY: 0.6,
    accent: true,
    width: 1.3,
  },
  { id: "g", startX: 94, bendX: 88, endX: 52.8, startY: 2, width: 1.1 },
];

const CONVERGE_Y = 86;
const HUB_Y = 90;

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function cablePath(cable: CableDef): string {
  const midY = cable.startY + (CONVERGE_Y - cable.startY) * 0.42;
  const c1x = cable.startX + (cable.bendX - cable.startX) * 0.55;
  const c2x = cable.bendX + (cable.endX - cable.bendX) * 0.45;
  const c1y = cable.startY + (midY - cable.startY) * 0.7;
  const c2y = midY + (CONVERGE_Y - midY) * 0.35;

  return `M ${cable.startX} ${cable.startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${cable.endX} ${CONVERGE_Y}`;
}

function useScrollProgress(disabled: boolean) {
  const [progress, setProgress] = useState(disabled ? 1 : 0);
  const frame = useRef(0);

  useEffect(() => {
    if (disabled) {
      setProgress(1);
      return;
    }

    const update = () => {
      frame.current = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const next = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      setProgress(next);
    };

    const onScroll = () => {
      if (frame.current) return;
      frame.current = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame.current) window.cancelAnimationFrame(frame.current);
    };
  }, [disabled]);

  return progress;
}

function CableLayer({
  progress,
  animateStroke,
}: {
  progress: number;
  animateStroke: boolean;
}) {
  const pathsRef = useRef<(SVGPathElement | null)[]>([]);
  const [strokeReady, setStrokeReady] = useState(!animateStroke);

  useEffect(() => {
    if (!animateStroke) return;
    const draw = easeOutCubic(Math.min(1, progress * 1.15));
    pathsRef.current.forEach((path) => {
      if (!path) return;
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length * (1 - draw)}`;
    });
    setStrokeReady(true);
  }, [progress, animateStroke]);

  const converge = easeOutCubic(Math.min(1, progress * 1.08));
  const hanOpacity = animateStroke ? 0.035 + converge * 0.1 : 0.08;
  const hubOpacity = animateStroke ? 0.1 + converge * 0.35 : 0.32;

  return (
    <div
      aria-hidden
      className={
        animateStroke ? "scroll-cables" : "scroll-cables scroll-cables--static"
      }
      data-stroke-ready={strokeReady ? "true" : "false"}
    >
      <svg
        className="scroll-cables__svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="cable-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#111111" stopOpacity="0.5" />
            <stop offset="72%" stopColor="#111111" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#B45309" stopOpacity="0.55" />
          </linearGradient>
        </defs>

        <g className="scroll-cables__mesh" opacity={0.4 + progress * 0.2}>
          <path
            d="M 10 3 C 22 8, 30 6, 40 4"
            fill="none"
            stroke="#111111"
            strokeWidth="0.7"
            vectorEffect="non-scaling-stroke"
            opacity="0.28"
          />
          <path
            d="M 60 3.5 C 70 7, 78 5, 90 2.5"
            fill="none"
            stroke="#111111"
            strokeWidth="0.7"
            vectorEffect="non-scaling-stroke"
            opacity="0.24"
          />
          <path
            d="M 28 1.5 C 40 5, 55 5.5, 72 2"
            fill="none"
            stroke="#B45309"
            strokeWidth="0.85"
            vectorEffect="non-scaling-stroke"
            opacity="0.38"
          />
        </g>

        {CABLES.map((cable, index) => (
          <g key={cable.id}>
            <circle
              cx={cable.startX}
              cy={cable.startY}
              r={cable.accent ? 0.55 : 0.38}
              fill={cable.accent ? "#B45309" : "#111111"}
              opacity={cable.accent ? 0.5 : 0.24}
            />
            <path
              ref={(el) => {
                pathsRef.current[index] = el;
              }}
              className="scroll-cables__strand"
              d={cablePath(cable)}
              fill="none"
              stroke={cable.accent ? "#B45309" : "url(#cable-fade)"}
              strokeWidth={cable.width}
              strokeLinecap="round"
              opacity={cable.accent ? 0.38 : 0.26}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}

        <circle
          cx="50"
          cy={HUB_Y}
          r={1.15 + converge * 0.55}
          fill="#B45309"
          opacity={hubOpacity}
        />
        <circle
          cx="50"
          cy={HUB_Y}
          r={2.9 + converge * 1.2}
          fill="none"
          stroke="#B45309"
          strokeWidth="0.65"
          opacity={hubOpacity * 0.5}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <p
        className="scroll-cables__han font-serif"
        style={{ opacity: hanOpacity }}
      >
        HAN
      </p>
    </div>
  );
}

export function ScrollCables() {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const progress = useScrollProgress(reducedMotion);

  useEffect(() => {
    setMounted(true);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  if (!mounted || reducedMotion) {
    return <CableLayer progress={1} animateStroke={false} />;
  }

  return <CableLayer progress={progress} animateStroke />;
}
