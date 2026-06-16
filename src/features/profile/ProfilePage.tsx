import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/authContext'
import { notifyAccountUpdated } from '../../storage/accountEvents'
import { getCurrentProfile, updateCurrentProfile, type PlayerProfile } from '../../storage/profileStorage'
import styles from './ProfilePage.module.css'

function formatBestTime(value: number | null): string {
  if (!value) {
    return '—'
  }

  const minutes = Math.floor(value / 60_000)
  const seconds = Math.floor((value % 60_000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, isLoading: isAuthLoading } = useAuth()
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const isLoading = Boolean(user && loadedUserId !== user.id)
  const winRate = useMemo(() => {
    if (!profile?.totalGames) {
      return '0%'
    }

    return `${Math.round((profile.totalWins / profile.totalGames) * 100)}%`
  }, [profile])

  useEffect(() => {
    let isMounted = true

    if (!user) {
      return undefined
    }

    getCurrentProfile()
      .then((nextProfile) => {
        if (isMounted) {
          setProfile(nextProfile)
          setLoadedUserId(user.id)
          setDisplayName(nextProfile?.displayName ?? user.email?.split('@')[0] ?? 'Jugador')
          setUsername(nextProfile?.username ?? '')
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('No se pudo cargar tu perfil.')
        }
      })

    return () => {
      isMounted = false
    }
  }, [user])

  if (!isAuthLoading && !user) {
    return <Navigate to="/auth" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    setMessage('')

    try {
      const nextProfile = await updateCurrentProfile({ displayName, username })
      setProfile(nextProfile)
      setDisplayName(nextProfile.displayName ?? '')
      setUsername(nextProfile.username ?? '')
      setMessage('Perfil actualizado.')
      notifyAccountUpdated()
    } catch (profileError) {
      setError(profileError instanceof Error ? profileError.message : 'No se pudo actualizar tu perfil.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className={styles.wrapper}>
      <div className={`panel ${styles.panel}`}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Cuenta arcade</p>
            <h1 className={styles.title}>Perfil</h1>
            <p className={styles.subtitle}>Personaliza tu nombre, revisa tus fichas y mira tus estadísticas globales.</p>
          </div>
          <button type="button" className="secondaryButton" onClick={() => navigate('/')}>
            Volver
          </button>
        </div>

        {isLoading ? (
          <p className={styles.empty}>Cargando perfil…</p>
        ) : (
          <div className={styles.content}>
            <aside className={styles.identityCard}>
              <div className={styles.avatarFrame}>
                <img src={`/avatars/${profile?.avatarId ?? 'default'}.svg`} alt="" />
              </div>
              <h2>{profile?.displayName ?? user?.email}</h2>
              <p>@{profile?.username ?? 'sin_usuario'}</p>
              <strong>🟡 {profile?.chips ?? 0} fichas</strong>
              <button type="button" className="primaryButton" onClick={() => navigate('/shop')}>
                Cambiar avatar
              </button>
            </aside>

            <div className={styles.mainColumn}>
              <form className={styles.form} onSubmit={handleSubmit}>
                <h2>Datos públicos</h2>
                <label>
                  <span>Nombre visible</span>
                  <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={24} />
                </label>
                <label>
                  <span>Usuario</span>
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="jugador_pixel"
                    maxLength={24}
                  />
                </label>
                {error ? <p className={styles.error}>{error}</p> : null}
                {message ? <p className={styles.success}>{message}</p> : null}
                <button type="submit" className="primaryButton" disabled={isSaving}>
                  {isSaving ? 'Guardando…' : 'Guardar perfil'}
                </button>
              </form>

              <div className={styles.statsGrid}>
                <article><span>Ranking</span><strong>{profile?.rankingPoints ?? 0}</strong></article>
                <article><span>Puntaje total</span><strong>{profile?.totalScore ?? 0}</strong></article>
                <article><span>Partidas</span><strong>{profile?.totalGames ?? 0}</strong></article>
                <article><span>Victorias</span><strong>{profile?.totalWins ?? 0}</strong></article>
                <article><span>Ratio victoria</span><strong>{winRate}</strong></article>
                <article><span>Perfectas</span><strong>{profile?.perfectGames ?? 0}</strong></article>
                <article><span>Mejor puntaje</span><strong>{profile?.bestScore ?? 0}</strong></article>
                <article><span>Mejor tiempo</span><strong>{formatBestTime(profile?.bestTimeMs ?? null)}</strong></article>
              </div>

              <div className={styles.quickActions}>
                <button type="button" className="secondaryButton" onClick={() => navigate('/challenges')}>Desafíos</button>
                <button type="button" className="secondaryButton" onClick={() => navigate('/ranking')}>Ranking</button>
                <button type="button" className="secondaryButton" onClick={() => navigate('/game')}>Jugar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
