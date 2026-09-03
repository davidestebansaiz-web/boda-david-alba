import { Box3, Mesh, Raycaster, Vector3 } from "three";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";

const RAYCAST_MARGIN = 1;
const DOWN = new Vector3(0, -1, 0);

/** Uses the exported walkable mesh as the single source of navigation truth. */
export class NavigationArea {
  private readonly bounds = new Box3();
  private readonly localSample = new Vector3();
  private readonly rayOrigin = new Vector3();
  private readonly raycaster = new Raycaster();
  private readonly sampler: MeshSurfaceSampler;
  private readonly mesh: Mesh;

  constructor(mesh: Mesh) {
    this.mesh = mesh;
    this.sampler = new MeshSurfaceSampler(this.mesh).build();
    this.updateWorldData();
  }

  updateWorldData(): void {
    this.mesh.updateWorldMatrix(true, false);
    this.bounds.setFromObject(this.mesh);
  }

  samplePosition(target: Vector3): Vector3 {
    this.sampler.sample(this.localSample);
    target.copy(this.localSample);
    return this.mesh.localToWorld(target);
  }

  getSurfacePoint(position: Vector3, target: Vector3): Vector3 | null {
    const rayHeight = this.bounds.max.y + RAYCAST_MARGIN;
    this.rayOrigin.set(position.x, rayHeight, position.z);
    this.raycaster.set(this.rayOrigin, DOWN);
    this.raycaster.far = Math.max(RAYCAST_MARGIN * 2, rayHeight - this.bounds.min.y + RAYCAST_MARGIN);

    const intersection = this.raycaster.intersectObject(this.mesh, false)[0];
    if (!intersection) return null;

    return target.copy(intersection.point);
  }

  isWalkable(position: Vector3): boolean {
    return this.getSurfacePoint(position, this.localSample) !== null;
  }
}
