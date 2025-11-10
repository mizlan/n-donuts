import { generateMatching, updateHistory, type Person, type MatchingHistory } from './matching';

const testPeople: Person[] = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' },
  { id: '4', name: 'Diana' },
  { id: '5', name: 'Eve' },
];

console.log('Test 1: Initial matching with 5 people (odd)');
let history: MatchingHistory = [];
let groups = generateMatching(testPeople, history);
console.log(JSON.stringify(groups, null, 2));
console.log(`Total groups: ${groups.length}`);
console.log(`Pairs: ${groups.filter(g => g.type === 'pair').length}`);
console.log(`Triples: ${groups.filter(g => g.type === 'triple').length}`);

console.log('\nTest 2: Update history and generate next week');
history = updateHistory(history, groups);
console.log('History after week 1:', JSON.stringify(history, null, 2));
groups = generateMatching(testPeople, history);
console.log('\nWeek 2 matching:', JSON.stringify(groups, null, 2));

console.log('\nTest 3: Multiple weeks to verify rotation');
for (let week = 3; week <= 6; week++) {
  history = updateHistory(history, groups);
  groups = generateMatching(testPeople, history);
  console.log(`\nWeek ${week}:`, JSON.stringify(groups, null, 2));
}

console.log('\n\nTest 4: Even number (4 people)');
const evenPeople = testPeople.slice(0, 4);
history = [];
groups = generateMatching(evenPeople, history);
console.log(JSON.stringify(groups, null, 2));
console.log(`Pairs: ${groups.filter(g => g.type === 'pair').length}`);
console.log(`Triples: ${groups.filter(g => g.type === 'triple').length}`);
