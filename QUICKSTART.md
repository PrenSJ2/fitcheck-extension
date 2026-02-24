# Quick Start Guide

## For Users

### 1. Install (5 seconds)
- Visit Chrome Web Store (coming soon)
- Click "Add to Chrome"
- Done!

### 2. Setup (30 seconds)
- Click the FitCheck icon 👕
- Enter your measurements:
  - Gender: Women's / Men's
  - Bust/Chest: ___ cm
  - Waist: ___ cm
  - Hips: ___ cm
  - Height: ___ cm
- Click "Save"

### 3. Shop (as usual)
- Visit ASOS, Zara, Boohoo, PLT, or H&M
- Browse products
- See purple recommendation card: "Recommended: UK 10" ✨

**That's it!** No more guessing sizes or returns.

---

## For Developers

### Test Locally (2 minutes)

```bash
# 1. Clone
git clone https://github.com/yourusername/fitcheck-extension.git
cd fitcheck-extension

# 2. Load in Chrome
# - Open chrome://extensions/
# - Enable "Developer mode"
# - Click "Load unpacked"
# - Select this folder

# 3. Test
# - Click extension icon, enter measurements
# - Visit https://www.asos.com/some-product
# - See recommendation!
```

### Add a New Site (10 minutes)

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guide.

**Quick version:**
1. Add site to `manifest.json` permissions
2. Add detection in `content.js`
3. Add selectors for size guide
4. Test on 5+ products
5. Submit PR

---

## Need Help?

- 📖 [Full README](README.md)
- 🐛 [Report Bug](https://github.com/yourusername/fitcheck-extension/issues/new?template=bug_report.md)
- 💡 [Request Feature](https://github.com/yourusername/fitcheck-extension/issues/new?template=feature_request.md)
- 🌍 [Request Site](https://github.com/yourusername/fitcheck-extension/issues/new?template=new_site_request.md)

---

**Privacy:** Your measurements stay on your device. Forever. 🔒
