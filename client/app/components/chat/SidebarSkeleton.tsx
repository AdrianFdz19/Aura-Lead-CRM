export const SidebarSkeleton = () => (
  <div className="flex flex-col animate-pulse">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="p-5 border-b border-slate-100/80 space-y-2">
        <div className="flex justify-between items-center">
          <div className="h-4 w-1/3 bg-slate-200 rounded" />
          <div className="h-3 w-1/5 bg-slate-100 rounded" />
        </div>
        <div className="h-3 w-3/4 bg-slate-100 rounded" />
      </div>
    ))}
  </div>
);