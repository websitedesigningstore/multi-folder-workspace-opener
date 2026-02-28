# Multi Folder Workspace Opener

> **Open multiple project folders together in VS Code — in just 3 clicks!**

[![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/GlobalWebify.multi-folder-workspace-opener?label=VS%20Marketplace&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=GlobalWebify.multi-folder-workspace-opener)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/GlobalWebify.multi-folder-workspace-opener)](https://marketplace.visualstudio.com/items?itemName=GlobalWebify.multi-folder-workspace-opener)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🤔 What Does This Extension Do?

Ever needed to work on two or more projects **at the same time** in VS Code? Normally you'd have to manually edit a `.code-workspace` file. This extension does it for you instantly.

**Just run one command → pick your folders → done.** Both folders open side-by-side in a single VS Code window as a [multi-root workspace](https://code.visualstudio.com/docs/editor/multi-root-workspaces).

---

## 🕐 When Should You Use This?

| Situation | Example |
|---|---|
| Frontend + Backend in different folders | `D:\Projects\my-app-frontend` + `D:\Projects\my-app-backend` |
| Working on a shared library alongside your main project | `C:\libs\ui-components` + `D:\work\website` |
| Comparing two different versions of a project | `D:\Projects\v1` + `D:\Projects\v2` |
| Monorepo-style work without a monorepo | Any two unrelated folders on your system |
| Client A project + Client B project | Side-by-side in one window |

---

## 🚀 How to Use (Step-by-Step)

### Step 1 — Install the Extension

Open VS Code and install from the Marketplace:

1. Press `Ctrl+Shift+X` to open the Extensions panel
2. Search for **"Multi Folder Workspace Opener"**
3. Click **Install**

> Or install directly from the terminal:
> ```bash
> code --install-extension GlobalWebify.multi-folder-workspace-opener
> ```

---

### Step 2 — Run the Command

1. Press `Ctrl+Shift+P` to open the **Command Palette**
2. Type: `Open Folders in One Workspace`
3. Select **"Multi Folder Workspace: Open Folders in One Workspace"**

![Command Palette screenshot](https://raw.githubusercontent.com/websitedesigningstore/multi-folder-workspace-opener/main/images/command-palette.png)

---

### Step 3 — Select Your Folders

A **folder picker dialog** will appear. Select your first folder, then a second dialog will appear for the second folder.

> 💡 **Tip:** You can change how many folders to pick in the [Settings](#%EF%B8%8F-settings).

---

### Step 4 — You're Done! 🎉

Both folders now appear in the **Explorer sidebar** as roots of a single workspace:

```
EXPLORER
├── 📁 my-frontend    ← Folder 1
│   ├── src/
│   └── package.json
└── 📁 my-backend     ← Folder 2
    ├── src/
    └── package.json
```

You can now browse, edit, search, and run terminals across **both folders in one window**.

---

### Step 5 — Save the Workspace (Optional)

After opening the folders, the extension will ask:

> **"Would you like to save this as a .code-workspace file?"**

- Click **"Save Workspace"** → choose a location → a `.code-workspace` file is saved
- Next time, just double-click that file to open both folders instantly!
- Click **"No Thanks"** → folders are added temporarily for this session only

---

## ⚙️ Settings

Customize the extension via **File → Preferences → Settings** (or `Ctrl+,`), then search for **"Multi Folder Workspace"**:

| Setting | Default | What It Does |
|---|---|---|
| `defaultFolderCount` | `2` | How many folders to pick (min: 2, max: 10) |
| `autoSaveWorkspace` | `false` | If `true`, skips the save-prompt and always saves a `.code-workspace` file automatically |

**To pick 3 folders instead of 2**, add this to your `settings.json`:
```json
{
  "multiFolderWorkspace.defaultFolderCount": 3,
  "multiFolderWorkspace.autoSaveWorkspace": false
}
```

---

## 💡 Pro Tips

- **Reopen a saved workspace**: Double-click the `.code-workspace` file, or use **File → Open Workspace from File…**
- **Add more folders later**: Run the command again — it will append to your existing workspace
- **Already have a folder open?** The command works even if you have a folder open — it simply adds the new ones alongside
- **Duplicate protection**: If you accidentally select the same folder twice, the extension skips it automatically and tells you

---

## ❓ Troubleshooting

| Problem | Solution |
|---|---|
| Command not found in palette | Make sure the extension is enabled. Try reloading VS Code (`Ctrl+Shift+P` → "Reload Window") |
| Folder picker doesn't appear | This can happen on some Linux distros with no native dialog support. Use VS Code's built-in file opener as a workaround |
| "Failed to add folders" error | Restart VS Code and try again. If it persists, please [open an issue](https://github.com/websitedesigningstore/multi-folder-workspace-opener/issues) |
| Saved `.code-workspace` file not opening both folders | Make sure both folder paths still exist on your system |

---

## 📦 Extension Info

| Property | Value |
|---|---|
| Publisher | **GlobalWebify** |
| Version | 1.0.0 |
| VS Code Engine | `1.75.0` or later |
| License | MIT |
| Repository | [GitHub](https://github.com/websitedesigningstore/multi-folder-workspace-opener) |

---

## 🐛 Found a Bug? Have a Feature Request?

Please open an issue on GitHub:
👉 **[github.com/websitedesigningstore/multi-folder-workspace-opener/issues](https://github.com/websitedesigningstore/multi-folder-workspace-opener/issues)**

---

## 👩‍💻 For Developers (Building from Source)

<details>
<summary>Click to expand developer setup instructions</summary>

### Install Dependencies
```bash
npm install
```

### Compile
```bash
npm run compile
# or watch mode:
npm run watch
```

### Run in Extension Development Host
1. Open the folder in VS Code
2. Press **F5**
3. A new Extension Host window opens — test the command there

### Package
```bash
npx vsce package
# → multi-folder-workspace-opener-1.0.0.vsix
```

### Publish
```bash
vsce login GlobalWebify
vsce publish
```

</details>

---

*Made with ❤️ by [GlobalWebify](https://github.com/websitedesigningstore)*
