import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { login as loginService } from '../../features/auth/authService';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const loginStore = useAuthStore((s) => s.login);

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await loginService(form);
      loginStore(response);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403) {
        setError('Credenciales incorrectas. Comprueba tu email y contraseña.');
      } else {
        setError('Error de conexión. Inténtalo de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen entering" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
      <div className="screen-scroll" style={{ display: 'flex', flexDirection: 'column' }}>

        {/* Back button */}
        <div style={{ padding: '16px 20px' }}>
          <Link to="/" className="btn btn-icon btn-soft"><BackIcon /></Link>
        </div>

        {/* Heading */}
        <div style={{ padding: '16px 24px 8px' }}>
          <div className="label" style={{ marginBottom: 12 }}>Iniciar sesión · 01</div>
          <h1 className="h-xl">Hola de<br /><em>nuevo.</em></h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>
          {error && (
            <div role="alert" style={{
              background: 'var(--red-soft)', color: 'var(--red)',
              borderRadius: 'var(--r-m)', padding: '12px 14px',
              fontSize: 13, fontFamily: 'var(--sans)'
            }}>
              {error}
            </div>
          )}

          <div className="col gap-6">
            <label className="micro" htmlFor="login-email">Correo</label>
            <input
              id="login-email" className="input" type="email" name="email"
              autoComplete="email" required
              value={form.email} onChange={handleChange}
              placeholder="tu@email.com"
            />
          </div>

          <div className="col gap-6">
            <label className="micro" htmlFor="login-password">Contraseña</label>
            <input
              id="login-password" className="input" type="password" name="password"
              autoComplete="current-password" required
              value={form.password} onChange={handleChange}
              placeholder="••••••••"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-sm btn-soft">¿Olvidaste la contraseña?</button>
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--muted)' }}>
              <span className="hr grow" /><span className="micro">o</span><span className="hr grow" />
            </div>
            <Link to="/register" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
              Crear una cuenta
            </Link>
          </div>
        </form>

      </div>
    </div>
  );
};

export default LoginPage;
