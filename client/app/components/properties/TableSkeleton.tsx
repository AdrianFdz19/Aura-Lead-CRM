export const TableSkeleton = () => (
  <div className="flex flex-col animate-pulse space-y-4">
    {/* Esqueleto para escritorio */}
    <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200">
      <div className="bg-slate-50 p-4 flex gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 rounded w-1/6" />
        ))}
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-4 border-t border-slate-100 flex items-center gap-4 bg-white">
          <div className="w-12 h-12 bg-slate-200 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-3 bg-slate-100 rounded w-1/4" />
          </div>
          <div className="h-6 bg-slate-100 rounded w-20" />
          <div className="h-4 bg-slate-200 rounded w-16" />
        </div>
      ))}
    </div>

    {/* Esqueleto para móvil */}
    <div className="md:hidden space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-200 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-3 bg-slate-100 rounded w-1/3" />
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <div className="h-4 bg-slate-200 rounded w-20" />
            <div className="h-4 bg-slate-100 rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  </div>
);