import { useState, useEffect } from 'react';
import type { Recipe } from '../types';

interface Props {
  recipe: Recipe;
  onExit: () => void;
}

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);
const VolumeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 10v4h3l5 4V6L8 10H5z"/><path d="M16 8a5 5 0 010 8M19 5a9 9 0 010 14"/>
  </svg>
);
const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h10a4 4 0 014 4v12H8a4 4 0 01-4-4V4zM4 17a3 3 0 013-3h11"/>
  </svg>
);
const PlayIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M6 4l14 8-14 8V4z"/></svg>
);
const PauseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
);
const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M11 6l-6 6 6 6"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12l6 6L20 6"/>
  </svg>
);

const fmt = (sec: number) => {
  const m = Math.floor(sec / 60);
  const r = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
};

const CookingMode = ({ recipe, onExit }: Props) => {
  const toSeconds = (s: typeof recipe.steps[0] | undefined) =>
    s?.timerMinutes != null ? s.timerMinutes * 60 : null;

  const [step, setStep] = useState(0);
  const [timer, setTimer] = useState<number | null>(toSeconds(recipe.steps[0]));
  const [timerRunning, setTimerRunning] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [showIngs, setShowIngs] = useState(false);

  const s = recipe.steps[step];
  const total = recipe.steps.length;

  const goToStep = (next: number) => {
    setStep(next);
    setTimer(toSeconds(recipe.steps[next]));
    setTimerRunning(false);
  };

  useEffect(() => {
    if (!timerRunning || timer == null || timer <= 0) return;
    const iv = setInterval(() => {
      setTimer(t => {
        if (t == null || t <= 1) { setTimerRunning(false); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [timerRunning, timer]);

  const stepMax = toSeconds(s);
  const pct = timer != null && stepMax ? timer / stepMax : 0;
  const r = 108;
  const circumference = 2 * Math.PI * r;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 40,
      background: 'var(--ink)', color: 'var(--paper)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>

        {/* Top bar */}
        <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onExit} style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)', border: 0, color: 'var(--paper)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <CloseIcon />
          </button>
          <span style={{ flex: 1 }} />
          <button onClick={() => setVoiceOn(!voiceOn)} style={{
            width: 44, height: 44, borderRadius: '50%',
            background: voiceOn ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
            color: voiceOn ? '#0c1e10' : 'var(--paper)', border: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <VolumeIcon />
          </button>
          <button onClick={() => setShowIngs(true)} style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)', border: 0, color: 'var(--paper)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <BookIcon />
          </button>
        </div>

        {/* Progress */}
        <div style={{ padding: '20px 20px 0', display: 'flex', gap: 4 }}>
          {recipe.steps.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i <= step ? 'var(--accent)' : 'rgba(255,255,255,0.15)',
              transition: 'background .3s',
            }} />
          ))}
        </div>

        {/* Step info */}
        <div style={{ padding: '20px 24px 0' }}>
          <div className="micro" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {recipe.title} · Paso {step + 1} de {total}
          </div>
          <h1 className="h-xl" style={{ fontSize: 40, color: 'var(--paper)', marginTop: 8 }}>
            {s.title ?? `Paso ${step + 1}`}
          </h1>
          <p className="body" style={{ color: 'rgba(255,255,255,0.8)', fontSize: 17, lineHeight: 1.5, marginTop: 14 }}>
            {s.description}
          </p>
        </div>

        {/* Timer */}
        {timer != null && (
          <div style={{ padding: '32px 20px 0', display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: 240, height: 240 }}>
              <svg width="240" height="240" className="timer-ring">
                <circle cx="120" cy="120" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                <circle cx="120" cy="120" r={r}
                  fill="none" stroke="var(--accent)" strokeWidth="6"
                  strokeDasharray={`${circumference}`}
                  strokeDashoffset={`${circumference * (1 - pct)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <div className="micro" style={{ color: 'rgba(255,255,255,0.5)' }}>Restante</div>
                <div className="mono" style={{
                  fontSize: 64, fontWeight: 500, color: 'var(--paper)', marginTop: 4,
                  letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
                }}>
                  {fmt(timer)}
                </div>
                <button onClick={() => setTimerRunning(!timerRunning)} style={{
                  marginTop: 14, width: 56, height: 56, borderRadius: '50%',
                  background: 'var(--accent)', color: '#0c1e10', border: 0, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {timerRunning ? <PauseIcon /> : <PlayIcon />}
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ height: 120 }} />
      </div>

      {/* Nav controls */}
      <div style={{ padding: '16px 20px 34px', display: 'flex', gap: 10, borderTop: '1px solid rgba(255,255,255,0.08)', background: 'var(--ink)' }}>
        <button
          onClick={() => goToStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="btn"
          style={{
            flex: 1, background: 'rgba(255,255,255,0.1)', color: 'var(--paper)',
            opacity: step === 0 ? 0.35 : 1, border: 0,
          }}
        >
          <ArrowLeftIcon /> Anterior
        </button>
        {step < total - 1 ? (
          <button onClick={() => goToStep(step + 1)} className="btn btn-accent" style={{ flex: 1.4 }}>
            Siguiente <ArrowRightIcon />
          </button>
        ) : (
          <button onClick={onExit} className="btn btn-accent" style={{ flex: 1.4 }}>
            ¡A comer! <CheckIcon />
          </button>
        )}
      </div>

      {/* Ingredients sheet */}
      {showIngs && (
        <>
          <div className="sheet-backdrop" onClick={() => setShowIngs(false)} />
          <div className="sheet" style={{ background: 'var(--paper)', color: 'var(--ink)', height: '60dvh' }}>
            <div className="sheet-handle" />
            <div style={{ padding: '18px 24px 0' }}>
              <div className="label" style={{ marginBottom: 10 }}>Ingredientes</div>
              <div className="h-l">{recipe.title}</div>
            </div>
            <div className="sheet-scroll" style={{ padding: '18px 20px 20px' }}>
              {recipe.ingredients.map((ing, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 4px', borderBottom: '1px solid var(--line)',
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                    background: ing.have ? 'var(--accent)' : 'var(--paper-2)',
                  }} />
                  <div className="h-s" style={{ flex: 1, fontSize: 14 }}>{ing.productName}</div>
                  <div className="mono" style={{ fontSize: 13, color: 'var(--muted)' }}>{ing.quantity} {ing.unit}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CookingMode;
