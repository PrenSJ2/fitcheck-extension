# Quick Installation Guide

## For Users (Chrome Web Store - Coming Soon)

1. Visit Chrome Web Store
2. Search "FitCheck"
3. Click "Add to Chrome"
4. Enter your measurements
5. Start shopping!

---

## For Developers / Beta Testers

### Prerequisites
- Google Chrome browser
- No build tools needed (vanilla JS)

### Installation Steps

1. **Download or Clone**
   ```bash
   git clone https://github.com/PrenSJ2/fitcheck-extension.git
   cd fitcheck-extension
   ```

2. **Open Chrome Extensions**
   - Open Chrome
   - Navigate to: `chrome://extensions/`
   - Or: Menu → Extensions → Manage Extensions

3. **Enable Developer Mode**
   - Toggle "Developer mode" switch (top right corner)

4. **Load Extension**
   - Click "Load unpacked"
   - Select the `fitcheck-extension` folder
   - Extension should appear in your toolbar

5. **Setup**
   - Click the FitCheck icon (purple gradient with shirt emoji)
   - Enter your measurements:
     - Gender (Women's/Men's)
     - Bust/Chest (cm)
     - Waist (cm)
     - Hips (cm)
     - Height (cm)
   - Click "Save Measurements"

6. **Test**
   - Visit any supported site:
     - ASOS: https://www.asos.com
     - Zara: https://www.zara.com/uk
     - Boohoo: https://www.boohoo.com
     - PrettyLittleThing: https://www.prettylittlething.com
     - H&M: https://www.hm.com
   - Browse to a product page
   - Look for the purple FitCheck recommendation card

---

## Troubleshooting

### Extension doesn't appear
- Check if it's enabled in `chrome://extensions/`
- Try reloading the extension (refresh icon)
- Check browser console for errors (F12)

### No recommendation showing
- Ensure you've saved measurements (click extension icon)
- Check if site is supported (see list above)
- Try refreshing the product page
- Open console (F12) and look for `[FitCheck]` logs

### Recommendation seems wrong
- Verify measurements are in **centimeters** (not inches)
- Check the size guide on the product page manually
- Report the issue on GitHub with:
  - Product URL
  - Your measurements
  - Expected vs actual recommendation

### Console shows errors
- Open an issue on GitHub
- Include:
  - Browser version
  - Site URL
  - Console error message
  - Steps to reproduce

---

## Updating

### Manual Update (Developer Mode)
1. Pull latest changes: `git pull origin main`
2. Go to `chrome://extensions/`
3. Click refresh icon on FitCheck extension
4. Test that it still works

### Auto Update (Chrome Web Store - Future)
Extensions update automatically when published to Chrome Web Store.

---

## Uninstalling

1. Go to `chrome://extensions/`
2. Find FitCheck
3. Click "Remove"
4. Confirm

Your measurements are stored locally and will be deleted.

---

## Getting Help

- 📖 Read the [README](README.md)
- 🐛 Check [existing issues](https://github.com/PrenSJ2/fitcheck-extension/issues)
- 💬 Open a [new issue](https://github.com/PrenSJ2/fitcheck-extension/issues/new)
- 📧 Email: support@fitcheck.app (coming soon)

---

**Privacy Note:** Your measurements are stored locally in Chrome's secure storage. They never leave your device. No account or signup required.
