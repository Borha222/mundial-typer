/**
 * Points Calculation Engine
 * Computes betting scores for both matches and special long-term predictions.
 * Provides sorted room leaderboard with tie-breakers.
 */

import { MATCHES } from './matches.js?v=5';

/**
 * Calculates points for a single match prediction.
 * @param {Object} prediction - { home, away }
 * @param {Object} actual - { home, away }
 * @returns {number} points (5, 3, or 0)
 */
export function calculateMatchPoints(prediction, actual) {
  if (!prediction || prediction.home === undefined || prediction.away === undefined) return 0;
  if (!actual || actual.home === undefined || actual.away === undefined) return 0;

  const predHome = parseInt(prediction.home, 10);
  const predAway = parseInt(prediction.away, 10);
  const actHome = parseInt(actual.home, 10);
  const actAway = parseInt(actual.away, 10);

  // 1. Exact score
  if (predHome === actHome && predAway === actAway) {
    return 5;
  }

  // 2. Correct outcome (win, loss, or draw)
  const predWinner = predHome > predAway ? 1 : (predHome < predAway ? -1 : 0);
  const actWinner = actHome > actAway ? 1 : (actHome < actAway ? -1 : 0);

  if (predWinner === actWinner) {
    return 3;
  }

  // 3. Wrong outcome
  return 0;
}

/**
 * Calculates long-term prediction points for a user.
 */
export function calculateSpecialPoints(prediction, results) {
  const breakdown = {
    top1: 0,
    top2: 0,
    top3: 0,
    top4: 0,
    goldenBoot: 0,
    assists: 0,
    total: 0
  };

  if (!prediction || !results) return breakdown;

  // Top 1: 10 pts
  if (results.top1 && prediction.top1 === results.top1) {
    breakdown.top1 = 10;
  }
  // Top 2: 8 pts
  if (results.top2 && prediction.top2 === results.top2) {
    breakdown.top2 = 8;
  }
  // Top 3: 6 pts
  if (results.top3 && prediction.top3 === results.top3) {
    breakdown.top3 = 6;
  }
  // Top 4: 4 pts
  if (results.top4 && prediction.top4 === results.top4) {
    breakdown.top4 = 4;
  }
  // Golden Boot (Król Strzelców): 10 pts
  if (results.goldenBoot && prediction.goldenBoot === results.goldenBoot) {
    breakdown.goldenBoot = 10;
  }
  // Most Assists (Najwięcej asyst): 10 pts
  if (results.assists && prediction.assists === results.assists) {
    breakdown.assists = 10;
  }

  breakdown.total = breakdown.top1 + breakdown.top2 + breakdown.top3 + breakdown.top4 + breakdown.goldenBoot + breakdown.assists;
  return breakdown;
}

/**
 * Computes total statistics and sorts the leaderboard for a specific room.
 */
export function calculateRoomLeaderboard(room) {
  if (!room || !room.members) return [];

  const matchScores = room.matchScores || {};
  const predictions = room.predictions || {};
  const specialPredictions = room.specialPredictions || {};
  const results = room.results || {};

  const rankings = room.members.map(username => {
    let matchPoints = 0;
    let exactCount = 0;
    let outcomeCount = 0;
    let missedCount = 0;

    const userPredictions = predictions[username] || {};

    // 1. Calculate points from played matches
    MATCHES.forEach(match => {
      const actual = matchScores[match.id];
      if (actual && actual.home !== undefined && actual.away !== undefined) {
        const pred = userPredictions[match.id];
        const points = calculateMatchPoints(pred, actual);
        matchPoints += points;

        if (points === 5) {
          exactCount++;
        } else if (points === 3) {
          outcomeCount++;
        } else if (pred) {
          missedCount++;
        }
      }
    });

    // 2. Calculate points from special predictions
    const userSpecial = specialPredictions[username] || {};
    const specialBreakdown = calculateSpecialPoints(userSpecial, results);

    const totalPoints = matchPoints + specialBreakdown.total;

    return {
      username: username,
      totalPoints: totalPoints,
      matchPoints: matchPoints,
      exactCount: exactCount,
      outcomeCount: outcomeCount,
      missedCount: missedCount,
      specialPoints: specialBreakdown.total,
      specialBreakdown: specialBreakdown
    };
  });

  // 3. Sort rankings: Total points desc, exact count desc, outcome count desc, username asc
  rankings.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    if (b.exactCount !== a.exactCount) {
      return b.exactCount - a.exactCount;
    }
    if (b.outcomeCount !== a.outcomeCount) {
      return b.outcomeCount - a.outcomeCount;
    }
    return a.username.localeCompare(b.username);
  });

  return rankings;
}
