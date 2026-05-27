export function formatDuration(durationMs: number): string {
  const safeDurationMs = Math.max(0, durationMs)
  const totalMilliseconds = Math.floor(safeDurationMs)
  const totalSeconds = Math.floor(totalMilliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const milliseconds = totalMilliseconds % 1000

  return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`
}
