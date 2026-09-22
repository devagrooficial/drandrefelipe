import { Suspense, useMemo } from "react";
import { useGLTF, Float } from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { useScrollTilt } from "./useScrollTilt.js";
import PlaceholderJoint from "./PlaceholderJoint.jsx";

const MODEL_PATH = "/knee.glb";

// knee.glb's real bounding box, measured once with
// `new THREE.Box3().setFromObject(scene)` in dev tools (~349 x 1364 x
// 362 units, centered around y≈140). Hardcoded so there's no runtime
// measurement to get wrong — see git history if this ever needs
// re-deriving for a re-exported file at a different scale.
const MODEL_CENTER = new THREE.Vector3(-2, 140, -63);
const MODEL_SCALE = 0.0021;

/**
 * Idle float + scroll-tilt for the loaded model. Split out from
 * KneeModel on purpose: useFrame (inside useScrollTilt) must not live
 * in the same component as useGLTF. useGLTF suspends while /knee.glb
 * streams in, and React only renders as far as the suspend point — so
 * a component calling both hooks ran them in a different order on the
 * first (aborted) render vs. the retry after the asset resolved,
 * which corrupted React's hook bookkeeping for that fiber. Nesting
 * this component below the suspending hook means its hooks only ever
 * run once useGLTF has already resolved.
 */
function KneeMesh({ scene, ...props }) {
  const group = useScrollTilt();

  return (
    <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.7}>
      <group ref={group} {...props}>
        <primitive object={scene} />
      </group>
    </Float>
  );
}

function LoadedKnee(props) {
  const { scene: cachedScene } = useGLTF(MODEL_PATH);

  const scene = useMemo(() => {
    // Plain Object3D.clone() does not re-link a SkinnedMesh's skeleton
    // to the cloned bones — it silently keeps pointing at the
    // originals, which corrupts every skinned vertex's position. This
    // model is rigged (Armature/bones drive the mesh), and that bug is
    // exactly what was rendering as a giant, shapeless blob no matter
    // what scale or position was applied afterward. SkeletonUtils.clone
    // is the three.js-recommended way to deep-clone a skinned model.
    const clone = SkeletonUtils.clone(cachedScene);
    clone.scale.setScalar(MODEL_SCALE);
    clone.position.copy(MODEL_CENTER).multiplyScalar(-MODEL_SCALE);
    return clone;
  }, [cachedScene]);

  return <KneeMesh scene={scene} {...props} />;
}

export default function KneeModel(props) {
  return (
    <Suspense fallback={<PlaceholderJoint scale={1.1} />}>
      <LoadedKnee {...props} />
    </Suspense>
  );
}

useGLTF.preload(MODEL_PATH);
