import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { GameScene } from './scenes/GameScene'
import { UIScene } from './scenes/UIScene'
import type { GameProgress, GameResult } from '../types/game.types'
import type { BoardTheme } from '../types/theme.types'

interface SceneCallbacks {
  onStateChange: (progress: GameProgress) => void
  onGameOver: (result: GameResult) => void
  getStartedAt: () => number
  theme: BoardTheme
}

export function createPhaserConfig(
  parent: HTMLElement,
  callbacks: SceneCallbacks,
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: 700,
    height: 700,
    backgroundColor: '#0f172a',
    transparent: false,
    antialias: false,
    roundPixels: true,
    fps: {
      target: 30,
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.NO_CENTER,
      width: 700,
      height: 700,
    },
    scene: [new BootScene(), new GameScene(callbacks, callbacks.theme), new UIScene()],
  }
}
