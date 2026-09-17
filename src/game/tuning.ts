export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const TILE = 64;

export const TUNING = {
  gravity: 2100,
  moveSpeed: 210,
  airControl: 0.28,
  jumpSpeed: -640,
  maxHp: 8,
  maxMp: 5,
  slashMs: 280,
  slashDamage: 2,
  fireballCost: 1,
  fireballSpeed: 460,
  fireballDamage: 1,
  invulnMs: 1000,
  knockback: 280
} as const;
