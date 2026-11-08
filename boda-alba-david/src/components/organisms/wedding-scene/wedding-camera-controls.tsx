import { useFrame, useThree } from "@react-three/fiber";
import GUI from "lil-gui";
import { useEffect, useRef, type RefObject } from "react";
import {
  MathUtils,
  MOUSE,
  OrthographicCamera,
  PerspectiveCamera,
  Spherical,
  Vector2,
  Vector3,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { DEFAULT_SCENE_EFFECTS, type SceneEffectsSettings } from "../three-scene/scene-types";
import {
  WEDDING_CAMERA_POSITION,
  WEDDING_CAMERA_TARGET,
  WEDDING_CAMERA_ZOOM,
} from "./wedding-camera-settings";

const INITIAL_CAMERA_POSITION = new Vector3(...WEDDING_CAMERA_POSITION);
const INITIAL_CAMERA_TARGET = new Vector3(...WEDDING_CAMERA_TARGET);
const INITIAL_CAMERA_SPHERICAL = new Spherical().setFromVector3(
  INITIAL_CAMERA_POSITION.clone().sub(INITIAL_CAMERA_TARGET),
);
const MAX_HORIZONTAL_ROTATION = MathUtils.degToRad(2.5);
const MAX_VERTICAL_ROTATION = MathUtils.degToRad(1.5);
const POINTER_SMOOTHING = 5;

type WeddingCameraControlsProps = {
  guiContainerRef: RefObject<HTMLDivElement | null>;
  onEffectsChange: (changes: Partial<SceneEffectsSettings>) => void;
};

function configureOrbitControls(controls: OrbitControls): void {
  controls.enabled = false;
  controls.enableDamping = false;
  controls.enableRotate = false;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.screenSpacePanning = false;
  controls.panSpeed = 1.5;
  controls.zoomToCursor = false;
  controls.zoomSpeed = 1.1;
  controls.minDistance = 0.2;
  controls.maxDistance = 100;
  controls.minZoom = 50;
  controls.maxZoom = 1000;
  controls.minPolarAngle = Math.PI * 0.02;
  controls.maxPolarAngle = Math.PI * 0.98;
  controls.mouseButtons.LEFT = MOUSE.ROTATE;
  controls.mouseButtons.MIDDLE = MOUSE.DOLLY;
  controls.mouseButtons.RIGHT = null;
  controls.object.position.copy(INITIAL_CAMERA_POSITION);
  controls.target.copy(INITIAL_CAMERA_TARGET);
  controls.update();
}

function addEffectsControls(
  gui: GUI,
  onEffectsChange: WeddingCameraControlsProps["onEffectsChange"],
): void {
  const folder = gui.addFolder("Tratamiento visual");
  const values = {
    anguloAristas: DEFAULT_SCENE_EFFECTS.lineThresholdAngle,
    anguloSuavizado: MathUtils.radToDeg(DEFAULT_SCENE_EFFECTS.lineAngle),
    lineart: DEFAULT_SCENE_EFFECTS.lineArt,
    colorLinea: DEFAULT_SCENE_EFFECTS.lineColor,
    intensidadLinea: DEFAULT_SCENE_EFFECTS.lineStrength,
    opacidadLinea: DEFAULT_SCENE_EFFECTS.lineOpacity,
    ordenRender: DEFAULT_SCENE_EFFECTS.lineRenderOrder,
    pixelado: DEFAULT_SCENE_EFFECTS.pixelation,
    polygonOffset: DEFAULT_SCENE_EFFECTS.linePolygonOffset,
    polygonOffsetFactor: DEFAULT_SCENE_EFFECTS.linePolygonOffsetFactor,
    screenSpace: DEFAULT_SCENE_EFFECTS.lineScreenspace,
    tamañoPixel: DEFAULT_SCENE_EFFECTS.pixelSize,
    toneMapped: DEFAULT_SCENE_EFFECTS.lineToneMapped,
    transparencia: DEFAULT_SCENE_EFFECTS.lineTransparent,
  };

  const lineArtFolder = folder.addFolder("Lineart");
  lineArtFolder.add(values, "lineart").name("Activar")
    .onChange((value: boolean) => onEffectsChange({ lineArt: value }));
  lineArtFolder.addColor(values, "colorLinea").name("Color")
    .onChange((value: number) => onEffectsChange({ lineColor: value }));
  lineArtFolder.add(values, "intensidadLinea", 0.5, 40, 0.5).name("Grosor")
    .onChange((value: number) => onEffectsChange({ lineStrength: value }));
  lineArtFolder.add(values, "opacidadLinea", 0, 1, 0.01).name("Opacidad")
    .onChange((value: number) => onEffectsChange({ lineOpacity: value }));
  lineArtFolder.add(values, "transparencia").name("Transparencia")
    .onChange((value: boolean) => onEffectsChange({ lineTransparent: value }));
  lineArtFolder.add(values, "screenSpace").name("Screen space")
    .onChange((value: boolean) => onEffectsChange({ lineScreenspace: value }));
  lineArtFolder.add(values, "anguloSuavizado", 0, 180, 1).name("Ángulo suavizado")
    .onChange((value: number) => onEffectsChange({ lineAngle: MathUtils.degToRad(value) }));
  lineArtFolder.add(values, "anguloAristas", 0, 180, 1).name("Ángulo aristas")
    .onChange((value: number) => onEffectsChange({ lineThresholdAngle: value }));
  lineArtFolder.add(values, "toneMapped").name("Tone mapping")
    .onChange((value: boolean) => onEffectsChange({ lineToneMapped: value }));
  lineArtFolder.add(values, "polygonOffset").name("Polygon offset")
    .onChange((value: boolean) => onEffectsChange({ linePolygonOffset: value }));
  lineArtFolder.add(values, "polygonOffsetFactor", -10, 10, 0.1).name("Factor offset")
    .onChange((value: number) => onEffectsChange({ linePolygonOffsetFactor: value }));
  lineArtFolder.add(values, "ordenRender", -20, 20, 1).name("Orden render")
    .onChange((value: number) => onEffectsChange({ lineRenderOrder: value }));

  const pixelationFolder = folder.addFolder("Pixelado");
  pixelationFolder.add(values, "pixelado").name("Activar")
    .onChange((value: boolean) => onEffectsChange({ pixelation: value }));
  pixelationFolder.add(values, "tamañoPixel", 0, 64, 2).name("Granularidad")
    .onChange((value: number) => onEffectsChange({ pixelSize: value }));
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
): void {
  camera.position.copy(INITIAL_CAMERA_POSITION);
  if (camera instanceof PerspectiveCamera) camera.fov = 42;
  if (camera instanceof OrthographicCamera) camera.zoom = WEDDING_CAMERA_ZOOM;
  camera.updateProjectionMatrix();
  controls.target.copy(INITIAL_CAMERA_TARGET);
  controls.update();
}

function createCameraGui(
  container: HTMLDivElement | null,
  camera: OrthographicCamera | PerspectiveCamera,
  controls: OrbitControls,
  onEffectsChange: WeddingCameraControlsProps["onEffectsChange"],
): GUI {
  const gui = new GUI({ container: container ?? undefined, title: "Escena 3D", width: 320 });
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
    restablecer: () => resetCamera(camera, controls),
  };
  gui.add(actions, "copiarPosicion").name("Copiar posición");
  gui.add(actions, "restablecer").name("Restablecer cámara");
  return gui;
}

export function WeddingCameraControls({
  guiContainerRef,
  onEffectsChange,
}: WeddingCameraControlsProps) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControls>(null);
  const pointerTargetRef = useRef(new Vector2());
  const pointerPositionRef = useRef(new Vector2());
  const cameraSphericalRef = useRef(new Spherical());
  const cameraOffsetRef = useRef(new Vector3());

  useEffect(() => {
    if (!(camera instanceof OrthographicCamera || camera instanceof PerspectiveCamera)) return;

    const controls = new OrbitControls(camera, gl.domElement);
    // OrbitControls fuerza `touch-action: none`; restauramos el desplazamiento vertical de la página.
    if (controls.domElement) controls.domElement.style.touchAction = "pan-y";
    configureOrbitControls(controls);
    controlsRef.current = controls;
    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;

      const bounds = gl.domElement.getBoundingClientRect();
      pointerTargetRef.current.set(
        MathUtils.clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1),
        MathUtils.clamp(((event.clientY - bounds.top) / bounds.height) * 2 - 1, -1, 1),
      );
    };
    const resetPointer = () => pointerTargetRef.current.set(0, 0);
    const preventContextMenu = (event: MouseEvent) => event.preventDefault();
    gl.domElement.addEventListener("pointermove", handlePointerMove);
    gl.domElement.addEventListener("pointerleave", resetPointer);
    gl.domElement.addEventListener("contextmenu", preventContextMenu);
    const gui = import.meta.env.DEV
      ? createCameraGui(
        guiContainerRef.current,
        camera,
        controls,
        onEffectsChange,
      )
      : null;
    return () => {
      gl.domElement.removeEventListener("pointermove", handlePointerMove);
      gl.domElement.removeEventListener("pointerleave", resetPointer);
      gl.domElement.removeEventListener("contextmenu", preventContextMenu);
      gui?.destroy();
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl.domElement, guiContainerRef, onEffectsChange]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    const smoothing = 1 - Math.exp(-POINTER_SMOOTHING * delta);
    const pointer = pointerPositionRef.current.lerp(pointerTargetRef.current, smoothing);
    const spherical = cameraSphericalRef.current.copy(INITIAL_CAMERA_SPHERICAL);
    spherical.theta -= pointer.x * MAX_HORIZONTAL_ROTATION;
    spherical.phi += pointer.y * MAX_VERTICAL_ROTATION;

    controls.object.position
      .copy(cameraOffsetRef.current.setFromSpherical(spherical))
      .add(INITIAL_CAMERA_TARGET);
    controls.update();
  });
  return null;
}
