import { Link } from 'react-router-dom';

const LandingPage = () => (
  <div className="screen entering" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
    <div className="screen-scroll" style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0c1e10" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 4c-1 10-6 16-16 16 0-10 6-16 16-16zM4 20L14 10"/>
          </svg>
        </div>
        <span className="mono" style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Larder</span>
      </div>

      {/* Hero text */}
      <div style={{ padding: '48px 24px 24px' }}>
        <div className="label" style={{ marginBottom: 14 }}>Tu despensa inteligente</div>
        <h1 className="h-hero">
          Cocina con<br />lo que <em>ya</em><br />tienes.
        </h1>
        <p className="body" style={{ marginTop: 22, maxWidth: 300 }}>
          Una despensa colaborativa y un cuaderno de recetas. Menos desperdicio, más cenas.
        </p>
      </div>

      {/* Hero image */}
      <div style={{ padding: '0 20px' }}>
        <div style={{
          position: 'relative', borderRadius: 20, overflow: 'hidden',
          aspectRatio: '4/3', marginBottom: 20,
          background: 'linear-gradient(135deg, var(--paper-2) 0%, var(--line) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em' }}>
            kitchen · hero
          </span>
          <div style={{ position: 'absolute', left: 14, bottom: 14, right: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="chip chip-fresh"><span className="dot" />frescos</span>
            <span className="chip chip-soon"><span className="dot" />caducan pronto</span>
            <span className="chip" style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'transparent', color: '#171613' }}>
              recetas sugeridas
            </span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* CTAs */}
      <div style={{ padding: '20px 20px 48px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Link to="/register" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          Empezar ahora
        </Link>
        <Link to="/login" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
          Ya tengo cuenta
        </Link>
      </div>
    </div>
  </div>
);

export default LandingPage;
