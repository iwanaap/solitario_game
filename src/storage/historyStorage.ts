import type { GameResult } from '../game/types/game.types'
import type { StoredGameResult } from './save.types'
import { saveGlobalRankingResult, saveWeeklyRankingResult } from './rankingStorage'

const STORAGE_KEY = 'el-solitario-history'

export function saveGameResult(result: GameResult): void {
  const history = getGameHistory()
  const nextHistory: StoredGameResult[] = [result, ...history]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory))
  saveWeeklyRankingResult(result)
  void saveGlobalRankingResult(result)
}

export function getGameHistory(): StoredGameResult[] {
  const rawHistory = localStorage.getItem(STORAGE_KEY)

  if (!rawHistory) {
    return []
  }

  try {
    const parsedHistory = JSON.parse(rawHistory) as StoredGameResult[]
    return Array.isArray(parsedHistory) ? parsedHistory : []
  } catch {
    return []
  }
}

export function clearGameHistory(): void {
  localStorage.removeItem(STORAGE_KEY)
}
