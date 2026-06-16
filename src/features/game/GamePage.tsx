import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/authContext'
import { createInitialGameState } from '../../game/core/gameState'
import { createGameId } from '../../game/core/id'
import { getValidMoves } from '../../game/core/moves'
import { getGameOutcome, getScoreLabel, isPerfectResult } from '../../game/core/scoring'
import { STREAK_WINDOW_MS } from '../../game/core/streak'
import { formatDuration } from '../../game/core/time'
import { saveGameResult } from '../../storage/historyStorage'
import { getCurrentPlayerName } from '../../storage/playerStorage'
import { getBoardTheme } from '../../storage/themeStorage'
import type { GameProgress, GameResult } from '../../game/types/game.types'
import styles from './GamePage.module.css'

const GameCanvas = lazy(() =>
  import('../../game/phaser/GameCanvas').then((module) => ({ default: module.GameCanvas })),
)

const initialState = createInitialGameState()
const COUNTDOWN_LABELS = ['3', '2', '1', '¡YA!'] as const
const RETRO_MELODY = [523.25, 659.25, 783.99, 659.25, 587.33, 739.99, 880, 739.99] as const
const RETRO_BASS = [130.81, 130.81, 174.61, 174.61, 146.83, 146.83, 196, 196] as const

export function GamePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const finishedRef = useRef(false)
  const musicContextRef = useRef<AudioContext | null>(null)
  const musicGainRef = useRef<GainNode | null>(null)
  const musicIntervalRef = useRef<number | null>(null)
  const musicStepRef = useRef(0)
  const [canvasKey, setCanvasKey] = useState(0)
  const startedAtRef = useRef(0)
  const [startedAtMs, setStartedAtMs] = useState(0)
  const [countdownStep, setCountdownStep] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [gameOverResult, setGameOverResult] = useState<GameResult | null>(null)
  const [isBoardReady, setIsBoardReady] = useState(false)
  const playerName = useMemo(() => {
    if (typeof user?.user_metadata.name === 'string') {
      return user.user_metadata.name
    }

    return user?.email ?? getCurrentPlayerName()
  }, [user])
  const [isMusicEnabled, setIsMusicEnabled] = useState(false)
  const [boardTheme, setBoardTheme] = useState(() => getBoardTheme())
  const [progress, setProgress] = useState<GameProgress>({
    board: initialState.board,
    moveCount: initialState.moveCount,
    remainingPieces: initialState.remainingPieces,
    score: initialState.score,
    streak: initialState.streak,
    lastMoveAt: initialState.lastMoveAt,
    lastMoveScore: initialState.lastMoveScore,
  })

  const playRetroMusicNote = useCallback((frequency: number, duration: number, type: OscillatorType, volume: number) => {
    const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

    if (!AudioContextCtor) {
      return
    }

    musicContextRef.current ??= new AudioContextCtor()
    const audioContext = musicContextRef.current
    musicGainRef.current ??= audioContext.createGain()
    musicGainRef.current.gain.setValueAtTime(0.14, audioContext.currentTime)
    musicGainRef.current.connect(audioContext.destination)

    if (audioContext.state === 'suspended') {
      void audioContext.resume()
    }

    const oscillator = audioContext.createOscillator()
    const noteGain = audioContext.createGain()
    const now = audioContext.currentTime

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, now)
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(80, frequency * 0.985), now + duration)

    noteGain.gain.setValueAtTime(0.0001, now)
    noteGain.gain.exponentialRampToValueAtTime(volume, now + 0.025)
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    oscillator.connect(noteGain)
    noteGain.connect(musicGainRef.current)
    oscillator.start(now)
    oscillator.stop(now + duration)
  }, [])

  const stopRetroMusic = useCallback(() => {
    if (musicIntervalRef.current !== null) {
      window.clearInterval(musicIntervalRef.current)
      musicIntervalRef.current = null
    }

    if (musicGainRef.current) {
      musicGainRef.current.gain.setTargetAtTime(0.0001, musicContextRef.current?.currentTime ?? 0, 0.04)
    }
  }, [])

  const startRetroMusic = useCallback(() => {
    stopRetroMusic()
    musicStepRef.current = 0

    const playStep = () => {
      const step = musicStepRef.current
      playRetroMusicNote(RETRO_MELODY[step % RETRO_MELODY.length], 0.18, 'square', 0.035)

      if (step % 2 === 0) {
        playRetroMusicNote(RETRO_BASS[step % RETRO_BASS.length], 0.22, 'triangle', 0.028)
      }

      musicStepRef.current = step + 1
    }

    playStep()
    musicIntervalRef.current = window.setInterval(playStep, 260)
  }, [playRetroMusicNote, stopRetroMusic])

  const handleToggleMusic = () => {
    setIsMusicEnabled((current) => {
      const nextValue = !current

      if (nextValue) {
        startRetroMusic()
      } else {
        stopRetroMusic()
      }

      return nextValue
    })
  }

  useEffect(() => {
    return () => {
      stopRetroMusic()
      void musicContextRef.current?.close()
    }
  }, [stopRetroMusic])

  useEffect(() => {
    if (!isBoardReady || gameOverResult || countdownStep >= COUNTDOWN_LABELS.length) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setCountdownStep((currentStep) => {
        const nextStep = currentStep + 1

        if (nextStep === COUNTDOWN_LABELS.length) {
          const startedAt = Date.now()
          startedAtRef.current = startedAt
          setStartedAtMs(startedAt)
          setElapsedMs(0)
        }

        return nextStep
      })
    }, 800)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [countdownStep, gameOverResult, isBoardReady])

  useEffect(() => {
    if (gameOverResult || countdownStep < COUNTDOWN_LABELS.length) {
      return
    }

    if (startedAtRef.current === 0) {
      return
    }

    const intervalId = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAtRef.current)
    }, 100)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [countdownStep, gameOverResult])

  const displayedElapsedMs = gameOverResult?.durationMs ?? elapsedMs
  const countdownLabel = countdownStep < COUNTDOWN_LABELS.length ? COUNTDOWN_LABELS[countdownStep] : null
  const currentGameTimeMs = startedAtMs + displayedElapsedMs
  const streakTimeLeftMs =
    progress.streak > 1 && progress.lastMoveAt !== null
      ? Math.max(0, STREAK_WINDOW_MS - (currentGameTimeMs - progress.lastMoveAt))
      : 0
  const showStreak = progress.streak > 1 && streakTimeLeftMs > 0
  const isStreakEnding = streakTimeLeftMs <= 2000

  const finishWithResult = useCallback((result: GameResult) => {
    if (finishedRef.current) {
      return
    }

    finishedRef.current = true
    saveGameResult(result)

    setGameOverResult(result)
  }, [])

  const getStartedAt = useCallback(() => startedAtRef.current || Date.now(), [])

  const handleStateChange = useCallback(
    (nextProgress: GameProgress) => {
      setProgress(nextProgress)

      if (getValidMoves(nextProgress.board).length > 0) {
        return
      }

      const result: GameResult = {
        id: createGameId(),
        date: new Date().toISOString(),
        remainingPieces: nextProgress.remainingPieces,
        moves: nextProgress.moveCount,
        score: nextProgress.score,
        durationMs: Math.max(0, Date.now() - getStartedAt()),
        playerName: playerName ?? undefined,
        evaluation: getScoreLabel(nextProgress.remainingPieces),
        perfect: isPerfectResult(nextProgress.board),
        outcome: getGameOutcome(nextProgress.remainingPieces),
      }

      finishWithResult(result)
    },
    [finishWithResult, getStartedAt, playerName],
  )

  const handleGameOver = useCallback((result: GameResult) => {
    finishWithResult({ ...result, playerName: playerName ?? undefined })
  }, [finishWithResult, playerName])

  const handleBoardReady = useCallback(() => {
    setIsBoardReady(true)
  }, [])

  const handleRestart = () => {
    finishedRef.current = false
    setGameOverResult(null)
    startedAtRef.current = 0
    setStartedAtMs(0)
    setCountdownStep(0)
    setElapsedMs(0)
    setIsBoardReady(false)
    setBoardTheme(getBoardTheme())
    const resetState = createInitialGameState()
    setProgress({
      board: resetState.board,
      moveCount: resetState.moveCount,
      remainingPieces: resetState.remainingPieces,
      score: resetState.score,
      streak: resetState.streak,
      lastMoveAt: resetState.lastMoveAt,
      lastMoveScore: resetState.lastMoveScore,
    })
    setCanvasKey((current) => current + 1)
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.ambientPieces} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

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
          </article>
          <article className={styles.pill}>
            <span>Movs.</span>
            <strong key={`moves-${progress.moveCount}`} className={styles.animatedValue}>
              {progress.moveCount}
            </strong>
          </article>
          <article className={`${styles.pill} ${styles.timePill}`}>
            <span>Tiempo</span>
            <strong>{formatDuration(displayedElapsedMs)}</strong>
          </article>
        </div>
      </header>

      <div className={`panel ${styles.boardPanel}`}>
        {showStreak ? (
          <div className={`${styles.streakBadge} ${isStreakEnding ? styles.streakWarning : ''}`}>
            <span>🔥 x{progress.streak}</span>
            <strong>{(streakTimeLeftMs / 1000).toFixed(1)}s</strong>
          </div>
        ) : null}
        <Suspense fallback={<div className={styles.loading}>Cargando tablero…</div>}>
          <GameCanvas
            canvasKey={canvasKey}
            onStateChange={handleStateChange}
            onGameOver={handleGameOver}
            onReady={handleBoardReady}
            getStartedAt={getStartedAt}
            theme={boardTheme}
          />
        </Suspense>
      </div>

      {!isBoardReady && !gameOverResult ? (
        <div className={styles.modalOverlay} role="status" aria-live="polite">
          <div className={styles.loadingPopup}>Preparando tablero…</div>
        </div>
      ) : countdownLabel ? (
        <div className={styles.modalOverlay} role="status" aria-live="polite">
          <div className={styles.countdownPopup}>{countdownLabel}</div>
        </div>
      ) : null}

      {gameOverResult ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="game-over-title">
          <div className={`panel ${styles.gameOverModal}`}>
            <div className={styles.gameOverIcon}>{gameOverResult.outcome === 'won' ? '🏆' : '💥'}</div>
            <p className={styles.eyebrow}>{gameOverResult.outcome === 'won' ? 'Partida completada' : 'Sin movimientos'}</p>
            <h2 id="game-over-title" className={styles.modalTitle}>
              {gameOverResult.outcome === 'won' ? '¡Ganaste!' : 'Perdiste'}
            </h2>
            <p className={styles.modalText}>
              Terminaste con <strong>{gameOverResult.remainingPieces}</strong> ficha(s),{' '}
              <strong>{gameOverResult.moves}</strong> movimientos, <strong>{gameOverResult.score}</strong> puntos y{' '}
              <strong>{formatDuration(gameOverResult.durationMs)}</strong> de tiempo.
            </p>
            <div className={styles.modalActions}>
              <button type="button" className="primaryButton" onClick={handleRestart}>
                Intentar de nuevo
              </button>
              {gameOverResult.outcome === 'won' ? (
                <button
                  type="button"
                  className="secondaryButton"
                  onClick={() => navigate('/results', { state: gameOverResult })}
                >
                  Ver resultado
                </button>
              ) : (
                <button type="button" className="secondaryButton" onClick={() => navigate('/')}>
                  Volver al inicio
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

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
          className={`secondaryButton ${styles.compactButton} ${styles.musicButton}`}
          onClick={handleToggleMusic}
          aria-pressed={isMusicEnabled}
        >
          {isMusicEnabled ? '🔊 Música' : '🔇 Música'}
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
