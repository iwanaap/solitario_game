import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './HomePage.module.css'

const donationUrl = 'https://link.mercadopago.cl/elsolitariojuego'

export function HomePage() {
  const navigate = useNavigate()
  const [isDonationOpen, setIsDonationOpen] = useState(false)

  return (
    <section className={styles.hero}>
      <video className={styles.heroVideo} autoPlay muted loop playsInline preload="auto" aria-hidden="true">
        <source src="/fondo.mp4" type="video/mp4" />
      </video>

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
          <button type="button" className="secondaryButton" onClick={() => navigate('/ranking')}>
            Ranking semanal
          </button>
          <button type="button" className="secondaryButton" onClick={() => navigate('/settings')}>
            Colores
          </button>
          <button type="button" className="secondaryButton" onClick={() => navigate('/how-to-play')}>
            Cómo jugar
          </button>
          <button type="button" className={styles.donateButton} onClick={() => setIsDonationOpen(true)}>
            Dona! apoya este proyecto
          </button>
        </div>
      </div>

      {isDonationOpen ? (
        <div className={styles.modalBackdrop} role="presentation" onClick={() => setIsDonationOpen(false)}>
          <div
            className={styles.donationModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="donation-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.closeButton}
              aria-label="Cerrar mensaje de donación"
              onClick={() => setIsDonationOpen(false)}
            >
              ×
            </button>
            <p className={styles.modalKicker}>Apoyo al proyecto</p>
            <h2 id="donation-title" className={styles.modalTitle}>
              ¡Gracias por querer apoyar El Solitario!
            </h2>
            <p className={styles.modalText}>
              Tu donación ayuda a mantener y mejorar este juego. Puedes gestionarla de forma segura en Mercado Pago.
            </p>
            <a className={styles.donationLink} href={donationUrl} target="_blank" rel="noreferrer">
              Gestionar donación
            </a>
          </div>
        </div>
      ) : null}
    </section>
  )
}
