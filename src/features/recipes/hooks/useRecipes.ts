import { useState, useMemo, useCallback, useEffect } from 'react';
import { useHouseholdStore } from '../../../store/householdStore';
import {
  getAllRecipes, getRecipeSuggestions, addMissingToShoppingList,
  createRecipe as apiCreate, updateRecipe as apiUpdate, deleteRecipe as apiDelete,
  rateRecipe as apiRate,
} from '../recipeService';
import type { RecipePayload } from '../recipeService';
import type { Recipe, RecipeSuggestion } from '../types';

export function useRecipes() {
  const activeHouseholdId = useHouseholdStore(s => s.activeHouseholdId);

  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [diffFilter, setDiffFilter] = useState<string>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeHouseholdId) {
        const suggestions: RecipeSuggestion[] = await getRecipeSuggestions(activeHouseholdId);
        // marcamos qué ingredientes tenemos
        const hydrated: Recipe[] = suggestions.map(s => ({
          ...s,
          tags: s.tags ?? [],
          ingredients: s.ingredients.map(ing => ({
            ...ing,
            have: !s.missingIngredients.some(m => m.productId === ing.productId),
          })),
        }));
        setAllRecipes(hydrated);
      } else {
        const recipes = await getAllRecipes();
        const withDefaults: Recipe[] = recipes.map(r => ({
          ...r,
          tags: r.tags ?? [],
          matchPercentage: 0,
          ingredients: r.ingredients.map(ing => ({ ...ing, have: false })),
        }));
        setAllRecipes(withDefaults);
      }
    } catch {
      setError('No se pudieron cargar las recetas');
    } finally {
      setLoading(false);
    }
  }, [activeHouseholdId]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const filtered = useMemo(() =>
    allRecipes
      .filter(r => {
        if (diffFilter !== 'all' && r.difficulty !== diffFilter) return false;
        if (query && !r.title.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage),
    [allRecipes, query, diffFilter]
  );

  const addMissingToCart = useCallback(async (recipeId: number) => {
    if (!activeHouseholdId) return;
    await addMissingToShoppingList(activeHouseholdId, recipeId);
  }, [activeHouseholdId]);

  const create = useCallback(async (data: RecipePayload) => {
    const saved = await apiCreate(data);
    await fetchRecipes();
    return saved;
  }, [fetchRecipes]);

  const update = useCallback(async (id: number, data: RecipePayload) => {
    const previous = allRecipes;
    setAllRecipes(prev => prev.map(r => r.id === id ? {
      ...r,
      title: data.title,
      description: data.description ?? r.description,
      imageUrl: data.imageUrl ?? r.imageUrl,
      difficulty: data.difficulty ?? r.difficulty,
      cookingTimeMinutes: data.cookingTimeMinutes ?? r.cookingTimeMinutes,
      servings: data.servings ?? r.servings,
    } : r));
    try {
      await apiUpdate(id, data);
      await fetchRecipes();
    } catch {
      setAllRecipes(previous);
      throw new Error('No se pudo actualizar la receta.');
    }
  }, [allRecipes, fetchRecipes]);

  const rate = useCallback(async (id: number, rating: number): Promise<void> => {
    await apiRate(id, rating);
    await fetchRecipes();
  }, [fetchRecipes]);

  const remove = useCallback(async (id: number) => {
    setAllRecipes(prev => prev.filter(r => r.id !== id));
    try {
      await apiDelete(id);
    } catch {
      await fetchRecipes();
      throw new Error('No se pudo eliminar la receta.');
    }
  }, [fetchRecipes]);

  return {
    recipes: filtered,
    allRecipes,
    loading,
    error,
    query, setQuery,
    diffFilter, setDiffFilter,
    selectedRecipe, setSelectedRecipe,
    cookingRecipe, setCookingRecipe,
    addMissingToCart,
    create, update, remove, rate,
  };
}
