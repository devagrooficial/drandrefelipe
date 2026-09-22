import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

/**
 * Ref to drive a <group>: a continuous idle spin on Y, plus an extra
 * diagonal tilt (X + Y) driven by how far the page has scrolled — so
 * the model doesn't just spin in place, it visibly tumbles as the hero
 * scrolls past instead of only turning on one flat axis.
 *
 * Uses the R3F clock's elapsedTime (total real time since mount) rather
 * than accumulating delta by hand — that way a choppy/throttled frame
 * rate still lands on the correct angle for "now" instead of drifting.
 */
export function useScrollTilt({ idleSpeed = 0.35, maxYaw = 1.4, maxPitch = 0.6 } = {}) {
  const group = useRef(null);

  useFrame((state) => {
    if (!group.current) return;

    const viewportHeight = window.innerHeight || 1;
    const progress = Math.min(Math.max(window.scrollY / viewportHeight, 0), 1);

    group.current.rotation.y = state.clock.elapsedTime * idleSpeed + progress * maxYaw;
    group.current.rotation.x = progress * maxPitch;
  });

  return group;
}
