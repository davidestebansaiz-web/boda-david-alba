import { Outlines } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
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
const POP_STIFFNESS = 260;
const POP_DAMPING = 16;
const MAXIMUM_POP_SCALE = 1.35;
const POP_REST_TOLERANCE = 0.001;

export type CharacterPart = {
  hoverOnly?: boolean;
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
  const bubbleScalesRef = useRef<number[]>([]);
  const bubbleVelocitiesRef = useRef<number[]>([]);
  const hoveredAgentRef = useRef<number | null>(null);
  const partCentersRef = useRef<Vector3[]>([]);
  const partOffsetsRef = useRef<Matrix4[]>([]);
  const navigationArea = useMemo(() => new NavigationArea(area), [area]);

  const reusable = useMemo(() => ({
    agentMatrix: new Matrix4(),
    anchorMatrix: new Matrix4(),
    cameraQuaternion: new Quaternion(),
    centerOffset: new Vector3(),
    managerInverse: new Matrix4(),
    localMatrix: new Matrix4(),
    partPosition: new Vector3(),
    partQuaternion: new Quaternion(),
    partScale: new Vector3(),
    quaternion: new Quaternion(),
    worldCenter: new Vector3(),
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
    partCentersRef.current = characterParts.map(({ mesh }) => {
      mesh.geometry.computeBoundingBox();
      return mesh.geometry.boundingBox?.getCenter(new Vector3()) ?? new Vector3();
    });

    const characterHeight = Math.max(
      new Box3().setFromObject(baseCharacter).getSize(new Vector3()).y,
      MINIMUM_CHARACTER_HEIGHT,
    );

    agentsRef.current = agentsRef.current.slice(0, guestCount);
    bubbleScalesRef.current = bubbleScalesRef.current.slice(0, guestCount);
    bubbleVelocitiesRef.current = bubbleVelocitiesRef.current.slice(0, guestCount);
    while (agentsRef.current.length < guestCount) {
      const position = navigationArea.samplePosition(new Vector3());
      agentsRef.current.push(new CharacterAgent(position, {
        minSpeed: characterHeight * 0.2,
        maxSpeed: characterHeight * 0.3,
        lookAheadDistance: characterHeight * 0.55,
      }));
      bubbleScalesRef.current.push(0);
      bubbleVelocitiesRef.current.push(0);
    }
    if (hoveredAgentRef.current !== null && hoveredAgentRef.current >= guestCount) {
      hoveredAgentRef.current = null;
    }

    updateInstanceMatrices(
      manager,
      instancesRef.current,
      agentsRef.current,
      bubbleScalesRef.current,
      characterParts,
      partCentersRef.current,
      partOffsetsRef.current,
      reusable,
    );
  }, [characterParts, guestCount, navigationArea, reusable]);

  useFrame(({ camera }, delta) => {
    const manager = managerRef.current;
    if (!manager) return;

    camera.getWorldQuaternion(reusable.cameraQuaternion);
    updateBubblePopAnimation(
      bubbleScalesRef.current,
      bubbleVelocitiesRef.current,
      hoveredAgentRef.current,
      delta,
    );
    agentsRef.current.forEach((agent) => agent.update(delta, navigationArea));
    updateInstanceMatrices(
      manager,
      instancesRef.current,
      agentsRef.current,
      bubbleScalesRef.current,
      characterParts,
      partCentersRef.current,
      partOffsetsRef.current,
      reusable,
    );
  });

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    if (event.instanceId === undefined) return;
    event.stopPropagation();
    hoveredAgentRef.current = event.instanceId;
  };
  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    if (event.instanceId === hoveredAgentRef.current) hoveredAgentRef.current = null;
  };

  return (
    <group ref={managerRef}>
      {characterParts.map(({ hoverOnly = false, mesh }, partIndex) => (
        <instancedMesh
          key={`${mesh.uuid}-${guestCount}`}
          ref={(instance) => {
            instancesRef.current[partIndex] = instance;
          }}
          args={[mesh.geometry, mesh.material, guestCount]}
          castShadow={!hoverOnly}
          dispose={null}
          frustumCulled={false}
          onPointerOut={partIndex === 0 ? handlePointerOut : undefined}
          onPointerOver={partIndex === 0 ? handlePointerOver : undefined}
          receiveShadow={!hoverOnly}
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
  cameraQuaternion: Quaternion;
  centerOffset: Vector3;
  managerInverse: Matrix4;
  localMatrix: Matrix4;
  partPosition: Vector3;
  partQuaternion: Quaternion;
  partScale: Vector3;
  quaternion: Quaternion;
  worldCenter: Vector3;
};

function updateInstanceMatrices(
  manager: Group,
  instances: Array<InstancedMesh | null>,
  agents: CharacterAgent[],
  bubbleScales: number[],
  characterParts: CharacterPart[],
  partCenters: Vector3[],
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

      const isHoverOnly = characterParts[partIndex]?.hoverOnly;
      const bubbleScale = bubbleScales[agentIndex] ?? 0;
      if (isHoverOnly && bubbleScale <= POP_REST_TOLERANCE) {
        reusable.localMatrix.makeScale(0, 0, 0);
        instance.setMatrixAt(agentIndex, reusable.localMatrix);
        return;
      }

      reusable.agentMatrix.multiplyMatrices(reusable.anchorMatrix, partOffset);
      if (isHoverOnly) {
        const partCenter = partCenters[partIndex];
        if (!partCenter) return;

        reusable.worldCenter.copy(partCenter).applyMatrix4(reusable.agentMatrix);
        reusable.agentMatrix.decompose(
          reusable.partPosition,
          reusable.partQuaternion,
          reusable.partScale,
        );
        reusable.partScale.multiplyScalar(bubbleScale);
        reusable.centerOffset
          .copy(partCenter)
          .multiply(reusable.partScale)
          .applyQuaternion(reusable.cameraQuaternion);
        reusable.partPosition.copy(reusable.worldCenter).sub(reusable.centerOffset);
        reusable.agentMatrix.compose(
          reusable.partPosition,
          reusable.cameraQuaternion,
          reusable.partScale,
        );
      }
      reusable.localMatrix.multiplyMatrices(reusable.managerInverse, reusable.agentMatrix);
      instance.setMatrixAt(agentIndex, reusable.localMatrix);
    });
  });

  instances.forEach((instance) => {
    if (instance) instance.instanceMatrix.needsUpdate = true;
  });
}

function updateBubblePopAnimation(
  scales: number[],
  velocities: number[],
  hoveredAgentIndex: number | null,
  delta: number,
): void {
  const timeStep = Math.min(delta, 1 / 30);

  scales.forEach((scale, agentIndex) => {
    const targetScale = agentIndex === hoveredAgentIndex ? 1 : 0;
    let velocity = velocities[agentIndex] ?? 0;
    velocity += (targetScale - scale) * POP_STIFFNESS * timeStep;
    velocity *= Math.exp(-POP_DAMPING * timeStep);
    let nextScale = Math.min(scale + velocity * timeStep, MAXIMUM_POP_SCALE);

    if (targetScale === 0 && nextScale < POP_REST_TOLERANCE) {
      nextScale = 0;
      velocity = 0;
    } else if (
      Math.abs(targetScale - nextScale) < POP_REST_TOLERANCE
      && Math.abs(velocity) < POP_REST_TOLERANCE
    ) {
      nextScale = targetScale;
      velocity = 0;
    }

    scales[agentIndex] = nextScale;
    velocities[agentIndex] = velocity;
  });
}
