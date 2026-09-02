import { useCallback, useRef, useState } from "react";
import { Vector3 } from "three";

import { DEFAULT_SCENE_EFFECTS, type SceneEffectsSettings } from "./scene-types";

const SAME_POINT_TOLERANCE = 0.000001;

export function useSceneState() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [effects, setEffects] = useState(DEFAULT_SCENE_EFFECTS);
  const [cameraTarget, setCameraTarget] = useState<Vector3 | null>(null);
  const guiContainerRef = useRef<HTMLDivElement>(null);

  const handleModelLoaded = useCallback((target: Vector3) => {
    setCameraTarget((currentTarget) =>
      currentTarget && currentTarget.distanceToSquared(target) < SAME_POINT_TOLERANCE
        ? currentTarget
        : target,
    );
    setIsLoaded(true);
  }, []);

  const updateEffects = useCallback((changes: Partial<SceneEffectsSettings>) => {
    setEffects((currentEffects) => ({ ...currentEffects, ...changes }));
  }, []);

  return {
    cameraTarget,
    effects,
    guiContainerRef,
    isLoaded,
    handleModelLoaded,
    updateEffects,
  };
}
