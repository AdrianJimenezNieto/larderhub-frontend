import { useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import StarRating from '../../../components/StarRating';
import type { Recipe } from '../types';

interface Props {
  recipe: Recipe;
  onClose: () => void;
  onCook: (r: Recipe) => void;
  onAddMissing?: () => void;
  onEdit?: (r: Recipe) => void;
  onDelete?: (r: Recipe) => void;
  onRate?: (rating: number) => Promise<void>;
}

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);
const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.7A4 4 0 0119 10c0 5.5-7 10-7 10z"/>
  </svg>
);
const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7M16 6l-4-4-4 4M12 2v13"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12l6 6L20 6"/>
  </svg>
);
const CartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/>
    <path d="M3 3h2l2.5 12h11l2-8H6"/>
  </svg>
);
const FlameIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3c2 3 5 5 5 9a5 5 0 01-10 0c0-2 1-3 2-4-1 3 1 4 2 4 0-3-2-4 1-9z"/>
  </svg>
);
const TimerIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 2h6"/><path d="M12 14V8"/><circle cx="12" cy="14" r="8"/>
  </svg>
);
const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
);

const RecipeDetail = ({ recipe, onClose, onCook, onAddMissing, onEdit, onDelete, onRate }: Props) => {
  const currentUserId = useAuthStore(s => s.user?.id);
  const isAuthor = recipe.authorId === currentUserId;
  const have = recipe.ingredients.filter(i => i.have).length;
  const total = recipe.ingredients.length;
  const [alreadyRated, setAlreadyRated] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 30,
      background: 'var(--paper)', color: 'var(--ink)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      animation: 'screenIn .3s cubic-bezier(.2,.8,.2,1)',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>

        {/* Hero */}
        <div style={{ position: 'relative', height: 380 }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, var(--paper-2) 0%, var(--line) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em' }}>
              {recipe.title.toLowerCase()}
            </span>
          </div>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 25%, transparent 55%, rgba(0,0,0,0.8) 100%)' }} />

          <div style={{ position: 'absolute', top: 54, left: 16, right: 16, display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', color: '#171613', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BackIcon />
            </button>
            <span style={{ flex: 1 }} />
            <button style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', color: '#171613', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HeartIcon />
            </button>
            <button style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', color: '#171613', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShareIcon />
            </button>
            {isAuthor && (
              <>
                <button
                  style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', color: '#171613', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => onEdit?.(recipe)}
                >
                  <EditIcon />
                </button>
                <button
                  style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', color: '#c0392b', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => onDelete?.(recipe)}
                >
                  <TrashIcon />
                </button>
              </>
            )}
          </div>

          <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, color: '#fff' }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
              {recipe.tags.map(t => (
                <span key={t} className="chip" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', borderColor: 'transparent', backdropFilter: 'blur(8px)', fontSize: 10, height: 22 }}>{t}</span>
              ))}
            </div>
            <div className="h-xl" style={{ fontSize: 40, color: '#fff' }}>{recipe.title}</div>
            <div className="body-s" style={{ color: 'rgba(255,255,255,0.85)', marginTop: 6, fontSize: 12 }}>por {recipe.authorUsername}</div>
          </div>
        </div>

        {/* Description */}
        <div style={{ padding: '24px 24px 0' }}>
          <p className="body" style={{ fontSize: 16, lineHeight: 1.5 }}>{recipe.description}</p>
        </div>

        {/* Meta strip */}
        <div style={{ padding: '20px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {[
            { label: 'Tiempo', v: `${recipe.cookingTimeMinutes ?? '—'}`, u: 'min' },
            { label: 'Dificultad', v: recipe.difficulty ?? '—', u: '' },
            { label: 'Porciones', v: String(recipe.servings ?? '—'), u: 'p.' },
            { label: 'Match', v: `${Math.round(recipe.matchPercentage)}`, u: '%' },
          ].map(s => (
            <div key={s.label} style={{ padding: 10, background: 'var(--paper-2)', borderRadius: 10 }}>
              <div className="micro" style={{ fontSize: 8, marginBottom: 2 }}>{s.label}</div>
              <div className="mono" style={{ fontSize: 17, fontWeight: 600 }}>
                {s.v}<span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 2 }}>{s.u}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '6px 20px 0', display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
          <div style={{ padding: 10, background: 'var(--paper-2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div>
              <div className="micro" style={{ fontSize: 8, marginBottom: 2 }}>Valoración</div>
              <StarRating value={recipe.averageRating} readOnly size={16} />
            </div>
            {(recipe.ratingsCount ?? 0) > 0 && (
              <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>
                {recipe.averageRating.toFixed(1)} · {recipe.ratingsCount} {recipe.ratingsCount === 1 ? 'valoración' : 'valoraciones'}
              </span>
            )}
            {(recipe.ratingsCount ?? 0) === 0 && (
              <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>Sin valoraciones</span>
            )}
          </div>
        </div>

        {/* Ingredients */}
        <div style={{ padding: '28px 24px 10px', display: 'flex', alignItems: 'baseline' }}>
          <div className="label">Ingredientes</div>
          <span style={{ flex: 1 }} />
          <span className="mono" style={{ fontSize: 12, color: 'var(--accent-ink)' }}>{have}/{total} ya tienes</span>
        </div>
        <div style={{ padding: '0 20px' }}>
          {recipe.ingredients.map((ing, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 4px', borderBottom: '1px solid var(--line)',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                background: ing.have ? 'var(--accent)' : 'transparent',
                border: ing.have ? 0 : '1.5px solid var(--line-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#0c1e10',
              }}>
                {ing.have && <CheckIcon />}
              </div>
              <div style={{ flex: 1 }}>
                <div className="h-s" style={{ fontSize: 14, color: ing.have ? 'var(--ink)' : 'var(--ink-2)' }}>{ing.productName}</div>
                {!ing.have && <div className="body-s" style={{ fontSize: 10, color: 'var(--amber)' }}>No está en tu despensa</div>}
              </div>
              <div className="mono" style={{ fontSize: 13, color: 'var(--muted)' }}>{ing.quantity} {ing.unit}</div>
            </div>
          ))}
        </div>

        {total - have > 0 && (
          <div style={{ padding: '16px 20px 0' }}>
            <button className="btn btn-soft" style={{ width: '100%' }} onClick={onAddMissing}>
              <CartIcon /> Añadir los {total - have} que faltan a la compra
            </button>
          </div>
        )}

        {/* Rating */}
        {onRate && (
          <div style={{ padding: '20px 24px 0' }}>
            <div className="label" style={{ marginBottom: 10 }}>Tu valoración</div>
            {alreadyRated ? (
              <div className="body-s" style={{ color: 'var(--muted)' }}>Ya has valorado esta receta</div>
            ) : (
              <>
                <StarRating
                  value={0}
                  size={28}
                  onChange={async (v) => {
                    try {
                      await onRate(v);
                    } catch (e: unknown) {
                      const status = (e as { response?: { status?: number } })?.response?.status;
                      if (status === 409) setAlreadyRated(true);
                      else setRateError('No se pudo enviar tu valoración');
                    }
                  }}
                />
                {rateError && (
                  <div className="body-s" style={{ color: 'var(--red)', marginTop: 6 }}>{rateError}</div>
                )}
              </>
            )}
          </div>
        )}

        {/* Steps */}
        <div style={{ padding: '28px 24px 10px' }}>
          <div className="label">Pasos · {recipe.steps.length}</div>
        </div>
        <div style={{ padding: '0 20px 160px' }}>
          {recipe.steps.map(s => (
            <div key={s.stepNumber} style={{ display: 'flex', gap: 14, paddingBottom: 18 }}>
              <div style={{ flexShrink: 0 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'var(--ink)', color: 'var(--paper)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600,
                }}>{s.stepNumber}</div>
                {s.stepNumber < recipe.steps.length && (
                  <div style={{ width: 1, height: 'calc(100% - 42px)', background: 'var(--line)', margin: '8px auto 0' }} />
                )}
              </div>
              <div style={{ flex: 1, paddingTop: 4 }}>
                {s.title && <div className="h-s" style={{ fontSize: 15 }}>{s.title}</div>}
                <div className="body-s" style={{ marginTop: 4 }}>{s.description}</div>
                {s.timerMinutes != null && s.timerMinutes > 0 && (
                  <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <TimerIcon /> {s.timerMinutes} min
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating CTA */}
      <div style={{
        padding: '16px 20px 34px',
        background: 'linear-gradient(to top, var(--paper) 70%, transparent)',
        borderTop: '1px solid var(--line)',
      }}>
        <button className="btn btn-primary" style={{ width: '100%', height: 58, fontSize: 16 }} onClick={() => onCook(recipe)}>
          <FlameIcon /> Empezar a cocinar
        </button>
      </div>
    </div>
  );
};

export default RecipeDetail;
