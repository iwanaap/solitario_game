import { useNavigate } from 'react-router-dom'
import styles from './HowToPlayPage.module.css'

const RULES = [
  'El tablero comienza con 32 fichas y el centro vacío.',
  'Cada movimiento salta sobre una ficha vecina y cae en un hueco vacío.',
  'Solo puedes saltar en horizontal o vertical.',
  'La ficha saltada desaparece del tablero.',
  'La partida termina cuando ya no existen movimientos válidos.',
]

export function HowToPlayPage() {
  const navigate = useNavigate()

  return (
    <section className={styles.wrapper}>
      <div className="panel">
        <p className={styles.eyebrow}>Guía rápida</p>
        <h1 className={styles.title}>Cómo jugar</h1>
        <p className={styles.description}>
          Selecciona una ficha amarilla y muévela dos espacios para saltar sobre otra ficha.
          No se permiten diagonales.
        </p>

        <div className={styles.example} aria-label="Ejemplo visual de salto">
          <div className={styles.piece} />
          <div className={styles.piece} />
          <div className={styles.empty} />
        </div>
        <p className={styles.helper}>Ejemplo: ficha → salta sobre ficha → cae en espacio vacío.</p>

        <ul className={styles.list}>
          {RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>

        <div className={styles.actions}>
          <button type="button" className="primaryButton" onClick={() => navigate('/game')}>
            Probar ahora
          </button>
          <button type="button" className="secondaryButton" onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </div>
      </div>
    </section>
  )
}
