interface StatsBarProps {
  stats: {
    tableCount: number;
    fieldCount: number;
  };
  fetchedAt: string;
}

export default function StatsBar({ stats, fetchedAt }: StatsBarProps) {
  const timeStr = new Date(fetchedAt).toLocaleTimeString();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4 px-6 bg-zinc-900/40 border-b border-zinc-800/80 backdrop-blur-md sticky top-0 z-20">
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-zinc-300 text-sm font-medium tracking-wide">Live Sync</span>
        </div>
        
        <div className="h-4 w-px bg-zinc-700 hidden sm:block" />
        
        <div className="flex items-center space-x-4 text-sm text-zinc-400">
          <div className="flex items-center space-x-1.5">
            <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            <span><strong className="text-zinc-200">{stats.tableCount}</strong> Tables</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span><strong className="text-zinc-200">{stats.fieldCount}</strong> Fields</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 text-xs text-zinc-500 font-mono">
        <span>Last synced: {timeStr}</span>
        <button 
          onClick={() => window.location.reload()}
          className="p-1.5 rounded-md hover:bg-zinc-800 hover:text-zinc-300 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-600"
          title="Refresh Data"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

    </div>
  );
}
