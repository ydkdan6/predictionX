/**
 * World Cup Predictor Utility Functions
 */

export interface PredictionResult {
  pointsEarned: number
  isExactMatch: boolean
  isCorrectOutcome: boolean
}

export interface MatchOutcome {
  type: 'W' | 'D' | 'L'
  description: string
}

/**
 * Determine match outcome (Win/Draw/Loss from home team perspective)
 */
export function getOutcome(homeScore: number, awayScore: number): MatchOutcome['type'] {
  if (homeScore > awayScore) return 'W'
  if (homeScore < awayScore) return 'L'
  return 'D'
}

/**
 * Calculate points earned for a single prediction
 */
export function calculatePredictionPoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): PredictionResult {
  const isExactMatch = predictedHome === actualHome && predictedAway === actualAway
  
  if (isExactMatch) {
    return {
      pointsEarned: 3,
      isExactMatch: true,
      isCorrectOutcome: true,
    }
  }

  const predictedOutcome = getOutcome(predictedHome, predictedAway)
  const actualOutcome = getOutcome(actualHome, actualAway)
  const isCorrectOutcome = predictedOutcome === actualOutcome

  return {
    pointsEarned: isCorrectOutcome ? 1 : 0,
    isExactMatch: false,
    isCorrectOutcome,
  }
}

/**
 * Calculate jackpot based on premium user count
 * Formula: (premium_count × 500) × 0.70
 * Where 0.70 (70%) goes to winner, 0.30 (30%) to founders
 */
export function calculateJackpot(premiumUserCount: number): {
  total: number
  forWinner: number
  forFounders: number
} {
  const total = premiumUserCount * 500
  const forWinner = total * 0.7
  const forFounders = total * 0.3

  return {
    total,
    forWinner,
    forFounders,
  }
}

/**
 * Validate WhatsApp user ID format
 */
export function isValidWhatsAppId(waId: string): boolean {
  // Simple validation: starts with +, followed by 10-15 digits
  const regex = /^\+\d{10,15}$/
  return regex.test(waId)
}

/**
 * Format currency for Nigerian Naira
 */
export function formatNaira(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return `₦${num.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`
}

/**
 * Check if a prediction is still open (within 1 hour before kickoff)
 */
export function isPredictionOpen(kickoffTime: Date): boolean {
  const now = new Date()
  const oneHourBefore = new Date(kickoffTime.getTime() - 60 * 60 * 1000)
  return now < oneHourBefore
}

/**
 * Calculate sprint number from match number
 * Sprint 1: matches 1-5
 * Sprint 2: matches 6-10
 * etc.
 */
export function getSprintNumber(matchNumber: number): number {
  return Math.ceil(matchNumber / 5)
}

/**
 * Get match number within current sprint (1-5)
 */
export function getMatchInSprint(matchNumber: number): number {
  const remainder = matchNumber % 5
  return remainder === 0 ? 5 : remainder
}

/**
 * Check if a match completes a sprint (is 5th match of sprint)
 */
export function completesSprint(matchNumber: number): boolean {
  return matchNumber % 5 === 0
}
