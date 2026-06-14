import { Outlet } from 'react-router-dom'
import styles from './AppLayout.module.css'

export function AppLayout() {
  return (
    <div className={styles.pageShell}>
      <div className={styles.pageContent}>
        <Outlet />
      </div>
      <footer className={styles.footer}>
        Creado por{' '}
        <a href="https://l-lab.cl" target="_blank" rel="noreferrer">
          l-lab.cl
        </a>{' '}
        2026 - Desarrollo web y Aplicaciones a Medida
      </footer>
    </div>
  )
}
