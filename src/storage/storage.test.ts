import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loginUser, logoutUser, registerUser, requestPasswordResetCode, confirmPasswordResetCode, getCurrentUser } from './authStorage'
import { clearGameHistory, getGameHistory, saveGameResult } from './historyStorage'
import { clearRanking, getRanking, saveRankingResult } from './rankingStorage'
import type { GameResult } from '../game/types/game.types'

const baseResult: GameResult = {
  id: 'result-1',
  date: '2026-05-26T00:00:00.000Z',
  remainingPieces: 3,
  moves: 29,
  score: 900,
  durationMs: 45_000,
  evaluation: 'Excelente!!',
  perfect: false,
  outcome: 'won',
}

function createMemoryStorage(): Storage {
  const entries = new Map<string, string>()

  return {
    get length() {
      return entries.size
    },
    clear: () => entries.clear(),
    getItem: (key: string) => entries.get(key) ?? null,
    key: (index: number) => Array.from(entries.keys())[index] ?? null,
    removeItem: (key: string) => entries.delete(key),
    setItem: (key: string, value: string) => entries.set(key, value),
  }
}

describe('local storage adapters', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage())
  })

  it('registers, logs in, logs out and recovers local demo users', () => {
    const user = registerUser('PLAYER@example.com', '1234', 'Jugador Uno', 'avatar.svg', 'Chile')

    expect(user.email).toBe('player@example.com')
    expect(getCurrentUser()?.id).toBe(user.id)

    logoutUser()
    expect(getCurrentUser()).toBeNull()

    expect(loginUser('player@example.com', '1234').displayName).toBe('Jugador Uno')

    const resetCode = requestPasswordResetCode('player@example.com')
    confirmPasswordResetCode('player@example.com', resetCode, '5678')
    logoutUser()

    expect(loginUser('player@example.com', '5678').id).toBe(user.id)
  })

  it('stores and clears the complete match history', () => {
    saveGameResult(baseResult)
    saveGameResult({ ...baseResult, id: 'result-2', remainingPieces: 1, perfect: true })

    expect(getGameHistory()).toHaveLength(2)
    expect(getGameHistory()[0].id).toBe('result-2')

    clearGameHistory()
    expect(getGameHistory()).toEqual([])
  })

  it('keeps only the best ranking entry per player', () => {
    const user = registerUser('ranking@example.com', '1234', 'Ranker', 'avatar.svg', 'Perú')

    saveRankingResult({ ...baseResult, id: 'low-score', score: 100 }, user)
    saveRankingResult({ ...baseResult, id: 'high-score', score: 500 }, user)

    const ranking = getRanking()

    expect(ranking).toHaveLength(1)
    expect(ranking[0].id).toBe('high-score')
    expect(ranking[0].displayName).toBe('Ranker')

    clearRanking()
    expect(getRanking()).toEqual([])
  })
})
