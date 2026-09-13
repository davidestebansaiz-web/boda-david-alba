import {
  Box3,
  EdgesGeometry,
  Mesh,
  Object3D,
  Vector3,
} from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";

export type NormalizedModel = {
  bounds: Box3;
  center: Vector3;
  meshes: Mesh[];
  model: Object3D;
  scale: number;
  size: Vector3;
};

export function normalizeModel(source: Object3D, targetSize = 3.5): NormalizedModel {
  const model = source.clone(true);
  const bounds = new Box3().setFromObject(model);
  const size = bounds.getSize(new Vector3());
  const center = bounds.getCenter(new Vector3());
  const largestSide = Math.max(size.x, size.y, size.z) || 1;
  const meshes: Mesh[] = [];

  model.position.set(-center.x, -bounds.min.y, -center.z);
  model.traverse((child) => {
    if (!(child instanceof Mesh)) return;

    child.castShadow = true;
    child.receiveShadow = true;
    meshes.push(child);
  });

  return {
    bounds,
    center,
    meshes,
    model,
    scale: targetSize / largestSide,
    size,
  };
}

type AddLineArtOptions = {
  color: number;
  lineStrength: number;
  meshes: Mesh[];
  opacity: number;
  polygonOffset: boolean;
  polygonOffsetFactor: number;
  renderOrder: number;
  thresholdAngle: (mesh: Mesh) => number;
  toneMapped: boolean;
  transparent: boolean;
  visible: boolean;
};

export function addLineArt({
  color,
  lineStrength,
  meshes,
  opacity,
  polygonOffset,
  polygonOffsetFactor,
  renderOrder,
  thresholdAngle,
  toneMapped,
  transparent,
  visible,
}: AddLineArtOptions): () => void {
  const material = new LineMaterial({
    color,
    depthTest: true,
    depthWrite: false,
    linewidth: lineStrength,
    opacity,
    polygonOffset,
    polygonOffsetFactor,
    toneMapped,
    transparent,
    worldUnits: false,
  });

  const linesByMesh = meshes.map((mesh) => {
    const edges = new EdgesGeometry(mesh.geometry, thresholdAngle(mesh));
    const geometry = new LineSegmentsGeometry();
    geometry.setPositions(edges.attributes.position.array as Float32Array);
    edges.dispose();

    const lines = new LineSegments2(geometry, material);
    lines.frustumCulled = false;
    lines.renderOrder = renderOrder;
    lines.visible = visible;
    mesh.add(lines);
    return { lines, mesh };
  });

  return () => {
    linesByMesh.forEach(({ lines, mesh }) => {
      mesh.remove(lines);
      lines.geometry.dispose();
    });
    material.dispose();
  };
}

export function getMeshesByName(meshes: Mesh[], names: ReadonlySet<string>): Mesh[] {
  return meshes.filter((mesh) => names.has(mesh.name));
}
