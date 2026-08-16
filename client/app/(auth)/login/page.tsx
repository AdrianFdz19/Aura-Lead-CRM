'use client'
import { useState } from 'react';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      window.location.href = '/dashboard'; // El middleware decidirá a dónde ir realmente
    } else {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Iniciar sesión</h2>
          <p className="text-sm text-slate-500 mt-1">Ingresa tus credenciales para acceder al sistema.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="nombre@empresa.com"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-sm active:scale-[0.98]"
          >
            Acceder al sistema
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            ¿Problemas para acceder? Contacta a tu administrador.
          </p>
        </div>
      </div>
    </div>
  );
}