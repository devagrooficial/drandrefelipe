import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

/**
 * Ref to drive a <group>: a slow continuous idle spin on Y, plus an
 * extra diagonal tilt (X + Y) driven by how far the page has scrolled —
 * so the model doesn't just spin in place, it visibly tumbles as the
 * hero scrolls past instead of only turning on one flat axis.
 */
export function useScrollTilt({ idleSpeed = 0.12, maxYaw = 1.4, maxPitch = 0.6 } = {}) {
  const group = useRef(null);
  const idle = useRef(0);

  useFrame((_state, delta) => {
    if (!group.current) return;

    idle.current += delta * idleSpeed;

    const viewportHeight = window.innerHeight || 1;
    const progress = Math.min(Math.max(window.scrollY / viewportHeight, 0), 1);

    group.current.rotation.y = idle.current + progress * maxYaw;
    group.current.rotation.x = progress * maxPitch;
  });

  return group;
}
