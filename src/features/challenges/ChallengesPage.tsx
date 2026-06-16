import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/authContext'
import {
  claimDailyChallenge,
  getDailyChallenges,
  type DailyChallengeProgress,
} from '../../storage/challengesStorage'
import styles from './ChallengesPage.module.css'

function getChallengeIcon(type: DailyChallengeProgress['type']): string {
  switch (type) {
    case 'play_games':
      return '🕹️'
    case 'max_remaining_pieces':
      return '🏁'
    case 'finish_under_time':
      return '⏱️'
    default:
      return '⭐'
  }
}

function getProgressLabel(challenge: DailyChallengeProgress): string {
  if (challenge.type === 'max_remaining_pieces') {
    return challenge.completed ? `Logrado: ${challenge.progress} ficha(s)` : `Meta: ${challenge.targetValue} ficha(s) o menos`
  }

  if (challenge.type === 'finish_under_time') {
    return challenge.completed ? 'Tiempo logrado' : `Meta: menos de ${Math.round(challenge.targetValue / 60)} min`
  }

  return `${Math.min(challenge.progress, challenge.targetValue)} / ${challenge.targetValue}`
}

export function ChallengesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [challenges, setChallenges] = useState<DailyChallengeProgress[]>([])
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null)
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const isLoading = Boolean(user && loadedUserId !== user.id)
  const completedCount = useMemo(
    () => challenges.filter((challenge) => challenge.completed).length,
    [challenges],
  )
  const totalRewards = useMemo(
    () => challenges.reduce((total, challenge) => total + (challenge.claimed ? challenge.rewardChips : 0), 0),
    [challenges],
  )

  useEffect(() => {
    let isMounted = true

    if (!user) {
      return undefined
    }

    getDailyChallenges()
      .then((nextChallenges) => {
        if (isMounted) {
          setChallenges(nextChallenges)
          setLoadedUserId(user.id)
          setError('')
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('No se pudieron cargar los desafíos diarios.')
        }
      })

    return () => {
      isMounted = false
    }
  }, [user])

  async function handleClaim(challengeId: string) {
    setClaimingId(challengeId)
    setError('')
    setMessage('')

    try {
      const reward = await claimDailyChallenge(challengeId)
      const nextChallenges = await getDailyChallenges()
      setChallenges(nextChallenges)
      setMessage(`¡Recompensa reclamada! +${reward} fichas.`)
    } catch (claimError) {
      setError(claimError instanceof Error ? claimError.message : 'No se pudo reclamar la recompensa.')
    } finally {
      setClaimingId(null)
    }
  }

  return (
    <section className={styles.wrapper}>
      <div className={`panel ${styles.panel}`}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Se reinician todos los días</p>
            <h1 className={styles.title}>Desafíos diarios</h1>
            <p className={styles.subtitle}>Completa misiones, reclama fichas y prepara tu próxima compra pixel art.</p>
          </div>
          <button type="button" className="secondaryButton" onClick={() => navigate('/')}>
            Volver
          </button>
        </div>

        {!user ? (
          <div className={styles.loginBox}>
            <strong>Necesitas cuenta para ganar recompensas.</strong>
            <p>Puedes jugar sin cuenta, pero los desafíos y fichas se guardan solo al iniciar sesión.</p>
            <button type="button" className="primaryButton" onClick={() => navigate('/auth')}>
              Entrar / crear cuenta
            </button>
          </div>
        ) : isLoading ? (
          <p className={styles.empty}>Cargando desafíos…</p>
        ) : error && challenges.length === 0 ? (
          <p className={styles.empty}>{error}</p>
        ) : (
          <>
            <div className={styles.summary}>
              <article>
                <span>Completados</span>
                <strong>{completedCount}/{challenges.length}</strong>
              </article>
              <article>
                <span>Fichas reclamadas</span>
                <strong>{totalRewards}</strong>
              </article>
            </div>

            {error ? <p className={styles.error}>{error}</p> : null}
            {message ? <p className={styles.success}>{message}</p> : null}

            <div className={styles.grid}>
              {challenges.map((challenge) => {
                const progressPercent = challenge.type === 'play_games'
                  ? Math.min(100, (challenge.progress / challenge.targetValue) * 100)
                  : challenge.completed
                    ? 100
                    : 0

                return (
                  <article key={challenge.challengeId} className={styles.card}>
                    <div className={styles.cardTop}>
                      <div className={styles.icon}>{getChallengeIcon(challenge.type)}</div>
                      <div className={styles.reward}>+{challenge.rewardChips} fichas</div>
                    </div>
                    <h2>{challenge.title}</h2>
                    <p>{challenge.description}</p>
                    <div className={styles.progressTrack} aria-label={getProgressLabel(challenge)}>
                      <span style={{ width: `${progressPercent}%` }} />
                    </div>
                    <div className={styles.progressLabel}>{getProgressLabel(challenge)}</div>
                    <button
                      type="button"
                      className={challenge.completed && !challenge.claimed ? 'primaryButton' : 'secondaryButton'}
                      onClick={() => void handleClaim(challenge.challengeId)}
                      disabled={!challenge.completed || challenge.claimed || claimingId === challenge.challengeId}
                    >
                      {challenge.claimed ? 'Reclamado' : claimingId === challenge.challengeId ? 'Reclamando…' : 'Reclamar'}
                    </button>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
