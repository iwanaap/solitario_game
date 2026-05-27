import type { GameOutcome, ScoreLabel } from '../game/types/game.types'

export interface StoredGameResult {
  id: string
  date: string
  remainingPieces: number
  moves: number
  score: number
  durationMs?: number
  evaluation: ScoreLabel
  perfect: boolean
  outcome?: GameOutcome
}
