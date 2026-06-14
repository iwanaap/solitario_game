import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDuration } from '../../game/core/time'
import { getGlobalWeeklyRanking, getWeekStartIso, type WeeklyRankingEntry } from '../../storage/rankingStorage'
import styles from './RankingPage.module.css'

function formatWeekStart(weekStart: string): string {
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'full' }).format(new Date(weekStart))
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

function getMedal(index: number): string {
  return ['🥇', '🥈', '🥉'][index] ?? `#${index + 1}`
}

export function RankingPage() {
  const navigate = useNavigate()
  const [ranking, setRanking] = useState<WeeklyRankingEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const weekStart = useMemo(() => getWeekStartIso(), [])

  useEffect(() => {
    let isMounted = true

    getGlobalWeeklyRanking()
      .then((entries) => {
        if (isMounted) {
          setRanking(entries)
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('No se pudo cargar el ranking global.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className={styles.wrapper}>
      <div className={`panel ${styles.panel}`}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Se reinicia cada lunes 00:00</p>
            <h1 className={styles.title}>Ranking semanal</h1>
            <p className={styles.week}>Semana iniciada el {formatWeekStart(weekStart)}</p>
          </div>

          <button type="button" className="secondaryButton" onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </div>

        {isLoading ? (
          <p className={styles.empty}>Cargando ranking global…</p>
        ) : error ? (
          <p className={styles.empty}>{error}</p>
        ) : ranking.length === 0 ? (
          <p className={styles.empty}>Todavía no hay puntajes esta semana.</p>
        ) : (
          <div className={styles.list}>
            {ranking.map((entry, index) => (
              <article key={entry.playerName} className={styles.item}>
                <div className={styles.rank}>{getMedal(index)}</div>
                <div className={styles.playerInfo}>
                  <h2>{entry.playerName}</h2>
                  <p>{entry.evaluation} · {formatDate(entry.date)}</p>
                </div>
                <div className={styles.scoreBlock}>
                  <span>Puntaje</span>
                  <strong>{entry.score}</strong>
                </div>
                <ul className={styles.stats}>
                  <li>{entry.remainingPieces} ficha(s)</li>
                  <li>{entry.moves} movs.</li>
                  <li>{formatDuration(entry.durationMs)}</li>
                </ul>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
