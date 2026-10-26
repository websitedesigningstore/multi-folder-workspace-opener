# Contributing to Multi Folder Workspace Opener

Thanks for your interest in contributing! This guide covers everything you need to build, test, and publish this VS Code extension.

---

## 🛠️ Prerequisites

- **Node.js** `v18` or later → [nodejs.org](https://nodejs.org)
- **VS Code** `1.75.0` or later → [code.visualstudio.com](https://code.visualstudio.com)
- **Git**

---

## 📥 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/websitedesigningstore/multi-folder-workspace-opener.git
cd multi-folder-workspace-opener
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Compile TypeScript

```bash
npm run compile
```

Output goes to `./out/extension.js`.

To watch for changes during development:

```bash
npm run watch
```

---

## 🔍 Running & Debugging

1. Open the project folder in VS Code:
   ```bash
   code .
   ```
2. Press **F5** → An **Extension Development Host** window opens
3. In that new window:
   - Click the **folder icon** in the Activity Bar to test the Sidebar UI
   - Or press `Ctrl+Shift+P` → type **"Open Folders in Workspace"**

> Breakpoints set in `src/extension.ts` will be hit in the Debug Console of the main VS Code window.

---

## 🗂️ Project Structure

```
multi-folder-workspace-opener/
├── .vscode/
│   ├── launch.json         ← F5 Extension Development Host config
│   └── tasks.json          ← Default build task (used by launch.json)
├── src/
│   └── extension.ts        ← All extension logic (sidebar UI + command)
├── out/                    ← Compiled JS (generated, git-ignored)
├── .eslintrc.json
├── .gitignore
├── .vscodeignore           ← Files excluded from the .vsix package
├── CONTRIBUTING.md         ← This file
├── package.json            ← Extension manifest
├── tsconfig.json
└── README.md               ← End-user documentation
```

---

## 🧹 Linting

```bash
npm run lint
```

Uses `@typescript-eslint` with the rules defined in `.eslintrc.json`.

---

## 📦 Packaging

Creates a `.vsix` file that can be installed locally or published to Open VSX.

```bash
npx vsce package
# → multi-folder-workspace-opener-1.0.0.vsix
```

### Install the VSIX Locally for Testing

```bash
code --install-extension multi-folder-workspace-opener-1.0.0.vsix
```

Or via VS Code UI: Extensions panel → `...` (three dots) → **Install from VSIX…**

---

## 🌐 Publishing

The extension is published by `websitedesigningstore` on both stores:

- [Open VSX](https://open-vsx.org/extension/websitedesigningstore/multi-folder-workspace-opener)
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=websitedesigningstore.multi-folder-workspace-manager)

Bump the `version` in `package.json` before each release — neither store accepts a version that already exists.

### VS Code Marketplace

1. Create the `websitedesigningstore` publisher at [marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage)
2. Generate a **Personal Access Token (PAT)** in [Azure DevOps](https://dev.azure.com) under **User Settings → Personal Access Tokens** with scope **Marketplace → Manage** (Organization: *All accessible organizations*)
3. Publish:

```bash
npx vsce login websitedesigningstore
npx vsce publish
```

### Open VSX (automatic, via GitHub Actions)

[`.github/workflows/publish.yml`](.github/workflows/publish.yml) publishes to Open VSX with **trusted publishing (OIDC)** — no token is stored in GitHub.

One-time setup:

1. On [open-vsx.org → Settings → Trusted Publishers](https://open-vsx.org/user-settings/trusted-publishers), add a GitHub publisher:
   - Owner: `websitedesigningstore`
   - Repository: `multi-folder-workspace-opener`
   - Workflow filename: `publish.yml`
   - Environment: leave empty
2. Do **not** add an `OVSX_PAT` secret — a token always takes precedence over OIDC.

To release:

```bash
# bump "version" in package.json, commit, then:
git tag v3.0.1
git push origin main v3.0.1
```

The workflow fails if the tag doesn't match the `package.json` version.

### Open VSX (manual)

1. Sign in at [open-vsx.org](https://open-vsx.org) and create an **Access Token** under **Settings → Access Tokens**
2. Publish:

```bash
npx ovsx publish -p <OPEN_VSX_TOKEN>
```

To publish an already-packaged `.vsix`:
```bash
npx ovsx publish multi-folder-workspace-opener-<version>.vsix -p <OPEN_VSX_TOKEN>
```

---

## 🧩 Available npm Scripts

| Script | Command | Description |
|---|---|---|
| `compile` | `tsc -p ./` | One-time TypeScript compile |
| `watch` | `tsc -watch -p ./` | Re-compile on file changes |
| `lint` | `eslint src --ext ts` | Lint TypeScript source |
| `vsce:package` | `vsce package` | Create `.vsix` package |
| `vscode:prepublish` | `npm run compile` | Auto-runs before packaging / publishing |

---

## 🔧 Key Architecture

The extension has **two entry points into the same logic**:

```
Activity Bar Icon ──→ SidebarProvider (WebviewView)
                                │
                                ▼
Command Palette ────→ runOpenFoldersCommand()  ←── shared core logic
                                │
                                ▼
                    vscode.workspace.updateWorkspaceFolders()
```

- **`SidebarProvider`** renders the HTML panel and posts messages to/from the webview
- **`runOpenFoldersCommand()`** handles folder picking, deduplication, and workspace mutation
- Both paths converge at the same function, keeping logic DRY

---

## 📄 License

MIT — see [LICENSE](LICENSE)
