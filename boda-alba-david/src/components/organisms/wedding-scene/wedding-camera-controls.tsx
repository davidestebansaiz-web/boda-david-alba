import { useFrame, useThree } from "@react-three/fiber";
import GUI from "lil-gui";
import { useEffect, useRef, type RefObject } from "react";
import { MOUSE, OrthographicCamera, PerspectiveCamera, Vector3 } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { enableRightButtonPan } from "../three-scene/pointer-controls";
import { DEFAULT_SCENE_EFFECTS, type SceneEffectsSettings } from "../three-scene/scene-types";

export const WEDDING_CAMERA_ZOOM = 450;
const INITIAL_CAMERA_OFFSET = new Vector3(6, 4.9, 6);

type WeddingCameraControlsProps = {
  guiContainerRef: RefObject<HTMLDivElement | null>;
  initialTarget: Vector3;
  onEffectsChange: (changes: Partial<SceneEffectsSettings>) => void;
};

function configureOrbitControls(controls: OrbitControls, initialTarget: Vector3): void {
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
  controls.object.position.copy(initialTarget).add(INITIAL_CAMERA_OFFSET);
  controls.target.copy(initialTarget);
  controls.update();
}

function addEffectsControls(
  gui: GUI,
  onEffectsChange: WeddingCameraControlsProps["onEffectsChange"],
): void {
  const folder = gui.addFolder("Tratamiento visual");
  const values = {
    lineart: DEFAULT_SCENE_EFFECTS.lineArt,
    colorLinea: DEFAULT_SCENE_EFFECTS.lineColor,
    intensidadLinea: DEFAULT_SCENE_EFFECTS.lineStrength,
    pixelado: DEFAULT_SCENE_EFFECTS.pixelation,
    tamañoPixel: DEFAULT_SCENE_EFFECTS.pixelSize,
  };

  folder.add(values, "pixelado").name("Pixelado")
    .onChange((value: boolean) => onEffectsChange({ pixelation: value }));
  folder.add(values, "tamañoPixel", 1, 24, 1).name("Tamaño píxel")
    .onChange((value: number) => onEffectsChange({ pixelSize: value }));
  folder.add(values, "lineart").name("Lineart")
    .onChange((value: boolean) => onEffectsChange({ lineArt: value }));
  folder.add(values, "intensidadLinea", 0.5, 40, 0.5).name("Grosor línea")
    .onChange((value: number) => onEffectsChange({ lineStrength: value }));
  folder.addColor(values, "colorLinea").name("Color línea")
    .onChange((value: number) => onEffectsChange({ lineColor: value }));
}

function addCameraReadouts(
  gui: GUI,
  camera: OrthographicCamera | PerspectiveCamera,
  controls: OrbitControls,
): void {
  const position = gui.addFolder("Posición");
  position.add(camera.position, "x", -100, 100, 0.01).name("X").listen().decimals(2);
  position.add(camera.position, "y", -100, 100, 0.01).name("Y").listen().decimals(2);
  position.add(camera.position, "z", -100, 100, 0.01).name("Z").listen().decimals(2);

  const rotation = gui.addFolder("Rotación");
  rotation.add(camera.rotation, "x").name("X (rad)").listen().decimals(3).disable();
  rotation.add(camera.rotation, "y").name("Y (rad)").listen().decimals(3).disable();
  rotation.add(camera.rotation, "z").name("Z (rad)").listen().decimals(3).disable();
  rotation.close();

  const target = gui.addFolder("Punto de mira");
  target.add(controls.target, "x", -100, 100, 0.01).name("X").listen().decimals(2);
  target.add(controls.target, "y", -100, 100, 0.01).name("Y").listen().decimals(2);
  target.add(controls.target, "z", -100, 100, 0.01).name("Z").listen().decimals(2);
  target.close();
}

function resetCamera(
  camera: OrthographicCamera | PerspectiveCamera,
  controls: OrbitControls,
  target: Vector3,
): void {
  camera.position.copy(target).add(INITIAL_CAMERA_OFFSET);
  if (camera instanceof PerspectiveCamera) camera.fov = 42;
  if (camera instanceof OrthographicCamera) camera.zoom = WEDDING_CAMERA_ZOOM;
  camera.updateProjectionMatrix();
  controls.target.copy(target);
  controls.update();
}

function createCameraGui(
  container: HTMLDivElement | null,
  camera: OrthographicCamera | PerspectiveCamera,
  controls: OrbitControls,
  initialTarget: Vector3,
  onEffectsChange: WeddingCameraControlsProps["onEffectsChange"],
): GUI {
  const gui = new GUI({ container: container ?? undefined, title: "Cámara", width: 300 });
  addEffectsControls(gui, onEffectsChange);
  addCameraReadouts(gui, camera, controls);

  if (camera instanceof PerspectiveCamera) {
    gui.add(camera, "fov", 20, 80, 1).name("Campo de visión")
      .onChange(() => camera.updateProjectionMatrix());
  } else {
    gui.add(camera, "zoom", 50, 1000, 1).name("Zoom ortográfico").listen()
      .onChange(() => camera.updateProjectionMatrix());
  }

  gui.onChange(() => controls.update());
  const actions = {
    copiarPosicion: () => {
      const projection = camera instanceof OrthographicCamera
        ? `zoom: ${camera.zoom.toFixed(0)}`
        : `fov: ${camera.fov.toFixed(0)}`;
      const { x, y, z } = camera.position;
      void navigator.clipboard?.writeText(
        `camera={{ position: [${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}], ${projection} }}`,
      );
    },
    restablecer: () => resetCamera(camera, controls, initialTarget),
  };
  gui.add(actions, "copiarPosicion").name("Copiar posición");
  gui.add(actions, "restablecer").name("Restablecer cámara");
  return gui;
}

export function WeddingCameraControls({
  guiContainerRef,
  initialTarget,
  onEffectsChange,
}: WeddingCameraControlsProps) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControls>(null);

  useEffect(() => {
    if (!(camera instanceof OrthographicCamera || camera instanceof PerspectiveCamera)) return;

    const controls = new OrbitControls(camera, gl.domElement);
    configureOrbitControls(controls, initialTarget);
    controlsRef.current = controls;
    const disableRightButtonPan = enableRightButtonPan(gl.domElement, controls);
    const gui = createCameraGui(
      guiContainerRef.current,
      camera,
      controls,
      initialTarget,
      onEffectsChange,
    );

    return () => {
      disableRightButtonPan();
      gui.destroy();
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl.domElement, guiContainerRef, initialTarget, onEffectsChange]);

  useFrame(() => controlsRef.current?.update());
  return null;
}
