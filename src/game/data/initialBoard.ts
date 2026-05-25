export const BOARD_SIZE = 7
export const CENTER_POSITION = { row: 3, col: 3 } as const

export const INITIAL_BOARD_LAYOUT: boolean[][] = [
  [false, false, true, true, true, false, false],
  [false, false, true, true, true, false, false],
  [true, true, true, true, true, true, true],
  [true, true, true, true, true, true, true],
  [true, true, true, true, true, true, true],
  [false, false, true, true, true, false, false],
  [false, false, true, true, true, false, false],
]
