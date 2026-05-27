# GitOps Database Schema Visualizer

This repository contains an automated pipeline to sync database schemas from a Google Sheet, generate a Mermaid.js ER Diagram, and deploy it as a static website on GitHub Pages.

## Prerequisites

- Python 3.10+
- A Google Service Account with the Sheets API enabled.
- The Google Sheet must be shared with the Service Account email.

## Setup Instructions

### Environment Variables for Local Development

To run this script locally for debugging, you need to set up the following environment variables:

1. **`SPREADSHEET_ID`**: The ID of your Google Sheet. You can find this in the URL of your Google Sheet: `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`
2. **`GOOGLE_SERVICE_ACCOUNT_JSON`**: The full JSON content of your Google Service Account key file.

**Windows (PowerShell):**
```powershell
$env:SPREADSHEET_ID="your_spreadsheet_id"
$env:GOOGLE_SERVICE_ACCOUNT_JSON='{"type": "service_account", ...}'
```

**Linux/macOS:**
```bash
export SPREADSHEET_ID="your_spreadsheet_id"
export GOOGLE_SERVICE_ACCOUNT_JSON='{"type": "service_account", ...}'
```

### Running Locally

1. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the script:
   ```bash
   python sync_schema.py
   ```
4. A `public/index.html` file will be generated. Open it in your browser to view the generated ER Diagram.

### GitHub Actions Setup

To enable the automated pipeline:

1. Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Create a New Repository Secret:
   - **Name**: `SPREADSHEET_ID`
   - **Value**: `<Your Spreadsheet ID>`
3. Create another New Repository Secret:
   - **Name**: `GOOGLE_SERVICE_ACCOUNT_JSON`
   - **Value**: `<Your complete Service Account JSON object>`
4. Ensure GitHub Pages is enabled:
   - Go to **Settings** -> **Pages**.
   - Under **Build and deployment**, select **GitHub Actions** as the source.

The pipeline will run automatically every 15 minutes or you can trigger it manually from the **Actions** tab.
