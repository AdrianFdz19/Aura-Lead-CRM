'use client'
import Link from 'next/link';
import { Wrench, Mail, GitBranch } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-300">
      
      {/* Minimalist Header */}
      <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/85 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 h-20 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-900 dark:text-white">
            AF<span className="text-indigo-600 dark:text-indigo-400">.</span>
          </Link>
          <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            Maintenance / Update
          </span>
        </div>
      </header>

      {/* Centered Main Content */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-20 flex flex-col items-center text-center my-auto">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 shadow-sm">
          <Wrench className="w-8 h-8 animate-bounce" />
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white max-w-2xl leading-tight">
          Optimizing Infrastructure
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
          The system is temporarily offline due to cloud deployment and infrastructure updates. We will be back online shortly.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="mailto:contact@adrianfdz.dev"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all shadow-sm"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </a>
          
          <Link
            href="https://github.com/AdrianFdz19"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <GitBranch className="w-4 h-4" />
            Check GitHub Status
          </Link>
        </div>
      </section>

      {/* Minimalist Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-6">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 dark:text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Adrian Fernandez. All rights reserved.</p>
          <p>Cloud Infrastructure / AWS Amplify</p>
        </div>
      </footer>

    </main>
  );
}