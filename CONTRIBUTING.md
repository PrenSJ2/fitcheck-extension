# Contributing to FitCheck

Thank you for your interest in contributing! 🎉

## 🚀 Quick Start

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/yourusername/fitcheck-extension.git
   cd fitcheck-extension
   ```
3. **Load the extension in Chrome:**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `fitcheck-extension` folder
4. **Make your changes**
5. **Test thoroughly**
6. **Submit a pull request**

---

## 🌍 Adding a New Site

Want to add support for a new shopping site? Here's how:

### 1. Update `manifest.json`

Add the site to `host_permissions`:
```json
"host_permissions": [
  "https://*.asos.com/*",
  "https://*.yournewsite.com/*"  // Add this
]
```

And to `content_scripts` matches:
```json
"matches": [
  "https://*.asos.com/*",
  "https://*.yournewsite.com/*"  // Add this
]
```

### 2. Add Site Detection in `content.js`

Find the site detection section:
```javascript
if (hostname.includes('asos.com')) site = 'asos';
else if (hostname.includes('yournewsite.com')) site = 'yournewsite';  // Add this
```

### 3. Add Selectors

Add selectors for the new site:
```javascript
function getSizeGuideSelector(site) {
  const selectors = {
    asos: '.size-guide, .product-size',
    yournewsite: '.size-guide, .product-info'  // Find the right selectors
  };
  return selectors[site] || '.size-guide';
}

function getInsertionPoint(site) {
  const selectors = {
    asos: '.product-size, .product-details',
    yournewsite: '.product-details'  // Where to inject the recommendation
  };
  return document.querySelector(selectors[site]);
}
```

### 4. Test Thoroughly

- Visit multiple product pages on the new site
- Verify size guide is detected
- Check recommendation appears correctly
- Test different product types (dresses, jeans, shirts, etc.)
- Verify the recommendation makes sense

### 5. Submit PR

Include in your PR description:
- Site name and URL
- Screenshots of the extension working
- Any quirks or special handling needed

---

## 🐛 Reporting Bugs

Found a bug? Please [open an issue](https://github.com/yourusername/fitcheck-extension/issues/new) with:

### Required Information
- **Browser:** Chrome version number
- **Site:** Which shopping site (ASOS, Zara, etc.)
- **Expected behavior:** What should happen
- **Actual behavior:** What actually happened
- **Steps to reproduce:**
  1. Go to...
  2. Click on...
  3. See error...

### Optional (but helpful!)
- Screenshots or screen recording
- Browser console logs (F12 → Console tab)
- Your measurements (if relevant to the bug)

---

## 💡 Suggesting Features

Have an idea? [Open an issue](https://github.com/yourusername/fitcheck-extension/issues/new) with:

- **Feature description:** What should it do?
- **Use case:** Why is this useful?
- **Example:** How would it work in practice?

---

## 📝 Code Style Guidelines

### JavaScript
- Use modern ES6+ syntax
- Prefer `const` over `let`, never use `var`
- Use async/await over promises
- Add comments for complex logic
- Keep functions small and focused

### Naming Conventions
```javascript
// Variables: camelCase
const userMeasurements = {};

// Functions: camelCase, descriptive
function extractSizeGuide(site) { }

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
```

### File Structure
```javascript
// 1. Constants
const SUPPORTED_SITES = ['asos', 'zara'];

// 2. Main logic
async function init() { }

// 3. Helper functions
function parseSizeTable(table) { }

// 4. Utilities
function waitForElement(selector) { }
```

---

## 🧪 Testing Checklist

Before submitting a PR, verify:

### Functionality
- [ ] Extension loads without errors
- [ ] Popup opens and accepts measurements
- [ ] Measurements are saved correctly
- [ ] Recommendations appear on product pages
- [ ] Confidence scores are reasonable (50-100%)
- [ ] Warnings show for edge cases

### Compatibility
- [ ] Works on Chrome
- [ ] Works on all supported sites
- [ ] No console errors
- [ ] Doesn't break existing functionality

### Code Quality
- [ ] No hardcoded credentials or API keys
- [ ] Comments added for complex logic
- [ ] No `console.log` left in production code (use conditionals)
- [ ] Follows existing code style

---

## 🌟 Good First Issues

New to contributing? Look for issues tagged:
- `good first issue`
- `help wanted`
- `documentation`

These are great starting points!

---

## 🔒 Privacy Principles

When contributing, remember our core values:

1. **Local-first:** All data stays on the user's device
2. **No tracking:** No analytics, telemetry, or phone-home
3. **Transparent:** Code should be readable and auditable
4. **Minimal permissions:** Only request what's necessary

**Never add:**
- External API calls (except to load product pages)
- Analytics libraries
- Tracking scripts
- Unnecessary permissions

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Every contribution makes online shopping better for everyone. Whether it's:
- Code
- Bug reports
- Documentation
- Feature ideas
- Spreading the word

**You're helping reduce waste and save people time and money. Thank you! ❤️**

---

## 💬 Questions?

Not sure about something? Open a [discussion](https://github.com/yourusername/fitcheck-extension/discussions) or comment on an issue. We're friendly! 🙂

---

**Happy contributing! 🎉**
