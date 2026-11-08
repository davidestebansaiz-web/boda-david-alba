import { Outlines } from "@react-three/drei";
import { createPortal, useLoader } from "@react-three/fiber";
import { Fragment, useEffect, useMemo } from "react";
import { Box3, DoubleSide, Mesh, Object3D, Texture, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import sceneUrl from "../../../assets/models/escena.glb?url";
import { addLineArt, normalizeModel } from "../three-scene/model-utils";
import type { LineArtSettings } from "../three-scene/scene-types";
import { CharacterManager, type CharacterPart } from "./crowd/character-manager";

const MODEL_Y_POSITION = -1.45;
// GLTFLoader removes dots from node names to keep them compatible with animation paths.
const TREE_MESH_NAMES = new Set([
  "Cube012",
  "Cube013",
  "Cube014",
  "Cube015",
  "Cube016",
  "Cube017",
  "Cube018",
  "Cube019",
  "Cube020",
  "Cube021",
  "Cube022",
  "Cube023",
  "Cube024",
  "Cube025",
  "tronco",
  "tronco001",
  "tronco002",
]);
const GROUND_MESH_NAMES = new Set([
  "suelo",
  "sueloasfalto",
]);

type WeddingModelProps = LineArtSettings & {
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

function isHousePlantMesh(mesh: Mesh): boolean {
  return mesh.name.startsWith("hierbaBase");
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
  numberOfGuests,
  onLoaded,
}: WeddingModelProps) {
  const gltf = useLoader(GLTFLoader, sceneUrl);
  const preparedModel = useMemo(() => {
    const normalizedModel = normalizeModel(gltf.scene);
    const navigationMesh = getRequiredMesh(normalizedModel.model, "area");
    const characterParts: CharacterPart[] = [
      { mesh: getRequiredMesh(normalizedModel.model, "persona") },
      { mesh: getRequiredMesh(normalizedModel.model, "pelo") },
      { hoverOnly: true, mesh: getRequiredMesh(normalizedModel.model, "bocadillo") },
    ];
    const characterPartMeshes = new Set(characterParts.map(({ mesh }) => mesh));
    const visibleSceneMeshes = normalizedModel.meshes.filter(
      (mesh) => mesh !== navigationMesh && !characterPartMeshes.has(mesh),
    );
    const lineArtMeshes = visibleSceneMeshes.filter(
      (mesh) => !GROUND_MESH_NAMES.has(mesh.name)
        && !TREE_MESH_NAMES.has(mesh.name)
        && !isHousePlantMesh(mesh),
    );
    const exteriorMeshes = visibleSceneMeshes.filter(isHouseExterior);

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
      opacity: lineOpacity,
      polygonOffset: linePolygonOffset,
      polygonOffsetFactor: linePolygonOffsetFactor,
      renderOrder: lineRenderOrder,
      thresholdAngle: (mesh) => (mesh.name === "ventana" ? 20 : lineThresholdAngle),
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
      {createPortal(
        <CharacterManager
          area={preparedModel.navigationMesh}
          characterParts={preparedModel.characterParts}
          lineArt={lineArt}
          lineAngle={lineAngle}
          lineColor={lineColor}
          lineOpacity={lineOpacity}
          linePolygonOffset={linePolygonOffset}
          linePolygonOffsetFactor={linePolygonOffsetFactor}
          lineRenderOrder={lineRenderOrder}
          lineScreenspace={lineScreenspace}
          lineStrength={lineStrength}
          lineToneMapped={lineToneMapped}
          lineTransparent={lineTransparent}
          lineThresholdAngle={lineThresholdAngle}
          numberOfGuests={numberOfGuests}
        />,
        preparedModel.model,
      )}
      {lineArt && preparedModel.lineArtMeshes.map((mesh) => (
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

useLoader.preload(GLTFLoader, sceneUrl);
