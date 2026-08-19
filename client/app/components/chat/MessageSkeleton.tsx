export const MessageSkeleton = () => (
  <div className="flex flex-col gap-4 animate-pulse">
    {[...Array(3)].map((_, i) => (
      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
        <div className={`h-12 w-[60%] rounded-2xl ${i % 2 === 0 ? 'bg-slate-200 rounded-bl-none' : 'bg-indigo-200 rounded-br-none'}`} />
      </div>
    ))}
  </div>
);