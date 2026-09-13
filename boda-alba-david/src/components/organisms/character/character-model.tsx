import { Outlines } from "@react-three/drei";
import { createPortal, useLoader } from "@react-three/fiber";
import { Fragment, useEffect, useMemo } from "react";
import { Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import characterUrl from "../../../assets/models/personaje.glb?url";
import { addLineArt, normalizeModel } from "../three-scene/model-utils";
import type { LineArtSettings } from "../three-scene/scene-types";

const MODEL_Y_POSITION = -1.45;

type CharacterModelProps = LineArtSettings & {
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
  onLoaded,
}: CharacterModelProps) {
  const gltf = useLoader(GLTFLoader, characterUrl);
  const preparedModel = useMemo(() => {
    const normalizedModel = normalizeModel(gltf.scene);
    const headCenter = new Vector3(
      0,
      MODEL_Y_POSITION + normalizedModel.size.y * normalizedModel.scale * 0.4,
      0,
    );

    return { ...normalizedModel, headCenter, lineArtMeshes: normalizedModel.meshes };
  }, [gltf.scene]);

  useEffect(() => onLoaded(preparedModel.headCenter), [onLoaded, preparedModel.headCenter]);
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
    <group position={[0, MODEL_Y_POSITION, 0]} scale={preparedModel.scale}>
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

useLoader.preload(GLTFLoader, characterUrl);
