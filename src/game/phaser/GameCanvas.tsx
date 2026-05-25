import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { createPhaserConfig } from './config'
import type { GameProgress, GameResult } from '../types/game.types'
import styles from './GameCanvas.module.css'

interface GameCanvasProps {
  canvasKey: number
  onStateChange: (progress: GameProgress) => void
  onGameOver: (result: GameResult) => void
}

export function GameCanvas({ canvasKey, onStateChange, onGameOver }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const game = new Phaser.Game(
      createPhaserConfig(containerRef.current, { onStateChange, onGameOver }),
    )

    return () => {
      game.destroy(true)
    }
  }, [canvasKey, onGameOver, onStateChange])

  return (
    <div className={styles.canvasWrapper}>
      <div ref={containerRef} className={styles.gameHost} />
    </div>
  )
}
