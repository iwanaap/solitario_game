import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearGameHistory, getGameHistory, saveGameResult } from './historyStorage'
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

  it('stores and clears the complete match history', () => {
    saveGameResult(baseResult)
    saveGameResult({ ...baseResult, id: 'result-2', remainingPieces: 1, perfect: true })

    expect(getGameHistory()).toHaveLength(2)
    expect(getGameHistory()[0].id).toBe('result-2')

    clearGameHistory()
    expect(getGameHistory()).toEqual([])
  })
})
