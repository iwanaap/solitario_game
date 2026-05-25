import { CENTER_POSITION, INITIAL_BOARD_LAYOUT } from '../data/initialBoard'
import type { Board, BoardCell, Position } from '../types/game.types'

export function createInitialBoard(): Board {
  return INITIAL_BOARD_LAYOUT.map((row, rowIndex) =>
    row.map<BoardCell>((valid, colIndex) => ({
      row: rowIndex,
      col: colIndex,
      valid,
      hasPiece:
        valid && !(rowIndex === CENTER_POSITION.row && colIndex === CENTER_POSITION.col),
    })),
  )
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => ({ ...cell })))
}

export function getCell(board: Board, position: Position): BoardCell | null {
  const row = board[position.row]

  if (!row) {
    return null
  }

  return row[position.col] ?? null
}
