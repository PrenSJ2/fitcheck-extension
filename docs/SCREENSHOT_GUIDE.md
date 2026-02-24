# Screenshot Guide for Chrome Web Store

## Quick Method (Manual)

1. Open `docs/demo.html` in Chrome
2. Use Chrome DevTools (F12) → Device Toolbar (Ctrl+Shift+M)
3. Set viewport to 1280x800
4. Take screenshots of each section
5. Save to `docs/screenshots/`

---

## Screenshots Needed

### 1. Extension Popup (Required)
- **File:** `screenshot-1-popup.png`
- **Size:** 1280x800 or 640x400
- **Section:** First demo section showing measurement input form
- **Crop to:** Just the popup UI (360px wide)
- **Caption:** "Enter your measurements once - takes 30 seconds"

### 2. Recommendation Card (Required)
- **File:** `screenshot-2-recommendation.png`
- **Size:** 1280x800 or 640x400
- **Section:** Second demo section with purple recommendation card
- **Show:** Full product page context with recommendation
- **Caption:** "Get instant size recommendations with confidence scores"

### 3. Before/After Comparison (Required)
- **File:** `screenshot-3-comparison.png`
- **Size:** 1280x800 or 640x400
- **Section:** Third demo section showing pain points vs benefits
- **Caption:** "Stop wasting money on returns"

### 4. Real Product Page (Optional but Recommended)
- **File:** `screenshot-4-real-asos.png`
- **Size:** 1280x800 or 640x400
- **How:** Install extension, visit ASOS product page, screenshot
- **Caption:** "Works on ASOS, Zara, Boohoo, and more"

### 5. Privacy Highlight (Optional)
- **File:** `screenshot-5-privacy.png`
- **Size:** 1280x800 or 640x400
- **Create:** Landing page privacy banner or custom graphic
- **Caption:** "100% private - your data never leaves your device"

---

## Automated Method (Node.js)

```bash
# Install Puppeteer
cd /home/node/.openclaw/workspace-telegram/projects/fitcheck-extension
npm init -y
npm install puppeteer

# Create screenshot script
node docs/screenshot-generator.js
```

---

## Small Tile (440x280)

Create using Canva or Figma:
- Background: Purple gradient (#667eea to #764ba2)
- Icon: Large shirt emoji or custom icon
- Text: "FitCheck" (bold, white)
- Tagline: "Get the right size, first time" (smaller, white)

---

## Manual Steps (Recommended for Best Quality)

### Using Chrome DevTools

1. **Open demo.html in Chrome**
   ```
   file:///home/node/.openclaw/workspace-telegram/projects/fitcheck-extension/docs/demo.html
   ```

2. **Open DevTools** (F12)

3. **Enable Device Toolbar** (Ctrl+Shift+M or click phone icon)

4. **Set Dimensions**
   - Responsive mode
   - Enter: 1280 x 800
   - Or: 640 x 400 (smaller file size)

5. **For Each Screenshot:**
   - Scroll to the section
   - Right-click page → "Capture screenshot"
   - Or use Chrome's built-in screenshot tool (Ctrl+Shift+P → "Capture screenshot")
   - Save to `docs/screenshots/`

6. **Crop & Optimize** (optional)
   - Use GIMP, Preview, or online tools
   - Crop to relevant UI only
   - Optimize file size (keep under 2MB each)

---

## Alternative: Extension Screenshots (Real)

### Best Quality (Actual Extension in Use)

1. **Load Extension**
   - chrome://extensions/
   - Load unpacked: fitcheck-extension/

2. **Popup Screenshot**
   - Click extension icon
   - Chrome DevTools → Inspect popup
   - Right-click popup → Capture screenshot

3. **Product Page Screenshot**
   - Visit: https://www.asos.com/asos-design/asos-design-midi-dress/prd/205473628
   - FitCheck card should appear
   - Ctrl+Shift+P → "Capture full size screenshot"
   - Crop to show both product and FitCheck card

4. **Settings Screenshot**
   - Click extension → "Edit Measurements"
   - Screenshot the form

---

## Upload to Chrome Web Store

1. Go to Chrome Developer Dashboard
2. Upload 3-5 screenshots (minimum 3, recommended 5)
3. Order:
   - Screenshot 1: Popup UI
   - Screenshot 2: Recommendation card
   - Screenshot 3: Before/After
   - Screenshot 4: Real ASOS example (optional)
   - Screenshot 5: Privacy guarantee (optional)

4. Add captions for each screenshot (max 140 characters)

---

## Quick Captions

- **Screenshot 1:** "Enter your measurements once - takes just 30 seconds"
- **Screenshot 2:** "Get instant size recommendations with 70-100% confidence scores"
- **Screenshot 3:** "Stop wasting £35+ on returns. Get the right size, first time."
- **Screenshot 4:** "Works automatically on ASOS, Zara, Boohoo, and more"
- **Screenshot 5:** "100% private - your data never leaves your device"

---

## File Naming Convention

```
screenshot-1-popup.png          (Measurement input)
screenshot-2-recommendation.png (Recommendation card)
screenshot-3-comparison.png     (Before/After)
screenshot-4-real-example.png   (Optional: Real ASOS page)
screenshot-5-privacy.png        (Optional: Privacy guarantee)
tile-440x280.png                (Small promotional tile)
marquee-1400x560.png            (Optional: Large promotional tile)
```

---

## Tips for Great Screenshots

- ✅ **High contrast** - Easy to read
- ✅ **Clear text** - Avoid blur
- ✅ **Show value** - Highlight key features
- ✅ **Real context** - Show extension in use
- ✅ **Consistent branding** - Purple gradient theme

❌ **Avoid:**
- Cluttered backgrounds
- Tiny text
- Multiple concepts per screenshot
- Low resolution
- Generic stock images

---

## Recommended Dimensions

Chrome Web Store accepts:
- 1280x800 (recommended)
- 640x400 (acceptable)
- Min: 640x400
- Max: 3840x2400

**Recommendation:** Use 1280x800 for best quality.

---

## When You're Done

Save screenshots to: `docs/screenshots/`

Commit and push:
```bash
git add docs/screenshots/
git commit -m "Add Chrome Web Store screenshots"
git push origin master
```

Upload to Chrome Developer Dashboard when ready for submission.

---

**Need help?** Check existing Chrome extensions for inspiration: https://chrome.google.com/webstore/category/extensions
