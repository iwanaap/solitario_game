import type { GameResult } from '../game/types/game.types'
import { getCurrentPlayerId } from './playerStorage'
import { isSupabaseConfigured, supabaseRequest } from './supabaseClient'

const WEEKLY_RANKING_KEY = 'el-solitario-weekly-ranking'

export interface WeeklyRankingEntry {
  playerName: string
  score: number
  remainingPieces: number
  moves: number
  durationMs: number
  date: string
  evaluation: string
  perfect: boolean
  outcome: string
}

interface WeeklyRankingSave {
  weekStart: string
  entries: WeeklyRankingEntry[]
}

interface WeeklyRankingRow {
  player_name: string
  score: number
  remaining_pieces: number
  moves: number
  duration_ms: number
  played_at: string
  evaluation: string
  perfect: boolean
  outcome: string
}

export function getWeekStartIso(date = new Date()): string {
  const weekStart = new Date(date)
  const day = weekStart.getDay()
  const daysSinceMonday = day === 0 ? 6 : day - 1

  weekStart.setHours(0, 0, 0, 0)
  weekStart.setDate(weekStart.getDate() - daysSinceMonday)

  return weekStart.toISOString()
}

function sortRanking(entries: WeeklyRankingEntry[]): WeeklyRankingEntry[] {
  return [...entries].sort((left, right) => {
    if (left.remainingPieces !== right.remainingPieces) {
      return left.remainingPieces - right.remainingPieces
    }

    if (left.score !== right.score) {
      return right.score - left.score
    }

    if (left.moves !== right.moves) {
      return left.moves - right.moves
    }

    return left.durationMs - right.durationMs
  })
}

function readWeeklyRanking(): WeeklyRankingSave {
  const currentWeekStart = getWeekStartIso()
  const rawRanking = localStorage.getItem(WEEKLY_RANKING_KEY)

  if (!rawRanking) {
    return { weekStart: currentWeekStart, entries: [] }
  }

  try {
    const parsedRanking = JSON.parse(rawRanking) as WeeklyRankingSave

    if (parsedRanking.weekStart !== currentWeekStart || !Array.isArray(parsedRanking.entries)) {
      return { weekStart: currentWeekStart, entries: [] }
    }

    return {
      weekStart: parsedRanking.weekStart,
      entries: parsedRanking.entries,
    }
  } catch {
    return { weekStart: currentWeekStart, entries: [] }
  }
}

function writeWeeklyRanking(save: WeeklyRankingSave): void {
  localStorage.setItem(WEEKLY_RANKING_KEY, JSON.stringify({
    weekStart: save.weekStart,
    entries: sortRanking(save.entries),
  }))
}

export function getWeeklyRanking(): WeeklyRankingEntry[] {
  const ranking = readWeeklyRanking()
  writeWeeklyRanking(ranking)
  return sortRanking(ranking.entries)
}

export async function getGlobalWeeklyRanking(): Promise<WeeklyRankingEntry[]> {
  if (!isSupabaseConfigured()) {
    return getWeeklyRanking()
  }

  const rows = await supabaseRequest<WeeklyRankingRow[]>(
    'weekly_ranking?select=player_name,score,remaining_pieces,moves,duration_ms,played_at,evaluation,perfect,outcome&order=remaining_pieces.asc,score.desc,moves.asc,duration_ms.asc',
  )

  return rows.map((row) => ({
    playerName: row.player_name,
    score: row.score,
    remainingPieces: row.remaining_pieces,
    moves: row.moves,
    durationMs: row.duration_ms,
    date: row.played_at,
    evaluation: row.evaluation,
    perfect: row.perfect,
    outcome: row.outcome,
  }))
}

export async function saveGlobalRankingResult(result: GameResult): Promise<void> {
  const playerId = getCurrentPlayerId()
  const playerName = result.playerName?.trim()

  if (!isSupabaseConfigured() || !playerId || !playerName) {
    return
  }

  await supabaseRequest('game_results', {
    method: 'POST',
    body: {
      player_id: playerId,
      player_name: playerName,
      score: result.score,
      remaining_pieces: result.remainingPieces,
      moves: result.moves,
      duration_ms: result.durationMs,
      evaluation: result.evaluation,
      perfect: result.perfect,
      outcome: result.outcome,
      played_at: result.date,
    },
  })
}

export function saveWeeklyRankingResult(result: GameResult): void {
  const playerName = result.playerName?.trim()

  if (!playerName) {
    return
  }

  const ranking = readWeeklyRanking()
  const entry: WeeklyRankingEntry = {
    playerName,
    score: result.score,
    remainingPieces: result.remainingPieces,
    moves: result.moves,
    durationMs: result.durationMs,
    date: result.date,
    evaluation: result.evaluation,
    perfect: result.perfect,
    outcome: result.outcome,
  }
  const existingIndex = ranking.entries.findIndex(
    (currentEntry) => currentEntry.playerName.toLocaleLowerCase() === playerName.toLocaleLowerCase(),
  )

  if (existingIndex === -1) {
    writeWeeklyRanking({ ...ranking, entries: [...ranking.entries, entry] })
    return
  }

  const existingEntry = ranking.entries[existingIndex]
  const [bestEntry] = sortRanking([existingEntry, entry])

  if (bestEntry !== entry) {
    return
  }

  const nextEntries = [...ranking.entries]
  nextEntries[existingIndex] = entry
  writeWeeklyRanking({ ...ranking, entries: nextEntries })
}
