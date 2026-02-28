// =============================================================================
// Multi Folder Workspace Opener – extension.ts
// =============================================================================
// This extension provides TWO ways to open multiple folders in one workspace:
//   1. Command Palette: "Multi Folder Workspace: Open Folders in One Workspace"
//   2. Sidebar UI Panel: Click the icon in the Activity Bar → click the button
//
// Bonus features:
//   • Configurable folder count  (multiFolderWorkspace.defaultFolderCount)
//   • Auto-save / prompt-to-save .code-workspace file
//   • Duplicate & already-in-workspace detection
// =============================================================================

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// ---------------------------------------------------------------------------
// Activation
// ---------------------------------------------------------------------------

export function activate(context: vscode.ExtensionContext): void {
    console.log('[Multi Folder Workspace Opener] Extension activated.');

    // 1. Register the command (Command Palette)
    const commandDisposable = vscode.commands.registerCommand(
        'multiFolderWorkspace.openFolders',
        () => runOpenFoldersCommand()
    );

    // 2. Register the Sidebar WebviewView provider
    const sidebarProvider = new SidebarProvider(context.extensionUri);
    const viewDisposable = vscode.window.registerWebviewViewProvider(
        'multiFolderWorkspace.sidebarView',
        sidebarProvider
    );

    context.subscriptions.push(commandDisposable, viewDisposable);
}

export function deactivate(): void {
    console.log('[Multi Folder Workspace Opener] Extension deactivated.');
}

// ---------------------------------------------------------------------------
// Sidebar WebviewView Provider
// ---------------------------------------------------------------------------

class SidebarProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) { }

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };

        // Render the initial HTML
        webviewView.webview.html = this._getHtml();

        // Listen for messages from the webview (button clicks)
        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'openFolders':
                    await runOpenFoldersCommand();
                    // Refresh the workspace folder list shown in the sidebar
                    this._refresh();
                    break;
                case 'refresh':
                    this._refresh();
                    break;
            }
        });

        // Keep the sidebar in sync when workspace folders change
        vscode.workspace.onDidChangeWorkspaceFolders(() => this._refresh());
    }

    /** Send updated folder list to the webview */
    private _refresh(): void {
        if (this._view) {
            const folders = (vscode.workspace.workspaceFolders ?? []).map(f => ({
                name: f.name,
                path: f.uri.fsPath,
            }));
            this._view.webview.postMessage({ command: 'updateFolders', folders });
        }
    }

    /** Build the full HTML for the sidebar panel */
    private _getHtml(): string {
        const folders = (vscode.workspace.workspaceFolders ?? []).map(f => ({
            name: f.name,
            path: f.uri.fsPath,
        }));

        const config = vscode.workspace.getConfiguration('multiFolderWorkspace');
        const folderCount: number = config.get<number>('defaultFolderCount', 2);

        return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Multi Folder Workspace Opener</title>
  <style>
    /* ── Reset & Base ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--vscode-font-family, 'Segoe UI', sans-serif);
      font-size: var(--vscode-font-size, 13px);
      color: var(--vscode-foreground);
      background: var(--vscode-sideBar-background, transparent);
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* ── Hero Button ── */
    .btn-open {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 11px 0;
      border: none;
      border-radius: 6px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s, transform 0.1s;
      letter-spacing: 0.2px;
    }
    .btn-open:hover  { opacity: 0.88; }
    .btn-open:active { opacity: 0.75; transform: scale(0.98); }
    .btn-open svg    { flex-shrink: 0; }

    /* ── Section label ── */
    .section-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--vscode-descriptionForeground);
      padding-bottom: 6px;
      border-bottom: 1px solid var(--vscode-widget-border, rgba(128,128,128,0.2));
    }

    /* ── Folder list ── */
    .folder-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-height: 28px;
    }

    .folder-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 5px;
      background: var(--vscode-list-hoverBackground, rgba(128,128,128,0.1));
      border: 1px solid var(--vscode-widget-border, transparent);
    }
    .folder-item-icon { margin-top: 1px; flex-shrink: 0; opacity: 0.7; }
    .folder-item-info { overflow: hidden; }
    .folder-item-name {
      font-weight: 600;
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .folder-item-path {
      font-size: 10px;
      opacity: 0.6;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 1px;
    }

    .empty-state {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      text-align: center;
      padding: 10px 0 4px;
      opacity: 0.75;
    }

    /* ── Info box ── */
    .info-box {
      background: var(--vscode-textBlockQuote-background, rgba(0,120,212,0.08));
      border-left: 3px solid var(--vscode-textLink-foreground, #3794ff);
      border-radius: 0 4px 4px 0;
      padding: 8px 10px;
      font-size: 11.5px;
      line-height: 1.6;
      color: var(--vscode-foreground);
      opacity: 0.9;
    }
    .info-box b { color: var(--vscode-textLink-foreground, #3794ff); }

    /* ── Shortcut badge ── */
    .shortcut-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11.5px;
      color: var(--vscode-descriptionForeground);
    }
    kbd {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      background: var(--vscode-keybindingLabel-background, rgba(128,128,128,0.2));
      border: 1px solid var(--vscode-keybindingLabel-border, rgba(128,128,128,0.4));
      border-radius: 3px;
      padding: 1px 5px;
      font-size: 10.5px;
      font-family: inherit;
    }
  </style>
</head>
<body>

  <!-- ── Hero action button ── -->
  <button class="btn-open" id="btnOpen">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h3.764c.415 0 .813.162 1.107.45l.686.672A.5.5 0 0 0 8.414 3.25h5.086A1.5 1.5 0 0 1 15 4.75v7.75A1.5 1.5 0 0 1 13.5 14h-11A1.5 1.5 0 0 1 1 12.5V3.5zm8 2.5H8V8H5.5v1H8v2.5h1V9h2.5V8H9V6z"/>
    </svg>
    Open Folders in Workspace
  </button>

  <!-- ── Current workspace folders ── -->
  <div>
    <div class="section-label">Current Workspace Folders</div>
    <div class="folder-list" id="folderList">
      ${this._renderFolderItems(folders)}
    </div>
  </div>

  <!-- ── How to use tip ── -->
  <div class="info-box">
    <b>How to use:</b> Click the button above, then pick folders from the dialog that appears.
    Both folders will open side-by-side in this window.<br><br>
    <b>Picking ${folderCount} folder(s)</b> per run (change in Settings →
    <i>multiFolderWorkspace.defaultFolderCount</i>).
  </div>

  <!-- ── Keyboard shortcut reminder ── -->
  <div class="shortcut-row">
    <span>Also available via Command Palette</span>
    <kbd>Ctrl</kbd><kbd>Shift</kbd><kbd>P</kbd>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    document.getElementById('btnOpen').addEventListener('click', () => {
      vscode.postMessage({ command: 'openFolders' });
    });

    // Receive updated folder list from extension host
    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.command === 'updateFolders') {
        document.getElementById('folderList').innerHTML = renderFolders(msg.folders);
      }
    });

    function renderFolders(folders) {
      if (!folders || folders.length === 0) {
        return '<p class="empty-state">No folders in workspace yet.<br>Click the button above to add some!</p>';
      }
      return folders.map(f => \`
        <div class="folder-item">
          <div class="folder-item-icon">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" opacity="0.8">
              <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h3.764c.415 0 .813.162 1.107.45l.686.672A.5.5 0 0 0 8.414 3.25h5.086A1.5 1.5 0 0 1 15 4.75v7.75A1.5 1.5 0 0 1 13.5 14h-11A1.5 1.5 0 0 1 1 12.5V3.5z"/>
            </svg>
          </div>
          <div class="folder-item-info">
            <div class="folder-item-name">\${escHtml(f.name)}</div>
            <div class="folder-item-path">\${escHtml(f.path)}</div>
          </div>
        </div>
      \`).join('');
    }

    function escHtml(str) {
      return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
  </script>
</body>
</html>`;
    }

    /** Render the initial folder list as HTML (server-side, before JS kicks in) */
    private _renderFolderItems(folders: { name: string; path: string }[]): string {
        if (folders.length === 0) {
            return `<p class="empty-state">No folders in workspace yet.<br>Click the button above to add some!</p>`;
        }
        return folders
            .map(
                (f) => `
      <div class="folder-item">
        <div class="folder-item-icon">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" opacity="0.8">
            <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h3.764c.415 0 .813.162 1.107.45l.686.672A.5.5 0 0 0 8.414 3.25h5.086A1.5 1.5 0 0 1 15 4.75v7.75A1.5 1.5 0 0 1 13.5 14h-11A1.5 1.5 0 0 1 1 12.5V3.5z"/>
          </svg>
        </div>
        <div class="folder-item-info">
          <div class="folder-item-name">${this._esc(f.name)}</div>
          <div class="folder-item-path">${this._esc(f.path)}</div>
        </div>
      </div>`
            )
            .join('');
    }

    private _esc(s: string): string {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
}

// ---------------------------------------------------------------------------
// Command handler (shared by both command palette AND sidebar button)
// ---------------------------------------------------------------------------

async function runOpenFoldersCommand(): Promise<void> {
    const config = vscode.workspace.getConfiguration('multiFolderWorkspace');
    const folderCount: number = config.get<number>('defaultFolderCount', 2);
    const autoSave: boolean = config.get<boolean>('autoSaveWorkspace', false);

    const selectedUris = await pickFolders(folderCount);
    if (selectedUris === null) { return; }

    if (selectedUris.length === 0) {
        vscode.window.showInformationMessage(
            'No new folders were added (all selections were duplicates or already in the workspace).'
        );
        return;
    }

    addFoldersToWorkspace(selectedUris);

    if (autoSave) {
        await saveWorkspaceFile(selectedUris);
    } else {
        const answer = await vscode.window.showInformationMessage(
            `Added ${selectedUris.length} folder(s) to the workspace. Would you like to save this as a .code-workspace file?`,
            'Save Workspace',
            'No Thanks'
        );
        if (answer === 'Save Workspace') {
            await saveWorkspaceFile(selectedUris);
        }
    }
}

// ---------------------------------------------------------------------------
// Folder picking
// ---------------------------------------------------------------------------

async function pickFolders(count: number): Promise<vscode.Uri[] | null> {
    const alreadyInWorkspace = new Set<string>(
        (vscode.workspace.workspaceFolders ?? []).map(f => normalise(f.uri.fsPath))
    );

    const result: vscode.Uri[] = [];
    const pickedThisSession = new Set<string>();

    for (let i = 0; i < count; i++) {
        const ordinal = ordinalLabel(i + 1);
        const picked = await vscode.window.showOpenDialog({
            canSelectFolders: true,
            canSelectFiles: false,
            canSelectMany: false,
            openLabel: `Select ${ordinal} Folder`,
            title: `Select ${ordinal} Folder  (${i + 1} of ${count})`,
        });

        if (!picked || picked.length === 0) {
            vscode.window.showInformationMessage('Folder selection cancelled.');
            return null;
        }

        const uri = picked[0];
        const key = normalise(uri.fsPath);

        if (pickedThisSession.has(key)) {
            vscode.window.showInformationMessage(
                `"${path.basename(uri.fsPath)}" was already selected — skipping.`
            );
            continue;
        }
        if (alreadyInWorkspace.has(key)) {
            vscode.window.showInformationMessage(
                `"${path.basename(uri.fsPath)}" is already in the workspace — skipping.`
            );
            continue;
        }

        pickedThisSession.add(key);
        result.push(uri);
    }

    return result;
}

// ---------------------------------------------------------------------------
// Workspace mutation
// ---------------------------------------------------------------------------

function addFoldersToWorkspace(uris: vscode.Uri[]): void {
    const start = vscode.workspace.workspaceFolders?.length ?? 0;
    const success = vscode.workspace.updateWorkspaceFolders(
        start, null, ...uris.map(uri => ({ uri }))
    );
    if (!success) {
        vscode.window.showErrorMessage('Failed to add folders to the workspace. Please try again.');
    }
}

// ---------------------------------------------------------------------------
// .code-workspace file saving
// ---------------------------------------------------------------------------

async function saveWorkspaceFile(newUris: vscode.Uri[]): Promise<void> {
    const saveUri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file(path.join(os.homedir(), 'my-workspace.code-workspace')),
        filters: { 'VS Code Workspace': ['code-workspace'] },
        title: 'Save Workspace File',
        saveLabel: 'Save',
    });

    if (!saveUri) { return; }

    const existingFolders = (vscode.workspace.workspaceFolders ?? []).map(f => ({ path: f.uri.fsPath }));
    const newFolders = newUris.map(u => ({ path: u.fsPath }));
    const seen = new Set<string>(existingFolders.map(f => normalise(f.path)));
    const merged = [...existingFolders];
    for (const f of newFolders) {
        if (!seen.has(normalise(f.path))) {
            seen.add(normalise(f.path));
            merged.push(f);
        }
    }

    const workspaceContent = { folders: merged, settings: {} };

    try {
        fs.writeFileSync(saveUri.fsPath, JSON.stringify(workspaceContent, null, 2), 'utf8');
        vscode.window.showInformationMessage(`Workspace saved to "${path.basename(saveUri.fsPath)}".`);
        await vscode.commands.executeCommand('vscode.openFolder', saveUri, { forceNewWindow: false });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`Failed to save workspace file: ${message}`);
    }
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function normalise(fsPath: string): string {
    const resolved = path.resolve(fsPath);
    return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

function ordinalLabel(n: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (suffixes[(v - 20) % 10] ?? suffixes[v] ?? suffixes[0]);
}
