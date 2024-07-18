import {
  ballot,
  candidate,
  methodOfEqualSharesResults,
  methodOfEqualSharesSummaryData,
  totalScore,
  roundResults,
} from "@equal-vote/star-vote-shared/domain_model/ITabulators";
import { IparsedData } from "./ParseData";

const ParseData = require("./ParseData");

interface Cost {
  [candidateId: string]: number;
}

interface Utility {
  [candidateId: string]: { [voterId: string]: number };
}

export function methodOfEqualShares(
  candidates: string[],
  votes: ballot[],
  nWinners = 3,
  randomTiebreakOrder: string[] = [],
): methodOfEqualSharesResults {
  const parsedData: IparsedData = ParseData(votes);
  const totalBudget = parsedData.validVotes.length;
  const cost = createCostDictionary(candidates);
  const utility = createUtilityDictionary(candidates, parsedData.scores);
  const voters = createVoters(parsedData.validVotes);
  const candidateObjects = createCandidateObjects(
    candidates,
    randomTiebreakOrder,
  );
  const totalUtility = calculateTotalUtility(candidateObjects, utility);

  // Check for unbreakable ties before running method
  const unbreakableTies = getUnbreakableTies(candidateObjects, cost, totalUtility);
  if (unbreakableTies.length > 0) {
    // Have election officials set tie-break order for each group
    const tieBreakOrder = setTieBreakOrder(unbreakableTies);
    // Re-run method with tie-break order
    const { elected, tied, roundResults } = runMethodOfEqualShares(voters, candidateObjects, cost, utility, totalBudget, nWinners, tieBreakOrder);

    const summaryData = generateSummaryData(
      candidateObjects,
      utility,
      parsedData,
    );

    return createMethodOfEqualSharesResults(
      candidateObjects,
      elected,
      tied,
      roundResults,
      summaryData,
    );
  }

  const { elected, tied, roundResults } = runMethodOfEqualShares(
    voters,
    candidateObjects,
    cost,
    utility,
    totalBudget,
    nWinners,
    randomTiebreakOrder,
  );

  // If there are unbroken ties, throw error
  if (tied.length > 0) {
    throw new Error(
      `Unresolved tie between candidates: ${tied.join(", ")}. ` +
        `Have election officials set tie-break order and re-run.`,
    );
  }

  const summaryData = generateSummaryData(
    candidateObjects,
    utility,
    parsedData,
  );

  return createMethodOfEqualSharesResults(
    candidateObjects,
    elected,
    tied,
    roundResults,
    summaryData,
  );
}
function createCostDictionary(candidates: string[]): Cost {
  return candidates.reduce((acc, _, index) => {
    acc[index.toString()] = 1;
    return acc;
  }, {} as Cost);
}

function createUtilityDictionary(
  candidates: string[],
  scores: number[][],
): Utility {
  const utility: Utility = {};
  candidates.forEach((_, cIndex) => {
    utility[cIndex.toString()] = {};
    scores.forEach((score, vIndex) => {
      utility[cIndex.toString()][vIndex.toString()] = score[cIndex];
    });
  });
  return utility;
}

function createVoters(validVotes: any[]): { id: string }[] {
  return validVotes.map((_, index) => ({ id: index.toString() }));
}

function createCandidateObjects(
  candidates: string[],
  randomTiebreakOrder: string[],
): candidate[] {
  return candidates.map((name, index) => ({
    index,
    name,
    tieBreakOrder: randomTiebreakOrder.indexOf(name.toString()) !== -1
      ? randomTiebreakOrder.indexOf(name.toString())
      : index,
  }));
}

function runMethodOfEqualShares(
  voters: { id: string }[],
  candidates: candidate[],
  cost: Cost,
  utility: Utility,
  totalBudget: number,
  nWinners: number,
  tieBreakOrder: string[],
): { elected: Set<string>; tied: string[]; roundResults: roundResults[] } {
  let elected = new Set<string>();
  const budget = initializeBudget(voters, totalBudget);
  const totalUtility = calculateTotalUtility(candidates, utility);
  const supporters = identifySupporters(candidates, voters, utility);
  const roundResults: roundResults[] = [];
  let lastTiedCandidates: string[] = [];

  while (elected.size < nWinners) {
    let { nextCandidate, lowestRho, tiedCandidates } = selectNextCandidate(
      candidates,
      elected,
      cost,
      supporters,
      budget,
      utility,
      totalUtility,
    );

    if (!nextCandidate) break;

    if (tiedCandidates.length > 1) {
      lastTiedCandidates = tiedCandidates;
      const resolvedTie = breakTies(
        cost,
        totalUtility,
        tiedCandidates,
        tieBreakOrder,
      );
      nextCandidate = resolvedTie[0];
    } else {
      lastTiedCandidates = [];
    }

    elected.add(nextCandidate);
    updateBudgets(voters, budget, lowestRho, utility[nextCandidate]);
    roundResults.push(createRoundResult(candidates, elected, nextCandidate));
  }

  if (elected.size < nWinners) {
    elected = completeUtilitarian(
      candidates,
      cost,
      utility,
      totalBudget,
      elected,
      nWinners,
      tieBreakOrder,
    );
  }

  return { elected, tied: lastTiedCandidates, roundResults };
}
function initializeBudget(
  voters: { id: string }[],
  totalBudget: number,
): { [voterId: string]: number } {
  return voters.reduce(
    (acc, voter) => {
      acc[voter.id] = totalBudget / voters.length;
      return acc;
    },
    {} as { [voterId: string]: number },
  );
}

function calculateTotalUtility(
  candidates: candidate[],
  utility: Utility,
): { [candidateId: string]: number } {
  return candidates.reduce(
    (acc, candidate) => {
      acc[candidate.index.toString()] = Object.values(
        utility[candidate.index.toString()],
      ).reduce((a, b) => a + b, 0);
      return acc;
    },
    {} as { [candidateId: string]: number },
  );
}

function identifySupporters(
  candidates: candidate[],
  voters: { id: string }[],
  utility: Utility,
): { [candidateId: string]: Set<string> } {
  return candidates.reduce(
    (acc, candidate) => {
      acc[candidate.index.toString()] = new Set(
        voters
          .filter((voter) => utility[candidate.index.toString()][voter.id] > 0)
          .map((voter) => voter.id),
      );
      return acc;
    },
    {} as { [candidateId: string]: Set<string> },
  );
}

function selectNextCandidate(
  candidates: candidate[],
  elected: Set<string>,
  cost: Cost,
  supporters: { [candidateId: string]: Set<string> },
  budget: { [voterId: string]: number },
  utility: Utility,
  totalUtility: { [candidateId: string]: number },
): {
  nextCandidate: string | null;
  lowestRho: number;
  tiedCandidates: string[];
} {
  let nextCandidate: string | null = null;
  let lowestRho = Infinity;
  let tiedCandidates: string[] = [];

  candidates.forEach((candidate) => {
    const candidateId = candidate.index.toString();
    if (
      !elected.has(candidateId) &&
      isCandidateAffordable(candidateId, cost, supporters, budget)
    ) {
      const rho = calculateRho(
        candidateId,
        cost,
        supporters,
        budget,
        utility,
        totalUtility,
      );

      if (rho < lowestRho) {
        nextCandidate = candidateId;
        lowestRho = rho;
        tiedCandidates = [candidateId];
      } else if (isClose(rho, lowestRho)) {
        tiedCandidates.push(candidateId);
      }
    }
  });

  return { nextCandidate, lowestRho, tiedCandidates };
}

function isCandidateAffordable(
  candidateId: string,
  cost: Cost,
  supporters: { [candidateId: string]: Set<string> },
  budget: { [voterId: string]: number },
): boolean {
  const availableBudget = Array.from(supporters[candidateId]).reduce(
    (sum, voterId) => sum + budget[voterId],
    0,
  );
  return _leq(cost[candidateId], availableBudget);
}

function calculateRho(
  candidateId: string,
  cost: Cost,
  supporters: { [candidateId: string]: Set<string> },
  budget: { [voterId: string]: number },
  utility: Utility,
  totalUtility: { [candidateId: string]: number },
): number {
  const supportersSorted = Array.from(supporters[candidateId]).sort(
    (a, b) =>
      budget[a] / utility[candidateId][a] - budget[b] / utility[candidateId][b],
  );
  let price = cost[candidateId];
  let util = totalUtility[candidateId];

  for (const voterId of supportersSorted) {
    if (_leq(price * utility[candidateId][voterId], budget[voterId] * util)) {
      break;
    }
    price -= budget[voterId];
    util -= utility[candidateId][voterId];
  }

  return !isClose(util, 0) && !isClose(price, 0)
    ? price / util
    : budget[supportersSorted[supportersSorted.length - 1]] /
        utility[candidateId][supportersSorted[supportersSorted.length - 1]];
}

function updateBudgets(
  voters: { id: string }[],
  budget: { [voterId: string]: number },
  lowestRho: number,
  candidateUtility: { [voterId: string]: number },
): void {
  voters.forEach((voter) => {
    budget[voter.id] -= Math.min(
      budget[voter.id],
      lowestRho * candidateUtility[voter.id],
    );
  });
}

function createRoundResult(
  candidates: candidate[],
  elected: Set<string>,
  nextCandidate: string,
): roundResults {
  return {
    winners: candidates.filter((c) => elected.has(c.index.toString())),
    runner_up: candidates.filter((c) => c.index.toString() === nextCandidate),
    logs: [`Elected candidate: ${nextCandidate}`],
  };
}

function createMethodOfEqualSharesResults(
  candidateObjects: candidate[],
  elected: Set<string>,
  tied: string[],
  roundResults: roundResults[],
  summaryData: methodOfEqualSharesSummaryData,
): methodOfEqualSharesResults {
  return {
    elected: candidateObjects.filter((c) => elected.has(c.index.toString())),
    tied: candidateObjects.filter((c) => tied.includes(c.index.toString())),
    other: candidateObjects.filter(
      (c) =>
        !elected.has(c.index.toString()) && !tied.includes(c.index.toString()),
    ),
    roundResults,
    summaryData,
    tieBreakType: "none",
  };
}

function completeUtilitarian(
  candidates: candidate[],
  cost: Cost,
  utility: Utility,
  totalBudget: number,
  W: Set<string>,
  nWinners: number,
  tieBreakOrder: string[],
): Set<string> {
  const util: { [candidateId: string]: number } = {};
  candidates.forEach((candidate) => {
    util[candidate.index.toString()] = Object.values(
      utility[candidate.index.toString()],
    ).reduce((a, b) => a + b, 0);
  });

  let committeeCost = Array.from(W).reduce(
    (sum, candidateId) => sum + cost[candidateId],
    0,
  );

  while (W.size < nWinners) {
    let nextCandidate: string | null = null;
    let highestUtil = -Infinity;
    let tiedCandidates: string[] = [];

    candidates.forEach((candidate) => {
      const candidateId = candidate.index.toString();
      if (
        !W.has(candidateId) &&
        _leq(committeeCost + cost[candidateId], totalBudget)
      ) {
        const utilityPerCost = util[candidateId] / cost[candidateId];
        if (utilityPerCost > highestUtil) {
          nextCandidate = candidateId;
          highestUtil = utilityPerCost;
          tiedCandidates = [candidateId];
        } else if (isClose(utilityPerCost, highestUtil)) {
          tiedCandidates.push(candidateId);
        }
      }
    });

    if (nextCandidate === null) {
      break;
    }

    if (tiedCandidates.length > 1) {
      const resolvedTie = breakTies(cost, util, tiedCandidates, tieBreakOrder);
      nextCandidate = resolvedTie[0];
    }

    W.add(nextCandidate);
    committeeCost += cost[nextCandidate];
  }

  return W;
}

function _leq(a: number, b: number): boolean {
  return a < b || isClose(a, b);
}

function isClose(a: number, b: number, epsilon: number = 1e-9): boolean {
  return Math.abs(a - b) < epsilon;
}

function generateSummaryData(
  candidates: candidate[],
  utility: Utility,
  parsedData: IparsedData,
): methodOfEqualSharesSummaryData {
  const totalScores: totalScore[] = candidates.map((candidate) => ({
    index: candidate.index,
    score: Object.values(utility[candidate.index.toString()]).reduce(
      (a, b) => a + b,
      0,
    ),
  }));

  const nBulletVotes = parsedData.scores.reduce((count, vote: ballot) => {
    const nonZeroScores = vote.filter((score) => score > 0).length;
    return count + (nonZeroScores === 1 ? 1 : 0);
  }, 0);

  return {
    candidates,
    totalScores,
    nValidVotes: parsedData.validVotes.length,
    nInvalidVotes: parsedData.invalidVotes.length,
    nUnderVotes: parsedData.underVotes,
    nBulletVotes,
  };
}

function breakTies(
  cost: Cost,
  totalUtility: { [candidateId: string]: number },
  choices: string[],
  tieBreakOrder: string[],
): string[] {
  let remaining = choices.slice();

  // Select candidate(s) with lowest cost
  const bestCost = Math.min(
    ...remaining.map((candidateId) => cost[candidateId]),
  );
  remaining = remaining.filter((candidateId) =>
    isClose(cost[candidateId], bestCost),
  );

  if (remaining.length === 1) {
    return remaining;
  }

  // If tied on cost, select candidate(s) with highest initial vote count
  const bestCount = Math.max(
    ...remaining.map((candidateId) => totalUtility[candidateId]),
  );
  remaining = remaining.filter(
    (candidateId) => totalUtility[candidateId] === bestCount,
  );

  if (remaining.length === 1) {
    return remaining;
  }

  // If still tied, use pre-set tie-break order
  const orderedRemaining = remaining.sort(
    (a, b) => tieBreakOrder.indexOf(a) - tieBreakOrder.indexOf(b),
  );

  return orderedRemaining;
}

function getUnbreakableTies(
  candidates: candidate[],
  cost: Cost,
  totalUtility: { [candidateId: string]: number },
): string[][] {
  const tiedGroups: string[][] = [];

  // Group candidates by cost and initial vote count
  const groupedByCost = groupBy(candidates, (c) => cost[c.index.toString()]);

  for (const candidateGroup of Object.values(groupedByCost)) {
    const groupedByVotes = groupBy(
      candidateGroup,
      (c) => totalUtility[c.index.toString()],
    );

    for (const tiedGroup of Object.values(groupedByVotes)) {
      if (tiedGroup.length > 1) {
        tiedGroups.push(tiedGroup.map((c) => c.index.toString()));
      }
    }
  }

  return tiedGroups;
}

function setTieBreakOrder(tiedGroups: string[][]): string[] {
  const tieBreakOrder: string[] = [];

  for (const tiedGroup of tiedGroups) {
    // Randomly permute tied group to determine order
    const groupOrder = shuffle(tiedGroup);
    tieBreakOrder.push(...groupOrder);
  }

  return tieBreakOrder;
}

function shuffle<T>(array: T[]): T[] {
  const shuffled = array.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}


function groupBy<T, K extends string | number | symbol>(array: T[], keyFn: (item: T) => K): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    groups[key] = groups[key] || [];
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}