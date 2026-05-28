import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

export interface SheetData {
  sheetName: string;
  data: string[][];
}

export async function fetchSheetData(): Promise<SheetData[]> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // Handle newlines in the private key properly if they're escaped in .env
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const sheetId = process.env.GOOGLE_SHEET_ID;

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
    // 1. Fetch spreadsheet metadata to get all sheet names
    const metadataResponse = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    const sheetTitles = metadataResponse.data.sheets
      ?.map((sheet) => sheet.properties?.title)
      .filter((title): title is string => !!title) || [];

    if (sheetTitles.length === 0) {
      return [];
    }

    // 2. Fetch data for all sheets using batchGet
    // batchGet takes ranges, which can just be the sheet names
    const batchResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: sheetId,
      ranges: sheetTitles,
    });

    const valueRanges = batchResponse.data.valueRanges || [];

    // 3. Map the results back to an array of { sheetName, data }
    const results: SheetData[] = [];
    
    for (let i = 0; i < sheetTitles.length; i++) {
      const title = sheetTitles[i];
      // Note: A sheet might be empty, resulting in no values array
      const values = (valueRanges[i]?.values as string[][]) || [];
      results.push({ sheetName: title, data: values });
    }

    return results;
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    throw new Error('Failed to fetch data from Google Sheets.');
  }
}
