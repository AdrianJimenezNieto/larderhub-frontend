import { useState } from 'react';
import { useRecipes } from '../features/recipes/hooks/useRecipes';
import RecipeDetail from '../features/recipes/components/RecipeDetail';
import CookingMode from '../features/recipes/components/CookingMode';
import RecipeFormSheet from '../features/recipes/components/RecipeFormSheet';
import ConfirmModal from '../components/ui/ConfirmModal';
import StarRating from '../components/StarRating';
import { useHouseholdStore } from '../store/householdStore';
import { useAuthStore } from '../store/authStore';
import type { Recipe } from '../features/recipes/types';

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
  </svg>
);
const FlameIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3c2 3 5 5 5 9a5 5 0 01-10 0c0-2 1-3 2-4-1 3 1 4 2 4 0-3-2-4 1-9z"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const RecipesPage = () => {
  const { recipes, allRecipes, query, setQuery, diffFilter, setDiffFilter, selectedRecipe, setSelectedRecipe, cookingRecipe, setCookingRecipe, addMissingToCart, create, update, remove, rate } = useRecipes();
  const activeHousehold = useHouseholdStore(s => s.activeHouseholdId);
  const households = useHouseholdStore(s => s.households);
  const household = households.find(h => h.id === activeHousehold);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  const [formOpen, setFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);

  if (cookingRecipe) {
    return <CookingMode recipe={cookingRecipe} onExit={() => setCookingRecipe(null)} />;
  }

  if (selectedRecipe) {
    return (
      <>
        <RecipeDetail
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onCook={(r) => { setSelectedRecipe(null); setCookingRecipe(r); }}
          onAddMissing={() => addMissingToCart(selectedRecipe.id)}
          onEdit={(r) => { setEditingRecipe(r); setFormOpen(true); setSelectedRecipe(null); }}
          onDelete={(r) => { setDeleteTarget(r); setSelectedRecipe(null); }}
          onRate={async (rating) => {
            await rate(selectedRecipe.id, rating);
            const updated = allRecipes.find(r => r.id === selectedRecipe.id);
            if (updated) setSelectedRecipe(updated);
          }}
        />
        <RecipeFormSheet
          open={formOpen}
          recipe={editingRecipe}
          onSave={async (data) => {
            if (editingRecipe) await update(editingRecipe.id, data);
            else await create(data);
            setFormOpen(false);
          }}
          onClose={() => setFormOpen(false)}
        />
        <ConfirmModal
          isOpen={!!deleteTarget}
          title="Eliminar receta"
          message={`¿Eliminar "${deleteTarget?.title}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          isDestructive
          onConfirm={async () => {
            if (deleteTarget) await remove(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      </>
    );
  }

  const hero = recipes[0];
  const rest = recipes.slice(1);

  return (
    <div style={{ height: '100%', overflowY: 'auto', scrollbarWidth: 'none', background: 'var(--paper)' }}>

      {/* Header */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div className="micro">Cuaderno · {recipes.length} recetas</div>
          <span style={{ flex: 1 }} />
          <span className="sync-pulse" />
        </div>
        <h1 className="h-xl" style={{ fontSize: 46 }}>Qué <em>cocinar.</em></h1>
        {household && (
          <p className="body" style={{ marginTop: 10, maxWidth: 320 }}>
            Recetas para{' '}
            <span className="mono" style={{ fontSize: 13 }}>{household.name}</span>.
            Ordenadas por lo que ya tienes.
          </p>
        )}
      </div>

      {/* Search */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ position: 'relative' }}>
          <input
            className="input"
            placeholder="Buscar recetas, ingredientes…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: 44 }}
          />
          <div style={{ position: 'absolute', left: 16, top: 17, color: 'var(--muted)' }}>
            <SearchIcon />
          </div>
        </div>
      </div>

      {/* Difficulty filter */}
      <div style={{ padding: '16px 20px 8px', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {(['all', 'Fácil', 'Media', 'Difícil'] as const).map(id => (
          <button
            key={id}
            onClick={() => setDiffFilter(id)}
            className="chip"
            style={{
              height: 32, padding: '0 12px', cursor: 'pointer', flexShrink: 0, border: 0,
              background: diffFilter === id ? 'var(--ink)' : 'var(--paper-2)',
              color: diffFilter === id ? 'var(--paper)' : 'var(--ink-2)',
            }}
          >
            {id === 'all' ? 'Todas' : id}
          </button>
        ))}
      </div>

      {/* Hero recipe */}
      {hero && (
        <button
          onClick={() => setSelectedRecipe(hero)}
          style={{ margin: '12px 20px 0', padding: 0, background: 'none', border: 0, cursor: 'pointer', textAlign: 'left', width: 'calc(100% - 40px)' }}
        >
          <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', aspectRatio: '4/5', background: 'linear-gradient(135deg, var(--paper-2) 0%, var(--line) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em' }}>
              {hero.title.toLowerCase()}
            </span>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />
            <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 6 }}>
              <span className="chip" style={{ background: 'rgba(255,255,255,0.9)', color: '#171613', borderColor: 'transparent' }}>
                <FlameIcon /> {Math.round(hero.matchPercentage)}% match
              </span>
              {hero.averageRating > 0 && (
                <span className="chip" style={{ background: 'rgba(255,255,255,0.9)', color: '#171613', borderColor: 'transparent', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <StarRating value={hero.averageRating} readOnly size={11} />
                  {(hero.ratingsCount ?? 0) > 0 && <span style={{ fontSize: 9 }}>({hero.ratingsCount})</span>}
                </span>
              )}
            </div>
            <div style={{ position: 'absolute', bottom: 18, left: 18, right: 18, color: '#fff' }}>
              <div className="micro" style={{ color: 'rgba(255,255,255,0.7)' }}>{hero.tags.join(' · ')}</div>
              <div className="h-xl" style={{ fontSize: 36, color: '#fff', marginTop: 6 }}>{hero.title}</div>
              <div style={{ display: 'flex', gap: 14, marginTop: 10, alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ClockIcon /> {hero.cookingTimeMinutes ?? '—'} min
                </span>
                <span className="mono" style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>· {hero.difficulty ?? ''}</span>
                <span className="mono" style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>· {hero.servings ?? '—'} p.</span>
              </div>
            </div>
          </div>
        </button>
      )}

      {/* More recipes */}
      {rest.length > 0 && (
        <>
          <div className="label" style={{ padding: '28px 24px 10px' }}>Más recetas</div>
          <div style={{ padding: '0 20px 120px' }}>
            {rest.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRecipe(r)}
                style={{
                  width: '100%', padding: 0, background: 'none', border: 0,
                  display: 'flex', gap: 12, marginBottom: 16, cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{
                  width: 108, height: 108, borderRadius: 14, flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--paper-2) 0%, var(--line) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.05em' }}>
                    {r.title.split(' ')[0].toLowerCase()}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center' }}>
                    <span className={`chip ${r.matchPercentage > 60 ? 'chip-fresh' : ''}`} style={{ height: 18, padding: '0 6px', fontSize: 9 }}>
                      <span className="dot" style={{ width: 4, height: 4 }} />{Math.round(r.matchPercentage)}%
                    </span>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{r.difficulty ?? ''}</span>
                    {r.averageRating > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <StarRating value={r.averageRating} readOnly size={10} />
                        {(r.ratingsCount ?? 0) > 0 && (
                          <span className="mono" style={{ fontSize: 9, color: 'var(--muted)' }}>({r.ratingsCount})</span>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="h-s" style={{ fontSize: 16, color: 'var(--ink)' }}>{r.title}</div>
                  <div className="body-s" style={{
                    fontSize: 12, marginTop: 4,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {r.description}
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{r.cookingTimeMinutes ?? '—'}min</span>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>· {r.authorUsername}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {recipes.length === 0 && (
        <div style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div className="body-s">Sin resultados para "{query}"</div>
        </div>
      )}

      {/* FAB — Nueva receta */}
      {isAuthenticated && (
        <button
          className="btn btn-accent"
          style={{
            position: 'fixed', bottom: 90, right: 20, zIndex: 20,
            borderRadius: '50%', width: 52, height: 52, padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          }}
          onClick={() => { setEditingRecipe(null); setFormOpen(true); }}
        >
          <PlusIcon />
        </button>
      )}

      {/* Form sheet (create) */}
      <RecipeFormSheet
        open={formOpen}
        recipe={editingRecipe}
        onSave={async (data) => {
          if (editingRecipe) await update(editingRecipe.id, data);
          else await create(data);
          setFormOpen(false);
        }}
        onClose={() => setFormOpen(false)}
      />

      {/* Confirm delete */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Eliminar receta"
        message={`¿Eliminar "${deleteTarget?.title}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDestructive
        onConfirm={async () => {
          if (deleteTarget) await remove(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default RecipesPage;
