import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/authContext'
import { ACCOUNT_UPDATED_EVENT } from '../../storage/accountEvents'
import { getCurrentProfile, type PlayerProfile } from '../../storage/profileStorage'
import styles from './AppLayout.module.css'

export function AppLayout() {
  const navigate = useNavigate()
  const { isLoading, user, signOut } = useAuth()
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const metadataName = typeof user?.user_metadata.name === 'string' ? user.user_metadata.name : undefined
  const userLabel = user ? profile?.displayName ?? profile?.username ?? user.email ?? metadataName : undefined
  const chipCount = user ? profile?.chips ?? 0 : 0

  useEffect(() => {
    let isMounted = true

    if (!user) {
      return undefined
    }

    const loadProfile = () => {
      getCurrentProfile()
        .then((nextProfile) => {
          if (isMounted) {
            setProfile(nextProfile)
          }
        })
        .catch(() => {
          if (isMounted) {
            setProfile(null)
          }
        })
    }

    loadProfile()
    window.addEventListener(ACCOUNT_UPDATED_EVENT, loadProfile)

    return () => {
      isMounted = false
      window.removeEventListener(ACCOUNT_UPDATED_EVENT, loadProfile)
    }
  }, [user])

  return (
    <div className={styles.pageShell}>
      <header className={styles.accountBar}>
        <button type="button" className={styles.brandButton} onClick={() => navigate('/')}>
          El Solitario
        </button>
        <div className={styles.accountActions}>
          {isLoading ? (
            <span className={styles.accountStatus}>Cargando cuenta…</span>
          ) : user ? (
            <>
              <button type="button" className={styles.profileButton} onClick={() => navigate('/profile')}>
                <img src={`/avatars/${profile?.avatarId ?? 'default'}.svg`} alt="" />
                <span>🟡 {chipCount} fichas · {userLabel}</span>
              </button>
              <button type="button" className={styles.accountButton} onClick={() => void signOut()}>
                Salir
              </button>
            </>
          ) : (
            <>
              <span className={styles.accountStatus}>Invitado · sin ranking ni fichas</span>
              <button type="button" className={styles.accountButton} onClick={() => navigate('/auth')}>
                Entrar
              </button>
            </>
          )}
        </div>
      </header>
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
