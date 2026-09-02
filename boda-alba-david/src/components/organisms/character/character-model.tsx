import { Outlines } from "@react-three/drei";
import { createPortal, useLoader } from "@react-three/fiber";
import { Fragment, useEffect, useMemo } from "react";
import { Mesh, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import characterUrl from "../../../assets/models/personaje.glb?url";
import { addLineArt, getMeshesByName, normalizeModel } from "../three-scene/model-utils";

const MODEL_Y_POSITION = -1.45;
const LINE_ART_MESH_NAMES = new Set(["Cube", "Cube.001", "Cube.004", "ventana"]);

type CharacterModelProps = {
  lineArt: boolean;
  lineColor: number;
  lineStrength: number;
  onLoaded: (headCenter: Vector3) => void;
};

function hasExteriorMaterial(mesh: Mesh): boolean {
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  return mesh.name !== "ventana" && materials.some(
    (material) => material.name === "casa" || material.name === "techo",
  );
}

export function CharacterModel({
  lineArt,
  lineColor,
  lineStrength,
  onLoaded,
}: CharacterModelProps) {
  const gltf = useLoader(GLTFLoader, characterUrl);
  const preparedModel = useMemo(() => {
    const normalizedModel = normalizeModel(gltf.scene);
    const lineArtMeshes = getMeshesByName(normalizedModel.meshes, LINE_ART_MESH_NAMES);
    const exteriorMeshes = normalizedModel.meshes.filter(hasExteriorMaterial);
    const headCenter = new Vector3(
      0,
      MODEL_Y_POSITION + normalizedModel.size.y * normalizedModel.scale * 0.4,
      0,
    );

    return { ...normalizedModel, exteriorMeshes, headCenter, lineArtMeshes };
  }, [gltf.scene]);

  useEffect(() => onLoaded(preparedModel.headCenter), [onLoaded, preparedModel.headCenter]);
  useEffect(
    () => addLineArt({
      color: lineColor,
      lineStrength,
      meshes: preparedModel.lineArtMeshes,
      thresholdAngle: (mesh) => (mesh.name === "ventana" ? 20 : 55),
      visible: lineArt,
    }),
    [lineArt, lineColor, lineStrength, preparedModel.lineArtMeshes],
  );

  return (
    <group position={[0, MODEL_Y_POSITION, 0]} scale={preparedModel.scale}>
      <primitive object={preparedModel.model} />
      {lineArt && preparedModel.exteriorMeshes.map((mesh) => (
        <Fragment key={mesh.uuid}>
          {createPortal(
            <Outlines
              color={lineColor}
              opacity={1}
              screenspace={false}
              thickness={lineStrength}
              toneMapped={false}
            />,
            mesh,
          )}
        </Fragment>
      ))}
    </group>
  );
}

useLoader.preload(GLTFLoader, characterUrl);
