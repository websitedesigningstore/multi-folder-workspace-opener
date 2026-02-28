// =============================================================================
// Multi Folder Workspace Opener – extension.ts
// =============================================================================
// This extension adds a command "Open Folders in One Workspace" that lets the
// user pick multiple folders (configurable, default = 2) via native OS dialogs
// and adds them all to the current VS Code multi-root workspace in one shot.
//
// Bonus features included:
//   • Configurable folder count  (multiFolderWorkspace.defaultFolderCount)
//   • Auto-save / prompt-to-save .code-workspace file
//   • Duplicate & already-in-workspace detection
// =============================================================================

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Activation
// ---------------------------------------------------------------------------

/**
 * Called by VS Code when the extension is first activated (i.e., when the
 * registered command is invoked for the first time).
 */
export function activate(context: vscode.ExtensionContext): void {
    console.log('[Multi Folder Workspace Opener] Extension activated.');

    const disposable = vscode.commands.registerCommand(
        'multiFolderWorkspace.openFolders',
        () => runOpenFoldersCommand()
    );

    context.subscriptions.push(disposable);
}

/**
 * Called by VS Code when the extension is deactivated (e.g., VS Code shutdown).
 */
export function deactivate(): void {
    console.log('[Multi Folder Workspace Opener] Extension deactivated.');
}

// ---------------------------------------------------------------------------
// Command handler
// ---------------------------------------------------------------------------

/**
 * Main entry point for the "Open Folders in One Workspace" command.
 * Reads user settings, collects folder picks, validates them, adds them to
 * the workspace, and optionally saves a .code-workspace file.
 */
async function runOpenFoldersCommand(): Promise<void> {
    // Read configurable settings
    const config = vscode.workspace.getConfiguration('multiFolderWorkspace');
    const folderCount: number = config.get<number>('defaultFolderCount', 2);
    const autoSave: boolean = config.get<boolean>('autoSaveWorkspace', false);

    // Step 1 – Collect folders from the user
    const selectedUris = await pickFolders(folderCount);

    if (selectedUris === null) {
        // User cancelled at some point – already notified inside pickFolders()
        return;
    }

    if (selectedUris.length === 0) {
        vscode.window.showInformationMessage(
            'No new folders were added (all selections were duplicates or already in the workspace).'
        );
        return;
    }

    // Step 2 – Add the valid folders to the workspace
    addFoldersToWorkspace(selectedUris);

    // Step 3 – Optionally save a .code-workspace file
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

/**
 * Prompts the user to select `count` folders one at a time.
 *
 * Returns:
 *   - An array of de-duplicated, valid `vscode.Uri` objects to add.
 *   - `null` when the user explicitly cancels a dialog (abort the command).
 *
 * Skips folders that:
 *   - Were already selected in a previous iteration (same-session duplicate).
 *   - Are already present in the current workspace.
 */
async function pickFolders(count: number): Promise<vscode.Uri[] | null> {
    // Build a Set of paths already in the workspace for O(1) look-ups
    const alreadyInWorkspace = new Set<string>(
        (vscode.workspace.workspaceFolders ?? []).map(f => normalise(f.uri.fsPath))
    );

    const result: vscode.Uri[] = [];
    const pickedThisSession = new Set<string>();

    for (let i = 0; i < count; i++) {
        const ordinal = ordinalLabel(i + 1, count);
        const picked = await vscode.window.showOpenDialog({
            canSelectFolders: true,
            canSelectFiles: false,
            canSelectMany: false,
            openLabel: `Select ${ordinal} Folder`,
            title: `Multi Folder Workspace Opener – Select ${ordinal} Folder (${i + 1} / ${count})`,
        });

        // User pressed Cancel or closed the dialog
        if (!picked || picked.length === 0) {
            vscode.window.showInformationMessage('Folder selection cancelled.');
            return null;
        }

        const uri = picked[0];
        const key = normalise(uri.fsPath);

        // Duplicate within this session
        if (pickedThisSession.has(key)) {
            vscode.window.showInformationMessage(
                `"${path.basename(uri.fsPath)}" was already selected – skipping.`
            );
            continue;
        }

        // Already part of the workspace
        if (alreadyInWorkspace.has(key)) {
            vscode.window.showInformationMessage(
                `"${path.basename(uri.fsPath)}" is already in the workspace – skipping.`
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

/**
 * Appends the given folder URIs to the current VS Code workspace.
 * Uses `updateWorkspaceFolders` which works for both:
 *   - No workspace open yet  → VS Code will switch to a transient multi-root workspace.
 *   - Existing workspace      → Folders are appended at the end.
 */
function addFoldersToWorkspace(uris: vscode.Uri[]): void {
    const start = vscode.workspace.workspaceFolders?.length ?? 0;

    const success = vscode.workspace.updateWorkspaceFolders(
        start,        // insert position (append)
        null,         // number of folders to remove (none)
        ...uris.map(uri => ({ uri }))
    );

    if (!success) {
        vscode.window.showErrorMessage(
            'Failed to add folders to the workspace. Please try again.'
        );
    }
}

// ---------------------------------------------------------------------------
// .code-workspace file saving (Bonus feature)
// ---------------------------------------------------------------------------

/**
 * Prompts the user to choose a save location and writes a `.code-workspace`
 * JSON file containing ALL current workspace folders (existing + newly added).
 *
 * After writing, VS Code is instructed to open the saved file so the workspace
 * becomes "named" (persisted) rather than transient.
 */
async function saveWorkspaceFile(newUris: vscode.Uri[]): Promise<void> {
    // Show save dialog
    const saveUri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file(
            path.join(require('os').homedir(), 'my-workspace.code-workspace')
        ),
        filters: {
            'VS Code Workspace': ['code-workspace'],
        },
        title: 'Save Workspace File',
        saveLabel: 'Save',
    });

    if (!saveUri) {
        // User cancelled the save dialog – that's fine, not an error
        return;
    }

    // Collect ALL folders: existing ones + newly added ones
    const existingFolders = (vscode.workspace.workspaceFolders ?? []).map(f => ({
        path: f.uri.fsPath,
    }));
    const newFolders = newUris.map(u => ({ path: u.fsPath }));

    // Merge and de-duplicate by normalised path
    const seen = new Set<string>(existingFolders.map(f => normalise(f.path)));
    const merged = [...existingFolders];
    for (const f of newFolders) {
        if (!seen.has(normalise(f.path))) {
            seen.add(normalise(f.path));
            merged.push(f);
        }
    }

    // Build the .code-workspace JSON structure
    const workspaceContent = {
        folders: merged,
        settings: {},
    };

    try {
        fs.writeFileSync(saveUri.fsPath, JSON.stringify(workspaceContent, null, 2), 'utf8');
        vscode.window.showInformationMessage(
            `Workspace saved to "${path.basename(saveUri.fsPath)}".`
        );

        // Open the saved workspace file so VS Code adopts it as the named workspace
        await vscode.commands.executeCommand('vscode.openFolder', saveUri, {
            forceNewWindow: false,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`Failed to save workspace file: ${message}`);
    }
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Normalises a file-system path for reliable cross-platform comparison.
 * On Windows, paths are lowercased since NTFS is case-insensitive.
 */
function normalise(fsPath: string): string {
    const resolved = path.resolve(fsPath);
    return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

/**
 * Returns a human-readable ordinal label to use in dialog titles.
 * e.g. ordinalLabel(1, 2) → "1st"
 *      ordinalLabel(2, 2) → "2nd"
 *      ordinalLabel(3, 5) → "3rd"
 */
function ordinalLabel(n: number, _total: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (suffixes[(v - 20) % 10] ?? suffixes[v] ?? suffixes[0]);
}
