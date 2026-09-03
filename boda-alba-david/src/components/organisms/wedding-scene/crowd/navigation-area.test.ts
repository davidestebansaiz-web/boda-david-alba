import { DoubleSide, Mesh, MeshBasicMaterial, Path, Shape, ShapeGeometry, Vector3 } from "three";
import { describe, expect, it } from "vitest";

import { CharacterAgent } from "./character-agent";
import { NavigationArea } from "./navigation-area";

function createAreaWithHole(): NavigationArea {
  const shape = new Shape()
    .moveTo(-5, -5)
    .lineTo(5, -5)
    .lineTo(5, 5)
    .lineTo(-5, 5)
    .closePath();
  const hole = new Path()
    .moveTo(-1, -1)
    .lineTo(-1, 1)
    .lineTo(1, 1)
    .lineTo(1, -1)
    .closePath();
  shape.holes.push(hole);

  const mesh = new Mesh(
    new ShapeGeometry(shape),
    new MeshBasicMaterial({ side: DoubleSide }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.updateMatrixWorld(true);
  return new NavigationArea(mesh);
}

describe("NavigationArea", () => {
  it("uses triangles rather than a bounding box and rejects holes", () => {
    const area = createAreaWithHole();

    expect(area.isWalkable(new Vector3(4, 0, 0))).toBe(true);
    expect(area.isWalkable(new Vector3(0, 0, 0))).toBe(false);
    expect(area.isWalkable(new Vector3(6, 0, 0))).toBe(false);
  });

  it("samples initial positions only on existing surface triangles", () => {
    const area = createAreaWithHole();

    for (let sampleIndex = 0; sampleIndex < 100; sampleIndex += 1) {
      const position = area.samplePosition(new Vector3());
      expect(area.isWalkable(position)).toBe(true);
      expect(Math.abs(position.x) < 1 && Math.abs(position.z) < 1).toBe(false);
    }
  });
});

describe("CharacterAgent", () => {
  it("never accepts movement outside the walkable geometry", () => {
    const area = createAreaWithHole();
    const initialPosition = new Vector3(4, 0, 0);
    const agent = new CharacterAgent(initialPosition, {
      minSpeed: 1,
      maxSpeed: 1,
      lookAheadDistance: 0.75,
      random: () => 0.5,
    });

    for (let frame = 0; frame < 600; frame += 1) {
      agent.update(1 / 60, area);
      expect(area.isWalkable(agent.position)).toBe(true);
    }

    expect(agent.position.distanceTo(initialPosition)).toBeGreaterThan(0.5);
  });
});
