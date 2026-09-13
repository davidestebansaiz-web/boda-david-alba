import { Canvas } from "@react-three/fiber";
import { EffectComposer, Pixelation } from "@react-three/postprocessing";
import { Suspense } from "react";

import { useSceneState } from "../three-scene/use-scene-state";
import { WeddingCameraControls } from "./wedding-camera-controls";
import { WEDDING_CAMERA_POSITION, WEDDING_CAMERA_ZOOM } from "./wedding-camera-settings";
import { WeddingModel } from "./wedding-model";
import {
  GuiContainer,
  LoadingMessage,
  SceneSection,
} from "./styles";

function SceneLighting() {
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
      <GuiContainer ref={guiContainerRef} />
      <Canvas
        camera={{
          position: WEDDING_CAMERA_POSITION,
          zoom: WEDDING_CAMERA_ZOOM,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 2]}
        orthographic
        shadows="basic"
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
