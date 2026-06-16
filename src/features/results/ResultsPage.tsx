import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/authContext'
import type { GameResult } from '../../game/types/game.types'
import { isWinningResult } from '../../game/core/scoring'
import { formatDuration } from '../../game/core/time'
import styles from './ResultsPage.module.css'

function getMedal(result: GameResult): { emoji: string; title: string; stars: number } {
  if (result.perfect) {
    return { emoji: '👑', title: 'Acaso eres Dios?', stars: 5 }
  }

  if (result.remainingPieces === 2) {
    return { emoji: '🏆', title: 'WOOOOW!', stars: 4 }
  }

  if (result.remainingPieces === 3) {
    return { emoji: '🌟', title: 'Excelente!!', stars: 3 }
  }

  if (result.remainingPieces === 4) {
    return { emoji: '👏', title: 'Genial', stars: 2 }
  }

  if (result.remainingPieces === 5) {
    return { emoji: '🎉', title: 'Bueno', stars: 1 }
  }

  return { emoji: '💥', title: 'Sin movimientos', stars: 0 }
}

export function ResultsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const result = location.state as GameResult | null

  if (!result) {
    return <Navigate to="/" replace />
  }

  const medal = getMedal(result)
  const didWin = result.outcome ? result.outcome === 'won' : isWinningResult(result.remainingPieces)

  return (
    <section className={styles.wrapper}>
      <div className={`panel ${styles.resultPanel}`}>
        <div className={styles.hero}>
          <div className={styles.medal}>{medal.emoji}</div>
          <p className={styles.eyebrow}>Resultado final</p>
          <h1 className={styles.title}>{result.evaluation}</h1>
          <p className={styles.subtitle}>{didWin ? `Ganaste · ${medal.title}` : 'Perdiste · no quedan movimientos'}</p>
          <div className={styles.stars} aria-label={`${medal.stars} estrellas`}>
            {Array.from({ length: 5 }, (_, index) => (
              <span key={index} className={index < medal.stars ? styles.starActive : styles.starMuted}>
                ★
              </span>
            ))}
          </div>
        </div>

        <p className={styles.description}>
          {result.playerName ? <><strong>{result.playerName}</strong>, </> : null}
          terminaste con <strong>{result.remainingPieces}</strong> ficha(s), <strong>{result.moves}</strong>{' '}
          movimientos, <strong>{result.score}</strong> puntos y <strong>{formatDuration(result.durationMs)}</strong>.
        </p>

        <div className={styles.summary}>
          <article className={`${styles.summaryCard} ${styles.highlightCard}`}>
            <span>Puntaje</span>
            <strong>{result.score}</strong>
          </article>
          <article className={styles.summaryCard}>
            <span>Fichas restantes</span>
            <strong>{result.remainingPieces}</strong>
          </article>
          <article className={styles.summaryCard}>
            <span>Movimientos realizados</span>
            <strong>{result.moves}</strong>
          </article>
          <article className={styles.summaryCard}>
            <span>Tiempo</span>
            <strong>{formatDuration(result.durationMs)}</strong>
          </article>
          <article className={styles.summaryCard}>
            <span>¿Perfecto?</span>
            <strong>{result.perfect ? 'Sí, una ficha en el centro' : 'Todavía no'}</strong>
          </article>
        </div>

        <div className={styles.actions}>
          {!user ? (
            <button type="button" className="primaryButton" onClick={() => navigate('/auth')}>
              Guardar ranking y ganar fichas
            </button>
          ) : null}
          <button type="button" className={user ? 'primaryButton' : 'secondaryButton'} onClick={() => navigate('/game')}>
            Jugar de nuevo
          </button>
          <button type="button" className="secondaryButton" onClick={() => navigate('/challenges')}>
            Ver desafíos
          </button>
          <button type="button" className="secondaryButton" onClick={() => navigate('/ranking')}>
            Ver ranking
          </button>
          <button type="button" className="secondaryButton" onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </div>
      </div>
    </section>
  )
}
