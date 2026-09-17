import Phaser from 'phaser';
import { Play } from './scenes/Play';
import { Preload } from './scenes/Preload';
import { Title } from './scenes/Title';
import { GAME_HEIGHT, GAME_WIDTH, TUNING } from './tuning';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#140c08',
  pixelArt: false,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: TUNING.gravity },
      debug: false
    }
  },
  scene: [Preload, Title, Play]
};

export default function StartGame(parent: string): Phaser.Game {
  const game = new Phaser.Game({ ...config, parent });
  (window as Window & { __isshin?: Phaser.Game }).__isshin = game;
  if (!game.scene.isActive('Preload')) {
    game.scene.start('Preload');
  }
  return game;
}
