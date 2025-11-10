import { readFileSync } from 'fs';
import { generateMatching, type Person, type MatchingHistory } from './matching';

const csv = readFileSync('./history.csv', 'utf-8');
const lines = csv.split('\n').filter(line => line.trim() && line !== 'Left,Right');

const history: MatchingHistory = [];
const peopleSet = new Set<string>();

for (const line of lines) {
  const [left, right] = line.split(',').map(s => s.trim().replace(/^@/, ''));
  if (left && right) {
    history.push([left, right]);
    peopleSet.add(left);
    peopleSet.add(right);
  }
}

const people: Person[] = Array.from(peopleSet).sort().map(name => ({
  id: name,
  name: name
}));

console.log(`Loaded ${people.length} people and ${history.length} historical pairings\n`);

const groups = generateMatching(people, history);

console.log('Generated matching:');
groups.forEach((group, i) => {
  const names = group.people.map(p => p.name);
  console.log(`${i + 1}. ${group.type}: [${names.join(', ')}] (score: ${group.score})`);
});

console.log(`\nTotal: ${groups.length} groups (${groups.filter(g => g.type === 'pair').length} pairs, ${groups.filter(g => g.type === 'triple').length} triples)`);

const totalScore = groups.reduce((sum, g) => sum + g.score, 0);
console.log(`Total repeat score: ${totalScore}`);
