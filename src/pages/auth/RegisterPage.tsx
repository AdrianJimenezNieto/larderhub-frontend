import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { register as registerService } from '../../features/auth/authService';

const RegisterPage = () => {
  const navigate = useNavigate();
  const loginStore = useAuthStore((s) => s.login);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Local validation: password match
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const { name, email, password } = form;
      const response = await registerService({ name, email, password });
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
    <main className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-card p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl text-brand-600 mb-1">LarderHub</h1>
          <h2 className="text-xl text-surface-700">Crear cuenta</h2>
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
          {/* Name */}
          <div className="flex flex-col gap-1">
            <label htmlFor="register-name" className="text-sm font-semibold text-surface-700 font-body">
              Nombre
            </label>
            <input
              id="register-name"
              type="text"
              name="name"
              autoComplete="given-name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Tu nombre"
              className="border border-surface-300 rounded-lg px-4 py-2 text-surface-900 font-body focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label htmlFor="register-email" className="text-sm font-semibold text-surface-700 font-body">
              Email
            </label>
            <input
              id="register-email"
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
            <label htmlFor="register-password" className="text-sm font-semibold text-surface-700 font-body">
              Contraseña
            </label>
            <input
              id="register-password"
              type="password"
              name="password"
              autoComplete="new-password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="Mín. 8 caracteres"
              className="border border-surface-300 rounded-lg px-4 py-2 text-surface-900 font-body focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1">
            <label htmlFor="register-confirm" className="text-sm font-semibold text-surface-700 font-body">
              Confirmar contraseña
            </label>
            <input
              id="register-confirm"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              required
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              className="border border-surface-300 rounded-lg px-4 py-2 text-surface-900 font-body focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>

          {/* Submit */}
          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="bg-action-500 text-white font-body font-semibold rounded-lg px-6 hover:bg-action-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        {/* Link to login */}
        <p className="text-center text-sm text-surface-500 font-body">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
};

export default RegisterPage;
