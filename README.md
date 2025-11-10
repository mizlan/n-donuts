# N-Donuts 🍩

A smart matching algorithm for organizing "donut chats" - recurring one-on-one meetings between team members. The system ensures fair rotation by minimizing repeat pairings while gracefully handling odd numbers of participants through strategic triple groupings.

## What are Donut Chats?

Donut chats are casual meetings between two people (or occasionally three) designed to foster connections within teams or organizations. They're typically recurring events where participants change each round to ensure everyone gets to know each other.

## How It Works

### The Matching Algorithm

N-Donuts uses **Edmonds' Blossom Algorithm** (maximum weight matching in general graphs) to create optimal pairings that:

1. **Minimize repeat meetings** - The algorithm tracks meeting history and assigns costs based on how many times two people have met before
2. **Ensure fairness** - Everyone gets matched, even with odd numbers of participants
3. **Handle odd groups intelligently** - When there's an odd number of people, one pair is converted to a triple, choosing the combination that minimizes historical overlap

### Key Components

#### 1. Matching Generation (`generateMatching`)

```typescript
generateMatching(people: Person[], history: MatchingHistory): GroupResult[]
```

- Takes a list of people and their meeting history
- Creates edges between all possible pairs with weights based on past meetings
- Uses the Blossom algorithm to find the minimum-weight perfect matching
- If there's an unmatched person (odd number), intelligently converts one pair to a triple

#### 2. History Tracking (`updateHistory`)

```typescript
updateHistory(history: MatchingHistory, groups: GroupResult[]): MatchingHistory
```

- Records all pairwise meetings from the current round
- Updates the count for each pair (or triple) that met
- Returns the updated history for use in future rounds

#### 3. Triple Selection Strategy

When there's an odd number of participants, the algorithm:
1. Generates optimal pairs for n-1 people
2. Evaluates each pair to find which has the least combined history with the unmatched person
3. Converts that pair into a triple, minimizing the chance that people in the triple have met multiple times

### Data Structures

**Person:**
```typescript
{
  id: string;      // Unique identifier
  name: string;    // Display name
}
```

**MatchingHistory:**
```typescript
{
  [personId: string]: {
    [otherPersonId: string]: number;  // Count of past meetings
  }
}
```

**GroupResult:**
```typescript
// Either a pair:
{ type: 'pair', people: [Person, Person] }

// Or a triple (for odd groups):
{ type: 'triple', people: [Person, Person, Person] }
```

## Usage Example

```typescript
import { generateMatching, updateHistory, type Person, type MatchingHistory } from './lib/matching';

// Initialize your team
const people: Person[] = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' },
  { id: '4', name: 'Diana' },
  { id: '5', name: 'Eve' },
];

// Start with empty history
let history: MatchingHistory = {};

// Generate first round of matches
let groups = generateMatching(people, history);
console.log(groups);
// Output: 2 pairs + 1 triple (since we have 5 people)

// After meetings happen, update history
history = updateHistory(history, groups);

// Generate next round (will try to pair people who haven't met)
groups = generateMatching(people, history);
```

## Algorithm Details

### Why Edmonds' Blossom Algorithm?

The Blossom algorithm solves the **minimum-weight perfect matching** problem in general graphs. This is ideal for donut chats because:

- It guarantees optimal global pairings (not just greedy local choices)
- It handles any graph structure (some people may have complex meeting histories)
- It's efficient even for larger groups
- It naturally creates pairs from all participants

### Cost Function

The "cost" of pairing two people is simply the number of times they've met before. The algorithm minimizes total cost, which means it:
- Prioritizes pairing people who haven't met
- Evenly distributes meetings over time
- Avoids repeatedly matching the same people

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **edmonds-blossom** - Maximum weight matching algorithm
- **Tailwind CSS** - Styling (UI coming soon)

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## Testing

See `lib/matching.test.ts` for test scenarios including:
- Initial matching with odd and even groups
- History tracking over multiple rounds
- Verification of fair rotation

Run the tests:
```bash
npx tsx lib/matching.test.ts
```

---

Made with ☕ for better team connections
