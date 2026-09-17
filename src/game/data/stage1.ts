export type EnemyKind = 'walker' | 'flyer' | 'shell' | 'boss';

export type RectSpan = { x: number; y: number; w: number };

export type EnemySpawn = {
  type: EnemyKind;
  x: number;
  y: number;
  patrol?: number;
};

export type PropSpawn = {
  type: 'torch' | 'shrine' | 'door' | 'crate' | 'bush' | 'rock' | 'window' | 'flag' | 'fence' | 'sign';
  x: number;
  y: number;
};

export const STAGE_1 = {
  name: 'Lantern Courtyard',
  title: '第一关  ·  灯笼庭',
  cols: 90,
  rows: 12,
  spawn: { x: 2.5, y: 8 },
  ground: [
    { x: 0, y: 10, w: 32 },
    { x: 36, y: 10, w: 18 },
    { x: 58, y: 10, w: 32 }
  ] satisfies RectSpan[],
  fill: [
    { x: 0, y: 11, w: 32 },
    { x: 36, y: 11, w: 18 },
    { x: 58, y: 11, w: 32 }
  ] satisfies RectSpan[],
  platforms: [
    { x: 6, y: 7, w: 4 },
    { x: 14, y: 5, w: 5 },
    { x: 24, y: 7, w: 4 },
    { x: 33, y: 4, w: 5 },
    { x: 42, y: 7, w: 4 },
    { x: 50, y: 5, w: 5 },
    { x: 62, y: 7, w: 4 },
    { x: 72, y: 6, w: 5 }
  ] satisfies RectSpan[],
  spikes: [
    { x: 18, y: 9, w: 2 },
    { x: 47, y: 9, w: 3 }
  ] satisfies RectSpan[],
  props: [
    { type: 'torch', x: 4, y: 9 },
    { type: 'bush', x: 8, y: 9 },
    { type: 'crate', x: 11, y: 9 },
    { type: 'window', x: 16, y: 8 },
    { type: 'shrine', x: 27, y: 9 },
    { type: 'flag', x: 27.6, y: 8.15 },
    { type: 'torch', x: 38, y: 9 },
    { type: 'rock', x: 44, y: 9 },
    { type: 'fence', x: 60, y: 9 },
    { type: 'torch', x: 66, y: 9 },
    { type: 'sign', x: 74, y: 9 },
    { type: 'door', x: 86, y: 8 }
  ] satisfies PropSpawn[],
  enemies: [
    { type: 'walker', x: 10, y: 9, patrol: 140 },
    { type: 'walker', x: 20, y: 9, patrol: 120 },
    { type: 'flyer', x: 15, y: 3.5, patrol: 90 },
    { type: 'walker', x: 29, y: 9, patrol: 80 },
    { type: 'flyer', x: 35, y: 2.8, patrol: 110 },
    { type: 'shell', x: 40, y: 9, patrol: 100 },
    { type: 'walker', x: 49, y: 9, patrol: 90 },
    { type: 'flyer', x: 53, y: 3.2, patrol: 80 },
    { type: 'walker', x: 64, y: 9, patrol: 120 },
    { type: 'flyer', x: 70, y: 3.5, patrol: 100 }
  ] satisfies EnemySpawn[],
  boss: { type: 'boss', x: 80, y: 8.4, patrol: 180 } satisfies EnemySpawn
};
