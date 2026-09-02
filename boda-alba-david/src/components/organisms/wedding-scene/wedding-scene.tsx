import { Canvas } from "@react-three/fiber";
import { EffectComposer, Pixelation } from "@react-three/postprocessing";
import { Suspense } from "react";

import Person from "../person";
import { useSceneState } from "../three-scene/use-scene-state";
import { WeddingCameraControls, WEDDING_CAMERA_ZOOM } from "./wedding-camera-controls";
import { WeddingModel } from "./wedding-model";
import {
  GuiContainer,
  InteractionHint,
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

export function WeddingScene() {
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
        camera={{ position: [6, 4.9, 6], zoom: WEDDING_CAMERA_ZOOM, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        orthographic
        shadows
      >
        <SceneLighting />
        <Suspense fallback={null}>
          <WeddingModel {...effects} onLoaded={handleModelLoaded} />
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
          <WeddingCameraControls
            guiContainerRef={guiContainerRef}
            initialTarget={cameraTarget}
            onEffectsChange={updateEffects}
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
