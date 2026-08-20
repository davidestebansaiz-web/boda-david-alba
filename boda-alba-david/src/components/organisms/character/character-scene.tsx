import { Outlines } from "@react-three/drei";
import { Canvas, createPortal, useFrame, useLoader, useThree } from "@react-three/fiber";
import GUI from "lil-gui";
import { Fragment, Suspense, useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import styled from "styled-components";
import {
  Box3,
  EdgesGeometry,
  Mesh,
  MOUSE,
  OrthographicCamera,
  PerspectiveCamera,
  Vector3,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";

import sceneUrl from "../../../assets/models/personaje.glb?url";

const SceneSection = styled.section`
  position: relative;
  width: 300px;
  height: 300px;
  min-height: 200px;
  min-height: 200px;
  overflow: hidden;
  

  canvas {
    display: block;
    width: 100% !important;
    height: 100% !important;
    cursor: grab;
    touch-action: pan-y;
  }

  canvas:active {
    cursor: grabbing;
  }
`;

const LoadingMessage = styled.p<{ $isLoaded: boolean }>`
  position: absolute;
  inset: 50% auto auto 50%;
  z-index: 1;
  margin: 0;
  color: #604b3c;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transform: translate(-50%, -50%);
  opacity: ${({ $isLoaded }) => ($isLoaded ? 0 : 1)};
  transition: opacity 300ms ease;
  pointer-events: none;
`;

type WeddingModelProps = {
  lineArt: boolean;
  lineColor: number;
  lineStrength: number;
  onLoaded: (headCenter: Vector3) => void;
};

type SceneEffectsSettings = {
  lineArt: boolean;
  lineColor: number;
  lineStrength: number;
  pixelation: boolean;
  pixelSize: number;
};

const initialEffectsSettings: SceneEffectsSettings = {
  lineArt: true,
  lineColor: 0xbc8973,
  lineStrength: 3,
  pixelation: true,
  pixelSize: 2,
};

const lineArtMeshNames = new Set(["Cube", "Cube.001", "Cube.004", "ventana"]);

function WeddingModel({ lineArt, lineColor, lineStrength, onLoaded }: WeddingModelProps) {
  const gltf = useLoader(GLTFLoader, sceneUrl);

  const { exteriorMeshes, headCenter, model, scale } = useMemo(() => {
    const clonedScene = gltf.scene.clone(true);
    const sceneMeshes: Mesh[] = [];
    const sceneEdgeMaterial = new LineMaterial({
      color: lineColor,
      depthTest: true,
      depthWrite: false,
      linewidth: lineStrength,
      opacity: 1,
      toneMapped: false,
      transparent: true,
      worldUnits: false,
    });
    const bounds = new Box3().setFromObject(clonedScene);
    const size = bounds.getSize(new Vector3());
    const center = bounds.getCenter(new Vector3());
    const largestSide = Math.max(size.x, size.y, size.z) || 1;
    const normalizedScale = 3.5 / largestSide;
    const normalizedHeadCenter = new Vector3(
      0,
      -1.45 + size.y * normalizedScale * 0.4,
      0,
    );

    clonedScene.position.set(-center.x, -bounds.min.y, -center.z);
    clonedScene.traverse((child) => {
      if (child instanceof Mesh) {
        sceneMeshes.push(child);
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    const lineArtMeshes = sceneMeshes.filter((mesh) => lineArtMeshNames.has(mesh.name));
    const houseExteriorMeshes = sceneMeshes.filter((mesh) => {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const isHouseMaterial = materials.some((material) => material.name === "casa" || material.name === "techo");
      return mesh.name !== "ventana" && isHouseMaterial;
    });
    lineArtMeshes.forEach((mesh) => {
      const thresholdAngle = mesh.name === "ventana" ? 20 : 55;
      const edges = new EdgesGeometry(mesh.geometry, thresholdAngle);
      const wideLineGeometry = new LineSegmentsGeometry();
      wideLineGeometry.setPositions(edges.attributes.position.array as Float32Array);
      edges.dispose();

      const lines = new LineSegments2(wideLineGeometry, sceneEdgeMaterial);
      lines.frustumCulled = false;
      lines.renderOrder = 20;
      lines.visible = lineArt;
      mesh.add(lines);
    });

    return {
      exteriorMeshes: houseExteriorMeshes,
      headCenter: normalizedHeadCenter,
      model: clonedScene,
      scale: normalizedScale,
    };
  }, [gltf.scene, lineArt, lineColor, lineStrength]);

  useEffect(() => {
    onLoaded(headCenter);
  }, [headCenter, onLoaded]);

  return (
    <group position={[0, -1.45, 0]} scale={scale}>
      <primitive object={model} />
      {lineArt &&
        exteriorMeshes.map((mesh) => (
          <Fragment key={mesh.uuid}>
            {createPortal(
              <Outlines
                color={lineColor}
                opacity={1}
                screenspace={false}
                thickness={lineStrength}
                toneMapped={false}
              />,
              mesh,
            )}
          </Fragment>
        ))}
    </group>
  );
}

type CameraControlsProps = {
  guiContainerRef: RefObject<HTMLDivElement | null>;
  initialTarget: Vector3;
  onEffectsChange: (changes: Partial<SceneEffectsSettings>) => void;
};

const initialCameraPosition = new Vector3(0, -0, 5.97);
const initialCameraZoom = 50;

function CameraControls({ guiContainerRef, initialTarget, onEffectsChange }: CameraControlsProps) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControls>(null);

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);

    camera.position.copy(initialCameraPosition);

    controlsRef.current = controls;

    let isRightPanning = false;

    const handleRightPointerDown = (event: PointerEvent) => {
      if (event.button !== 2) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      isRightPanning = true;
      gl.domElement.setPointerCapture(event.pointerId);
    };

    const handleRightPointerMove = (event: PointerEvent) => {
      if (!isRightPanning || (event.buttons & 2) === 0) return;

      event.preventDefault();
      event.stopImmediatePropagation();
    };

    const handleRightPointerUp = (event: PointerEvent) => {
      if (!isRightPanning) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      isRightPanning = false;
      if (gl.domElement.hasPointerCapture(event.pointerId)) {
        gl.domElement.releasePointerCapture(event.pointerId);
      }
    };

    const preventContextMenu = (event: MouseEvent) => event.preventDefault();

    gl.domElement.addEventListener("pointerdown", handleRightPointerDown, true);
    gl.domElement.addEventListener("pointermove", handleRightPointerMove, true);
    gl.domElement.addEventListener("pointerup", handleRightPointerUp, true);
    gl.domElement.addEventListener("pointercancel", handleRightPointerUp, true);
    gl.domElement.addEventListener("contextmenu", preventContextMenu, true);

    const gui = new GUI({
      container: guiContainerRef.current ?? undefined,
      title: "Cámara",
      width: 300,
    });


    if (camera instanceof PerspectiveCamera) {
      gui.add(camera, "fov", 20, 80, 1)
        .name("Campo de visión")
        .onChange(() => camera.updateProjectionMatrix());
    } else if (camera instanceof OrthographicCamera) {
      gui.add(camera, "zoom", 50, 1000, 1)
        .name("Zoom ortográfico")
        .listen()
        .onChange(() => camera.updateProjectionMatrix());
    }



    const actions = {
      copiarPosicion: () => {
        const projection =
          camera instanceof OrthographicCamera
            ? `zoom: ${camera.zoom.toFixed(0)}`
            : `fov: ${camera instanceof PerspectiveCamera ? camera.fov.toFixed(0) : 42}`;
        const code = `camera={{ position: [${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)}], ${projection} }}`;
        void navigator.clipboard?.writeText(code);
      },
      restablecer: () => {
        camera.position.copy(initialCameraPosition);
        if (camera instanceof PerspectiveCamera) {
          camera.fov = 42;
          camera.updateProjectionMatrix();
        } else if (camera instanceof OrthographicCamera) {
          camera.zoom = initialCameraZoom;
          camera.updateProjectionMatrix();
        }
      },
    };
    gui.add(actions, "copiarPosicion").name("Copiar posición");
    gui.add(actions, "restablecer").name("Restablecer cámara");

    return () => {
      gl.domElement.removeEventListener("pointerdown", handleRightPointerDown, true);
      gl.domElement.removeEventListener("pointermove", handleRightPointerMove, true);
      gl.domElement.removeEventListener("pointerup", handleRightPointerUp, true);
      gl.domElement.removeEventListener("pointercancel", handleRightPointerUp, true);
      gl.domElement.removeEventListener("contextmenu", preventContextMenu, true);
      gui.destroy();
    };
  }, [camera, gl.domElement, guiContainerRef, initialTarget, onEffectsChange]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    controls.target.copy(initialTarget);
    controls.update();
  });

  return null;
}

export function Character() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [effects, setEffects] = useState(initialEffectsSettings);
  const [cameraTarget, setCameraTarget] = useState<Vector3 | null>(null);
  const guiContainerRef = useRef<HTMLDivElement>(null);
  const handleLoaded = useCallback((headCenter: Vector3) => {
    setCameraTarget((current) =>
      current && current.distanceToSquared(headCenter) < 0.000001 ? current : headCenter,
    );
    setIsLoaded(true);
  }, []);
  const handleEffectsChange = useCallback((changes: Partial<SceneEffectsSettings>) => {
    setEffects((current) => ({ ...current, ...changes }));
  }, []);

  return (
    <SceneSection aria-label="Escena 3D de la boda">
      <LoadingMessage $isLoaded={isLoaded} role="status">
        Cargando escena
      </LoadingMessage>
      <Canvas
        camera={{ position: [-3.65, -0.99, 8.97], fov: 35, near: 0.1, far: 100 }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={1.2} />
        <hemisphereLight args={["#fff7ee", "#8c6954", 1.6]} />
        <directionalLight
          castShadow
          intensity={2.8}
          position={[4, 7, 5]}
          shadow-normalBias={0.04}
          shadow-mapSize={[1024, 1024]}
        />
        <Suspense fallback={null}>
          <WeddingModel
            lineArt={effects.lineArt}
            lineColor={effects.lineColor}
            lineStrength={effects.lineStrength}
            onLoaded={handleLoaded}
          />
        </Suspense>

        {cameraTarget && (
          <CameraControls
            guiContainerRef={guiContainerRef}
            initialTarget={cameraTarget}
            onEffectsChange={handleEffectsChange}
          />
        )}
      </Canvas>
    </SceneSection>
  );
}

useLoader.preload(GLTFLoader, sceneUrl);
