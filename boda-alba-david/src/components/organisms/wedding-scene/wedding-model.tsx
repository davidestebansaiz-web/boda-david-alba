import { Outlines } from "@react-three/drei";
import { createPortal, useLoader } from "@react-three/fiber";
import { Fragment, useEffect, useMemo } from "react";
import { Box3, DoubleSide, Mesh, Object3D, Texture, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import sceneUrl from "../../../assets/models/escena.glb?url";
import { addLineArt, getMeshesByName, normalizeModel } from "../three-scene/model-utils";
import { CharacterManager, type CharacterPart } from "./crowd/character-manager";

const MODEL_Y_POSITION = -1.45;
const LINE_ART_MESH_NAMES = new Set(["Cube", "Cube.001", "Cube.004", "ventana"]);

type WeddingModelProps = {
  lineArt: boolean;
  lineColor: number;
  lineStrength: number;
  numberOfGuests: number;
  onLoaded: (houseCenter: Vector3) => void;
};

function getRequiredMesh(model: Object3D, name: string): Mesh {
  const object = model.getObjectByName(name);
  if (!(object instanceof Mesh)) {
    throw new Error(`No se encontró el mesh requerido "${name}" en escena.glb.`);
  }
  return object;
}

function configureTransparentTextures(meshes: Mesh[]): void {
  meshes.forEach((mesh) => {
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      if (!("map" in material) || !(material.map instanceof Texture)) return;
      material.alphaTest = 0.5;
      material.transparent = false;
      material.depthWrite = true;
      material.depthTest = true;
      material.needsUpdate = true;
    });
  });
}

function isHouseExterior(mesh: Mesh): boolean {
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  const belongsToHouse = materials.some(
    (material) => material.name === "casa" || material.name === "techo",
  );
  return mesh.name !== "ventana" && belongsToHouse;
}

export function WeddingModel({
  lineArt,
  lineColor,
  lineStrength,
  numberOfGuests,
  onLoaded,
}: WeddingModelProps) {
  const gltf = useLoader(GLTFLoader, sceneUrl);
  const preparedModel = useMemo(() => {
    const normalizedModel = normalizeModel(gltf.scene);
    const lineArtMeshes = getMeshesByName(normalizedModel.meshes, LINE_ART_MESH_NAMES);
    const exteriorMeshes = normalizedModel.meshes.filter(isHouseExterior);
    const navigationMesh = getRequiredMesh(normalizedModel.model, "area");
    const characterParts: CharacterPart[] = [
      { mesh: getRequiredMesh(normalizedModel.model, "persona") },
      { mesh: getRequiredMesh(normalizedModel.model, "pelo") },
    ];

    navigationMesh.material = Array.isArray(navigationMesh.material)
      ? navigationMesh.material.map((material) => material.clone())
      : navigationMesh.material.clone();
    const navigationMaterials = Array.isArray(navigationMesh.material)
      ? navigationMesh.material
      : [navigationMesh.material];
    navigationMaterials.forEach((material) => {
      material.side = DoubleSide;
    });
    // Direct raycasting still works while the navigation-only mesh is invisible.
    navigationMesh.visible = false;
    characterParts.forEach(({ mesh }) => {
      mesh.visible = false;
    });

    configureTransparentTextures(normalizedModel.meshes);
    normalizedModel.model.updateMatrixWorld(true);
    const houseBounds = new Box3();
    exteriorMeshes.forEach((mesh) => houseBounds.expandByObject(mesh));
    const houseCenter = houseBounds
      .getCenter(new Vector3())
      .multiplyScalar(normalizedModel.scale)
      .add(new Vector3(0, MODEL_Y_POSITION, 0));

    return {
      ...normalizedModel,
      characterParts,
      exteriorMeshes,
      houseCenter,
      lineArtMeshes,
      navigationMesh,
    };
  }, [gltf.scene]);

  useEffect(() => onLoaded(preparedModel.houseCenter), [onLoaded, preparedModel.houseCenter]);
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
      {createPortal(
        <CharacterManager
          area={preparedModel.navigationMesh}
          characterParts={preparedModel.characterParts}
          numberOfGuests={numberOfGuests}
        />,
        preparedModel.model,
      )}
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

useLoader.preload(GLTFLoader, sceneUrl);
