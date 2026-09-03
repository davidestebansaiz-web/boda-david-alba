import { Canvas } from "@react-three/fiber";
import { EffectComposer, Pixelation } from "@react-three/postprocessing";
import { Suspense } from "react";

import { useSceneState } from "../three-scene/use-scene-state";
import { WeddingCameraControls } from "./wedding-camera-controls";
import { WEDDING_CAMERA_POSITION, WEDDING_CAMERA_ZOOM } from "./wedding-camera-settings";
import { WeddingModel } from "./wedding-model";
import {
  LoadingMessage,
  SceneSection,
} from "./wedding-scene.styles";

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={1.2} />
      <hemisphereLight args={["#fff7ee", "#8c6954", 1.6]} />
      <directionalLight
        castShadow
        intensity={2.8}
        position={[4, 7, 5]}
        shadow-normalBias={0.04}
        shadow-mapSize={[1024, 1024]}
      />
    </>
  );
}

type WeddingSceneProps = {
  numberOfGuests: number;
};

export function WeddingScene({ numberOfGuests }: WeddingSceneProps) {
  const {
    cameraTarget,
    effects,
    guiContainerRef,
    isLoaded,
    handleModelLoaded,
    updateEffects,
  } = useSceneState();

  return (
    <SceneSection aria-label="Escena 3D de la boda">
      <LoadingMessage $isLoaded={isLoaded} role="status">Cargando escena</LoadingMessage>
      <Canvas
        camera={{
          position: WEDDING_CAMERA_POSITION,
          zoom: WEDDING_CAMERA_ZOOM,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 2]}
        orthographic
        shadows
      >
        <SceneLighting />
        <Suspense fallback={null}>
          <WeddingModel
            {...effects}
            numberOfGuests={numberOfGuests}
            onLoaded={handleModelLoaded}
          />
        </Suspense>
        <mesh position={[0, -1.46, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[5, 64]} />
          <shadowMaterial opacity={0.18} />
        </mesh>
        <EffectComposer multisampling={0}>
          {effects.pixelation && <Pixelation granularity={effects.pixelSize} />}
        </EffectComposer>
        {cameraTarget && (
          <WeddingCameraControls
            guiContainerRef={guiContainerRef}
            onEffectsChange={updateEffects}
          />
        )}
      </Canvas>
    </SceneSection>
  );
}
