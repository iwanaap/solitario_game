import type { GameResult } from '../game/types/game.types'
import type { UserProfile } from './authStorage'

export interface RankingEntry extends GameResult {
  userId: string
  displayName: string
  photoUrl: string
  country: string
}

const RANKING_KEY = 'el-solitario-ranking'

export function getRanking(): RankingEntry[] {
  const rawRanking = localStorage.getItem(RANKING_KEY)

  if (!rawRanking) {
    return []
  }

  try {
    const parsedRanking = JSON.parse(rawRanking) as RankingEntry[]
    return Array.isArray(parsedRanking) ? sortRanking(getBestEntryByUser(parsedRanking)) : []
  } catch {
    return []
  }
}

export function saveRankingResult(result: GameResult, user: UserProfile): void {
  const entry: RankingEntry = {
    ...result,
    userId: user.id,
    displayName: user.displayName,
    photoUrl: user.photoUrl,
    country: user.country,
  }

  const bestEntries = getBestEntryByUser([entry, ...getRanking()])
  localStorage.setItem(RANKING_KEY, JSON.stringify(sortRanking(bestEntries).slice(0, 50)))
}

export function clearRanking(): void {
  localStorage.removeItem(RANKING_KEY)
}

function getBestEntryByUser(entries: RankingEntry[]): RankingEntry[] {
  const bestEntries = new Map<string, RankingEntry>()

  entries.forEach((entry) => {
    const currentBest = bestEntries.get(entry.userId)

    if (!currentBest || isEntryBetter(entry, currentBest)) {
      bestEntries.set(entry.userId, entry)
    }
  })

  return Array.from(bestEntries.values())
}

function sortRanking(entries: RankingEntry[]): RankingEntry[] {
  return [...entries].sort((a, b) => (isEntryBetter(a, b) ? -1 : 1))
}

function isEntryBetter(candidate: RankingEntry, current: RankingEntry): boolean {
  if (candidate.score !== current.score) {
    return candidate.score > current.score
  }

  if (candidate.outcome !== current.outcome) {
    return candidate.outcome === 'won'
  }

  if (candidate.remainingPieces !== current.remainingPieces) {
    return candidate.remainingPieces < current.remainingPieces
  }

  return (candidate.durationMs ?? Number.MAX_SAFE_INTEGER) < (current.durationMs ?? Number.MAX_SAFE_INTEGER)
}
