import type { GameResult } from '../game/types/game.types'
import { supabaseAuth } from './supabaseAuthClient'

interface RegisterGameResultPayload {
  p_score: number
  p_remaining_pieces: number
  p_moves: number
  p_duration_ms: number
  p_evaluation: string
  p_perfect: boolean
  p_outcome: string
  p_played_at: string
}

export function getRankingPointsAwarded(result: GameResult): number {
  const participationPoints = 25
  const winPoints = result.outcome === 'won' ? 300 : 0
  const perfectPoints = result.perfect ? 1000 : 0
  const speedPoints = result.outcome === 'won'
    ? result.durationMs <= 120_000
      ? 250
      : result.durationMs <= 300_000
        ? 120
        : result.durationMs <= 600_000
          ? 50
          : 0
    : 0

  return Math.max(0, result.score + participationPoints + winPoints + perfectPoints + speedPoints)
}

export async function saveAuthenticatedGameResult(result: GameResult): Promise<void> {
  if (!supabaseAuth) {
    return
  }

  const { data: sessionData } = await supabaseAuth.auth.getSession()

  if (!sessionData.session) {
    return
  }

  const payload: RegisterGameResultPayload = {
    p_score: result.score,
    p_remaining_pieces: result.remainingPieces,
    p_moves: result.moves,
    p_duration_ms: result.durationMs,
    p_evaluation: result.evaluation,
    p_perfect: result.perfect,
    p_outcome: result.outcome,
    p_played_at: result.date,
  }

  const { error } = await supabaseAuth.rpc('register_game_result', payload)

  if (error) {
    throw new Error(error.message)
  }
}
