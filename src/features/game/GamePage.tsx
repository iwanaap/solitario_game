import { Suspense, lazy, useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createInitialGameState } from '../../game/core/gameState'
import { saveGameResult } from '../../storage/historyStorage'
import type { GameProgress, GameResult } from '../../game/types/game.types'
import styles from './GamePage.module.css'

const GameCanvas = lazy(() =>
  import('../../game/phaser/GameCanvas').then((module) => ({ default: module.GameCanvas })),
)

const initialState = createInitialGameState()

export function GamePage() {
  const navigate = useNavigate()
  const finishedRef = useRef(false)
  const [canvasKey, setCanvasKey] = useState(0)
  const [progress, setProgress] = useState<GameProgress>({
    board: initialState.board,
    moveCount: initialState.moveCount,
    remainingPieces: initialState.remainingPieces,
    score: initialState.score,
    streak: initialState.streak,
    lastMoveScore: initialState.lastMoveScore,
  })

  const handleStateChange = useCallback((nextProgress: GameProgress) => {
    setProgress(nextProgress)
  }, [])

  const handleGameOver = useCallback(
    (result: GameResult) => {
      if (finishedRef.current) {
        return
      }

      finishedRef.current = true
      saveGameResult(result)
      navigate('/results', { state: result })
    },
    [navigate],
  )

  const handleRestart = () => {
    finishedRef.current = false
    const resetState = createInitialGameState()
    setProgress({
      board: resetState.board,
      moveCount: resetState.moveCount,
      remainingPieces: resetState.remainingPieces,
      score: resetState.score,
      streak: resetState.streak,
      lastMoveScore: resetState.lastMoveScore,
    })
    setCanvasKey((current) => current + 1)
  }

  return (
    <section className={styles.wrapper}>
      <header className={`panel ${styles.topBar}`}>
        <div className={styles.brand}>
          <p className={styles.eyebrow}>Partida actual</p>
          <h1 className={styles.title}>El Solitario</h1>
        </div>

        <div className={styles.hud}>
          <article className={styles.pill}>
            <span>Fichas</span>
            <strong key={`pieces-${progress.remainingPieces}`} className={styles.animatedValue}>
              {progress.remainingPieces}
            </strong>
          </article>
          <article className={`${styles.pill} ${styles.scorePill}`}>
            <span>Puntos</span>
            <strong key={`score-${progress.score}`} className={styles.animatedScore}>
              {progress.score}
            </strong>
            {progress.streak > 1 ? <em className={styles.streakBadge}>Racha x{progress.streak}</em> : null}
          </article>
          <article className={styles.pill}>
            <span>Movs.</span>
            <strong key={`moves-${progress.moveCount}`} className={styles.animatedValue}>
              {progress.moveCount}
            </strong>
          </article>
        </div>
      </header>

      <div className={`panel ${styles.boardPanel}`}>
        <Suspense fallback={<div className={styles.loading}>Cargando tablero…</div>}>
          <GameCanvas
            canvasKey={canvasKey}
            onStateChange={handleStateChange}
            onGameOver={handleGameOver}
          />
        </Suspense>
      </div>

      <footer className={`panel ${styles.bottomBar}`}>
        <button
          type="button"
          className={`secondaryButton ${styles.compactButton}`}
          onClick={handleRestart}
        >
          Reiniciar
        </button>
        <button
          type="button"
          className={`secondaryButton ${styles.compactButton}`}
          onClick={() => navigate('/')}
        >
          Menú
        </button>
      </footer>
    </section>
  )
}
