export type SceneEffectsSettings = {
  lineArt: boolean;
  lineAngle: number;
  lineColor: number;
  lineOpacity: number;
  linePolygonOffset: boolean;
  linePolygonOffsetFactor: number;
  lineRenderOrder: number;
  lineScreenspace: boolean;
  lineStrength: number;
  lineToneMapped: boolean;
  lineTransparent: boolean;
  lineThresholdAngle: number;
  pixelation: boolean;
  pixelSize: number;
};

export type LineArtSettings = Pick<
  SceneEffectsSettings,
  | "lineArt"
  | "lineAngle"
  | "lineColor"
  | "lineOpacity"
  | "linePolygonOffset"
  | "linePolygonOffsetFactor"
  | "lineRenderOrder"
  | "lineScreenspace"
  | "lineStrength"
  | "lineToneMapped"
  | "lineTransparent"
  | "lineThresholdAngle"
>;

export const DEFAULT_SCENE_EFFECTS: SceneEffectsSettings = {
  lineArt: true,
  lineAngle: 0,
  lineColor: 0x000000,
  lineOpacity: 1,
  linePolygonOffset: false,
  linePolygonOffsetFactor: -10,
  lineRenderOrder: -20,
  lineScreenspace: false,
  lineStrength: 1,
  lineToneMapped: false,
  lineTransparent: false,
  lineThresholdAngle: 55,
  pixelation: false,
  pixelSize: 4,
};
