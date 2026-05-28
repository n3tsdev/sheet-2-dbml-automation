import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

export async function fetchSheetData(): Promise<string[][]> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // Handle newlines in the private key properly if they're escaped in .env
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const range = process.env.GOOGLE_SHEET_RANGE || 'Schema!A1:E';

  if (!email || !privateKey) {
    throw new Error('Google Service Account credentials missing in environment variables.');
  }

  if (!sheetId || sheetId === 'YOUR_SPREADSHEET_ID') {
    throw new Error('Please configure GOOGLE_SHEET_ID in your .env.local file.');
  }

  const auth = new JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    // Assume the first row is headers, strip it out if it contains "TableName" or similar
    const headerRow = rows[0];
    if (headerRow[0]?.toLowerCase().includes('table')) {
      return rows.slice(1) as string[][];
    }

    return rows as string[][];
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    throw new Error('Failed to fetch data from Google Sheets.');
  }
}
