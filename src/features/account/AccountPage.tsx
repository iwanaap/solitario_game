import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  confirmPasswordResetCode,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordResetCode,
  updateCurrentUser,
  type UserProfile,
} from '../../storage/authStorage'
import styles from './AccountPage.module.css'

const DEFAULT_AVATARS = [
  'https://api.dicebear.com/8.x/pixel-art/svg?seed=solitario-player',
  'https://api.dicebear.com/8.x/pixel-art/svg?seed=retro-chip',
  'https://api.dicebear.com/8.x/pixel-art/svg?seed=gold-piece',
  'https://api.dicebear.com/8.x/pixel-art/svg?seed=blue-board',
  'https://api.dicebear.com/8.x/pixel-art/svg?seed=arcade-hero',
  'https://api.dicebear.com/8.x/pixel-art/svg?seed=peg-master',
] as const
const DEFAULT_AVATAR = DEFAULT_AVATARS[0]
const COUNTRY_OPTIONS = [
  'Argentina',
  'Bolivia',
  'Brasil',
  'Canadá',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Cuba',
  'Ecuador',
  'El Salvador',
  'España',
  'Estados Unidos',
  'Guatemala',
  'Honduras',
  'México',
  'Nicaragua',
  'Panamá',
  'Paraguay',
  'Perú',
  'Puerto Rico',
  'República Dominicana',
  'Uruguay',
  'Venezuela',
] as const

export function AccountPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<UserProfile | null>(() => getCurrentUser())
  const [mode, setMode] = useState<'login' | 'register' | 'recover'>('login')
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState(() => getCurrentUser()?.displayName ?? '')
  const [photoUrl, setPhotoUrl] = useState<string>(() => getCurrentUser()?.photoUrl ?? DEFAULT_AVATAR)
  const [country, setCountry] = useState(() => getCurrentUser()?.country ?? '')
  const [resetCode, setResetCode] = useState('')
  const [resetCodeSent, setResetCodeSent] = useState(false)
  const [demoResetCode, setDemoResetCode] = useState('')
  const [showSavedPopup, setShowSavedPopup] = useState(false)


  const handleAuthSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    try {
      if (mode === 'recover') {
        if (!resetCodeSent) {
          const code = requestPasswordResetCode(email)
          setDemoResetCode(code)
          setResetCodeSent(true)
          return
        }

        confirmPasswordResetCode(email, resetCode, password)
        setShowSavedPopup(true)
        window.setTimeout(() => {
          setShowSavedPopup(false)
          setMode('login')
          setPassword('')
          setResetCode('')
          setResetCodeSent(false)
          setDemoResetCode('')
        }, 1200)
        return
      }

      const nextUser = mode === 'register'
        ? registerUser(email, password, displayName, photoUrl || DEFAULT_AVATAR, country)
        : loginUser(email, password)

      setUser(nextUser)
      setDisplayName(nextUser.displayName)
      setPhotoUrl(nextUser.photoUrl)
      setCountry(nextUser.country)
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'No se pudo completar la operación.')
    }
  }

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const updatedUser = updateCurrentUser({
      displayName: user?.displayName ?? displayName,
      photoUrl: photoUrl || DEFAULT_AVATAR,
      country: user?.country ?? country,
    })

    if (updatedUser) {
      setUser(updatedUser)
      setDisplayName(updatedUser.displayName)
      setPhotoUrl(updatedUser.photoUrl)
      setCountry(updatedUser.country)
      setError('')
      setShowSavedPopup(true)
      window.setTimeout(() => {
        navigate('/')
      }, 1200)
    }
  }

  const handleLogout = () => {
    logoutUser()
    setUser(null)
    setEmail('')
    setPassword('')
    setDisplayName('')
    setPhotoUrl(DEFAULT_AVATAR)
    setCountry('')
  }

  return (
    <section className={styles.page}>
      {user ? (
        <div className={`panel ${styles.profileGrid}`}>
          <div className={styles.avatarPanel}>
            <img src={user.photoUrl} alt="Avatar del jugador" />
            <strong>{user.displayName}</strong>
            <span>{user.email}</span>
            <em>{user.country}</em>
          </div>

          <form className={styles.form} onSubmit={handleProfileSubmit}>
            <div className={styles.lockedFields}>
              <p>
                <span>Nombre visible</span>
                <strong>{user.displayName}</strong>
              </p>
              <p>
                <span>País</span>
                <strong>{user.country}</strong>
              </p>
              <small>Estos datos quedan fijos después de crear la cuenta.</small>
            </div>
            <fieldset className={styles.avatarPicker}>
              <legend>Avatar</legend>
              <div className={styles.avatarOptions}>
                {DEFAULT_AVATARS.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    className={photoUrl === avatar ? styles.selectedAvatar : ''}
                    onClick={() => setPhotoUrl(avatar)}
                    aria-label="Elegir avatar predeterminado"
                  >
                    <img src={avatar} alt="" />
                  </button>
                ))}
              </div>
            </fieldset>
            <div className={styles.actions}>
              <button type="submit" className="primaryButton">Guardar perfil</button>
              <button type="button" className="secondaryButton" onClick={() => navigate('/ranking')}>Ver ranking</button>
              <button type="button" className="secondaryButton" onClick={() => navigate('/')}>Inicio</button>
              <button type="button" className="secondaryButton" onClick={handleLogout}>Cerrar sesión</button>
            </div>
          </form>
        </div>
      ) : (
        <div className={`panel ${styles.authCard}`}>
          <div className={styles.switcher}>
            <button type="button" className={mode === 'login' ? styles.active : ''} onClick={() => setMode('login')}>Iniciar</button>
            <button type="button" className={mode === 'register' ? styles.active : ''} onClick={() => setMode('register')}>Crear usuario</button>
          </div>

          <form className={styles.form} onSubmit={handleAuthSubmit}>
            {mode === 'recover' ? (
              <p className={styles.helpText}>
                {resetCodeSent
                  ? 'Ingresa el código recibido y tu nueva contraseña.'
                  : 'Ingresa tu email. En producción enviaremos un enlace/código por correo para recuperar el acceso.'}
              </p>
            ) : null}
            {mode === 'recover' && demoResetCode ? (
              <p className={styles.demoCode}>Código demo: <strong>{demoResetCode}</strong></p>
            ) : null}
            {mode === 'register' ? (
              <>
                <label>
                  Nombre visible
                  <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required />
                </label>
                <label>
                  País
                  <input list="country-options" value={country} onChange={(event) => setCountry(event.target.value)} placeholder="Escribe tu país" required />
                  <datalist id="country-options">
                    {COUNTRY_OPTIONS.map((countryOption) => (
                      <option key={countryOption} value={countryOption} />
                    ))}
                  </datalist>
                </label>
                <fieldset className={styles.avatarPicker}>
                  <legend>Avatar</legend>
                  <div className={styles.avatarOptions}>
                    {DEFAULT_AVATARS.map((avatar) => (
                      <button
                        key={avatar}
                        type="button"
                        className={photoUrl === avatar ? styles.selectedAvatar : ''}
                        onClick={() => setPhotoUrl(avatar)}
                        aria-label="Elegir avatar predeterminado"
                      >
                        <img src={avatar} alt="" />
                      </button>
                    ))}
                  </div>
                </fieldset>
              </>
            ) : null}
            <label>
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            {mode === 'recover' && resetCodeSent ? (
              <label>
                Código de recuperación
                <input value={resetCode} onChange={(event) => setResetCode(event.target.value)} inputMode="numeric" required />
              </label>
            ) : null}
            {mode !== 'recover' || resetCodeSent ? (
              <label>
                {mode === 'recover' ? 'Nueva contraseña' : 'Contraseña'}
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={4} />
              </label>
            ) : null}
            {error ? <p className={styles.error}>{error}</p> : null}
            <button type="submit" className="primaryButton">
              {mode === 'register' ? 'Crear cuenta' : mode === 'recover' ? resetCodeSent ? 'Guardar nueva clave' : 'Enviar código' : 'Entrar'}
            </button>
            {mode === 'login' ? (
              <button type="button" className={styles.recoverButton} onClick={() => setMode('recover')}>
                Olvidé mi contraseña
              </button>
            ) : (
              <button type="button" className={styles.recoverButton} onClick={() => {
                setMode('login')
                setResetCodeSent(false)
                setResetCode('')
                setDemoResetCode('')
              }}>
                Volver a iniciar sesión
              </button>
            )}

          </form>
        </div>
      )}

      {showSavedPopup ? (
        <div className={styles.savedOverlay} role="status" aria-live="polite">
          <div className={`panel ${styles.savedPopup}`}>
            <span>✅</span>
            <strong>{mode === 'recover' ? 'Contraseña actualizada' : 'Información guardada'}</strong>
            <small>{mode === 'recover' ? 'Ya puedes iniciar sesión…' : 'Volviendo al inicio…'}</small>
          </div>
        </div>
      ) : null}
    </section>
  )
}
