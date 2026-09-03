export type SceneEffectsSettings = {
  lineArt: boolean;
  lineColor: number;
  lineStrength: number;
  pixelation: boolean;
  pixelSize: number;
};

export const DEFAULT_SCENE_EFFECTS: SceneEffectsSettings = {
  lineArt: true,
  lineColor: 0x000000,
  lineStrength: 1,
  pixelation: true,
  pixelSize: 2,
};
