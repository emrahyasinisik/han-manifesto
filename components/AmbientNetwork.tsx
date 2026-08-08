"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Mouse = { x: number; y: number };

function NetworkGraph({ mouse }: { mouse: React.MutableRefObject<Mouse> }) {
  const group = useRef<THREE.Group>(null);

  const { positions, lineGeometry } = useMemo(() => {
    const count = 30;
    const positions: THREE.Vector3[] = [];

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const radius = 1.55 + (i % 4) * 0.07;
      positions.push(
        new THREE.Vector3(
          radius * Math.cos(theta) * Math.sin(phi),
          radius * Math.sin(theta) * Math.sin(phi) * 0.92,
          radius * Math.cos(phi) * 0.68,
        ),
      );
    }

    const pairs: [number, number][] = [];
    for (let i = 0; i < count; i++) {
      const nearest = positions
        .map((point, j) => ({ j, d: point.distanceTo(positions[i]) }))
        .filter((entry) => entry.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3);
      for (const { j } of nearest) {
        if (i < j) pairs.push([i, j]);
      }
    }

    const points: THREE.Vector3[] = [];
    for (const [a, b] of pairs) {
      points.push(positions[a], positions[b]);
    }

    return {
      positions,
      lineGeometry: new THREE.BufferGeometry().setFromPoints(points),
    };
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = t * 0.07 + mouse.current.x * 0.35;
    group.current.rotation.x = 0.22 + mouse.current.y * 0.2;
    group.current.position.x = mouse.current.x * 0.12;
    group.current.position.y = -mouse.current.y * 0.08;
  });

  return (
    <group ref={group} scale={1.15}>
      {positions.map((position, index) => {
        const hub = index % 6 === 0;
        return (
          <mesh key={index} position={position}>
            <sphereGeometry args={[hub ? 0.05 : 0.028, 14, 14]} />
            <meshBasicMaterial
              color={hub ? "#B45309" : "#1a1a1a"}
              transparent
              opacity={hub ? 0.92 : 0.42}
            />
          </mesh>
        );
      })}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#111111" transparent opacity={0.16} />
      </lineSegments>
    </group>
  );
}

function StaticNetworkFallback() {
  return (
    <div
      aria-hidden
      className="ambient-network-fallback pointer-events-none absolute -right-8 top-0 h-[28rem] w-[28rem] opacity-40 md:h-[36rem] md:w-[36rem]"
    />
  );
}

export function AmbientNetwork() {
  const mouse = useRef<Mouse>({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);

    const onMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = (event.clientY / window.innerHeight) * 2 - 1;
      mouse.current.x = x * 0.55;
      mouse.current.y = y * 0.55;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  if (!mounted || reducedMotion) {
    return <StaticNetworkFallback />;
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -right-10 top-[-4rem] z-0 h-[30rem] w-[30rem] opacity-70 md:-right-6 md:top-[-2rem] md:h-[40rem] md:w-[40rem] lg:opacity-80"
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 4.2], fov: 42 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <NetworkGraph mouse={mouse} />
      </Canvas>
    </div>
  );
}
