# Stepps.ai Browser Extension

## 🚀 Getting Started

### First-Time Setup

1. **Install dependencies** (if you haven't already):
   ```bash
   cd apps/browser-extension
   pnpm install
   ```

2. **Build the extension**:
   ```bash
   pnpm build
   ```

3. **Load the extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions`
   - Enable **"Developer mode"** (toggle in the top right corner)
   - Click **"Load unpacked"**
   - Select the `apps/browser-extension/dist` folder
   - Pin the extension to your toolbar for easy access

### Development Workflow

#### Option 1: Manual Reload (Current Setup)
1. Make changes to your code
2. Run `pnpm build` to rebuild
3. Go to `chrome://extensions` and click the refresh icon on your extension
4. Test your changes

#### Option 2: Watch Mode (Recommended)
1. Run the build in watch mode:
   ```bash
   pnpm build -- --watch
   ```
2. Make changes to your code - it will auto-rebuild
3. You still need to manually refresh the extension in `chrome://extensions`

### Testing the Extension

1. **Click the extension icon** in your Chrome toolbar
2. The popup should appear with the "Start Recording" button
3. Click "open dashboard" to navigate to your web app (currently set to `http://localhost:3000`)

### Working with Both Web App and Extension

You can run both simultaneously:

**Terminal 1** - Web App:
```bash
cd apps/user-application
pnpm run dev
```

**Terminal 2** - Extension (watch mode):
```bash
cd apps/browser-extension
pnpm build -- --watch
```

The extension and web app are separate but can communicate:
- The extension popup has a link to open the dashboard
- Later, you can implement messaging between the extension and web app using Chrome's messaging API

## 📁 Project Structure

```
apps/browser-extension/
├── src/
│   ├── popup/
│   │   ├── App.tsx          # Main popup component
│   │   └── index.tsx        # React entry point
│   └── styles/
│       └── globals.css      # Global styles
├── dist/                    # Built extension (load this in Chrome)
├── manifest.json           # Extension configuration
├── popup.html              # Popup HTML entry point
├── vite.config.ts          # Build configuration
└── package.json
```

## 🔧 Common Tasks

### Adding New Features
- Edit files in `src/`
- Rebuild with `pnpm build`
- Refresh the extension in Chrome

### Debugging
- Right-click the extension popup → "Inspect"
- This opens DevTools for the popup
- Console logs and errors will appear here

### Updating Permissions
- Edit `manifest.json`
- Rebuild and reload the extension

## 🎨 Styling
The extension uses Tailwind CSS with the same design tokens as the main web app for consistency.

## 📝 Next Steps
- Implement recording functionality
- Add background script for capturing screenshots
- Set up communication with the web app backend
