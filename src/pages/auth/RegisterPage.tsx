import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { register as registerService } from '../../features/auth/authService';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);

const RegisterPage = () => {
  const navigate = useNavigate();
  const loginStore = useAuthStore((s) => s.login);

  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirmPassword) { setError('Las contraseñas no coinciden.'); return; }
    if (form.password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
    setLoading(true);
    try {
      const { username, email, password } = form;
      const response = await registerService({ username, email, password });
      loginStore(response);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setError('Este email ya está registrado. Prueba a iniciar sesión.');
      } else {
        setError('Error de conexión. Inténtalo de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen entering" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
      <form id="reg-form" onSubmit={handleSubmit} noValidate
        style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div className="screen-scroll" style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Back button */}
          <div style={{ padding: '16px 20px' }}>
            <Link to="/" className="btn btn-icon btn-soft"><BackIcon /></Link>
          </div>

          {/* Heading */}
          <div style={{ padding: '16px 24px 8px' }}>
            <div className="label" style={{ marginBottom: 12 }}>Crea tu cuenta · 01/03</div>
            <h1 className="h-xl">Un lugar<br /><em>para cocinar</em><br />juntos.</h1>
          </div>

          {/* Fields */}
          <div style={{ padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
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
              <label className="micro" htmlFor="reg-name">Nombre</label>
              <input id="reg-name" className="input" type="text" name="username"
                autoComplete="username" required
                value={form.username} onChange={handleChange} placeholder="Tu nombre" />
            </div>

            <div className="col gap-6">
              <label className="micro" htmlFor="reg-email">Correo</label>
              <input id="reg-email" className="input" type="email" name="email"
                autoComplete="email" required
                value={form.email} onChange={handleChange} placeholder="tu@email.com" />
            </div>

            <div className="col gap-6">
              <label className="micro" htmlFor="reg-password">Contraseña</label>
              <input id="reg-password" className="input" type="password" name="password"
                autoComplete="new-password" required
                value={form.password} onChange={handleChange} placeholder="Mín. 8 caracteres" />
            </div>

            <div className="col gap-6">
              <label className="micro" htmlFor="reg-confirm">Confirmar contraseña</label>
              <input id="reg-confirm" className="input" type="password" name="confirmPassword"
                autoComplete="new-password" required
                value={form.confirmPassword} onChange={handleChange} placeholder="Repite tu contraseña" />
            </div>

            <p className="body-s" style={{ marginTop: 4 }}>
              Al continuar aceptas los <u>términos</u> y la <u>política de privacidad</u>.
            </p>
          </div>

          <div style={{ flex: 1 }} />

          {/* Submit */}
          <div style={{ padding: '20px 20px 48px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--sans)', margin: 0 }}>
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" style={{ color: 'var(--ink)', fontWeight: 600, textDecoration: 'underline' }}>
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
