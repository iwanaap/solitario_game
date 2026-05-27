import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDuration } from '../../game/core/time'
import { getRanking } from '../../storage/rankingStorage'
import styles from './RankingPage.module.css'

export function RankingPage() {
  const navigate = useNavigate()
  const ranking = useMemo(() => getRanking(), [])

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <p>Marcador local</p>
        <h1>Ranking</h1>
        <button type="button" className="secondaryButton" onClick={() => navigate('/account')}>Mi cuenta</button>
      </header>

      <div className={`panel ${styles.tableCard}`}>
        {ranking.length === 0 ? (
          <div className={styles.empty}>
            <strong>Aún no hay puntajes.</strong>
            <span>Inicia sesión, juega una partida y aparecerás aquí.</span>
          </div>
        ) : (
          <ol className={styles.list}>
            {ranking.map((entry, index) => (
              <li key={entry.id} className={styles.row}>
                <span className={styles.position}>#{index + 1}</span>
                <img src={entry.photoUrl} alt="" />
                <div className={styles.player}>
                  <strong>{entry.displayName}</strong>
                  <span>{entry.country} · {entry.outcome === 'won' ? 'Victoria' : 'Derrota'} · {formatDuration(entry.durationMs ?? 0)}</span>
                </div>
                <div className={styles.score}>
                  <strong>{entry.score}</strong>
                  <span>{entry.remainingPieces} fichas</span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}
