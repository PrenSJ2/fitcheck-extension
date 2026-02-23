# 👕 FitCheck - Smart Size Finder

**Open-source Chrome extension that recommends your clothing size across different brands.**

Stop wasting money on returns and shipping. FitCheck analyzes size guides on fashion websites and tells you exactly what size to buy based on your measurements.

---

## 🌟 Features

- ✅ **Privacy-first** - Your measurements never leave your device
- ✅ **Works offline** - No cloud APIs, everything runs locally
- ✅ **Multi-site support** - ASOS, Zara, Boohoo, PrettyLittleThing, H&M
- ✅ **Smart warnings** - Alerts you if something might be too tight/loose
- ✅ **Open source** - Fully transparent, audit the code yourself
- ✅ **Free forever** - No subscriptions, no hidden costs

---

## 🚀 Quick Start

### Install from Source

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/fitcheck-extension.git
   cd fitcheck-extension
   ```

2. Open Chrome and go to `chrome://extensions/`

3. Enable **Developer mode** (toggle in top right)

4. Click **Load unpacked** and select the `fitcheck-extension` folder

5. Click the FitCheck icon in your toolbar and enter your measurements

6. Visit ASOS, Zara, or Boohoo and see size recommendations!

---

## 📏 How It Works

### 1. **One-Time Setup**
Enter your body measurements once (bust, waist, hips, height). They're stored locally in Chrome's secure storage.

### 2. **Shop Normally**
Browse your favorite fashion sites as usual.

### 3. **Get Recommendations**
FitCheck automatically:
- Detects you're on a product page
- Scrapes the size guide
- Compares your measurements
- Shows your recommended size with confidence score
- Warns if any area might not fit perfectly

### 4. **No More Returns**
Buy the right size the first time!

---

## 🛠️ Technical Architecture

### **Privacy-First Design**
- All data stored locally via Chrome Storage API
- Zero network requests (except loading product pages you visit anyway)
- No analytics, no tracking, no cloud servers
- Measurements never uploaded anywhere

### **Smart Size Matching**
```javascript
// Simplified algorithm:
1. Extract size guide from page (table parsing)
2. Compare your measurements to each size
3. Calculate fit score (lower = better match)
4. Return best match with confidence %
5. Flag any measurements that are edge cases
```

### **Tech Stack**
- Vanilla JavaScript (no framework dependencies)
- Chrome Extension Manifest V3
- Local Chrome Storage API
- DOM manipulation for UI injection

---

## 🌍 Supported Sites

| Site | Status | Notes |
|------|--------|-------|
| ASOS | ✅ Working | Full support |
| Zara | ✅ Working | Full support |
| Boohoo | ✅ Working | Full support |
| PrettyLittleThing | ✅ Working | Full support |
| H&M | ✅ Working | Full support |
| More coming soon | 🔜 | [Request a site](https://github.com/yourusername/fitcheck-extension/issues) |

---

## 🤝 Contributing

We welcome contributions! Here's how:

### Adding a New Site

1. Fork the repository
2. Add site hostname to `manifest.json`:
   ```json
   "host_permissions": [
     "https://yournewsite.com/*"
   ]
   ```
3. Add scraper logic to `content.js`:
   ```javascript
   if (hostname.includes('yournewsite.com')) {
     site = 'newsite';
   }
   ```
4. Add selectors for size guide detection
5. Test thoroughly
6. Submit a pull request!

### Other Ways to Contribute

- 🐛 [Report bugs](https://github.com/yourusername/fitcheck-extension/issues)
- 💡 [Suggest features](https://github.com/yourusername/fitcheck-extension/issues)
- 📖 Improve documentation
- 🌍 Add translations (coming soon)
- ⭐ Star the repo if you find it useful!

---

## 📋 Roadmap

### v0.2 (Next Release)
- [ ] User reviews: "Does this brand run small?"
- [ ] Size history: Track your purchases and fits
- [ ] More sites: Next, New Look, River Island, Urban Outfitters
- [ ] Improved scraping: Handle more size guide formats

### v0.3
- [ ] iOS companion app with ARKit body scanning
- [ ] Community sizing database
- [ ] Style recommendations
- [ ] Export measurements (for tailors, etc.)

### v1.0
- [ ] Firefox/Safari support
- [ ] Local ML for better scraping (Llama 3.2 1B via WASM)
- [ ] International sizing conversions
- [ ] Brand fit database (crowdsourced)

---

## 🔒 Privacy & Security

### What Data We Collect
**None.** Seriously.

### What Data We Store Locally
- Your measurements (bust, waist, hips, height, gender)
- Stored in Chrome's secure local storage
- Never uploaded, shared, or transmitted

### What We Can See
- Nothing. We don't have servers, analytics, or telemetry
- The extension runs entirely on your device

### Open Source Transparency
- Full source code available for audit
- No obfuscation, no hidden code
- MIT license - use it however you want

---

## ❓ FAQ

**Q: Do I need to create an account?**
A: No! Just enter your measurements and start shopping.

**Q: Does this work on mobile?**
A: Not yet. Chrome extensions only work on desktop. Mobile app coming in v0.3.

**Q: Which sizing system does it use?**
A: We extract the size guide from each site, so it uses whatever they use (usually UK sizes).

**Q: What if the size guide is wrong?**
A: We're working on a crowdsourced database where users can report fit issues.

**Q: Can I trust this with my measurements?**
A: Yes! Your measurements are stored locally on your device only. Check the code yourself - it's open source.

**Q: Why is this free?**
A: Because online shopping returns are wasteful for everyone. Plus, we believe privacy tools should be accessible.

---

## 🧑‍💻 Development

### Local Development

```bash
# Clone the repo
git clone https://github.com/yourusername/fitcheck-extension.git
cd fitcheck-extension

# Load in Chrome (no build step needed!)
# chrome://extensions/ → Developer mode → Load unpacked
```

### Testing

Manual testing checklist:
- [ ] Enter measurements via popup
- [ ] Visit ASOS product page
- [ ] Check recommendation appears
- [ ] Verify confidence score is reasonable
- [ ] Test warnings for edge cases
- [ ] Repeat for other supported sites

### Code Structure

```
fitcheck-extension/
├── manifest.json         # Extension config
├── popup.html           # Measurement input UI
├── popup.js             # Popup logic
├── content.js           # Main logic (runs on product pages)
├── content.css          # Injected styles
├── background.js        # Service worker
└── icons/              # Extension icons
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

**TL;DR:** Use it however you want. Commercial use allowed. No warranty.

---

## 🙏 Credits

Built by frustrated online shoppers who were tired of:
- Buying 3 sizes of everything
- £35 shipping costs just to find the right fit
- Size guides that nobody reads
- Returns that waste time and damage the environment

Inspired by:
- The pain of Nica's dress shopping experience
- Existing tools that were either expensive, privacy-invasive, or US-only
- The belief that open source + privacy = better internet

---

## 🌟 Show Your Support

If FitCheck helps you:
- ⭐ Star this repo
- 🐦 Tweet about it
- 📣 Tell your friends
- 🤝 Contribute code or report bugs

Every return you avoid saves money, time, and the planet! 🌍

---

## 📞 Contact

- GitHub Issues: [Report bugs or request features](https://github.com/yourusername/fitcheck-extension/issues)
- Twitter: [@yourhandle](https://twitter.com/yourhandle)
- Email: your.email@example.com

---

**Made with ❤️ by people who hate returning clothes**

*P.S. If this saves you even one return, we've done our job!*
