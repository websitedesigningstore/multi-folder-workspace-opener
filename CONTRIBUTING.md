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

Creates a `.vsix` file that can be installed locally or published to the Marketplace.

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

## 🌐 Publishing to the VS Code Marketplace

### Prerequisites

1. Create a publisher account at [marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage)
2. Generate a **Personal Access Token (PAT)** in [Azure DevOps](https://dev.azure.com) under **User Settings → Personal Access Tokens** with scope: **Marketplace → Manage**
3. Ensure `package.json` has `"publisher": "GlobalWebify"`

### Login and Publish

```bash
npx vsce login GlobalWebify
npx vsce publish
```

To publish a specific version:
```bash
npx vsce publish 1.0.1
```

To auto-bump the version:
```bash
npx vsce publish patch   # 1.0.0 → 1.0.1
npx vsce publish minor   # 1.0.0 → 1.1.0
npx vsce publish major   # 1.0.0 → 2.0.0
```

---

## 🧩 Available npm Scripts

| Script | Command | Description |
|---|---|---|
| `compile` | `tsc -p ./` | One-time TypeScript compile |
| `watch` | `tsc -watch -p ./` | Re-compile on file changes |
| `lint` | `eslint src --ext ts` | Lint TypeScript source |
| `vsce:package` | `vsce package` | Create `.vsix` package |
| `vscode:prepublish` | `npm run compile` | Auto-runs before `vsce publish` |

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
