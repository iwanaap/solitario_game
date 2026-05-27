import { describe, expect, it } from 'vitest'
import { createInitialBoard } from './board'
import { createInitialGameState, playMove } from './gameState'
import { getValidMoves, isValidMove } from './moves'
import { countRemainingPieces, hasNoMoreMoves, isGameLost } from './rules'
import { getGameOutcome, getScoreLabel, isPerfectResult } from './scoring'
import { STREAK_WINDOW_MS } from './streak'
import { CENTER_POSITION } from '../data/initialBoard'

function createBoardWithPieces(pieces: Array<[number, number]>) {
  const board = createInitialBoard().map((row) => row.map((cell) => ({ ...cell, hasPiece: false })))

  pieces.forEach(([row, col]) => {
    board[row][col].hasPiece = true
  })

  return board
}

describe('game core', () => {
  it('creates the standard board with four opening moves', () => {
    const state = createInitialGameState()

    expect(countRemainingPieces(state.board)).toBe(32)
    expect(state.remainingPieces).toBe(32)
    expect(state.moveCount).toBe(0)
    expect(state.isGameOver).toBe(false)
    expect(getValidMoves(state.board)).toHaveLength(4)
  })

  it('validates and applies a legal jump into the center', () => {
    const state = createInitialGameState()
    const move = {
      from: { row: 1, col: 3 },
      over: { row: 2, col: 3 },
      to: { row: 3, col: 3 },
    }

    expect(isValidMove(state.board, move)).toBe(true)

    const nextState = playMove(state, move, 1_000)

    expect(nextState.moveCount).toBe(1)
    expect(nextState.remainingPieces).toBe(31)
    expect(nextState.board[1][3].hasPiece).toBe(false)
    expect(nextState.board[2][3].hasPiece).toBe(false)
    expect(nextState.board[3][3].hasPiece).toBe(true)
    expect(nextState.score).toBeGreaterThan(0)
  })

  it('ignores invalid moves without mutating progress', () => {
    const state = createInitialGameState()
    const invalidMove = {
      from: { row: 0, col: 2 },
      over: { row: 0, col: 3 },
      to: { row: 0, col: 4 },
    }

    const nextState = playMove(state, invalidMove, 1_000)

    expect(isValidMove(state.board, invalidMove)).toBe(false)
    expect(nextState.board).toBe(state.board)
    expect(nextState.moveCount).toBe(0)
    expect(nextState.remainingPieces).toBe(32)
    expect(nextState.score).toBe(0)
  })

  it('tracks streaks inside the configured streak window', () => {
    const firstMove = {
      from: { row: 1, col: 3 },
      over: { row: 2, col: 3 },
      to: { row: 3, col: 3 },
    }
    const secondMove = {
      from: { row: 4, col: 3 },
      over: { row: 3, col: 3 },
      to: { row: 2, col: 3 },
    }

    const afterFirstMove = playMove(createInitialGameState(), firstMove, 10_000)
    const afterSecondMove = playMove(afterFirstMove, secondMove, 10_000 + STREAK_WINDOW_MS - 1)

    expect(afterFirstMove.streak).toBe(1)
    expect(afterSecondMove.streak).toBe(2)
    expect(afterSecondMove.lastMoveScore).toBeGreaterThan(afterFirstMove.lastMoveScore)
  })

  it('classifies blocked boards as won or lost by remaining pieces', () => {
    const winningBoard = createBoardWithPieces([[CENTER_POSITION.row, CENTER_POSITION.col]])
    const lostBoard = createBoardWithPieces([
      [0, 2],
      [0, 4],
      [2, 0],
      [2, 6],
      [4, 0],
      [4, 6],
    ])

    expect(hasNoMoreMoves(winningBoard)).toBe(true)
    expect(isPerfectResult(winningBoard)).toBe(true)
    expect(getGameOutcome(countRemainingPieces(winningBoard))).toBe('won')
    expect(getScoreLabel(countRemainingPieces(winningBoard))).toContain('Dios')

    expect(hasNoMoreMoves(lostBoard)).toBe(true)
    expect(isGameLost(lostBoard)).toBe(true)
    expect(getGameOutcome(countRemainingPieces(lostBoard))).toBe('lost')
    expect(getScoreLabel(countRemainingPieces(lostBoard))).toBe('Perdiste')
  })
})
