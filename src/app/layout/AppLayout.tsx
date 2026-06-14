import { Outlet } from 'react-router-dom'
import styles from './AppLayout.module.css'

export function AppLayout() {
  return (
    <div className={styles.pageShell}>
      <div className={styles.pageContent}>
        <Outlet />
      </div>
      <footer className={styles.footer}>
        <span>
          Creado por{' '}
          <a href="https://l-lab.cl" target="_blank" rel="noreferrer">
            l-lab.cl
          </a>{' '}
          2026 - Desarrollo web y Aplicaciones a Medida
        </span>
        <span className={styles.footerLinks}>
          <a href="https://www.instagram.com/l.lab.cl" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <span aria-hidden="true">·</span>
          <a href="https://github.com/iwanaap/solitario_game" target="_blank" rel="noreferrer">
            Repositorio en GitHub
          </a>
        </span>
      </footer>
    </div>
  )
}
