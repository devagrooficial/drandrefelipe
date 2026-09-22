import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import KneeModel from "./KneeModel.jsx";
import PlaceholderJoint from "./PlaceholderJoint.jsx";
import ModelErrorBoundary from "./ModelErrorBoundary.jsx";

/**
 * Hero 3D stage: studio-style lighting (ambient fill + directional key
 * spot) around a single floating model. No HDRI/environment map on
 * purpose — keeps the hero free of third-party asset fetches.
 *
 * The default camera position/fov below is tuned for PlaceholderJoint
 * (shown while loading and as the error fallback); KneeModel repositions
 * the camera itself once the real, differently-scaled asset is in.
 */
export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.5], fov: 32 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      frameloop="always"
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
          <KneeModel />
        </Suspense>
      </ModelErrorBoundary>
    </Canvas>
  );
}
