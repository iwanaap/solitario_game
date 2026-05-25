import { getValidMoves } from './moves'
import type { Board } from '../types/game.types'

export function countRemainingPieces(board: Board): number {
  return board.flat().filter((cell) => cell.valid && cell.hasPiece).length
}

export function isGameOver(board: Board): boolean {
  return getValidMoves(board).length === 0
}
