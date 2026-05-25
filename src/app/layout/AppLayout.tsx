import { Outlet } from 'react-router-dom'
import styles from './AppLayout.module.css'

export function AppLayout() {
  return (
    <div className={styles.pageShell}>
      <div className={styles.pageContent}>
        <Outlet />
      </div>
    </div>
  )
}
