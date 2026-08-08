"use client";

import { useEffect, useRef } from "react";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  baseAlpha: number;
  hub: boolean;
  phase: number;
  color: "amber" | "ink";
};

const AMBER = "180, 83, 9";
const INK = "17, 17, 17";

function nodeCountForWidth(width: number): number {
  if (width < 640) return 18;
  if (width < 1024) return 30;
  return 42;
}

/** Prefer gutters so the reading column stays clear. */
function placeX(width: number): number {
  const gutter = Math.min(width * 0.32, 360);
  if (Math.random() < 0.82 && width > 520) {
    return Math.random() < 0.5
      ? Math.random() * gutter
      : width - Math.random() * gutter;
  }
  return Math.random() * width;
}

function seedNodes(width: number, height: number, count: number): Node[] {
  const nodes: Node[] = [];
  for (let i = 0; i < count; i++) {
    const hub = i % 4 === 0;
    const amber = hub || i % 3 === 0;
    nodes.push({
      x: placeX(width),
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.26,
      vy: (Math.random() - 0.5) * 0.2,
      r: hub ? 3.6 + Math.random() * 2.4 : 2.1 + Math.random() * 1.7,
      baseAlpha: hub
        ? 0.52 + Math.random() * 0.2
        : 0.3 + Math.random() * 0.18,
      hub,
      phase: Math.random() * Math.PI * 2,
      color: amber ? "amber" : "ink",
    });
  }
  return nodes;
}

function drawNode(
  ctx: CanvasRenderingContext2D,
  n: Node,
  alpha: number,
  radius: number,
) {
  const rgb = n.color === "amber" ? AMBER : INK;

  if (n.hub) {
    ctx.beginPath();
    ctx.fillStyle = `rgba(${rgb}, ${alpha * 0.22})`;
    ctx.arc(n.x, n.y, radius * 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
  ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawStatic(ctx: CanvasRenderingContext2D, nodes: Node[]) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (const n of nodes) {
    drawNode(ctx, n, n.baseAlpha, n.r);
  }
}

export function ProtocolField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let nodes: Node[] = [];
    let raf = 0;
    let running = false;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const parent = canvas.parentElement;
      width = parent?.clientWidth ?? window.innerWidth;
      height = parent?.clientHeight ?? window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = nodeCountForWidth(width);
      if (nodes.length !== count) {
        nodes = seedNodes(width, height, count);
      } else {
        for (const n of nodes) {
          n.x = Math.min(Math.max(n.x, 0), width);
          n.y = Math.min(Math.max(n.y, 0), height);
        }
      }

      if (reducedMotion) {
        drawStatic(ctx, nodes);
      }
    };

    const tick = (t: number) => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < -8) n.x = width + 8;
        else if (n.x > width + 8) n.x = -8;
        if (n.y < -8) n.y = height + 8;
        else if (n.y > height + 8) n.y = -8;

        let alpha = n.baseAlpha;
        let radius = n.r;
        if (n.hub) {
          const pulse = 0.5 + 0.5 * Math.sin(t * 0.002 + n.phase);
          alpha = n.baseAlpha * (0.5 + 0.6 * pulse);
          radius = n.r * (0.86 + 0.22 * pulse);
        } else if (n.color === "amber") {
          const pulse = 0.5 + 0.5 * Math.sin(t * 0.0014 + n.phase);
          alpha = n.baseAlpha * (0.72 + 0.35 * pulse);
        }

        drawNode(ctx, n, alpha, radius);
      }

      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (reducedMotion || running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    resize();
    if (!reducedMotion) start();

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    window.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      ro.disconnect();
      window.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="protocol-field pointer-events-none absolute inset-0 z-0"
      aria-hidden
    />
  );
}
