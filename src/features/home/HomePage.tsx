import { useNavigate } from 'react-router-dom'
import styles from './HomePage.module.css'

export function HomePage() {
  const navigate = useNavigate()

  return (
    <section className={styles.hero}>
      <p className={styles.kicker}>Juego de tablero clásico</p>
      <h1 className={styles.title}>El Solitario</h1>
      <p className={styles.description}>
        Salta fichas en horizontal o vertical y trata de terminar con una sola pieza en el centro.
      </p>

      <div className={styles.actions}>
        <button type="button" className="primaryButton" onClick={() => navigate('/game')}>
          Iniciar partida
        </button>
        <button type="button" className="secondaryButton" onClick={() => navigate('/history')}>
          Historial
        </button>
        <button type="button" className="secondaryButton" onClick={() => navigate('/how-to-play')}>
          Cómo jugar
        </button>
      </div>
    </section>
  )
}
