import { createInitialBoard } from './board'
import { applyMove, getValidMoves } from './moves'
import { countRemainingPieces, isGameOver } from './rules'
import { getMoveScore } from './scoring'
import { STREAK_WINDOW_MS } from './streak'
import type { GameState, Move } from '../types/game.types'

export function createInitialGameState(): GameState {
  const board = createInitialBoard()
  const availableMoves = getValidMoves(board)

  return {
    board,
    moveCount: 0,
    remainingPieces: countRemainingPieces(board),
    score: 0,
    streak: 0,
    lastMoveAt: null,
    lastMoveScore: 0,
    availableMoves,
    isGameOver: availableMoves.length === 0,
  }
}

export function playMove(state: GameState, move: Move, playedAt: number): GameState {
  const board = applyMove(state.board, move)
  const remainingPieces = countRemainingPieces(board)
  const availableMoves = getValidMoves(board)
  const moveWasApplied = board !== state.board
  const elapsedMs = state.lastMoveAt === null ? null : playedAt - state.lastMoveAt
  const streak =
    moveWasApplied && elapsedMs !== null && elapsedMs <= STREAK_WINDOW_MS ? state.streak + 1 : moveWasApplied ? 1 : state.streak
  const lastMoveScore = moveWasApplied ? getMoveScore(remainingPieces, elapsedMs, streak) : 0

  return {
    board,
    moveCount: moveWasApplied ? state.moveCount + 1 : state.moveCount,
    remainingPieces,
    score: moveWasApplied ? state.score + lastMoveScore : state.score,
    streak,
    lastMoveAt: moveWasApplied ? playedAt : state.lastMoveAt,
    lastMoveScore,
    availableMoves,
    isGameOver: isGameOver(board),
  }
}
