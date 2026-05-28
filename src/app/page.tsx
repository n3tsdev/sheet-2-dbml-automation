import DiagramRenderer from '@/components/DiagramRenderer';
import StatsBar from '@/components/StatsBar';
import { fetchSheetData } from '@/lib/google';
import { parseToMermaid } from '@/lib/parser';

// Force Next.js to dynamically render this page on every request
export const dynamic = 'force-dynamic';

export default async function Home() {
  let mermaidSyntax = '';
  let stats = { tableCount: 0, fieldCount: 0 };
  let fetchError = null;
  let fetchedAt = new Date().toISOString();

  try {
    const rows = await fetchSheetData();
    const result = parseToMermaid(rows);
    mermaidSyntax = result.mermaidSyntax;
    stats = result.stats;
  } catch (error: any) {
    fetchError = error.message;
  }

  return (
    <main className="min-h-screen bg-black text-zinc-200 selection:bg-amber-500/30 font-sans">
      
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-900/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
              Schema <span className="text-zinc-500 font-light">Sync</span>
            </h1>
          </div>
          
          <div className="text-sm text-zinc-500 flex items-center space-x-2">
            <span>Powered by</span>
            <span className="text-zinc-300 font-medium">Google Sheets</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto p-6">
        
        {fetchError ? (
          <div className="mt-12 max-w-2xl mx-auto bg-red-950/20 border border-red-900/50 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-400 mb-2">Connection Error</h2>
            <p className="text-zinc-400 mb-6 leading-relaxed">{fetchError}</p>
            <div className="bg-black/40 border border-red-900/30 rounded-lg p-4 text-left font-mono text-sm text-red-300/80">
              <p>Check your .env.local configuration:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>GOOGLE_SHEET_ID is set correctly</li>
                <li>Service account email has "Viewer" access to the sheet</li>
                <li>Private key format is valid</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900/20 rounded-2xl border border-zinc-800/60 shadow-2xl overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
            <StatsBar stats={stats} fetchedAt={fetchedAt} />
            <div className="flex-1 relative overflow-hidden">
              <DiagramRenderer chart={mermaidSyntax} />
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
