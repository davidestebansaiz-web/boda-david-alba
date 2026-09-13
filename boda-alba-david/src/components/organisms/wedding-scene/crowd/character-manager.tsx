import { Outlines } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import {
  Box3,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  Quaternion,
  Vector3,
} from "three";

import { CharacterAgent } from "./character-agent";
import { NavigationArea } from "./navigation-area";
import type { LineArtSettings } from "../../three-scene/scene-types";

const UP = new Vector3(0, 1, 0);
const NO_SCALE = new Vector3(1, 1, 1);
const MINIMUM_CHARACTER_HEIGHT = 0.1;

export type CharacterPart = {
  mesh: Mesh;
};

type CharacterManagerProps = LineArtSettings & {
  area: Mesh;
  characterParts: CharacterPart[];
  numberOfGuests: number;
};

function normalizeGuestCount(value: number): number {
  return Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
}

export function CharacterManager({
  area,
  characterParts,
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
  numberOfGuests,
}: CharacterManagerProps) {
  const guestCount = normalizeGuestCount(numberOfGuests);
  const managerRef = useRef<Group>(null);
  const instancesRef = useRef<Array<InstancedMesh | null>>([]);
  const agentsRef = useRef<CharacterAgent[]>([]);
  const partOffsetsRef = useRef<Matrix4[]>([]);
  const navigationArea = useMemo(() => new NavigationArea(area), [area]);

  const reusable = useMemo(() => ({
    agentMatrix: new Matrix4(),
    anchorMatrix: new Matrix4(),
    managerInverse: new Matrix4(),
    localMatrix: new Matrix4(),
    quaternion: new Quaternion(),
  }), []);

  useLayoutEffect(() => {
    const manager = managerRef.current;
    const baseCharacter = characterParts[0]?.mesh;
    if (!manager || !baseCharacter) return;

    manager.updateWorldMatrix(true, false);
    navigationArea.updateWorldData();
    characterParts.forEach(({ mesh }) => mesh.updateWorldMatrix(true, false));

    const templateOrigin = baseCharacter.getWorldPosition(new Vector3());
    const templateAnchor = navigationArea.getSurfacePoint(templateOrigin, new Vector3())
      ?? navigationArea.samplePosition(new Vector3());
    const inverseTemplateAnchor = new Matrix4().makeTranslation(
      -templateAnchor.x,
      -templateAnchor.y,
      -templateAnchor.z,
    );
    partOffsetsRef.current = characterParts.map(({ mesh }) =>
      new Matrix4().multiplyMatrices(inverseTemplateAnchor, mesh.matrixWorld),
    );

    const characterHeight = Math.max(
      new Box3().setFromObject(baseCharacter).getSize(new Vector3()).y,
      MINIMUM_CHARACTER_HEIGHT,
    );

    agentsRef.current = agentsRef.current.slice(0, guestCount);
    while (agentsRef.current.length < guestCount) {
      const position = navigationArea.samplePosition(new Vector3());
      agentsRef.current.push(new CharacterAgent(position, {
        minSpeed: characterHeight * 0.2,
        maxSpeed: characterHeight * 0.3,
        lookAheadDistance: characterHeight * 0.55,
      }));
    }

    updateInstanceMatrices(manager, instancesRef.current, agentsRef.current, partOffsetsRef.current, reusable);
  }, [characterParts, guestCount, navigationArea, reusable]);

  useFrame((_, delta) => {
    const manager = managerRef.current;
    if (!manager) return;

    agentsRef.current.forEach((agent) => agent.update(delta, navigationArea));
    updateInstanceMatrices(manager, instancesRef.current, agentsRef.current, partOffsetsRef.current, reusable);
  });

  return (
    <group ref={managerRef}>
      {characterParts.map(({ mesh }, partIndex) => (
        <instancedMesh
          key={`${mesh.uuid}-${guestCount}`}
          ref={(instance) => {
            instancesRef.current[partIndex] = instance;
          }}
          args={[mesh.geometry, mesh.material, guestCount]}
          castShadow
          dispose={null}
          frustumCulled={false}
          receiveShadow
        >
          {lineArt && (
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
            />
          )}
        </instancedMesh>
      ))}
    </group>
  );
}

type ReusableMatrices = {
  agentMatrix: Matrix4;
  anchorMatrix: Matrix4;
  managerInverse: Matrix4;
  localMatrix: Matrix4;
  quaternion: Quaternion;
};

function updateInstanceMatrices(
  manager: Group,
  instances: Array<InstancedMesh | null>,
  agents: CharacterAgent[],
  partOffsets: Matrix4[],
  reusable: ReusableMatrices,
): void {
  manager.updateWorldMatrix(true, false);
  reusable.managerInverse.copy(manager.matrixWorld).invert();

  agents.forEach((agent, agentIndex) => {
    reusable.quaternion.setFromAxisAngle(UP, agent.directionAngle);
    reusable.anchorMatrix.compose(agent.position, reusable.quaternion, NO_SCALE);

    instances.forEach((instance, partIndex) => {
      const partOffset = partOffsets[partIndex];
      if (!instance || !partOffset) return;

      reusable.agentMatrix.multiplyMatrices(reusable.anchorMatrix, partOffset);
      reusable.localMatrix.multiplyMatrices(reusable.managerInverse, reusable.agentMatrix);
      instance.setMatrixAt(agentIndex, reusable.localMatrix);
    });
  });

  instances.forEach((instance) => {
    if (instance) instance.instanceMatrix.needsUpdate = true;
  });
}
