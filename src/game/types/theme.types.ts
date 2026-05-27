export interface BoardTheme {
  boardPrimary: string
  boardSecondary: string
  boardLine: string
  slotRim: string
  slotCore: string
  pieceBase: string
  pieceInner: string
  selectedPiece: string
  selectedInner: string
  validMove: string
}

export const DEFAULT_BOARD_THEME: BoardTheme = {
  boardPrimary: '#2563eb',
  boardSecondary: '#1d4ed8',
  boardLine: '#bfe4ff',
  slotRim: '#60a5fa',
  slotCore: '#082f6b',
  pieceBase: '#eab308',
  pieceInner: '#facc15',
  selectedPiece: '#fb7185',
  selectedInner: '#ffb4c2',
  validMove: '#4ade80',
}

export function hexToPhaserColor(hexColor: string): number {
  const normalized = hexColor.replace('#', '').trim()
  const safeColor = /^[0-9a-fA-F]{6}$/.test(normalized) ? normalized : 'ffffff'
  return Number.parseInt(safeColor, 16)
}
