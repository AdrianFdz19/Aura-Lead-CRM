'use client'; // This directive is essential for Next.js Client Components

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

// Define props to control locking from the parent component (e.g., the page)
interface RegisterFormProps {
  isDemoLocked?: boolean;
}

/**
 * The improved and lockable registration form component.
 */
function RegisterForm({ isDemoLocked = false }: RegisterFormProps) {
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get('plan') || 'basic';
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Preconfigured demo account data
  const demoCredentials = {
    companyName: 'Elite Real Estate Demo',
    adminName: 'Juan Recruiter',
    email: 'juan@elite.com',
    password: 'broker1234',
    confirmPassword: 'broker1234',
  };

  const [formData, setFormData] = useState({
    companyName: '',
    adminName: '',
    email: '',
    password: '',
    confirmPassword: '',
    selectedPlan: selectedPlan, 
  });

  // Unified function for the demo login button
  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: demoCredentials.email, password: demoCredentials.password }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        window.location.href = '/dashboard'; // Redirect directly to the dashboard
      } else {
        alert("Demo login failed. Please try again later.");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Prevent submission if the form is locked for demo purposes
    if (isDemoLocked) return; 

    // Frontend validation: ensure passwords match before sending
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // Send the form data state
        credentials: 'include' // Include cookies for session management
      });

      if (res.ok) {
        const data = await res.json();
        // On success, redirect to checkout with the plan and tenant ID
        window.location.href = `/checkout?plan=${data.plan}&tenantId=${data.tenantId}`;
      } else {
        const errorData = await res.json();
        // Display backend-specific errors (e.g., validation or existing email)
        alert(errorData.error || "Registration failed");
        setLoading(false);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setLoading(false);
    }
  };

  // Common Tailwind classes for inputs, adjusted for the locked state
  const inputClass = `w-full px-4 py-3 border ${isDemoLocked ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'} rounded-xl outline-none transition-all disabled:cursor-not-allowed`;

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* Left Section: Branding/Marketing (Styled similarly to the login page) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 p-12 flex-col justify-between text-white">
        <div className="text-3xl font-extrabold tracking-tighter">Aura<span className='text-blue-400'>CRM</span></div>
        <div>
          <h1 className="text-5xl font-bold mb-4 leading-tight tracking-tight">
            Manage your real estate agency with intelligence.
          </h1>
          <p className="text-slate-400 text-xl mt-4">
            Automate leads and centralize WhatsApp in one place.
          </p>
        </div>
        <div className="text-sm text-slate-500">© 2026 Aura Lead CRM. All rights reserved.</div>
      </div>

      {/* Right Section: Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg space-y-8 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100">
          
          {/* Form Header */}
          <div>
            <h2 className="text-4xl font-bold tracking-tighter text-slate-900">Create Account</h2>
            <p className="text-slate-600 mt-3 text-lg">Start managing your real estate business today.</p>
          </div>

          {/* Quick Access Button for Demo (The requested feature) */}
          <div className="border border-blue-100 bg-blue-50/50 p-4 rounded-xl">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl text-sm transition-all shadow-sm active:scale-[0.98] disabled:opacity-60"
            >
              <span>✨</span>
              {loading ? 'Signing in...' : 'Quick Access (Recruiter Demo)'}
            </button>
            <p className="text-[13px] text-purple-700/80 text-center mt-2.5">
              Instantly access a fully configured account with data for review.
            </p>
          </div>

          {/* Separator */}
          <div className="flex items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="px-4 text-sm text-slate-500 uppercase tracking-wider font-medium">or create new account</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Registration Form */}
          <form className="space-y-5" onSubmit={handleRegister}>
            
            {/* Company Name Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Company Name</label>
              <input
                name="companyName"
                className={inputClass}
                placeholder="Elite Real Estate"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
                disabled={isDemoLocked} // Disable if demo mode is active
              />
            </div>

            {/* Admin Name Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Admin Name</label>
              <input
                name="adminName"
                className={inputClass}
                placeholder="Juan Pérez"
                value={formData.adminName}
                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                required
                disabled={isDemoLocked}
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                name="email"
                className={inputClass}
                type="email"
                placeholder="admin@elite.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isDemoLocked}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password"
                  className={`${inputClass} pr-12`}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  disabled={isDemoLocked}
                />
                {/* Toggle password visibility button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  disabled={isDemoLocked}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88 12 12l2.12 2.12" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  className={`${inputClass} pr-12`}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={8}
                  disabled={isDemoLocked}
                />
                {/* Toggle confirm password visibility button */}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  disabled={isDemoLocked}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88 12 12l2.12 2.12" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Registration Button */}
            <button 
              type="submit" 
              disabled={loading || isDemoLocked} // Disable if loading or locked
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? 'Creating Account...' : 'Create AuraCRM Account'}
            </button>
          </form>

          {/* Link to Login Page */}
          <p className="text-sm text-center text-slate-600 mt-6">
            Already have an account? <a href="/login" className="text-blue-600 font-semibold hover:underline">Sign in</a>
          </p>

          {/* Mobile copyright note */}
          <p className="text-xs text-center text-slate-400 pt-6 block lg:hidden">© 2026 Aura Lead CRM. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

/**
 * The page component that wraps the form in a Suspense boundary.
 * This resolves the Next.js error "missing-suspense-with-csr-bailout".
 */
export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      {/* For public production, set isDemoLocked to true. 
          If you want to allow real client registration later, set it to false. */}
      <RegisterForm isDemoLocked={true} />
    </Suspense>
  );
}