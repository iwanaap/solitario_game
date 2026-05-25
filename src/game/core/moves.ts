import { cloneBoard, getCell } from './board'
import type { Board, Move, Position } from '../types/game.types'

const DIRECTIONS = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
] as const

export function getValidMoves(board: Board): Move[] {
  return board.flatMap((row) =>
    row.flatMap((cell) =>
      cell.valid && cell.hasPiece ? getValidMovesForPiece(board, cell) : [],
    ),
  )
}

export function getValidMovesForPiece(board: Board, position: Position): Move[] {
  const origin = getCell(board, position)

  if (!origin?.valid || !origin.hasPiece) {
    return []
  }

  return DIRECTIONS.flatMap((direction) => {
    const over = {
      row: position.row + direction.row,
      col: position.col + direction.col,
    }
    const to = {
      row: position.row + direction.row * 2,
      col: position.col + direction.col * 2,
    }
    const move: Move = { from: position, over, to }

    return isValidMove(board, move) ? [move] : []
  })
}

export function isValidMove(board: Board, move: Move): boolean {
  const fromCell = getCell(board, move.from)
  const overCell = getCell(board, move.over)
  const toCell = getCell(board, move.to)

  if (!fromCell?.valid || !fromCell.hasPiece) {
    return false
  }

  if (!toCell?.valid || toCell.hasPiece) {
    return false
  }

  if (!overCell?.valid || !overCell.hasPiece) {
    return false
  }

  const rowDistance = Math.abs(move.from.row - move.to.row)
  const colDistance = Math.abs(move.from.col - move.to.col)
  const isHorizontal = rowDistance === 0 && colDistance === 2
  const isVertical = rowDistance === 2 && colDistance === 0

  return isHorizontal || isVertical
}

export function applyMove(board: Board, move: Move): Board {
  if (!isValidMove(board, move)) {
    return board
  }

  const nextBoard = cloneBoard(board)

  nextBoard[move.from.row][move.from.col].hasPiece = false
  nextBoard[move.over.row][move.over.col].hasPiece = false
  nextBoard[move.to.row][move.to.col].hasPiece = true

  return nextBoard
}
