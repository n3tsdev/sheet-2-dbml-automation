export interface TableColumn {
  name: string;
  dataType: string;
  isPrimaryKey: boolean;
  foreignKey: string;
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
 * Parses raw rows from Google Sheets into Mermaid ER Diagram syntax.
 * Expected columns: [TableName, FieldName, DataType, IsPrimaryKey, ForeignKey]
 */
export function parseToMermaid(rows: string[][]): ParseResult {
  const tables = new Map<string, Table>();
  const relationships: string[] = [];
  let fieldCount = 0;

  // 1. Group rows into Tables
  for (const row of rows) {
    const tableName = row[0]?.trim();
    if (!tableName) continue; // Skip empty rows

    const fieldName = row[1]?.trim() || 'unknown_field';
    // Clean up spaces in data types for Mermaid compatibility
    const dataType = row[2]?.trim().replace(/\s+/g, '_') || 'VARCHAR';
    const isPrimaryKey = row[3]?.trim().toLowerCase() === 'true' || row[3]?.trim().toLowerCase() === 'yes';
    const foreignKey = row[4]?.trim() || '';

    if (!tables.has(tableName)) {
      tables.set(tableName, { name: tableName, columns: [] });
    }

    tables.get(tableName)!.columns.push({
      name: fieldName,
      dataType,
      isPrimaryKey,
      foreignKey,
    });
    
    fieldCount++;
  }

  // 2. Build Mermaid Syntax
  let syntax = 'erDiagram\n';

  // Build entities and attributes
  for (const [tableName, table] of Array.from(tables.entries())) {
    syntax += `  ${tableName} {\n`;
    for (const col of table.columns) {
      let attributes = '';
      if (col.isPrimaryKey) {
        attributes += ' PK';
      }
      if (col.foreignKey) {
        attributes += ' FK';
      }
      syntax += `    ${col.dataType} ${col.name}${attributes}\n`;

      // Build relationships if a foreign key exists
      if (col.foreignKey) {
        // Assume format is TargetTable.TargetColumn, e.g., "Users.id" or just "Users"
        const parts = col.foreignKey.split('.');
        const targetTable = parts[0];
        if (targetTable) {
          // Zero or many to exactly one (standard FK relationship)
          relationships.push(`  ${targetTable} ||--o{ ${tableName} : "has"`);
        }
      }
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
      fieldCount: fieldCount
    }
  };
}
