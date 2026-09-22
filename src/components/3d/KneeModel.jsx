import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Float } from "@react-three/drei";

const MODEL_PATH = "/knee.glb";

/**
 * Loads the anatomical knee model and gives it a slow, idle presence:
 * a gentle vertical float plus a slow spin on the Y axis.
 */
export default function KneeModel(props) {
  const group = useRef(null);
  const { scene } = useGLTF(MODEL_PATH);

  useFrame((_state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.7}>
      <group ref={group} {...props}>
        <primitive object={scene} />
      </group>
    </Float>
  );
}

useGLTF.preload(MODEL_PATH);
