import { SheetData } from './google';

export interface TableColumn {
  name: string;
  dataType: string;
  isPrimaryKey: boolean;
}

export interface Table {
  name: string;
  columns: TableColumn[];
}

export interface DiagramStats {
  tableCount: number;
  fieldCount: number;
}

export interface ParseResult {
  mermaidSyntax: string;
  stats: DiagramStats;
}

/**
 * Parses raw multi-sheet data from Google Sheets into Mermaid ER Diagram syntax.
 */
export function parseToMermaid(sheets: SheetData[]): ParseResult {
  const tables = new Map<string, Table>();
  const relationships: string[] = [];
  let fieldCount = 0;

  for (const sheet of sheets) {
    const sheetName = sheet.sheetName.trim();
    const rows = sheet.data;

    if (sheetName.toLowerCase() === 'index') {
      // Skip index sheet
      continue;
    }

    if (sheetName.toLowerCase() === 'relationships') {
      // Parse relationships sheet
      // Format: ['#', 'From Table', 'FK Field', '→', 'To Table', 'PK Field']
      // Skip rows 0 and 1
      for (let i = 2; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const fromTable = row[1]?.trim();
        const fkField = row[2]?.trim();
        const toTable = row[4]?.trim();

        if (fromTable && toTable) {
          // Determine link label. If we have fkField, use it, else just 'has'
          const label = fkField ? `"${fkField}"` : '"has"';
          relationships.push(`  ${toTable} ||--o{ ${fromTable} : ${label}`);
        }
      }
      continue;
    }

    // It's a Table sheet
    // Format: ['field_name', 'field_type', 'note / FK']
    // Skip rows 0 and 1
    const columns: TableColumn[] = [];
    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const fieldName = row[0]?.trim();
      if (!fieldName) continue; // Skip if no field name

      const dataType = row[1]?.trim().replace(/\s+/g, '_') || 'VARCHAR';
      const note = row[2]?.trim() || '';
      
      // Check if note contains exactly "PK" or "PK,..."
      const isPrimaryKey = note === 'PK' || note.startsWith('PK,');

      columns.push({
        name: fieldName,
        dataType,
        isPrimaryKey,
      });

      fieldCount++;
    }

    // Only add table if it has columns or we want to show it anyway.
    // We add it anyway so empty tables still show up if they exist as a sheet.
    tables.set(sheetName, { name: sheetName, columns });
  }

  // Build Mermaid Syntax
  let syntax = 'erDiagram\n';

  // Build entities and attributes
  for (const [tableName, table] of Array.from(tables.entries())) {
    syntax += `  ${tableName} {\n`;
    for (const col of table.columns) {
      let attributes = '';
      if (col.isPrimaryKey) {
        attributes += ' PK';
      }
      syntax += `    ${col.dataType} ${col.name}${attributes}\n`;
    }
    syntax += `  }\n\n`;
  }

  // Append relationships at the end
  if (relationships.length > 0) {
    syntax += relationships.join('\n') + '\n';
  }

  return {
    mermaidSyntax: syntax,
    stats: {
      tableCount: tables.size,
      fieldCount: fieldCount,
    },
  };
}
