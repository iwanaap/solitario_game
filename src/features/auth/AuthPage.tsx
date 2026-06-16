import { useMemo, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/authContext'
import styles from './AuthPage.module.css'

type AuthMode = 'signin' | 'signup'

function translateAuthError(message: string): string {
  const lowerMessage = message.toLocaleLowerCase()

  if (lowerMessage.includes('invalid login credentials')) {
    return 'Email o contraseña incorrectos.'
  }

  if (lowerMessage.includes('password')) {
    return 'La contraseña debe tener al menos 6 caracteres.'
  }

  if (lowerMessage.includes('email')) {
    return 'Revisa que el email sea válido.'
  }

  return message
}

export function AuthPage() {
  const navigate = useNavigate()
  const { isConfigured, isLoading, user, signInWithPassword, signUpWithPassword, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const title = mode === 'signin' ? 'Entrar a la máquina' : 'Crear cuenta'
  const submitLabel = mode === 'signin' ? 'Iniciar sesión' : 'Crear cuenta'
  const helperText = useMemo(() => (
    mode === 'signin'
      ? 'Guarda puntajes, reclama fichas y aparece en el ranking.'
      : 'Tu cuenta habilita fichas, desafíos diarios, avatares y ranking global.'
  ), [mode])

  if (!isLoading && user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      if (mode === 'signin') {
        await signInWithPassword(email.trim(), password)
        navigate('/')
      } else {
        await signUpWithPassword(email.trim(), password)
        setMessage('Cuenta creada. Si Supabase pide confirmación, revisa tu correo antes de entrar.')
      }
    } catch (authError) {
      setError(translateAuthError(authError instanceof Error ? authError.message : 'No se pudo completar la acción.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGoogleSignIn() {
    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      await signInWithGoogle()
    } catch (authError) {
      setError(translateAuthError(authError instanceof Error ? authError.message : 'No se pudo conectar con Google.'))
      setIsSubmitting(false)
    }
  }

  return (
    <section className={styles.wrapper}>
      <div className={`panel ${styles.panel}`}>
        <div className={styles.marquee} aria-hidden="true">
          <span>LOGIN</span>
          <span>FICHAS</span>
          <span>RANKING</span>
          <span>AVATARES</span>
        </div>

        <div className={styles.copy}>
          <p className={styles.eyebrow}>Cuenta opcional · recompensas activadas</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{helperText}</p>
        </div>

        {!isConfigured ? (
          <div className={styles.notice}>
            Supabase todavía no está configurado. Define <strong>VITE_SUPABASE_URL</strong> y{' '}
            <strong>VITE_SUPABASE_ANON_KEY</strong> para activar cuentas.
          </div>
        ) : null}

        <button
          type="button"
          className={styles.googleButton}
          onClick={handleGoogleSignIn}
          disabled={!isConfigured || isSubmitting}
        >
          <span className={styles.googleIcon}>G</span>
          Continuar con Google
        </button>

        <div className={styles.divider}><span>o usa email</span></div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="jugador@arcade.cl"
              autoComplete="email"
              required
              disabled={!isConfigured || isSubmitting}
            />
          </label>

          <label className={styles.field}>
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              minLength={6}
              required
              disabled={!isConfigured || isSubmitting}
            />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}
          {message ? <p className={styles.success}>{message}</p> : null}

          <button type="submit" className="primaryButton" disabled={!isConfigured || isSubmitting}>
            {isSubmitting ? 'Procesando…' : submitLabel}
          </button>
        </form>

        <div className={styles.switcher}>
          {mode === 'signin' ? '¿Aún no tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button type="button" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
            {mode === 'signin' ? 'Crear una' : 'Iniciar sesión'}
          </button>
        </div>

        <button type="button" className={`secondaryButton ${styles.backButton}`} onClick={() => navigate('/')}>
          Seguir jugando sin cuenta
        </button>
      </div>
    </section>
  )
}
