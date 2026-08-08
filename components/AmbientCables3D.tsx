"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import * as THREE from "three";

type Mouse = { x: number; y: number };

type CableSpec = {
  id: string;
  startX: number;
  midX: number;
  endX: number;
  startZ: number;
  midZ: number;
  endZ: number;
  radius: number;
  accent: boolean;
  delay: number;
};

/** Fan of strands: top of viewport → converge at lower hub behind HAN */
const CABLES: CableSpec[] = [
  {
    id: "a",
    startX: -3.35,
    midX: -2.05,
    endX: -0.32,
    startZ: -0.45,
    midZ: 0.35,
    endZ: 0.05,
    radius: 0.048,
    accent: false,
    delay: 0,
  },
  {
    id: "b",
    startX: -2.25,
    midX: -1.4,
    endX: -0.16,
    startZ: 0.55,
    midZ: 0.1,
    endZ: -0.04,
    radius: 0.062,
    accent: true,
    delay: 0.04,
  },
  {
    id: "c",
    startX: -1.1,
    midX: -0.65,
    endX: -0.07,
    startZ: -0.62,
    midZ: -0.18,
    endZ: 0.06,
    radius: 0.044,
    accent: false,
    delay: 0.08,
  },
  {
    id: "d",
    startX: 0.05,
    midX: 0.02,
    endX: 0.01,
    startZ: 0.7,
    midZ: 0.22,
    endZ: 0,
    radius: 0.066,
    accent: true,
    delay: 0.02,
  },
  {
    id: "e",
    startX: 1.15,
    midX: 0.7,
    endX: 0.09,
    startZ: -0.48,
    midZ: 0.15,
    endZ: -0.03,
    radius: 0.046,
    accent: false,
    delay: 0.1,
  },
  {
    id: "f",
    startX: 2.3,
    midX: 1.4,
    endX: 0.2,
    startZ: 0.42,
    midZ: -0.16,
    endZ: 0.05,
    radius: 0.058,
    accent: true,
    delay: 0.05,
  },
  {
    id: "g",
    startX: 3.3,
    midX: 2.05,
    endX: 0.34,
    startZ: -0.28,
    midZ: 0.4,
    endZ: -0.02,
    radius: 0.05,
    accent: false,
    delay: 0.12,
  },
];

/** Framed for camera z=7.4 / fov 40 */
const TOP_Y = 2.55;
const BOTTOM_Y = -2.15;
const HUB = new THREE.Vector3(0, BOTTOM_Y, 0);
/** At scroll 0, only short tips peek in from the top */
const MIN_DRAW = 0.07;

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function useScrollProgress(disabled: boolean) {
  const progress = useRef(disabled ? 1 : 0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (disabled) {
      progress.current = 1;
      setTick((n) => n + 1);
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      const next =
        max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      progress.current = next;
      setTick((n) => n + 1);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [disabled]);

  return { progress, tick };
}

function CableMesh({
  spec,
  progress,
  reducedMotion,
}: {
  spec: CableSpec;
  progress: MutableRefObject<number>;
  reducedMotion: boolean;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const tip = useRef<THREE.Mesh>(null);
  const startCap = useRef<THREE.Mesh>(null);
  const drawRef = useRef(MIN_DRAW);
  const indexCount = useRef(0);

  const { geometry, curve, startNode } = useMemo(() => {
    const points = [
      new THREE.Vector3(spec.startX, TOP_Y, spec.startZ),
      new THREE.Vector3(
        (spec.startX + spec.midX) * 0.5,
        TOP_Y * 0.55,
        (spec.startZ + spec.midZ) * 0.5,
      ),
      new THREE.Vector3(spec.midX, 0.2, spec.midZ),
      new THREE.Vector3(
        (spec.midX + spec.endX) * 0.55,
        BOTTOM_Y * 0.35,
        (spec.midZ + spec.endZ) * 0.55,
      ),
      new THREE.Vector3(spec.endX, BOTTOM_Y + 0.12, spec.endZ),
      HUB.clone(),
    ];
    const curve = new THREE.CatmullRomCurve3(points);
    curve.curveType = "catmullrom";
    curve.tension = 0.42;
    const geometry = new THREE.TubeGeometry(curve, 140, spec.radius, 12, false);
    return { geometry, curve, startNode: points[0].clone() };
  }, [spec]);

  useEffect(() => {
    indexCount.current = geometry.index?.count ?? 0;
    const initial = Math.max(1, Math.floor(indexCount.current * MIN_DRAW));
    geometry.setDrawRange(0, initial);
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const raw = progress.current;
    const staggered = Math.min(
      1,
      Math.max(0, (raw - spec.delay) / Math.max(0.001, 1 - spec.delay * 0.7)),
    );
    const target = reducedMotion
      ? 1
      : MIN_DRAW + (1 - MIN_DRAW) * easeOutCubic(staggered);

    drawRef.current += (target - drawRef.current) * (reducedMotion ? 1 : 0.1);

    const count = indexCount.current;
    if (count > 0 && mesh.current) {
      const visible = Math.max(3, Math.floor(count * drawRef.current));
      // radialSegments=12 → 13 verts around, 6 indices per quad
      const stride = 13 * 6;
      const snapped = Math.min(count, Math.ceil(visible / stride) * stride);
      geometry.setDrawRange(0, snapped);

      if (!reducedMotion) {
        mesh.current.position.x = Math.sin(t * 0.32 + spec.delay * 10) * 0.02;
        mesh.current.position.z = Math.cos(t * 0.26 + spec.startX) * 0.03;
      } else {
        mesh.current.position.set(0, 0, 0);
      }

      const mat = mesh.current.material as THREE.MeshBasicMaterial;
      const base = spec.accent ? 0.78 : 0.52;
      mat.opacity = base * (0.75 + drawRef.current * 0.25);
    }

    if (tip.current) {
      const tipT = Math.min(0.995, drawRef.current);
      const point = curve.getPointAt(tipT);
      tip.current.position.copy(point);
      tip.current.position.x += mesh.current?.position.x ?? 0;
      tip.current.position.z += mesh.current?.position.z ?? 0;
      const tipMat = tip.current.material as THREE.MeshBasicMaterial;
      tipMat.opacity =
        (spec.accent ? 0.9 : 0.65) *
        (0.35 + (1 - Math.abs(tipT - 0.5) * 0.3) * drawRef.current);
      tip.current.scale.setScalar(
        reducedMotion ? 1 : 0.85 + Math.sin(t * 2.2 + spec.delay * 8) * 0.08,
      );
    }

    if (startCap.current && !reducedMotion) {
      startCap.current.position.x =
        startNode.x + Math.sin(t * 0.32 + spec.delay * 10) * 0.02;
      startCap.current.position.z =
        startNode.z + Math.cos(t * 0.26 + spec.startX) * 0.03;
    }
  });

  return (
    <group>
      <mesh ref={mesh} geometry={geometry}>
        <meshBasicMaterial
          color={spec.accent ? "#B45309" : "#2A2A2A"}
          transparent
          opacity={spec.accent ? 0.78 : 0.52}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={startCap} position={startNode}>
        <sphereGeometry args={[spec.accent ? 0.075 : 0.055, 16, 16]} />
        <meshBasicMaterial
          color={spec.accent ? "#B45309" : "#1A1A1A"}
          transparent
          opacity={spec.accent ? 0.88 : 0.62}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={tip}>
        <sphereGeometry args={[spec.radius * 1.35, 12, 12]} />
        <meshBasicMaterial
          color={spec.accent ? "#B45309" : "#333333"}
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function Hub({
  progress,
  reducedMotion,
}: {
  progress: MutableRefObject<number>;
  reducedMotion: boolean;
}) {
  const core = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const p = reducedMotion ? 1 : easeOutCubic(progress.current);
    const pulse = reducedMotion
      ? 1
      : 1 + Math.sin(state.clock.elapsedTime * 1.35) * 0.06;

    if (core.current) {
      core.current.scale.setScalar((0.55 + p * 1.25) * pulse);
      (core.current.material as THREE.MeshBasicMaterial).opacity = 0.12 + p * 0.62;
    }
    if (ring.current) {
      ring.current.scale.setScalar(0.65 + p * 1.05);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = 0.06 + p * 0.38;
      if (!reducedMotion) {
        ring.current.rotation.z = state.clock.elapsedTime * 0.16;
      }
    }
    if (glow.current) {
      glow.current.scale.setScalar(0.9 + p * 1.6);
      (glow.current.material as THREE.MeshBasicMaterial).opacity = 0.03 + p * 0.14;
    }
  });

  return (
    <group position={HUB}>
      <mesh ref={glow}>
        <sphereGeometry args={[0.42, 20, 20]} />
        <meshBasicMaterial
          color="#B45309"
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={core}>
        <sphereGeometry args={[0.12, 20, 20]} />
        <meshBasicMaterial
          color="#B45309"
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2.35, 0.15, 0]}>
        <torusGeometry args={[0.34, 0.012, 8, 56]} />
        <meshBasicMaterial
          color="#B45309"
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function CableScene({
  mouse,
  progress,
  reducedMotion,
}: {
  mouse: MutableRefObject<Mouse>;
  progress: MutableRefObject<number>;
  reducedMotion: boolean;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    if (reducedMotion) {
      group.current.rotation.set(0.05, 0, 0);
      group.current.position.set(0, 0, 0);
      return;
    }
    const t = state.clock.elapsedTime;
    const targetX = mouse.current.x * 0.16;
    const targetY = -mouse.current.y * 0.1;
    group.current.position.x += (targetX - group.current.position.x) * 0.05;
    group.current.position.y += (targetY - group.current.position.y) * 0.05;
    group.current.rotation.y =
      Math.sin(t * 0.11) * 0.07 + mouse.current.x * 0.1;
    group.current.rotation.x =
      0.06 + Math.sin(t * 0.08) * 0.03 + mouse.current.y * 0.05;
  });

  return (
    <group ref={group}>
      {CABLES.map((spec) => (
        <CableMesh
          key={spec.id}
          spec={spec}
          progress={progress}
          reducedMotion={reducedMotion}
        />
      ))}
      <Hub progress={progress} reducedMotion={reducedMotion} />
    </group>
  );
}

export function AmbientCables3D() {
  const mouse = useRef<Mouse>({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { progress, tick } = useScrollProgress(reducedMotion);

  useEffect(() => {
    setMounted(true);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);

    const onMove = (event: PointerEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const hanOpacity = reducedMotion
    ? 0.18
    : 0.045 + easeOutCubic(progress.current) * 0.22;

  if (!mounted) {
    return (
      <div
        aria-hidden
        className="ambient-cables-3d ambient-cables-3d--pending"
      />
    );
  }

  return (
    <div
      aria-hidden
      className={
        reducedMotion
          ? "ambient-cables-3d ambient-cables-3d--static"
          : "ambient-cables-3d"
      }
      data-scroll-tick={tick}
    >
      <Canvas
        className="ambient-cables-3d__canvas"
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.08, 7.4], fov: 40, near: 0.1, far: 40 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        frameloop="always"
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <CableScene
          mouse={mouse}
          progress={progress}
          reducedMotion={reducedMotion}
        />
      </Canvas>

      <p
        className="ambient-cables-3d__han font-serif"
        style={{ opacity: hanOpacity }}
      >
        HAN
      </p>
    </div>
  );
}
