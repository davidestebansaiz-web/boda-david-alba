import { useFrame, useThree } from "@react-three/fiber";
import GUI from "lil-gui";
import { useEffect, useRef } from "react";
import { OrthographicCamera, PerspectiveCamera, Vector3 } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const INITIAL_CAMERA_POSITION = new Vector3(0, 0, 5.97);
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
      if (camera instanceof PerspectiveCamera) camera.fov = 42;
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
    camera.position.copy(INITIAL_CAMERA_POSITION);
    controlsRef.current = controls;
    //const gui = createCameraGui(camera);
    const preventContextMenu = (event: MouseEvent) => event.preventDefault();
    gl.domElement.addEventListener("contextmenu", preventContextMenu);

    return () => {
      gl.domElement.removeEventListener("contextmenu", preventContextMenu);
      //gui.destroy();
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
