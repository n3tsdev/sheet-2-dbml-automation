'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface DiagramRendererProps {
  chart: string;
}

export default function DiagramRenderer({ chart }: DiagramRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgCode, setSvgCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark', // Fits Minimal Luxury aesthetic
      themeVariables: {
        primaryColor: '#18181b', // zinc-900
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#3f3f46', // zinc-700
        lineColor: '#fbbf24', // amber-400 (accent)
        secondaryColor: '#27272a', // zinc-800
        tertiaryColor: '#09090b', // zinc-950
      },
      fontFamily: 'inherit',
    });

    const renderDiagram = async () => {
      if (containerRef.current && chart) {
        try {
          // Generate a unique ID for the diagram
          const id = `mermaid-schema-${Math.random().toString(36).substring(2, 9)}`;
          const { svg } = await mermaid.render(id, chart);
          setSvgCode(svg);
          setError(null);
        } catch (err: any) {
          console.error('Mermaid rendering failed', err);
          setError(err.message || 'Failed to render diagram');
        }
      }
    };

    renderDiagram();
  }, [chart]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-red-950/20 border border-red-900/50 rounded-xl p-8 text-red-400">
        <div className="flex flex-col items-center">
          <svg className="w-8 h-8 mb-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="font-medium">Diagram parsing error</p>
          <p className="text-sm opacity-80 mt-1 max-w-md text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[600px] bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden flex flex-col group">
      
      {/* Top subtle gradient overlay */}
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-zinc-900/50 to-transparent pointer-events-none z-10" />

      {/* The pan/zoom container */}
      <div className="flex-1 w-full h-full overflow-auto custom-scrollbar p-12 flex items-center justify-center">
        {svgCode ? (
          <div 
            className="transition-opacity duration-1000 ease-out opacity-100 min-w-max"
            dangerouslySetInnerHTML={{ __html: svgCode }} 
          />
        ) : (
          <div className="animate-pulse flex flex-col items-center justify-center text-zinc-600">
            <div className="w-12 h-12 border-2 border-zinc-800 border-t-amber-500 rounded-full animate-spin mb-4" />
            <p className="text-sm tracking-widest uppercase">Rendering Canvas</p>
          </div>
        )}
      </div>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-zinc-700/50 m-4 pointer-events-none" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-zinc-700/50 m-4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-zinc-700/50 m-4 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-zinc-700/50 m-4 pointer-events-none" />
    </div>
  );
}
