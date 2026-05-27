import { CENTER_POSITION } from '../data/initialBoard'
import { getCell } from './board'
import type { Board, GameOutcome, ScoreLabel } from '../types/game.types'

export function getMoveScore(
  remainingPieces: number,
  elapsedMs: number | null = null,
  streak = 1,
): number {
  const endgameBonus = remainingPieces <= 5 ? (6 - remainingPieces) * 20 : 0
  const speedBonus =
    elapsedMs === null
      ? 0
      : elapsedMs <= 1800
        ? 30
        : elapsedMs <= 3200
          ? 18
          : elapsedMs <= 5000
            ? 10
            : 0
  const streakBonus = Math.max(0, streak - 1) * 8

  return 10 + endgameBonus + speedBonus + streakBonus
}

export function getScoreLabel(remainingPieces: number): ScoreLabel {
  if (isLostResult(remainingPieces)) {
    return 'Perdiste'
  }

  switch (remainingPieces) {
    case 1:
      return 'Acaso eres Dios? Increible!!!'
    case 2:
      return 'WOOOOW!'
    case 3:
      return 'Excelente!!'
    case 4:
      return 'Genial'
    case 5:
      return 'Bueno'
    default:
      return 'Sigue intentando'
  }
}

export function isWinningResult(remainingPieces: number): boolean {
  return remainingPieces <= 5
}

export function isLostResult(remainingPieces: number): boolean {
  return remainingPieces >= 6
}

export function getGameOutcome(remainingPieces: number): GameOutcome {
  return isLostResult(remainingPieces) ? 'lost' : 'won'
}

export function isPerfectResult(board: Board): boolean {
  const centerCell = getCell(board, CENTER_POSITION)

  return board.flat().filter((cell) => cell.valid && cell.hasPiece).length === 1 && Boolean(centerCell?.hasPiece)
}
