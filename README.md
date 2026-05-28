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

### Real-Time Updates (Trigger on Edit)

If you want the GitHub Actions to run almost real-time whenever you make a change in the Google Sheet, you can use Google Apps Script to send a webhook to GitHub.

1. **Generate a GitHub Personal Access Token (PAT)**:
   - Go to your GitHub Settings -> **Developer settings** -> **Personal access tokens** -> **Tokens (classic)**.
   - Click **Generate new token (classic)**.
   - Give it a name (e.g., `Google Sheets Webhook`) and select the `repo` scope.
   - Generate and copy the token.

2. **Add Google Apps Script**:
   - Open your Google Sheet.
   - Click **Extensions** -> **Apps Script**.
   - Replace any existing code with the following snippet:

   ```javascript
   function onChangeTrigger(e) {
     var githubToken = "YOUR_GITHUB_PERSONAL_ACCESS_TOKEN";
     var owner = "YOUR_GITHUB_USERNAME_OR_ORG";
     var repo = "YOUR_REPOSITORY_NAME";
     
     var url = "https://api.github.com/repos/" + owner + "/" + repo + "/dispatches";
     
     var payload = {
       "event_type": "sheet_update"
     };
     
     var options = {
       "method": "post",
       "headers": {
         "Authorization": "token " + githubToken,
         "Accept": "application/vnd.github.v3+json"
       },
       "payload": JSON.stringify(payload)
     };
     
     try {
       UrlFetchApp.fetch(url, options);
     } catch(err) {
       console.error("Error triggering GitHub Action: ", err);
     }
   }
   ```
   - Replace `YOUR_GITHUB_PERSONAL_ACCESS_TOKEN`, `YOUR_GITHUB_USERNAME_OR_ORG`, and `YOUR_REPOSITORY_NAME` with your actual details.
   - Save the script (Ctrl+S or Cmd+S).

3. **Set Up the Trigger**:
   - In the Apps Script editor, click the **Triggers** icon on the left menu (it looks like an alarm clock).
   - Click **+ Add Trigger** (bottom right).
   - Choose which function to run: `onChangeTrigger`
   - Choose which deployment should run: `Head`
   - Select event source: `From spreadsheet`
   - Select event type: `On change`
   - Click **Save**. It will ask you to authorize the script; proceed through the warnings to allow it.

Now, whenever you add, edit, or remove data in the sheet, it will immediately trigger the GitHub Action to sync your schema!
