import { type CSSProperties, type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type BoardTheme } from '../../game/types/theme.types'
import { getBoardTheme, resetBoardTheme, saveBoardTheme } from '../../storage/themeStorage'
import styles from './SettingsPage.module.css'

const COLOR_FIELDS: Array<{ key: keyof BoardTheme; label: string }> = [
  { key: 'boardPrimary', label: 'Tablero principal' },
  { key: 'boardSecondary', label: 'Tablero secundario' },
  { key: 'boardLine', label: 'Borde del tablero' },
  { key: 'slotRim', label: 'Anillo de casilla' },
  { key: 'slotCore', label: 'Centro de casilla' },
  { key: 'pieceBase', label: 'Ficha exterior' },
  { key: 'pieceInner', label: 'Ficha interior' },
  { key: 'selectedPiece', label: 'Ficha seleccionada' },
  { key: 'selectedInner', label: 'Interior seleccionado' },
  { key: 'validMove', label: 'Movimiento válido' },
]

export function SettingsPage() {
  const navigate = useNavigate()
  const [theme, setTheme] = useState<BoardTheme>(() => getBoardTheme())
  const [saved, setSaved] = useState(false)

  const updateColor = (key: keyof BoardTheme, value: string) => {
    setSaved(false)
    setTheme((currentTheme) => ({ ...currentTheme, [key]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    saveBoardTheme(theme)
    setSaved(true)
  }

  const handleReset = () => {
    setTheme(resetBoardTheme())
    setSaved(true)
  }

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <p>Laboratorio visual</p>
        <h1>Colores del tablero</h1>
        <span>Personaliza fichas, tablero y resaltados. Se aplica en la próxima partida o reinicio del tablero.</span>
        <button type="button" className={`secondaryButton ${styles.homeButton}`} onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </header>

      <div className={styles.contentGrid}>
        <form className={`panel ${styles.form}`} onSubmit={handleSubmit}>
          {COLOR_FIELDS.map((field) => (
            <label key={field.key}>
              <span>{field.label}</span>
              <input type="color" value={theme[field.key]} onChange={(event) => updateColor(field.key, event.target.value)} />
            </label>
          ))}
          <div className={styles.actions}>
            <button type="submit" className="primaryButton">Guardar colores</button>
            <button type="button" className="secondaryButton" onClick={handleReset}>Restaurar</button>
          </div>
          {saved ? <p className={styles.saved}>Configuración guardada.</p> : null}
        </form>

        <div className={`panel ${styles.preview}`}>
          <div className={styles.boardPreview} style={{ '--board-a': theme.boardPrimary, '--board-b': theme.boardSecondary, '--line': theme.boardLine } as CSSProperties}>
            <span className={styles.slot} style={{ '--rim': theme.slotRim, '--core': theme.slotCore } as CSSProperties}>
              <i style={{ '--piece': theme.pieceBase, '--inner': theme.pieceInner } as CSSProperties} />
            </span>
            <span className={styles.slot} style={{ '--rim': theme.validMove, '--core': theme.slotCore } as CSSProperties} />
            <span className={styles.slot} style={{ '--rim': theme.slotRim, '--core': theme.slotCore } as CSSProperties}>
              <i style={{ '--piece': theme.selectedPiece, '--inner': theme.selectedInner } as CSSProperties} />
            </span>
          </div>
          <small>Vista previa rápida</small>
        </div>
      </div>
    </section>
  )
}
