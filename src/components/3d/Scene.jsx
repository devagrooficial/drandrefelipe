import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds } from "@react-three/drei";
import KneeModel from "./KneeModel.jsx";
import PlaceholderJoint from "./PlaceholderJoint.jsx";
import ModelErrorBoundary from "./ModelErrorBoundary.jsx";

/**
 * Hero 3D stage: studio-style lighting (ambient fill + directional key
 * spot) around a single floating model. No HDRI/environment map on
 * purpose — keeps the hero free of third-party asset fetches.
 */
export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.5], fov: 32 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      resize={{ offsetSize: true }}
    >
      <ambientLight intensity={0.7} color="#f8f4ec" />
      <spotLight
        position={[4, 6, 6]}
        angle={0.35}
        penumbra={0.7}
        intensity={140}
        color="#c8ad84"
      />
      <spotLight
        position={[-5, -3, -4]}
        angle={0.5}
        penumbra={1}
        intensity={40}
        color="#4a6359"
      />
      <directionalLight position={[0, 4, 2]} intensity={0.4} color="#ffffff" />

      <ModelErrorBoundary fallback={<PlaceholderJoint scale={1.1} />}>
        <Suspense fallback={<PlaceholderJoint scale={1.1} />}>
          {/* knee.glb ships at whatever scale/origin it was exported with —
              Bounds fits the camera to it once on load instead of trusting
              hand-tuned numbers that would break on a re-export. */}
          <Bounds fit clip observe margin={1.15}>
            <KneeModel />
          </Bounds>
        </Suspense>
      </ModelErrorBoundary>
    </Canvas>
  );
}
