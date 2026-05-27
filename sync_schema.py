import os
import json
import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    service_account_json_str = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")
    spreadsheet_id = os.getenv("SPREADSHEET_ID")

    if not service_account_json_str:
        logger.error("GOOGLE_SERVICE_ACCOUNT_JSON is not set.")
        exit(1)
    if not spreadsheet_id:
        logger.error("SPREADSHEET_ID is not set.")
        exit(1)
        
    try:
        service_account_info = json.loads(service_account_json_str)
        credentials = service_account.Credentials.from_service_account_info(service_account_info)
    except Exception as e:
        logger.error(f"Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON: {e}")
        exit(1)

    try:
        service = build('sheets', 'v4', credentials=credentials)
        sheet = service.spreadsheets()
        
        # Get all sheets
        spreadsheet = sheet.get(spreadsheetId=spreadsheet_id).execute()
        sheets_info = spreadsheet.get('sheets', [])
    except Exception as e:
        logger.error(f"Failed to fetch spreadsheet info: {e}")
        exit(1)
        
    # We want to skip 'config' and 'readme'
    skip_sheets = {'config', 'readme'}
    
    erd_tables = []
    erd_relationships = []
    
    for s in sheets_info:
        title = s.get("properties", {}).get("title", "")
        if title.lower() in skip_sheets:
            logger.info(f"Skipping sheet: {title}")
            continue
            
        logger.info(f"Processing sheet: {title}")
        
        # Fetch sheet data (A to D)
        range_name = f"'{title}'!A:D"
        try:
            result = sheet.values().get(spreadsheetId=spreadsheet_id, range=range_name).execute()
            rows = result.get('values', [])
        except Exception as e:
            logger.error(f"Failed to fetch data for sheet {title}: {e}")
            continue
            
        if not rows:
            logger.info(f"No data found in {title}.")
            continue
            
        # Format table name safely for mermaid (remove spaces, wrap in quotes if needed)
        # It's safest to just replace spaces with underscores for Mermaid entity names.
        table_name = title.strip().replace(" ", "_")
        
        columns = []
        
        # We skip row 0 if it looks like the header
        start_idx = 1 if len(rows) > 0 else 0
        
        for i in range(start_idx, len(rows)):
            row = rows[i]
            # Skip empty rows
            if not any(row):
                continue
                
            field_name = row[0].strip() if len(row) > 0 else ""
            data_type = row[1].strip() if len(row) > 1 else "string"
            constraints = row[2].strip() if len(row) > 2 else ""
            foreign_key = row[3].strip() if len(row) > 3 else ""
            
            if not field_name:
                continue
                
            # Safely format field name
            safe_field_name = field_name.replace(" ", "_")
            safe_data_type = data_type.replace(" ", "_")
            
            # constraint parsing for mermaid.
            # mermaid supports PK, FK, UK.
            mermaid_constraint = ""
            lower_constraints = constraints.lower()
            if "pk" in lower_constraints or "primary" in lower_constraints:
                mermaid_constraint = "PK"
            elif "fk" in lower_constraints or "foreign" in lower_constraints or foreign_key:
                mermaid_constraint = "FK"
            elif "unique" in lower_constraints or "uk" in lower_constraints:
                mermaid_constraint = "UK"
                
            desc = constraints if constraints else ""
            # escape double quotes in description
            desc = desc.replace('"', "'")
            
            columns.append(f'    {safe_data_type} {safe_field_name} {mermaid_constraint} "{desc}"')
            
            if foreign_key:
                # foreign_key format is like "users.id"
                parts = foreign_key.split(".")
                if len(parts) >= 2:
                    ref_table = parts[0].strip().replace(" ", "_")
                    ref_field = parts[1].strip().replace(" ", "_")
                    # e.g. users ||--o{ orders : "user_id"
                    erd_relationships.append(f'{ref_table} ||--o{{ {table_name} : "{safe_field_name}"')
                else:
                    logger.warning(f"Unrecognized foreign key format in {table_name}.{field_name}: {foreign_key}")
                    
        if columns:
            erd_tables.append(f"{table_name} {{\n" + "\n".join(columns) + "\n}")

    # Build Mermaid ERD String
    mermaid_erd = "erDiagram\n\n"
    if erd_tables:
        mermaid_erd += "\n\n".join(erd_tables) + "\n\n"
    if erd_relationships:
        mermaid_erd += "\n".join(erd_relationships) + "\n"

    # Generate HTML
    html_content = generate_html(mermaid_erd)
    
    # Save to public/index.html
    os.makedirs("public", exist_ok=True)
    with open("public/index.html", "w", encoding="utf-8") as f:
        f.write(html_content)
        
    logger.info("Successfully generated public/index.html")

def generate_html(erd_content):
    timestamp = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Schema Visualizer</title>
    <style>
        :root {{
            --bg-color: #ffffff;
            --text-color: #333333;
            --header-bg: #f5f5f5;
            --header-border: #e0e0e0;
        }}
        [data-theme="dark"] {{
            --bg-color: #1e1e1e;
            --text-color: #f5f5f5;
            --header-bg: #2d2d2d;
            --header-border: #444444;
        }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: var(--bg-color);
            color: var(--text-color);
            transition: background-color 0.3s, color 0.3s;
        }}
        header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 2rem;
            background-color: var(--header-bg);
            border-bottom: 1px solid var(--header-border);
        }}
        h1 {{
            margin: 0;
            font-size: 1.5rem;
        }}
        .timestamp {{
            font-size: 0.9rem;
            color: #888;
        }}
        #theme-toggle {{
            background: none;
            border: 1px solid var(--text-color);
            color: var(--text-color);
            padding: 0.5rem 1rem;
            cursor: pointer;
            border-radius: 4px;
        }}
        main {{
            padding: 2rem;
            display: flex;
            justify-content: center;
            overflow: auto;
        }}
        pre.mermaid {{
            background-color: transparent !important;
        }}
    </style>
</head>
<body>
    <header>
        <div>
            <h1>Database Schema</h1>
            <div class="timestamp">Last Updated: {timestamp}</div>
        </div>
        <button id="theme-toggle">Toggle Dark Mode</button>
    </header>
    <main>
        <pre class="mermaid">
{erd_content}
        </pre>
    </main>

    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        
        const themeToggle = document.getElementById('theme-toggle');
        const body = document.body;
        
        // Initialize theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {{
            body.setAttribute('data-theme', 'dark');
        }}

        const initMermaid = () => {{
            const currentTheme = body.getAttribute('data-theme') === 'dark' ? 'dark' : 'default';
            mermaid.initialize({{ startOnLoad: true, theme: currentTheme }});
        }};

        initMermaid();

        themeToggle.addEventListener('click', () => {{
            const newTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            if (newTheme === 'dark') {{
                body.setAttribute('data-theme', 'dark');
            }} else {{
                body.removeAttribute('data-theme');
            }}
            localStorage.setItem('theme', newTheme);
            
            // Re-render mermaid
            location.reload();
        }});
    </script>
</body>
</html>"""

if __name__ == "__main__":
    main()
