import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { createPhaserConfig } from './config'
import type { GameProgress, GameResult } from '../types/game.types'
import type { BoardTheme } from '../types/theme.types'
import styles from './GameCanvas.module.css'

interface GameCanvasProps {
  canvasKey: number
  onStateChange: (progress: GameProgress) => void
  onGameOver: (result: GameResult) => void
  getStartedAt: () => number
  theme: BoardTheme
}

export function GameCanvas({ canvasKey, onStateChange, onGameOver, getStartedAt, theme }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const game = new Phaser.Game(
      createPhaserConfig(containerRef.current, { onStateChange, onGameOver, getStartedAt, theme }),
    )

    return () => {
      game.destroy(true)
    }
  }, [canvasKey, getStartedAt, onGameOver, onStateChange, theme])

  return (
    <div className={styles.canvasWrapper}>
      <div ref={containerRef} className={styles.gameHost} />
    </div>
  )
}
