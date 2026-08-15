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
    <div className="flex items-center justify-center min-h-screen p-8">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <h2 className="text-2xl font-bold">Log in</h2>
        <input 
          type="email" placeholder="Email" required
          className="w-full px-3 py-2 border rounded"
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        <input 
          type="password" placeholder="Password" required
          className="w-full px-3 py-2 border rounded"
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
      </form>
    </div>
  );
}