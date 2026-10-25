import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

import { useSceneState } from "../three-scene/use-scene-state";
import { CharacterCameraControls } from "./character-camera-controls";
import { CharacterModel, type CharacterModelVariant } from "./character-model";
import { CharacterSceneSection, LoadingMessage } from "./styles";

export type CharacterFacing = "left" | "right";

function CharacterLighting() {
  return (
    <>
      <ambientLight intensity={1.2} />
      <hemisphereLight args={["#fff7ee", "#8c6954", 1.6]} />
      <directionalLight
        castShadow
        intensity={2.8}
        position={[4, 7, 5]}
        shadow-bias={-0.0002}
        shadow-camera-bottom={-4}
        shadow-camera-far={20}
        shadow-camera-left={-4}
        shadow-camera-near={0.1}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-mapSize={[2048, 2048]}
        shadow-normalBias={0.02}
      />
    </>
  );
}

type CharacterProps = {
  facing?: CharacterFacing;
  model?: CharacterModelVariant;
};

export function Character({ facing = "right", model = "personaje" }: CharacterProps) {
  const { cameraTarget, effects, isLoaded, handleModelLoaded } = useSceneState();

  return (
    <CharacterSceneSection aria-label="Personaje 3D">
      <LoadingMessage $isLoaded={isLoaded} role="status">Cargando personaje</LoadingMessage>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 40, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        shadows="basic"
      >
        <CharacterLighting />
        <Suspense fallback={null}>
          <CharacterModel {...effects} facing={facing} model={model} onLoaded={handleModelLoaded} />
        </Suspense>
        {cameraTarget && <CharacterCameraControls initialTarget={cameraTarget} />}
      </Canvas>
    </CharacterSceneSection>
  );
}
