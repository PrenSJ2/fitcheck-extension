# Testing Guide

## Initial Setup

1. **Load the extension:**
   ```bash
   # Navigate to chrome://extensions/
   # Enable "Developer mode"
   # Click "Load unpacked"
   # Select the fitcheck-extension folder
   ```

2. **Enter measurements:**
   - Click the FitCheck icon in toolbar
   - Enter sample measurements:
     - Gender: Women's
     - Bust: 86 cm
     - Waist: 68 cm
     - Hips: 92 cm
     - Height: 165 cm
   - Click "Save Measurements"

## Test Sites

### ASOS
- **Test URL:** https://www.asos.com/asos-design/asos-design-midi-dress/prd/205473628
- **Expected:** Size recommendation appears near size selector
- **Check:** Confidence score 70-100%, UK size (8, 10, 12, etc.)

### Zara
- **Test URL:** https://www.zara.com/uk/en/dress-p12345678.html (any product)
- **Expected:** Recommendation appears in product details
- **Check:** Proper size format, warnings if applicable

### Boohoo
- **Test URL:** https://www.boohoo.com/petite-woven-midi-dress/AGG12345.html (any product)
- **Expected:** Recommendation card visible
- **Check:** Styling matches site theme

## Edge Cases to Test

### Missing Size Guide
- Visit a product without a size guide
- **Expected:** Fallback to generic UK sizing

### Between Sizes
- Measurements: Bust 87cm, Waist 69cm, Hips 93cm
- **Expected:** Warnings like "Consider sizing up"

### Unusual Measurements
- Very small or very large measurements
- **Expected:** Still provides best match, warnings shown

### No Measurements Saved
- Clear Chrome storage
- Visit product page
- **Expected:** No recommendation (graceful failure)

## Console Debugging

Open console (F12) and look for:
```
[FitCheck] Loaded measurements: {...}
[FitCheck] Detected site: asos
[FitCheck] Extracted size guide: [...]
[FitCheck] Recommendation: {...}
```

## Common Issues

### Recommendation Doesn't Appear
1. Check console for errors
2. Verify site is in supported list
3. Check if size guide exists on page
4. Try refreshing the page

### Wrong Size Recommended
1. Check extracted size guide (console)
2. Verify measurements are in cm (not inches)
3. Look for scraping issues (table format)

### Styling Broken
1. Check if site updated their CSS
2. Verify content.css is loading
3. Check for CSS conflicts

## Performance Testing

- **Load time:** Extension should add <100ms overhead
- **Memory:** Check Chrome Task Manager (should be <50MB)
- **CPU:** Should not spike when browsing

## Accessibility Testing

- **Keyboard navigation:** Can you tab through the popup?
- **Screen readers:** Does text make sense?
- **Color contrast:** Is text readable?

## Browser Compatibility

Currently only Chrome (Manifest V3).

Future: Firefox, Edge (Chromium), Safari

---

## Automated Testing (Future)

```javascript
// Planned for v0.2
describe('Size Matching', () => {
  it('should match UK 10 for standard measurements', () => {
    const result = matchSize({
      bust: 89, waist: 71, hips: 96
    }, genericSizeGuide);
    expect(result.size).toBe('UK 10');
  });
});
```

---

**For bug reports, include:**
- Browser version
- Site tested
- Console logs
- Screenshots
- Expected vs actual behavior
