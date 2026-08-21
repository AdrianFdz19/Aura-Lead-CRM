'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        window.location.href = '/dashboard'; // El middleware decidirá a dónde ir
      } else {
        alert("Credenciales incorrectas");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    handleLogin({ email: 'juan@elite.com', password: 'broker1234' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(formData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Sign In test dockerfile change</h2>
          <p className="text-sm text-slate-500 mt-1">Enter your credentials to access the system.</p>
        </div>

        {/* Botón de Acceso Rápido para Reclutadores */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleDemoAccess}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
          >
            <span>✨</span>
            <span>Quick Access (Recruiter Demo)</span>
          </button>
          <p className="text-[11px] text-slate-400 text-center mt-2">
            Log in instantly with the preconfigured demo account.
          </p>
        </div>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="px-3 text-xs text-slate-400 uppercase tracking-wider">or sign in manually</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Email address
            </label>
            <input
              type="email"
              value={formData.email}
              placeholder="nombre@empresa.com"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in to system'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Demo credentials: <span className="font-mono text-slate-600">juan@elite.com</span> / <span className="font-mono text-slate-600">broker1234</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Having trouble accessing? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}