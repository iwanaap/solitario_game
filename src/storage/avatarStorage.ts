import { notifyAccountUpdated } from './accountEvents'
import { supabaseAuth } from './supabaseAuthClient'

export interface AvatarCatalogItem {
  id: string
  name: string
  priceChips: number
  imagePath: string
  rarity: string
  owned: boolean
  equipped: boolean
}

interface AvatarCatalogRow {
  id: string
  name: string
  price_chips: number
  image_path: string
  rarity: string
  owned: boolean
  equipped: boolean
}

function mapAvatar(row: AvatarCatalogRow): AvatarCatalogItem {
  return {
    id: row.id,
    name: row.name,
    priceChips: row.price_chips,
    imagePath: row.image_path,
    rarity: row.rarity,
    owned: row.owned,
    equipped: row.equipped,
  }
}

export async function getAvatarCatalog(): Promise<AvatarCatalogItem[]> {
  if (!supabaseAuth) {
    return []
  }

  const { data: sessionData } = await supabaseAuth.auth.getSession()

  if (!sessionData.session) {
    return []
  }

  const { data, error } = await supabaseAuth.rpc('get_avatar_catalog')

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as AvatarCatalogRow[]).map(mapAvatar)
}

export async function buyAvatar(avatarId: string): Promise<void> {
  if (!supabaseAuth) {
    throw new Error('Debes iniciar sesión para comprar avatares.')
  }

  const { error } = await supabaseAuth.rpc('buy_avatar', { p_avatar_id: avatarId })

  if (error) {
    throw new Error(error.message)
  }

  notifyAccountUpdated()
}

export async function equipAvatar(avatarId: string): Promise<void> {
  if (!supabaseAuth) {
    throw new Error('Debes iniciar sesión para equipar avatares.')
  }

  const { error } = await supabaseAuth.rpc('equip_avatar', { p_avatar_id: avatarId })

  if (error) {
    throw new Error(error.message)
  }

  notifyAccountUpdated()
}
