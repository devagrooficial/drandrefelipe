import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";

/**
 * Abstract stand-in for the knee model, shown while /knee.glb streams in
 * and as a permanent fallback if the asset is missing or fails to load.
 */
export default function PlaceholderJoint(props) {
  const group = useRef(null);

  useFrame((_state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.7}>
      <group ref={group} {...props}>
        <mesh castShadow>
          <torusKnotGeometry args={[1, 0.34, 160, 32]} />
          <meshStandardMaterial
            color="#c8ad84"
            metalness={0.55}
            roughness={0.28}
          />
        </mesh>
        <mesh scale={1.35}>
          <torusKnotGeometry args={[1, 0.34, 64, 16]} />
          <meshBasicMaterial color="#c8ad84" wireframe transparent opacity={0.08} />
        </mesh>
      </group>
    </Float>
  );
}
