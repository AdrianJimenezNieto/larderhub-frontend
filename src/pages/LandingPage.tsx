import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <main className="min-h-screen bg-surface-50 flex flex-col items-center justify-center gap-8 p-6">
      {/* Brand */}
      <div className="text-center">
        <h1 className="text-5xl text-brand-600 mb-2">LarderHub</h1>
        <p className="text-surface-500 text-lg font-body">
          Tu despensa colaborativa, siempre organizada.
        </p>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          to="/login"
          className="flex items-center justify-center bg-brand-600 text-white font-body font-semibold rounded-lg px-6 hover:bg-brand-700 transition-colors"
        >
          Iniciar sesión
        </Link>
        <Link
          to="/register"
          className="flex items-center justify-center border-2 border-brand-600 text-brand-600 font-body font-semibold rounded-lg px-6 hover:bg-brand-50 transition-colors"
        >
          Registrarse
        </Link>
      </div>

      {/* Footer note */}
      <p className="text-surface-400 text-sm text-center font-body">
        Gestiona tu despensa, lista de la compra y recetas en un solo lugar.
      </p>
    </main>
  );
};

export default LandingPage;
