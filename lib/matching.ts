import blossom from 'edmonds-blossom';

export interface Person {
  id: string;
  name: string;
}

export interface MatchingHistory {
  [personId: string]: {
    [otherPersonId: string]: number;
  };
}

export interface PairResult {
  type: 'pair';
  people: [Person, Person];
}

export interface TripleResult {
  type: 'triple';
  people: [Person, Person, Person];
}

export type GroupResult = PairResult | TripleResult;

function getPastMeetings(history: MatchingHistory, id1: string, id2: string): number {
  return history[id1]?.[id2] || 0;
}

function convertPairToTriple(
  pairs: [number, number][],
  unmatchedPerson: number,
  people: Person[],
  history: MatchingHistory
): GroupResult[] {
  let bestPairIndex = 0;
  let bestCost = Infinity;

  for (let pairIdx = 0; pairIdx < pairs.length; pairIdx++) {
    const [a, b] = pairs[pairIdx];
    const costAW = getPastMeetings(history, people[a].id, people[unmatchedPerson].id);
    const costBW = getPastMeetings(history, people[b].id, people[unmatchedPerson].id);
    const totalCost = costAW + costBW;

    if (totalCost < bestCost) {
      bestCost = totalCost;
      bestPairIndex = pairIdx;
    }
  }

  const results: GroupResult[] = [];

  for (let i = 0; i < pairs.length; i++) {
    const [a, b] = pairs[i];
    if (i === bestPairIndex) {
      results.push({
        type: 'triple',
        people: [people[a], people[b], people[unmatchedPerson]]
      });
    } else {
      results.push({
        type: 'pair',
        people: [people[a], people[b]]
      });
    }
  }

  return results;
}

export function generateMatching(
  people: Person[],
  history: MatchingHistory
): GroupResult[] {
  const n = people.length;

  if (n === 0) return [];
  if (n === 1) return [{ type: 'pair', people: [people[0], people[0]] }];
  if (n === 2) return [{ type: 'pair', people: [people[0], people[1]] }];

  const edges: [number, number, number][] = [];

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const weight = getPastMeetings(history, people[i].id, people[j].id);
      edges.push([i, j, weight]);
    }
  }

  const matching = blossom(edges, true);

  const pairs: [number, number][] = [];
  const matched = new Set<number>();

  for (let i = 0; i < matching.length; i++) {
    const j = matching[i];
    if (j !== -1 && j > i) {
      if (matched.has(i) || matched.has(j)) {
        throw new Error(`Person ${i} or ${j} already matched`);
      }
      pairs.push([i, j]);
      matched.add(i);
      matched.add(j);
    }
  }

  const unmatched = Array.from({ length: n }, (_, i) => i).filter(i => !matched.has(i));

  if (unmatched.length > 0) {
    return convertPairToTriple(pairs, unmatched[0], people, history);
  }

  return pairs.map(([i, j]) => ({
    type: 'pair',
    people: [people[i], people[j]]
  }));
}

export function updateHistory(
  history: MatchingHistory,
  groups: GroupResult[]
): MatchingHistory {
  const newHistory = JSON.parse(JSON.stringify(history)) as MatchingHistory;

  for (const group of groups) {
    const ids = group.people.map(p => p.id);

    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const id1 = ids[i];
        const id2 = ids[j];

        if (!newHistory[id1]) newHistory[id1] = {};
        if (!newHistory[id2]) newHistory[id2] = {};

        newHistory[id1][id2] = (newHistory[id1][id2] || 0) + 1;
        newHistory[id2][id1] = (newHistory[id2][id1] || 0) + 1;
      }
    }
  }

  return newHistory;
}
