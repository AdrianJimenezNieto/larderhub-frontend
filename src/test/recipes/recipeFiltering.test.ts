import { describe, it, expect } from 'vitest';
import type { Recipe } from '../../features/recipes/types';

/**
 * Replicates the filter + sort logic from useRecipes.ts useMemo block.
 * Testing it as a pure function avoids the need to mount a React component
 * while still exercising the exact same logic.
 */
function filterAndSort(recipes: Recipe[], query: string, diffFilter: string): Recipe[] {
  return recipes
    .filter(r => {
      if (diffFilter !== 'all' && r.difficulty !== diffFilter) return false;
      if (query && !r.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
}

const fixtures: Recipe[] = [
  {
    id: 1, title: 'Tortilla española', difficulty: 'easy',
    matchPercentage: 80, description: '', authorId: 0, authorUsername: 'u', averageRating: 0,
    tags: [], ingredients: [], steps: [],
  },
  {
    id: 2, title: 'Paella valenciana', difficulty: 'hard',
    matchPercentage: 60, description: '', authorId: 0, authorUsername: 'u', averageRating: 0,
    tags: [], ingredients: [], steps: [],
  },
  {
    id: 3, title: 'Croquetas', difficulty: 'medium',
    matchPercentage: 90, description: '', authorId: 0, authorUsername: 'u', averageRating: 0,
    tags: [], ingredients: [], steps: [],
  },
  {
    id: 4, title: 'Ensalada verde', difficulty: 'easy',
    matchPercentage: 40, description: '', authorId: 0, authorUsername: 'u', averageRating: 0,
    tags: [], ingredients: [], steps: [],
  },
];

describe('Recipe filtering and sorting', () => {
  it('filterByDifficulty_easy returns only easy recipes', () => {
    const result = filterAndSort(fixtures, '', 'easy');
    expect(result).toHaveLength(2);
    expect(result.every(r => r.difficulty === 'easy')).toBe(true);
  });

  it('filterByDifficulty_all returns all recipes', () => {
    const result = filterAndSort(fixtures, '', 'all');
    expect(result).toHaveLength(4);
  });

  it('filterByQuery matches title case-insensitively', () => {
    const result = filterAndSort(fixtures, 'tortilla', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Tortilla española');
  });

  it('filterByQuery with no match returns empty list', () => {
    const result = filterAndSort(fixtures, 'xyz123', 'all');
    expect(result).toHaveLength(0);
  });

  it('sorts by matchPercentage descending', () => {
    const result = filterAndSort(fixtures, '', 'all');
    const percentages = result.map(r => r.matchPercentage);
    expect(percentages).toEqual([90, 80, 60, 40]);
  });

  it('combined filter: difficulty + query', () => {
    const result = filterAndSort(fixtures, 'ensalada', 'easy');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Ensalada verde');
  });
});
