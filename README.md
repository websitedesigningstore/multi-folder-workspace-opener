# Multi Folder Workspace Opener

> **Open multiple project folders together in VS Code — in just 3 clicks!**

[![VS Marketplace](https://img.shields.io/visual-studio-marketplace/v/GlobalWebify.multi-folder-workspace-opener?label=VS%20Marketplace&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=GlobalWebify.multi-folder-workspace-opener)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/GlobalWebify.multi-folder-workspace-opener)](https://marketplace.visualstudio.com/items?itemName=GlobalWebify.multi-folder-workspace-opener)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🤔 What Does This Extension Do?

Ever needed to work on two or more projects **at the same time** in VS Code? Normally you'd have to manually edit a `.code-workspace` file. This extension does it for you instantly — either via a **clickable sidebar panel** or the **Command Palette**.

---

## 🕐 When Should You Use This?

| Situation | Example |
|---|---|
| Frontend + Backend in different folders | `D:\Projects\app-frontend` + `D:\Projects\app-backend` |
| Working on a library alongside your main project | `C:\libs\ui-components` + `D:\work\website` |
| Comparing two versions of a project | `D:\Projects\v1` + `D:\Projects\v2` |
| Multiple clients' projects side-by-side | Any two unrelated folders on your system |

---

## 🚀 How to Use

### Method 1 — Sidebar UI (Recommended)

1. Click the **folder icon** in the Activity Bar (left side) to open the panel
2. Click the **"Open Folders in Workspace"** button
3. Pick your folders from the dialogs that appear → Done! ✅

The panel also shows you all currently open workspace folders in real time.

---

### Method 2 — Command Palette

1. Press `Ctrl+Shift+P`
2. Type **`Open Folders in Workspace`**
3. Select **"Multi Folder Workspace: Open Folders in One Workspace"**
4. Pick your folders from the dialogs → Done! ✅

---

### After Selecting Folders

Both folders appear in the **Explorer sidebar** as roots of a single workspace:

```
EXPLORER
├── 📁 my-frontend
│   ├── src/
│   └── package.json
└── 📁 my-backend
    ├── src/
    └── package.json
```

You can now browse, edit, search, and run terminals across **both folders in one window**.

---

### Save the Workspace (Optional)

After opening folders, a prompt will ask:

> **"Would you like to save this as a .code-workspace file?"**

- **Save Workspace** → Pick a location → Next time, just double-click that file to reopen both folders instantly!
- **No Thanks** → Folders stay open for this session only

---

## ⚙️ Settings

Go to **File → Preferences → Settings** and search **"Multi Folder Workspace"**:

| Setting | Default | Description |
|---|---|---|
| `defaultFolderCount` | `2` | How many folders to pick (2–10) |
| `autoSaveWorkspace` | `false` | Always save a `.code-workspace` file automatically without prompting |

**Example — pick 3 folders at once:**
```json
{
  "multiFolderWorkspace.defaultFolderCount": 3
}
```

---

## 💡 Pro Tips

- **Reopen a saved workspace**: Double-click the `.code-workspace` file or use **File → Open Workspace from File…**
- **Add more folders later**: Run the command again — new folders are appended alongside existing ones
- **Duplicate protection**: Selecting the same folder twice is automatically skipped with a notification

---

## ❓ Troubleshooting

| Problem | Solution |
|---|---|
| Sidebar panel not visible | Click the folder icon in the Activity Bar on the left |
| Command not found | Make sure extension is enabled. Try `Ctrl+Shift+P` → "Reload Window" |
| "Failed to add folders" error | Restart VS Code and try again. Still broken? [Open an issue](https://github.com/websitedesigningstore/multi-folder-workspace-opener/issues) |
| Saved workspace not opening both folders | Make sure both folder paths still exist on your system |

---

## 🐛 Found a Bug? Have a Feature Request?

👉 **[Open an issue on GitHub](https://github.com/websitedesigningstore/multi-folder-workspace-opener/issues)**

---

*Made with ❤️ by [GlobalWebify](https://globalwebify.com)*
