import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import Sheet from '../../../components/Sheet';
import { getCatalogProducts } from '../../catalog/catalogService';
import type { CatalogProduct } from '../../../types/catalogProduct';
import type { Recipe } from '../types';
import type { RecipePayload } from '../recipeService';

interface IngredientRow {
  productId: number | '';
  quantity: string;
  unit: string;
}

interface StepRow {
  title: string;
  description: string;
  timerMinutes: string;
}

interface Props {
  open: boolean;
  recipe?: Recipe | null;
  onSave: (data: RecipePayload) => Promise<void>;
  onClose: () => void;
}

const DIFFICULTY_OPTIONS = ['Fácil', 'Media', 'Difícil'];

const emptyIngredient = (): IngredientRow => ({ productId: '', quantity: '', unit: '' });
const emptyStep = (): StepRow => ({ title: '', description: '', timerMinutes: '' });

export default function RecipeFormSheet({ open, recipe, onSave, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [servings, setServings] = useState('');
  const [ingredients, setIngredients] = useState<IngredientRow[]>([emptyIngredient()]);
  const [steps, setSteps] = useState<StepRow[]>([emptyStep()]);
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    getCatalogProducts().then(setCatalog).catch(() => {});
    if (recipe) {
      setTitle(recipe.title);
      setDescription(recipe.description ?? '');
      setImageUrl(recipe.imageUrl ?? '');
      setDifficulty(recipe.difficulty ?? '');
      setCookingTime(recipe.cookingTimeMinutes?.toString() ?? '');
      setServings(recipe.servings?.toString() ?? '');
      setIngredients(
        recipe.ingredients.length
          ? recipe.ingredients.map(i => ({
              productId: i.productId,
              quantity: i.quantity.toString(),
              unit: i.unit ?? '',
            }))
          : [emptyIngredient()]
      );
      setSteps(
        recipe.steps.length
          ? recipe.steps.map(s => ({
              title: s.title ?? '',
              description: s.description,
              timerMinutes: s.timerMinutes?.toString() ?? '',
            }))
          : [emptyStep()]
      );
    } else {
      setTitle('');
      setDescription('');
      setImageUrl('');
      setDifficulty('');
      setCookingTime('');
      setServings('');
      setIngredients([emptyIngredient()]);
      setSteps([emptyStep()]);
    }
    setFormError(null);
  }, [open, recipe]);

  const updateIngredient = (i: number, field: keyof IngredientRow, value: string | number) => {
    setIngredients(prev => prev.map((row, idx) => idx === i ? { ...row, [field]: value } : row));
  };

  const updateStep = (i: number, field: keyof StepRow, value: string) => {
    setSteps(prev => prev.map((row, idx) => idx === i ? { ...row, [field]: value } : row));
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!title.trim()) { setFormError('El nombre de la receta es obligatorio.'); return; }
    if (ingredients.some(i => i.productId === '')) { setFormError('Selecciona un producto para cada ingrediente.'); return; }
    if (steps.some(s => !s.description.trim())) { setFormError('Cada paso necesita una descripción.'); return; }

    const payload: RecipePayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      difficulty: difficulty || undefined,
      cookingTimeMinutes: cookingTime ? parseInt(cookingTime) : undefined,
      servings: servings ? parseInt(servings) : undefined,
      ingredients: ingredients.map(i => ({
        productId: i.productId as number,
        quantity: parseFloat(i.quantity) || 1,
        unit: i.unit || undefined,
      })),
      steps: steps.map((s, idx) => ({
        stepNumber: idx + 1,
        title: s.title.trim() || undefined,
        description: s.description.trim(),
        timerMinutes: s.timerMinutes ? parseInt(s.timerMinutes) : undefined,
      })),
    };

    setSaving(true);
    try {
      await onSave(payload);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'No se pudo guardar la receta.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} height="92vh">
      <div style={{ padding: '0 16px 32px', overflowY: 'auto', height: '100%' }}>
        <h2 className="h-md serif" style={{ marginBottom: 16 }}>
          {recipe ? 'Editar receta' : 'Nueva receta'}
        </h2>

        {/* Campos escalares */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <input
            className="input"
            placeholder="Nombre de la receta *"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <textarea
            className="input"
            placeholder="Descripción..."
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ resize: 'none' }}
          />
          <input
            className="input"
            placeholder="URL de imagen (opcional)"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <select className="input" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option value="">Dificultad</option>
              {DIFFICULTY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input
              className="input"
              type="number"
              placeholder="Minutos"
              min={1}
              value={cookingTime}
              onChange={e => setCookingTime(e.target.value)}
            />
            <input
              className="input"
              type="number"
              placeholder="Raciones"
              min={1}
              value={servings}
              onChange={e => setServings(e.target.value)}
            />
          </div>
        </div>

        {/* Ingredientes */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span className="label">Ingredientes</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setIngredients(prev => [...prev, emptyIngredient()])}>
              <Plus size={14} /> Añadir
            </button>
          </div>
          {ingredients.map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 6, marginBottom: 6, alignItems: 'center' }}>
              <select
                className="input"
                value={row.productId}
                onChange={e => updateIngredient(i, 'productId', Number(e.target.value))}
              >
                <option value="">Producto...</option>
                {catalog.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input
                className="input"
                type="number"
                placeholder="Cant."
                min={0}
                step="any"
                value={row.quantity}
                onChange={e => updateIngredient(i, 'quantity', e.target.value)}
                style={{ width: 70 }}
              />
              <input
                className="input"
                placeholder="Ud."
                value={row.unit}
                onChange={e => updateIngredient(i, 'unit', e.target.value)}
                style={{ width: 55 }}
              />
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setIngredients(prev => prev.filter((_, idx) => idx !== i))}
                disabled={ingredients.length === 1}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Pasos */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span className="label">Pasos</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setSteps(prev => [...prev, emptyStep()])}>
              <Plus size={14} /> Añadir
            </button>
          </div>
          {steps.map((row, i) => (
            <div key={i} style={{ border: '1px solid var(--ink-2)', borderRadius: 8, padding: 10, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span className="micro" style={{ color: 'var(--ink-2)' }}>Paso {i + 1}</span>
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={() => setSteps(prev => prev.filter((_, idx) => idx !== i))}
                  disabled={steps.length === 1}
                >
                  <X size={14} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input
                  className="input"
                  placeholder="Título del paso (opcional)"
                  value={row.title}
                  onChange={e => updateStep(i, 'title', e.target.value)}
                />
                <textarea
                  className="input"
                  placeholder="Descripción del paso *"
                  rows={2}
                  value={row.description}
                  onChange={e => updateStep(i, 'description', e.target.value)}
                  style={{ resize: 'none' }}
                />
                <input
                  className="input"
                  type="number"
                  placeholder="Temporizador (min, opcional)"
                  min={1}
                  value={row.timerMinutes}
                  onChange={e => updateStep(i, 'timerMinutes', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        {formError && (
          <p className="micro" style={{ color: 'var(--red)', marginBottom: 12 }}>{formError}</p>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-soft" style={{ flex: 1 }} onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className="btn btn-accent" style={{ flex: 1 }} onClick={handleSubmit} disabled={saving}>
            {saving ? 'Guardando...' : recipe ? 'Guardar cambios' : 'Crear receta'}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
