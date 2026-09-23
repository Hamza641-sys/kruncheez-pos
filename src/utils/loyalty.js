// ── Loyalty Points System ─────────────────────────────────
// Rules:
//   Earn: Rs. 100 spent = 1 point
//   Redeem: 10 points = Rs. 50 discount
//   Min redeem: 10 points
// ─────────────────────────────────────────────────────────

export const POINTS_PER_100 = 1        // 1 point per Rs.100
export const REDEEM_RATE    = 5        // 1 point = Rs. 5 discount
export const MIN_REDEEM     = 10       // minimum 10 points to redeem

export function calculateEarnedPoints(orderTotal) {
  return Math.floor(orderTotal / 100) * POINTS_PER_100
}

export function calculateRedeemValue(points) {
  return points * REDEEM_RATE
}

export function canRedeem(points) {
  return points >= MIN_REDEEM
}

export function getPointsTier(totalPoints) {
  if (totalPoints >= 500) return { tier: 'Gold',   icon: '🥇', color: '#f4a261', discount: 10 }
  if (totalPoints >= 200) return { tier: 'Silver', icon: '🥈', color: '#a0a0b0', discount: 5  }
  if (totalPoints >= 50)  return { tier: 'Bronze', icon: '🥉', color: '#cd7f32', discount: 2  }
  return                           { tier: 'Basic',  icon: '⭐', color: '#4cc9f0', discount: 0  }
}
