import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/authContext'
import { buyAvatar, equipAvatar, getAvatarCatalog, type AvatarCatalogItem } from '../../storage/avatarStorage'
import { getCurrentProfile, type PlayerProfile } from '../../storage/profileStorage'
import styles from './ShopPage.module.css'

function getRarityLabel(rarity: string): string {
  switch (rarity) {
    case 'common':
      return 'Común'
    case 'rare':
      return 'Raro'
    case 'epic':
      return 'Épico'
    case 'legendary':
      return 'Legendario'
    default:
      return rarity
  }
}

export function ShopPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [avatars, setAvatars] = useState<AvatarCatalogItem[]>([])
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null)
  const [busyAvatarId, setBusyAvatarId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const isLoading = Boolean(user && loadedUserId !== user.id)
  const ownedCount = useMemo(() => avatars.filter((avatar) => avatar.owned).length, [avatars])

  async function refreshCatalog(userId = user?.id) {
    if (!userId) {
      return
    }

    const [nextAvatars, nextProfile] = await Promise.all([getAvatarCatalog(), getCurrentProfile()])
    setAvatars(nextAvatars)
    setProfile(nextProfile)
    setLoadedUserId(userId)
  }

  useEffect(() => {
    let isMounted = true

    if (!user) {
      return undefined
    }

    Promise.all([getAvatarCatalog(), getCurrentProfile()])
      .then(([nextAvatars, nextProfile]) => {
        if (isMounted) {
          setAvatars(nextAvatars)
          setProfile(nextProfile)
          setLoadedUserId(user.id)
          setError('')
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('No se pudo cargar la tienda de avatares.')
        }
      })

    return () => {
      isMounted = false
    }
  }, [user])

  async function handleBuy(avatar: AvatarCatalogItem) {
    setBusyAvatarId(avatar.id)
    setError('')
    setMessage('')

    try {
      await buyAvatar(avatar.id)
      await refreshCatalog()
      setMessage(`Compraste ${avatar.name}.`)
    } catch (buyError) {
      setError(buyError instanceof Error ? buyError.message : 'No se pudo comprar el avatar.')
    } finally {
      setBusyAvatarId(null)
    }
  }

  async function handleEquip(avatar: AvatarCatalogItem) {
    setBusyAvatarId(avatar.id)
    setError('')
    setMessage('')

    try {
      await equipAvatar(avatar.id)
      await refreshCatalog()
      setMessage(`${avatar.name} equipado.`)
    } catch (equipError) {
      setError(equipError instanceof Error ? equipError.message : 'No se pudo equipar el avatar.')
    } finally {
      setBusyAvatarId(null)
    }
  }

  return (
    <section className={styles.wrapper}>
      <div className={`panel ${styles.panel}`}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Pixel art · inventario</p>
            <h1 className={styles.title}>Tienda de avatares</h1>
            <p className={styles.subtitle}>Compra personajes con fichas y equipa el que aparecerá en rankings.</p>
          </div>
          <button type="button" className="secondaryButton" onClick={() => navigate('/')}>
            Volver
          </button>
        </div>

        {!user ? (
          <div className={styles.loginBox}>
            <strong>Necesitas cuenta para usar la tienda.</strong>
            <p>Las fichas, compras y avatares equipados se guardan en tu cuenta.</p>
            <button type="button" className="primaryButton" onClick={() => navigate('/auth')}>
              Entrar / crear cuenta
            </button>
          </div>
        ) : isLoading ? (
          <p className={styles.empty}>Cargando tienda…</p>
        ) : error && avatars.length === 0 ? (
          <p className={styles.empty}>{error}</p>
        ) : (
          <>
            <div className={styles.summary}>
              <article>
                <span>Fichas</span>
                <strong>{profile?.chips ?? 0}</strong>
              </article>
              <article>
                <span>Inventario</span>
                <strong>{ownedCount}/{avatars.length}</strong>
              </article>
            </div>

            {error ? <p className={styles.error}>{error}</p> : null}
            {message ? <p className={styles.success}>{message}</p> : null}

            <div className={styles.grid}>
              {avatars.map((avatar) => {
                const canAfford = (profile?.chips ?? 0) >= avatar.priceChips
                const isBusy = busyAvatarId === avatar.id

                return (
                  <article key={avatar.id} className={`${styles.card} ${avatar.equipped ? styles.equippedCard : ''}`}>
                    <div className={styles.avatarFrame}>
                      <img src={avatar.imagePath} alt="" />
                    </div>
                    <div className={styles.cardBody}>
                      <p className={styles.rarity}>{getRarityLabel(avatar.rarity)}</p>
                      <h2>{avatar.name}</h2>
                      <p className={styles.price}>{avatar.priceChips === 0 ? 'Gratis' : `${avatar.priceChips} fichas`}</p>
                    </div>
                    {avatar.equipped ? (
                      <button type="button" className="secondaryButton" disabled>
                        Equipado
                      </button>
                    ) : avatar.owned ? (
                      <button type="button" className="primaryButton" onClick={() => void handleEquip(avatar)} disabled={isBusy}>
                        {isBusy ? 'Equipando…' : 'Equipar'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={canAfford ? 'primaryButton' : 'secondaryButton'}
                        onClick={() => void handleBuy(avatar)}
                        disabled={!canAfford || isBusy}
                      >
                        {isBusy ? 'Comprando…' : canAfford ? 'Comprar' : 'Faltan fichas'}
                      </button>
                    )}
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
