import type { ScoreLabel } from '../game/types/game.types'

export interface StoredGameResult {
  id: string
  date: string
  remainingPieces: number
  moves: number
  score: number
  evaluation: ScoreLabel
  perfect: boolean
}
