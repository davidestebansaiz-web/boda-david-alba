import { Outlines } from "@react-three/drei";
import { createPortal, useFrame, useLoader } from "@react-three/fiber";
import { Fragment, useEffect, useMemo, useRef } from "react";
import { Mesh, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import characterUrl from "../../../assets/models/personaje.glb?url";
import character2Url from "../../../assets/models/personaje2.glb?url";
import { addLineArt, normalizeModel } from "../three-scene/model-utils";
import type { LineArtSettings } from "../three-scene/scene-types";
import type { CharacterFacing } from ".";

const MODEL_Y_POSITION = -1.45;
const HEAD_CAMERA_TARGET_RATIO = 0.48;
const CHARACTER_MODEL_URLS = {
  personaje: characterUrl,
  personaje2: character2Url,
} as const;
const SPEAKING_SHAPE_KEY = "habla";
const WINKING_SHAPE_KEY = "guino";
const MORPH_MIN = 0.2;
const MORPH_MAX = 0.9;
const WINK_MIN = 0.2;
const FACING_ROTATION: Record<CharacterFacing, number> = {
  left: -0.45,
  right: 0.45,
};

type SpeechState = {
  isSpeaking: boolean;
  phaseDuration: number;
  phaseStartedAt: number;
  syllableDuration: number;
  maxValue: number;
};

type MorphInfluence = {
  index: number;
  values: number[];
};

type WinkState = {
  blinkDuration: number;
  blinkStartedAt: number | null;
  maxValue: number;
  nextBlinkAt: number;
};

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function normalizeShapeKeyName(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function createSpeechState(isSpeaking: boolean, phaseStartedAt: number): SpeechState {
  return {
    isSpeaking,
    phaseStartedAt,
    // Las pausas son más largas que las frases para que no parezca un metrónomo.
    phaseDuration: isSpeaking ? randomBetween(0.6, 1.8) : randomBetween(1.2, 3.4),
    syllableDuration: randomBetween(0.16, 0.3),
    maxValue: randomBetween(0.65, MORPH_MAX),
  };
}

function createWinkState(nextBlinkAt: number): WinkState {
  return {
    blinkDuration: 0,
    blinkStartedAt: null,
    maxValue: 0,
    nextBlinkAt,
  };
}

export type CharacterModelVariant = keyof typeof CHARACTER_MODEL_URLS;

type CharacterModelProps = LineArtSettings & {
  facing: CharacterFacing;
  model: CharacterModelVariant;
  onLoaded: (headCenter: Vector3) => void;
};

export function CharacterModel({
  lineArt,
  lineAngle,
  lineColor,
  lineOpacity,
  linePolygonOffset,
  linePolygonOffsetFactor,
  lineRenderOrder,
  lineScreenspace,
  lineStrength,
  lineToneMapped,
  lineTransparent,
  lineThresholdAngle,
  facing,
  model,
  onLoaded,
}: CharacterModelProps) {
  const gltf = useLoader(GLTFLoader, CHARACTER_MODEL_URLS[model]);
  const speechStateRef = useRef<SpeechState | null>(null);
  const winkStateRef = useRef<WinkState | null>(null);
  const preparedModel = useMemo(() => {
    const normalizedModel = normalizeModel(gltf.scene);
    const headCenter = new Vector3(
      0,
      MODEL_Y_POSITION + normalizedModel.size.y * normalizedModel.scale * HEAD_CAMERA_TARGET_RATIO,
      0,
    );

    return { ...normalizedModel, headCenter, lineArtMeshes: normalizedModel.meshes };
  }, [gltf.scene]);
  const morphInfluences = useMemo(() => {
    const speaking: MorphInfluence[] = [];
    const winking: MorphInfluence[] = [];

    preparedModel.model.traverse((child) => {
      if (
        child instanceof Mesh
        && child.morphTargetInfluences
        && child.morphTargetDictionary
      ) {
        Object.entries(child.morphTargetDictionary).forEach(([name, index]) => {
          const influence = { index, values: child.morphTargetInfluences! };
          const normalizedName = normalizeShapeKeyName(name);

          if (normalizedName === SPEAKING_SHAPE_KEY) speaking.push(influence);
          if (normalizedName === WINKING_SHAPE_KEY) winking.push(influence);
        });
      }
    });

    return { speaking, winking };
  }, [preparedModel.model]);

  useEffect(() => onLoaded(preparedModel.headCenter), [onLoaded, preparedModel.headCenter]);
  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    let speechState = speechStateRef.current
      ?? createSpeechState(Math.random() > 0.35, elapsedTime);

    while (elapsedTime - speechState.phaseStartedAt >= speechState.phaseDuration) {
      speechState = createSpeechState(
        !speechState.isSpeaking,
        speechState.phaseStartedAt + speechState.phaseDuration,
      );
    }
    speechStateRef.current = speechState;

    const value = speechState.isSpeaking
      ? MORPH_MIN + (speechState.maxValue - MORPH_MIN)
        * ((Math.sin(((elapsedTime - speechState.phaseStartedAt) / speechState.syllableDuration) * Math.PI * 2 - Math.PI / 2) + 1) / 2)
      : 0;

    morphInfluences.speaking.forEach(({ index, values }) => {
      values[index] = value;
    });

    let winkState = winkStateRef.current
      ?? createWinkState(elapsedTime + randomBetween(0.8, 2.2));

    if (
      winkState.blinkStartedAt !== null
      && elapsedTime - winkState.blinkStartedAt >= winkState.blinkDuration
    ) {
      winkState = createWinkState(elapsedTime + randomBetween(1.1, 2.8));
    }
    if (winkState.blinkStartedAt === null && elapsedTime >= winkState.nextBlinkAt) {
      winkState = {
        blinkDuration: randomBetween(0.1, 0.18),
        blinkStartedAt: elapsedTime,
        maxValue: randomBetween(0.7, 1),
        nextBlinkAt: Number.POSITIVE_INFINITY,
      };
    }
    winkStateRef.current = winkState;

    const blinkProgress = winkState.blinkStartedAt === null
      ? 0
      : (elapsedTime - winkState.blinkStartedAt) / winkState.blinkDuration;
    const winkValue = WINK_MIN
      + Math.sin(Math.PI * blinkProgress) * (winkState.maxValue - WINK_MIN);

    morphInfluences.winking.forEach(({ index, values }) => {
      values[index] = winkValue;
    });
  });
  useEffect(
    () => addLineArt({
      color: lineColor,
      lineStrength,
      meshes: preparedModel.lineArtMeshes,
      opacity: lineOpacity,
      polygonOffset: linePolygonOffset,
      polygonOffsetFactor: linePolygonOffsetFactor,
      renderOrder: lineRenderOrder,
      thresholdAngle: () => lineThresholdAngle,
      toneMapped: lineToneMapped,
      transparent: lineTransparent,
      visible: lineArt,
    }),
    [
      lineArt,
      lineColor,
      lineOpacity,
      linePolygonOffset,
      linePolygonOffsetFactor,
      lineRenderOrder,
      lineStrength,
      lineThresholdAngle,
      lineToneMapped,
      lineTransparent,
      preparedModel.lineArtMeshes,
    ],
  );

  return (
    <group
      position={[0, MODEL_Y_POSITION, 0]}
      rotation={[0, FACING_ROTATION[facing], 0]}
      scale={preparedModel.scale}
    >
      <primitive object={preparedModel.model} />
      {lineArt && preparedModel.meshes.map((mesh) => (
        <Fragment key={mesh.uuid}>
          {createPortal(
            <Outlines
              angle={lineAngle}
              color={lineColor}
              opacity={lineOpacity}
              polygonOffset={linePolygonOffset}
              polygonOffsetFactor={linePolygonOffsetFactor}
              renderOrder={lineRenderOrder}
              screenspace={lineScreenspace}
              thickness={lineStrength}
              toneMapped={lineToneMapped}
              transparent={lineTransparent}
            />,
            mesh,
          )}
        </Fragment>
      ))}
    </group>
  );
}

Object.values(CHARACTER_MODEL_URLS).forEach((url) => useLoader.preload(GLTFLoader, url));
