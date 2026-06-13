export function getDailyRefill(
  pullsAvailable: number,
  lastRefillDate: string,
  maxDailyPulls: number,
  maxAccumulated: number
): { pullsAvailable: number; lastRefillDate: string } | null {
  const today = new Date().toISOString().split('T')[0]
  if (lastRefillDate === today) return null
  return {
    pullsAvailable: Math.min(pullsAvailable + maxDailyPulls, maxAccumulated),
    lastRefillDate: today,
  }
}
