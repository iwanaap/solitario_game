import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearGameHistory, getGameHistory } from '../../storage/historyStorage'
import type { StoredGameResult } from '../../storage/save.types'
import styles from './HistoryPage.module.css'

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

export function HistoryPage() {
  const navigate = useNavigate()
  const [history, setHistory] = useState<StoredGameResult[]>(() => getGameHistory())

  const bestResult = useMemo(() => {
    return [...history].sort((left, right) => {
      if (left.remainingPieces !== right.remainingPieces) {
        return left.remainingPieces - right.remainingPieces
      }

      if (left.score !== right.score) {
        return right.score - left.score
      }

      return left.moves - right.moves
    })[0]
  }, [history])

  const handleClear = () => {
    clearGameHistory()
    setHistory([])
  }

  return (
    <section className={styles.wrapper}>
      <div className="panel">
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Partidas guardadas</p>
            <h1 className={styles.title}>Historial</h1>
          </div>

          <div className={styles.actions}>
            <button type="button" className="secondaryButton" onClick={() => navigate('/')}>
              Volver al inicio
            </button>
            <button type="button" className="secondaryButton" onClick={handleClear}>
              Limpiar historial
            </button>
          </div>
        </div>

        {bestResult ? (
          <p className={styles.bestResult}>
            Mejor resultado histórico: <strong>{bestResult.remainingPieces}</strong> ficha(s),{' '}
            <strong>{bestResult.moves}</strong> movimientos, <strong>{bestResult.score}</strong> puntos,
            <strong> {bestResult.evaluation}</strong>.
          </p>
        ) : null}

        {history.length === 0 ? (
          <p className={styles.empty}>Todavía no hay partidas guardadas.</p>
        ) : (
          <div className={styles.list}>
            {history.map((entry) => (
              <article key={entry.id} className={styles.item}>
                <div>
                  <h2>{entry.evaluation}</h2>
                  <p>{formatDate(entry.date)}</p>
                </div>
                <ul>
                  <li>Fichas restantes: {entry.remainingPieces}</li>
                  <li>Movimientos: {entry.moves}</li>
                  <li>Puntaje: {entry.score}</li>
                  <li>{entry.perfect ? 'Resultado perfecto' : 'Sin resultado perfecto'}</li>
                </ul>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
