import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center">
        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-4">
          Aura Lead CRM - MVP
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          Real Estate Management
        </h1>
        <p className="text-slate-600 text-sm mb-8">
          Streamline your property leads, client communications, and team workflows efficiently.
        </p>
        
        <div className="space-y-3">
          <Link
            href="/login"
            className="w-full block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-sm"
          >
            Sign In to Dashboard
          </Link>
          <Link
            href="/pricing"
            className="w-full block bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl text-sm transition-all"
          >
            View Pricing Plans
          </Link>
        </div>
      </div>
    </div>
  );
}