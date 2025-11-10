'use client';

import { useState, useEffect } from 'react';
import { generateMatching, updateHistory, type Person, type MatchingHistory, type GroupResult } from '@/lib/matching';

export default function Home() {
  const [people, setPeople] = useState<Person[]>([]);
  const [history, setHistory] = useState<MatchingHistory>([]);
  const [matches, setMatches] = useState<GroupResult[]>([]);
  const [newPersonName, setNewPersonName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const savedPeople = localStorage.getItem('donut-people');
    const savedHistory = localStorage.getItem('donut-history');
    
    if (savedPeople) setPeople(JSON.parse(savedPeople));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('donut-people', JSON.stringify(people));
  }, [people]);

  useEffect(() => {
    localStorage.setItem('donut-history', JSON.stringify(history));
  }, [history]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      const newPeople: Person[] = [];
      lines.forEach((line, index) => {
        if (index === 0 && line.toLowerCase().includes('name')) return; // Skip header
        
        const name = line.trim().replace(/^["']|["']$/g, ''); // Remove quotes
        if (name) {
          newPeople.push({
            id: crypto.randomUUID(),
            name: name
          });
        }
      });

      if (newPeople.length > 0) {
        setPeople(newPeople);
        setHistory([]); // Reset history when uploading new people
        setMatches([]);
      }
    };
    reader.readAsText(file);
  };

  const addPerson = () => {
    if (!newPersonName.trim()) return;
    
    const newPerson: Person = {
      id: crypto.randomUUID(),
      name: newPersonName.trim()
    };
    
    setPeople([...people, newPerson]);
    setNewPersonName('');
  };

  const removePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
    
    // Clean up history - remove any pairs involving this person
    const newHistory = history.filter(([a, b]) => a !== id && b !== id);
    setHistory(newHistory);
  };

  const startEditing = (person: Person) => {
    setEditingId(person.id);
    setEditingName(person.name);
  };

  const saveEdit = () => {
    if (!editingId || !editingName.trim()) return;
    
    setPeople(people.map(p => 
      p.id === editingId ? { ...p, name: editingName.trim() } : p
    ));
    setEditingId(null);
    setEditingName('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const generateNewMatching = () => {
    const newMatches = generateMatching(people, history);
    setMatches(newMatches);
  };

  const confirmMatches = () => {
    const newHistory = updateHistory(history, matches);
    setHistory(newHistory);
    alert('Matches confirmed and added to history!');
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all meeting history?')) {
      setHistory([]);
      setMatches([]);
      localStorage.setItem('donut-history', JSON.stringify([]));
    }
  };

  const exportToCSV = () => {
    const csv = people.map(p => p.name).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'people.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 dark:from-zinc-900 dark:via-black dark:to-zinc-900 py-12 px-4">
      <main className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-zinc-900 dark:text-white mb-3">
            🍩 N-Donuts
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Smart matching for donut chats
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - People Management */}
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                Upload People
              </h2>
              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 mb-2 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="font-semibold">Click to upload CSV</span> or drag and drop
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">CSV with names (one per line)</p>
                  </div>
                  <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
                </label>
                
                <button
                  onClick={exportToCSV}
                  className="w-full px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition"
                >
                  Export to CSV
                </button>
              </div>
            </div>

            {/* Add Person Section */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                Add Person
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addPerson()}
                  placeholder="Enter name..."
                  className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  onClick={addPerson}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition"
                >
                  Add
                </button>
              </div>
            </div>

            {/* People List */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                  People ({people.length})
                </h2>
                {people.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    Clear History
                  </button>
                )}
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {people.length === 0 ? (
                  <p className="text-zinc-500 dark:text-zinc-400 text-center py-8">
                    No people added yet. Upload a CSV or add manually.
                  </p>
                ) : (
                  people.map(person => (
                    <div key={person.id} className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                      {editingId === person.id ? (
                        <>
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                            className="flex-1 px-3 py-1 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                            autoFocus
                          />
                          <button onClick={saveEdit} className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded">
                            Save
                          </button>
                          <button onClick={cancelEdit} className="px-3 py-1 bg-zinc-400 hover:bg-zinc-500 text-white text-sm rounded">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-zinc-900 dark:text-white">{person.name}</span>
                          <button
                            onClick={() => startEditing(person)}
                            className="px-3 py-1 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => removePerson(person.id)}
                            className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Matching */}
          <div className="space-y-6">
            {/* Generate Section */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                Generate Matching
              </h2>
              <button
                onClick={generateNewMatching}
                disabled={people.length < 2}
                className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:from-zinc-300 disabled:to-zinc-300 dark:disabled:from-zinc-700 dark:disabled:to-zinc-700 text-white font-semibold rounded-xl transition shadow-lg disabled:shadow-none disabled:cursor-not-allowed text-lg"
              >
                {people.length < 2 ? 'Add at least 2 people' : 'Generate Matching'}
              </button>
            </div>

            {/* Matches Display */}
            {matches.length > 0 && (
              <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                    Generated Matches
                  </h2>
                  <button
                    onClick={confirmMatches}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition text-sm"
                  >
                    Confirm Matches
                  </button>
                </div>
                
                <div className="space-y-3">
                  {matches.map((match, idx) => (
                    <div key={idx} className="p-4 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-zinc-700/50 dark:to-zinc-700/30 rounded-lg border border-orange-200 dark:border-zinc-600">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {match.type === 'pair' ? '☕' : '🍩'}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-zinc-900 dark:text-white">
                            {match.people.map(p => p.name).join(' + ')}
                          </div>
                          <div className="text-xs text-zinc-600 dark:text-zinc-400">
                            {match.type === 'pair' ? 'Pair' : 'Triple'} • Met {match.score}x before
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meeting History Stats */}
            {history.length > 0 && (
              <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                  Meeting History
                </h2>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  <p>Total meetings: {history.length}</p>
                  <div className="mt-3 space-y-1 max-h-48 overflow-y-auto">
                    {/* Count meetings per pair */}
                    {(() => {
                      const pairCounts = new Map<string, number>();
                      history.forEach(([id1, id2]) => {
                        const key = [id1, id2].sort().join('-');
                        pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
                      });
                      
                      return Array.from(pairCounts.entries())
                        .sort((a, b) => b[1] - a[1]) // Sort by count descending
                        .map(([key, count]) => {
                          const [id1, id2] = key.split('-');
                          const person1 = people.find(p => p.id === id1);
                          const person2 = people.find(p => p.id === id2);
                          if (!person1 || !person2) return null;
                          return (
                            <div key={key} className="flex justify-between text-xs">
                              <span>{person1.name} + {person2.name}</span>
                              <span className="font-medium">{count}x</span>
                            </div>
                          );
                        });
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
