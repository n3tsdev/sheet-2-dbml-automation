import { NextResponse } from 'next/server';
import { fetchSheetData } from '@/lib/google';
import { parseToMermaid } from '@/lib/parser';

// Force dynamic rendering to ensure we always get real-time data from the Google Sheet
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const rows = await fetchSheetData();
    const result = parseToMermaid(rows);

    return NextResponse.json({
      success: true,
      data: result.mermaidSyntax,
      stats: result.stats,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch schema data' },
      { status: 500 }
    );
  }
}
