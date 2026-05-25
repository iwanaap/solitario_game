export type ScoreLabel =
  | 'Sigue intentando'
  | 'Bueno'
  | 'Genial'
  | 'Excelente!!'
  | 'WOOOOW!'
  | 'Acaso eres Dios? Increible!!!'

export interface Position {
  row: number
  col: number
}

export interface BoardCell extends Position {
  valid: boolean
  hasPiece: boolean
}

export type Board = BoardCell[][]

export interface Move {
  from: Position
  over: Position
  to: Position
}

export interface GameState {
  board: Board
  moveCount: number
  remainingPieces: number
  score: number
  streak: number
  lastMoveAt: number | null
  lastMoveScore: number
  availableMoves: Move[]
  isGameOver: boolean
}

export interface GameProgress {
  board: Board
  moveCount: number
  remainingPieces: number
  score: number
  streak: number
  lastMoveScore: number
}

export interface GameResult {
  id: string
  date: string
  remainingPieces: number
  moves: number
  score: number
  evaluation: ScoreLabel
  perfect: boolean
}
