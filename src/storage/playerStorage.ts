import { SupabaseRequestError, isSupabaseConfigured, supabaseRequest } from './supabaseClient'

const CURRENT_PLAYER_KEY = 'el-solitario-current-player'
const CURRENT_PLAYER_ID_KEY = 'el-solitario-current-player-id'
const PLAYERS_KEY = 'el-solitario-players'

interface PlayerRow {
  id: string
  name: string
}

export interface CurrentPlayer {
  id?: string
  name: string
}

export function normalizePlayerName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

export function getCurrentPlayer(): CurrentPlayer | null {
  const playerName = localStorage.getItem(CURRENT_PLAYER_KEY)

  if (!playerName) {
    return null
  }

  return {
    id: localStorage.getItem(CURRENT_PLAYER_ID_KEY) ?? undefined,
    name: normalizePlayerName(playerName),
  }
}

export function getCurrentPlayerName(): string | null {
  const currentPlayer = getCurrentPlayer()

  if (!currentPlayer) {
    return null
  }

  if (isSupabaseConfigured() && !currentPlayer.id) {
    return null
  }

  return currentPlayer.name
}

export function getCurrentPlayerId(): string | null {
  return getCurrentPlayer()?.id ?? null
}

export function getRegisteredPlayerNames(): string[] {
  const rawPlayers = localStorage.getItem(PLAYERS_KEY)

  if (!rawPlayers) {
    return []
  }

  try {
    const parsedPlayers = JSON.parse(rawPlayers) as string[]
    return Array.isArray(parsedPlayers) ? parsedPlayers.map(normalizePlayerName).filter(Boolean) : []
  } catch {
    return []
  }
}

function saveCurrentPlayer(player: CurrentPlayer): void {
  localStorage.setItem(CURRENT_PLAYER_KEY, player.name)

  if (player.id) {
    localStorage.setItem(CURRENT_PLAYER_ID_KEY, player.id)
  }
}

function registerLocalPlayerName(name: string): string {
  const playerName = normalizePlayerName(name)

  if (playerName.length < 2) {
    throw new Error('Ingresa un nombre de al menos 2 caracteres.')
  }

  const registeredPlayers = getRegisteredPlayerNames()
  const alreadyExists = registeredPlayers.some(
    (registeredName) => registeredName.toLocaleLowerCase() === playerName.toLocaleLowerCase(),
  )

  if (alreadyExists) {
    throw new Error('Ese nombre ya existe. Elige otro.')
  }

  const nextPlayers = [...registeredPlayers, playerName]
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(nextPlayers))
  saveCurrentPlayer({ name: playerName })

  return playerName
}

export async function registerPlayer(name: string): Promise<CurrentPlayer> {
  const playerName = normalizePlayerName(name)

  if (playerName.length < 2) {
    throw new Error('Ingresa un nombre de al menos 2 caracteres.')
  }

  if (!isSupabaseConfigured()) {
    return { name: registerLocalPlayerName(playerName) }
  }

  try {
    const existingPlayers = await supabaseRequest<PlayerRow[]>(`players?select=id,name&name=ilike.${encodeURIComponent(playerName)}`)

    if (existingPlayers.length > 0) {
      throw new Error('Ese nombre ya existe. Elige otro.')
    }

    const [createdPlayer] = await supabaseRequest<PlayerRow[]>('players?select=id,name', {
      method: 'POST',
      body: { name: playerName },
      prefer: 'return=representation',
    })

    const player = { id: createdPlayer.id, name: createdPlayer.name }
    saveCurrentPlayer(player)
    return player
  } catch (error) {
    if (error instanceof Error && error.message === 'Ese nombre ya existe. Elige otro.') {
      throw error
    }

    if (error instanceof SupabaseRequestError && error.code === '23505') {
      throw new Error('Ese nombre ya existe. Elige otro.', { cause: error })
    }

    throw new Error('No se pudo registrar el nombre. Revisa la conexión e intenta de nuevo.', { cause: error })
  }
}

export function registerPlayerName(name: string): string {
  return registerLocalPlayerName(name)
}
