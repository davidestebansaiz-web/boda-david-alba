import { Outlines } from "@react-three/drei";
import { Canvas, createPortal, useFrame, useLoader, useThree } from "@react-three/fiber";
import { EffectComposer, Pixelation } from "@react-three/postprocessing";
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

import sceneUrl from "../../../assets/models/escena.glb?url";
import Person from '../person'

const SceneSection = styled.section`
  position: relative;
  width: 100%;
  min-height: 70vh;
  min-height: 70svh;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 42%, rgba(255, 255, 255, 0.82), transparent 38%),
    linear-gradient(180deg, #f4e6d8 0%, #ead2bf 100%);

  canvas {
    display: block;
    width: 100% !important;
    min-height: 70vh;
    min-height: 70svh;
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

const InteractionHint = styled.p`
  position: absolute;
  right: 1rem;
  bottom: 0.8rem;
  z-index: 1;
  margin: 0;
  padding: 0.4rem 0.65rem;
  color: rgba(47, 38, 32, 0.72);
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.65);
  border-radius: 999px;
  font-size: 0.72rem;
  backdrop-filter: blur(8px);
  pointer-events: none;
`;

const GuiContainer = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 2;
  box-shadow: 0 8px 24px rgba(73, 47, 31, 0.12);

  .lil-gui.root {
    --background-color: rgba(35, 30, 27, 0.92);
    --widget-color: #4a413c;
    --hover-color: #5d514a;
    --focus-color: #75645a;
    --text-color: #fff8f1;
    --number-color: #e8bd9f;
    --string-color: #cddfae;
  }

  @media (max-width: 640px) {
    top: 0.75rem;
    right: 0.75rem;
  }
`;

type WeddingModelProps = {
  lineArt: boolean;
  lineColor: number;
  lineStrength: number;
  onLoaded: (houseCenter: Vector3) => void;
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

  const { exteriorMeshes, houseCenter, model, scale } = useMemo(() => {
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

    clonedScene.position.set(-center.x, -bounds.min.y, -center.z);
    clonedScene.traverse((child) => {
      if (child instanceof Mesh) {
        sceneMeshes.push(child);

        child.castShadow = true;
        child.receiveShadow = true;

        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];

        materials.forEach((material) => {
          // Solo materiales que tengan transparencia
          if ("map" in material && material.map?.channel !== undefined) {
            if ("alphaTest" in material) {
              material.alphaTest = 0.5;
            }

            material.transparent = false;
            material.depthWrite = true;
            material.depthTest = true;
            material.needsUpdate = true;
          }
        });
      }
    });
    const lineArtMeshes = sceneMeshes.filter((mesh) => lineArtMeshNames.has(mesh.name));
    const houseExteriorMeshes = sceneMeshes.filter((mesh) => {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const isHouseMaterial = materials.some((material) => material.name === "casa" || material.name === "techo");
      return mesh.name !== "ventana" && isHouseMaterial;
    });

    clonedScene.updateMatrixWorld(true);
    const houseBounds = new Box3();
    houseExteriorMeshes.forEach((mesh) => houseBounds.expandByObject(mesh));
    const normalizedHouseCenter = houseBounds
      .getCenter(new Vector3())
      .multiplyScalar(normalizedScale)
      .add(new Vector3(0, -1.45, 0));

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
      houseCenter: normalizedHouseCenter,
      model: clonedScene,
      scale: normalizedScale,
    };
  }, [gltf.scene, lineArt, lineColor, lineStrength]);

  useEffect(() => {
    onLoaded(houseCenter);
  }, [houseCenter, onLoaded]);

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

const initialCameraOffset = new Vector3(6, 4.9, 6);
const initialCameraZoom = 450;

function CameraControls({ guiContainerRef, initialTarget, onEffectsChange }: CameraControlsProps) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControls>(null);

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableDamping = true;
    controls.enableRotate = true;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.screenSpacePanning = true;
    controls.panSpeed = 1.5;
    controls.zoomToCursor = true;
    controls.zoomSpeed = 1.1;
    controls.minDistance = 0.2;
    controls.maxDistance = 100;
    controls.minZoom = 50;
    controls.maxZoom = 1000;
    controls.minPolarAngle = Math.PI * 0.02;
    controls.maxPolarAngle = Math.PI * 0.98;
    controls.mouseButtons.LEFT = MOUSE.ROTATE;
    controls.mouseButtons.MIDDLE = MOUSE.DOLLY;
    controls.mouseButtons.RIGHT = MOUSE.PAN;
    camera.position.copy(initialTarget).add(initialCameraOffset);
    controls.target.copy(initialTarget);
    controls.update();
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
      controls.pan(event.movementX * controls.panSpeed, event.movementY * controls.panSpeed);
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

    const effectsFolder = gui.addFolder("Tratamiento visual");
    const effectControls = {
      lineart: initialEffectsSettings.lineArt,
      colorLinea: initialEffectsSettings.lineColor,
      intensidadLinea: initialEffectsSettings.lineStrength,
      pixelado: initialEffectsSettings.pixelation,
      tamañoPixel: initialEffectsSettings.pixelSize,
    };
    effectsFolder
      .add(effectControls, "pixelado")
      .name("Pixelado")
      .onChange((value: boolean) => onEffectsChange({ pixelation: value }));
    effectsFolder
      .add(effectControls, "tamañoPixel", 1, 24, 1)
      .name("Tamaño píxel")
      .onChange((value: number) => onEffectsChange({ pixelSize: value }));
    effectsFolder
      .add(effectControls, "lineart")
      .name("Lineart")
      .onChange((value: boolean) => onEffectsChange({ lineArt: value }));
    effectsFolder
      .add(effectControls, "intensidadLinea", 0.5, 40, 0.5)
      .name("Grosor línea")
      .onChange((value: number) => onEffectsChange({ lineStrength: value }));
    effectsFolder
      .addColor(effectControls, "colorLinea")
      .name("Color línea")
      .onChange((value: number) => onEffectsChange({ lineColor: value }));

    const positionFolder = gui.addFolder("Posición");
    positionFolder.add(camera.position, "x", -100, 100, 0.01).name("X").listen().decimals(2);
    positionFolder.add(camera.position, "y", -100, 100, 0.01).name("Y").listen().decimals(2);
    positionFolder.add(camera.position, "z", -100, 100, 0.01).name("Z").listen().decimals(2);

    const rotationFolder = gui.addFolder("Rotación");
    rotationFolder.add(camera.rotation, "x").name("X (rad)").listen().decimals(3).disable();
    rotationFolder.add(camera.rotation, "y").name("Y (rad)").listen().decimals(3).disable();
    rotationFolder.add(camera.rotation, "z").name("Z (rad)").listen().decimals(3).disable();
    rotationFolder.close();

    const targetFolder = gui.addFolder("Punto de mira");
    targetFolder.add(controls.target, "x", -100, 100, 0.01).name("X").listen().decimals(2);
    targetFolder.add(controls.target, "y", -100, 100, 0.01).name("Y").listen().decimals(2);
    targetFolder.add(controls.target, "z", -100, 100, 0.01).name("Z").listen().decimals(2);
    targetFolder.close();

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

    gui.onChange(() => controls.update());

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
        camera.position.copy(initialTarget).add(initialCameraOffset);
        if (camera instanceof PerspectiveCamera) {
          camera.fov = 42;
          camera.updateProjectionMatrix();
        } else if (camera instanceof OrthographicCamera) {
          camera.zoom = initialCameraZoom;
          camera.updateProjectionMatrix();
        }
        controls.target.copy(initialTarget);
        controls.update();
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
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl.domElement, guiContainerRef, initialTarget, onEffectsChange]);

  useFrame(() => controlsRef.current?.update());

  return null;
}

export function WeddingScene() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [effects, setEffects] = useState(initialEffectsSettings);
  const [cameraTarget, setCameraTarget] = useState<Vector3 | null>(null);
  const guiContainerRef = useRef<HTMLDivElement>(null);
  const handleLoaded = useCallback((houseCenter: Vector3) => {
    setCameraTarget((current) =>
      current && current.distanceToSquared(houseCenter) < 0.000001 ? current : houseCenter,
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
        camera={{ position: [6, 4.9, 6], zoom: initialCameraZoom, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        orthographic
        shadows
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
        <Person position={[0, 0, 0]} />
        <mesh position={[0, -1.46, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[5, 64]} />
          <shadowMaterial opacity={0.18} />
        </mesh>
        <EffectComposer multisampling={0}>
          {effects.pixelation && <Pixelation granularity={effects.pixelSize} />}
        </EffectComposer>
        {cameraTarget && (
          <CameraControls
            guiContainerRef={guiContainerRef}
            initialTarget={cameraTarget}
            onEffectsChange={handleEffectsChange}
          />
        )}
      </Canvas>
      <GuiContainer ref={guiContainerRef} />
      <InteractionHint aria-hidden="true">
        Rueda: avanzar · Izquierdo: girar · Derecho: desplazar
      </InteractionHint>
    </SceneSection>
  );
}

useLoader.preload(GLTFLoader, sceneUrl);
