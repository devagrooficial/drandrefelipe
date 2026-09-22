import { useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { useGLTF, Float } from "@react-three/drei";
import * as THREE from "three";
import { useScrollTilt } from "./useScrollTilt.js";

const MODEL_PATH = "/knee.glb";
const FRAME_MARGIN = 1.3;

/**
 * Loads the anatomical knee model and gives it a slow, idle presence:
 * a gentle vertical float, plus a diagonal tumble tied to page scroll.
 *
 * knee.glb ships at whatever scale/origin it was exported with (this one
 * measures ~1360 units tall), so on mount we measure its real bounding
 * box once, re-center it at the origin, and push the camera back just
 * far enough to frame it — instead of hand-tuned numbers that would
 * silently break on a re-export.
 *
 * This component can be mounted more than once on the same page (hero +
 * technology section). drei caches useGLTF by URL and hands back the
 * SAME scene graph object to every caller, and Object3D.add() reparents
 * on insert — so without cloning, the second mount would silently steal
 * the model out of the first one's scene.
 */
export default function KneeModel(props) {
  const group = useScrollTilt();
  const { scene: cachedScene } = useGLTF(MODEL_PATH);
  const scene = useMemo(() => cachedScene.clone(true), [cachedScene]);
  const { camera } = useThree();
  const didFit = useRef(false);

  useEffect(() => {
    if (didFit.current) return;
    didFit.current = true;

    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    scene.position.sub(center);

    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    const fovRadians = (camera.fov * Math.PI) / 180;
    const distance = (maxDimension / 2 / Math.tan(fovRadians / 2)) * FRAME_MARGIN;

    camera.position.set(0, 0, distance);
    camera.near = distance / 100;
    camera.far = distance * 100;
    camera.updateProjectionMatrix();
  }, [scene, camera]);

  return (
    <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.7}>
      <group ref={group} {...props}>
        <primitive object={scene} />
      </group>
    </Float>
  );
}

useGLTF.preload(MODEL_PATH);
