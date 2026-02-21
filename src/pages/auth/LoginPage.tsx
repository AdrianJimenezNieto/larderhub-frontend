import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { login as loginService } from '../../features/auth/authService';

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
    <main className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-card p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl text-brand-600 mb-1">LarderHub</h1>
          <h2 className="text-xl text-surface-700">Iniciar sesión</h2>
        </div>

        {/* Error banner */}
        {error && (
          <div
            role="alert"
            className="bg-alert-50 border border-alert-300 text-alert-600 text-sm rounded-lg px-4 py-3 font-body"
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {/* Email */}
          <div className="flex flex-col gap-1">
            <label htmlFor="login-email" className="text-sm font-semibold text-surface-700 font-body">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              className="border border-surface-300 rounded-lg px-4 py-2 text-surface-900 font-body focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label htmlFor="login-password" className="text-sm font-semibold text-surface-700 font-body">
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="border border-surface-300 rounded-lg px-4 py-2 text-surface-900 font-body focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="bg-brand-600 text-white font-body font-semibold rounded-lg px-6 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        {/* Link to register */}
        <p className="text-center text-sm text-surface-500 font-body">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-brand-600 font-semibold hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
