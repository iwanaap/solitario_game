import { supabaseAuth } from './supabaseAuthClient'

export interface PlayerProfile {
  id: string
  username: string | null
  displayName: string | null
  avatarId: string
  chips: number
  totalScore: number
  totalGames: number
  totalWins: number
  perfectGames: number
  bestScore: number
  bestRemainingPieces: number | null
  bestTimeMs: number | null
  rankingPoints: number
}

interface ProfileRow {
  id: string
  username: string | null
  display_name: string | null
  avatar_id: string
  chips: number
  total_score: number
  total_games: number
  total_wins: number
  perfect_games: number
  best_score: number
  best_remaining_pieces: number | null
  best_time_ms: number | null
  ranking_points: number
}

function mapProfile(row: ProfileRow): PlayerProfile {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatarId: row.avatar_id,
    chips: row.chips,
    totalScore: row.total_score,
    totalGames: row.total_games,
    totalWins: row.total_wins,
    perfectGames: row.perfect_games,
    bestScore: row.best_score,
    bestRemainingPieces: row.best_remaining_pieces,
    bestTimeMs: row.best_time_ms,
    rankingPoints: row.ranking_points,
  }
}

export async function updateCurrentProfile(input: { displayName: string; username: string }): Promise<PlayerProfile> {
  if (!supabaseAuth) {
    throw new Error('Debes iniciar sesión para actualizar tu perfil.')
  }

  const { data: sessionData } = await supabaseAuth.auth.getSession()
  const user = sessionData.session?.user

  if (!user) {
    throw new Error('Debes iniciar sesión para actualizar tu perfil.')
  }

  const displayName = input.displayName.trim().replace(/\s+/g, ' ')
  const username = input.username.trim().toLocaleLowerCase().replace(/[^a-z0-9_]/g, '')

  if (displayName.length < 2) {
    throw new Error('El nombre visible debe tener al menos 2 caracteres.')
  }

  if (username.length < 3) {
    throw new Error('El usuario debe tener al menos 3 caracteres. Usa letras, números o _.')
  }

  const { data, error } = await supabaseAuth.rpc('update_profile_basics', {
    p_display_name: displayName,
    p_username: username,
  })

  if (error) {
    if (error.code === '23505') {
      throw new Error('Ese usuario ya existe. Elige otro.')
    }

    throw new Error(error.message)
  }

  return mapProfile(data as ProfileRow)
}

export async function getCurrentProfile(): Promise<PlayerProfile | null> {
  if (!supabaseAuth) {
    return null
  }

  const { data: sessionData } = await supabaseAuth.auth.getSession()
  const user = sessionData.session?.user

  if (!user) {
    return null
  }

  const { data, error } = await supabaseAuth
    .from('profiles')
    .select('id,username,display_name,avatar_id,chips,total_score,total_games,total_wins,perfect_games,best_score,best_remaining_pieces,best_time_ms,ranking_points')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapProfile(data) : null
}
