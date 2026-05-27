import { DEFAULT_BOARD_THEME, type BoardTheme } from '../game/types/theme.types'

const THEME_STORAGE_KEY = 'el-solitario-board-theme'

function isTheme(value: unknown): value is Partial<BoardTheme> {
  return typeof value === 'object' && value !== null
}

export function getBoardTheme(): BoardTheme {
  const rawTheme = localStorage.getItem(THEME_STORAGE_KEY)

  if (!rawTheme) {
    return DEFAULT_BOARD_THEME
  }

  try {
    const parsedTheme = JSON.parse(rawTheme) as unknown
    return isTheme(parsedTheme) ? { ...DEFAULT_BOARD_THEME, ...parsedTheme } : DEFAULT_BOARD_THEME
  } catch {
    return DEFAULT_BOARD_THEME
  }
}

export function saveBoardTheme(theme: BoardTheme): void {
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme))
}

export function resetBoardTheme(): BoardTheme {
  saveBoardTheme(DEFAULT_BOARD_THEME)
  return DEFAULT_BOARD_THEME
}
