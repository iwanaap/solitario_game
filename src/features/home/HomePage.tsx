import { useNavigate } from 'react-router-dom'
import styles from './HomePage.module.css'

export function HomePage() {
  const navigate = useNavigate()

  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <p className={styles.kicker}>Juego de tablero clásico</p>
        <h1 className={styles.title}>El Solitario</h1>
        <p className={styles.description}>
          Salta fichas, encadena rachas y resuelve el tablero antes de quedarte sin movimientos.
        </p>

        <div className={styles.actions}>
          <button type="button" className={`primaryButton ${styles.startButton}`} onClick={() => navigate('/game')}>
            <span>Iniciar partida</span>
            <em>3 · 2 · 1 · ¡YA!</em>
          </button>
          <button type="button" className="secondaryButton" onClick={() => navigate('/history')}>
            Historial
          </button>
          <button type="button" className="secondaryButton" onClick={() => navigate('/settings')}>
            Colores
          </button>
          <button type="button" className="secondaryButton" onClick={() => navigate('/how-to-play')}>
            Cómo jugar
          </button>
        </div>
      </div>

      <div className={styles.showcase} aria-hidden="true">
        <div className={styles.boardGlow} />
        <div className={styles.miniBoard}>
          {Array.from({ length: 49 }, (_, index) => {
            const row = Math.floor(index / 7)
            const col = index % 7
            const isCorner = (row < 2 || row > 4) && (col < 2 || col > 4)
            const isCenter = row === 3 && col === 3
            const isJumpPath = (row === 3 && col >= 1 && col <= 5) || (col === 3 && row >= 1 && row <= 5)

            return (
              <span
                key={index}
                className={`${styles.slot} ${isCorner ? styles.slotHidden : ''} ${isCenter ? styles.slotEmpty : ''} ${isJumpPath ? styles.slotPath : ''}`}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
