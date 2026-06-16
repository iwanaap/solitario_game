import { notifyAccountUpdated } from './accountEvents'
import { supabaseAuth } from './supabaseAuthClient'

export type DailyChallengeType = 'play_games' | 'max_remaining_pieces' | 'finish_under_time'

export interface DailyChallengeProgress {
  challengeId: string
  challengeDate: string
  type: DailyChallengeType
  targetValue: number
  rewardChips: number
  title: string
  description: string
  progress: number
  completed: boolean
  claimed: boolean
}

interface DailyChallengeProgressRow {
  challenge_id: string
  challenge_date: string
  challenge_type: DailyChallengeType
  target_value: number
  reward_chips: number
  title: string
  description: string
  progress: number
  completed: boolean
  claimed: boolean
}

function mapChallenge(row: DailyChallengeProgressRow): DailyChallengeProgress {
  return {
    challengeId: row.challenge_id,
    challengeDate: row.challenge_date,
    type: row.challenge_type,
    targetValue: row.target_value,
    rewardChips: row.reward_chips,
    title: row.title,
    description: row.description,
    progress: row.progress,
    completed: row.completed,
    claimed: row.claimed,
  }
}

export async function getDailyChallenges(): Promise<DailyChallengeProgress[]> {
  if (!supabaseAuth) {
    return []
  }

  const { data: sessionData } = await supabaseAuth.auth.getSession()

  if (!sessionData.session) {
    return []
  }

  const { data, error } = await supabaseAuth.rpc('get_daily_challenge_progress')

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as DailyChallengeProgressRow[]).map(mapChallenge)
}

export async function claimDailyChallenge(challengeId: string): Promise<number> {
  if (!supabaseAuth) {
    throw new Error('Debes iniciar sesión para reclamar fichas.')
  }

  const { data, error } = await supabaseAuth.rpc('claim_daily_challenge', {
    p_challenge_id: challengeId,
  })

  if (error) {
    throw new Error(error.message)
  }

  notifyAccountUpdated()
  return Number(data ?? 0)
}
