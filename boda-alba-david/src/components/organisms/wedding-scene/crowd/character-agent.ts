import { MathUtils, Vector3 } from "three";

import type { NavigationArea } from "./navigation-area";

const FULL_TURN = Math.PI * 2;
const MAX_FRAME_DELTA = 0.1;
const EDGE_DIRECTION_ATTEMPTS = 16;

export type RandomSource = () => number;

export type CharacterAgentOptions = {
  minSpeed: number;
  maxSpeed: number;
  lookAheadDistance: number;
  random?: RandomSource;
};

function randomBetween(random: RandomSource, min: number, max: number): number {
  return min + random() * (max - min);
}

function shortestAngleDifference(from: number, to: number): number {
  return MathUtils.euclideanModulo(to - from + Math.PI, FULL_TURN) - Math.PI;
}

export class CharacterAgent {
  readonly position: Vector3;
  readonly speed: number;
  directionAngle: number;

  private readonly candidate = new Vector3();
  private readonly direction = new Vector3();
  private readonly surfacePoint = new Vector3();
  private readonly random: RandomSource;
  private readonly lookAheadDistance: number;
  private readonly turnSpeed: number;
  private edgeTurnCooldown = 0;
  private pauseRemaining = 0;
  private targetDirectionAngle: number;
  private timeUntilDirectionChange: number;

  constructor(position: Vector3, options: CharacterAgentOptions) {
    this.position = position.clone();
    this.random = options.random ?? Math.random;
    this.speed = randomBetween(this.random, options.minSpeed, options.maxSpeed);
    this.lookAheadDistance = options.lookAheadDistance;
    this.turnSpeed = randomBetween(this.random, 2.5, 4);
    this.directionAngle = randomBetween(this.random, -Math.PI, Math.PI);
    this.targetDirectionAngle = this.directionAngle;
    this.timeUntilDirectionChange = randomBetween(this.random, 2, 6);
  }

  update(delta: number, navigationArea: NavigationArea): void {
    const safeDelta = Math.min(delta, MAX_FRAME_DELTA);
    this.timeUntilDirectionChange -= safeDelta;
    this.edgeTurnCooldown = Math.max(0, this.edgeTurnCooldown - safeDelta);

    if (this.timeUntilDirectionChange <= 0) {
      this.chooseWanderDirection();
    }

    this.turnTowardsTarget(safeDelta);

    if (this.pauseRemaining > 0) {
      this.pauseRemaining -= safeDelta;
      return;
    }

    this.direction.set(Math.sin(this.directionAngle), 0, Math.cos(this.directionAngle));
    this.candidate.copy(this.position).addScaledVector(this.direction, this.lookAheadDistance);

    if (!navigationArea.isWalkable(this.candidate)) {
      this.steerAwayFromEdge(navigationArea);
      return;
    }

    this.candidate.copy(this.position).addScaledVector(this.direction, this.speed * safeDelta);
    const nextSurfacePoint = navigationArea.getSurfacePoint(this.candidate, this.surfacePoint);

    if (nextSurfacePoint) {
      this.position.copy(nextSurfacePoint);
    } else {
      this.steerAwayFromEdge(navigationArea);
    }
  }

  private chooseWanderDirection(): void {
    const turnAmplitude = randomBetween(this.random, -Math.PI * 0.65, Math.PI * 0.65);
    this.targetDirectionAngle = this.directionAngle + turnAmplitude;
    this.timeUntilDirectionChange = randomBetween(this.random, 2.5, 6.5);

    if (this.random() < 0.12) {
      this.pauseRemaining = randomBetween(this.random, 0.25, 0.8);
    }
  }

  private steerAwayFromEdge(navigationArea: NavigationArea): void {
    if (this.edgeTurnCooldown > 0) return;

    const initialOffset = randomBetween(this.random, 0, FULL_TURN);
    for (let attempt = 0; attempt < EDGE_DIRECTION_ATTEMPTS; attempt += 1) {
      const angle = initialOffset + attempt * (FULL_TURN / EDGE_DIRECTION_ATTEMPTS);
      this.direction.set(Math.sin(angle), 0, Math.cos(angle));
      this.candidate.copy(this.position).addScaledVector(this.direction, this.lookAheadDistance);

      if (navigationArea.isWalkable(this.candidate)) {
        this.targetDirectionAngle = angle;
        this.edgeTurnCooldown = 0.45;
        this.timeUntilDirectionChange = randomBetween(this.random, 1.5, 3.5);
        return;
      }
    }

    // A short pause avoids rapid oscillation if the agent is in a very narrow corner.
    this.pauseRemaining = 0.35;
    this.edgeTurnCooldown = 0.35;
  }

  private turnTowardsTarget(delta: number): void {
    const difference = shortestAngleDifference(this.directionAngle, this.targetDirectionAngle);
    const turnFactor = 1 - Math.exp(-this.turnSpeed * delta);
    this.directionAngle += difference * turnFactor;
  }
}
