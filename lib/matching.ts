import blossom from "edmonds-blossom";

export interface Person {
  id: string;
  name: string;
}

export type MatchingHistory = [string, string][];

export interface PairResult {
  type: "pair";
  people: [Person, Person];
  score: number;
}

export interface TripleResult {
  type: "triple";
  people: [Person, Person, Person];
  score: number;
}

export type GroupResult = PairResult | TripleResult;

function getPastMeetings(
  history: MatchingHistory,
  id1: string,
  id2: string,
): number {
  return history.filter(
    ([a, b]) => (a === id1 && b === id2) || (a === id2 && b === id1),
  ).length;
}

function convertPairToTriple(
  pairs: [number, number][],
  unmatchedPerson: number,
  people: Person[],
  history: MatchingHistory,
): GroupResult[] {
  let bestPairIndex = 0;
  let bestCost = Infinity;

  for (let pairIdx = 0; pairIdx < pairs.length; pairIdx++) {
    const [a, b] = pairs[pairIdx];
    const costAW = getPastMeetings(
      history,
      people[a].id,
      people[unmatchedPerson].id,
    );
    const costBW = getPastMeetings(
      history,
      people[b].id,
      people[unmatchedPerson].id,
    );
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
      const scoreAB = getPastMeetings(history, people[a].id, people[b].id);
      const scoreAW = getPastMeetings(
        history,
        people[a].id,
        people[unmatchedPerson].id,
      );
      const scoreBW = getPastMeetings(
        history,
        people[b].id,
        people[unmatchedPerson].id,
      );
      results.push({
        type: "triple",
        people: [people[a], people[b], people[unmatchedPerson]],
        score: scoreAB + scoreAW + scoreBW,
      });
    } else {
      results.push({
        type: "pair",
        people: [people[a], people[b]],
        score: getPastMeetings(history, people[a].id, people[b].id),
      });
    }
  }

  return results;
}

export function generateMatching(
  people: Person[],
  history: MatchingHistory,
): GroupResult[] {
  const n = people.length;

  if (n <= 1) return [];
  if (n === 2)
    return [
      {
        type: "pair",
        people: [people[0], people[1]],
        score: getPastMeetings(history, people[0].id, people[1].id),
      },
    ];

  const edges: [number, number, number][] = [];

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const weight = getPastMeetings(history, people[i].id, people[j].id);
      edges.push([i, j, -weight]);
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

  const unmatched = Array.from({ length: n }, (_, i) => i).filter(
    (i) => !matched.has(i),
  );

  if (unmatched.length > 0) {
    return convertPairToTriple(pairs, unmatched[0], people, history);
  }

  return pairs.map(([i, j]) => ({
    type: "pair",
    people: [people[i], people[j]],
    score: getPastMeetings(history, people[i].id, people[j].id),
  }));
}

export function updateHistory(
  history: MatchingHistory,
  groups: GroupResult[],
): MatchingHistory {
  const newHistory: MatchingHistory = [...history];

  for (const group of groups) {
    const ids = group.people.map((p) => p.id);

    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        newHistory.push([ids[i], ids[j]]);
      }
    }
  }

  return newHistory;
}
