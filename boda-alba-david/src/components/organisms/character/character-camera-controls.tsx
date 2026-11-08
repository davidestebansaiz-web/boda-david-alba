import { useFrame, useThree } from "@react-three/fiber";
import GUI from "lil-gui";
import { useEffect, useRef } from "react";
import { OrthographicCamera, PerspectiveCamera, Vector3 } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Un encuadre algo más abierto evita cortar pelo, orejas o barbilla en los avatares.
const INITIAL_CAMERA_POSITION = new Vector3(0, 0, 5);
const INITIAL_CAMERA_ZOOM = 50;

type CharacterCameraControlsProps = {
  initialTarget: Vector3;
};

function createCameraGui(camera: OrthographicCamera | PerspectiveCamera): GUI {
  const gui = new GUI({ title: "Cámara", width: 300 });

  if (camera instanceof PerspectiveCamera) {
    gui.add(camera, "fov", 20, 80, 1).name("Campo de visión")
      .onChange(() => camera.updateProjectionMatrix());
  } else {
    gui.add(camera, "zoom", 50, 1000, 1).name("Zoom ortográfico").listen()
      .onChange(() => camera.updateProjectionMatrix());
  }

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
    restablecer: () => {
      camera.position.copy(INITIAL_CAMERA_POSITION);
      if (camera instanceof PerspectiveCamera) camera.fov = 40;
      if (camera instanceof OrthographicCamera) camera.zoom = INITIAL_CAMERA_ZOOM;
      camera.updateProjectionMatrix();
    },
  };
  gui.add(actions, "copiarPosicion").name("Copiar posición");
  gui.add(actions, "restablecer").name("Restablecer cámara");
  return gui;
}

export function CharacterCameraControls({ initialTarget }: CharacterCameraControlsProps) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControls>(null);

  useEffect(() => {
    if (!(camera instanceof OrthographicCamera || camera instanceof PerspectiveCamera)) return;

    const controls = new OrbitControls(camera, gl.domElement);
    // OrbitControls fuerza `touch-action: none`; restauramos el desplazamiento vertical de la página.
    if (controls.domElement) controls.domElement.style.touchAction = "pan-y";
    controls.enableRotate = false;
    controls.enablePan = false;
    controls.enableZoom = false;
    camera.position.copy(INITIAL_CAMERA_POSITION);
    controlsRef.current = controls;
    const gui = createCameraGui(camera);
    gui.hide();
    const preventContextMenu = (event: MouseEvent) => event.preventDefault();
    gl.domElement.addEventListener("contextmenu", preventContextMenu);

    return () => {
      gl.domElement.removeEventListener("contextmenu", preventContextMenu);
      gui.destroy();
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl.domElement]);

  useFrame(() => {
    if (!controlsRef.current) return;
    controlsRef.current.target.copy(initialTarget);
    controlsRef.current.update();
  });

  return null;
}
