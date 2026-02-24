# Changelog

All notable changes to FitCheck will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- iOS companion app with ARKit body scanning
- Community brand fit ratings
- More UK/EU sites (Next, M&S, River Island, Urban Outfitters, New Look)
- Firefox and Safari support
- Local ML for improved scraping (Llama 3.2 1B via WASM)
- Size history tracking
- Outfit recommendations

---

## [0.1.0] - 2026-02-24

### Added - Initial MVP Release
- Chrome Extension (Manifest V3)
- Measurement input popup with local storage
- Size recommendation engine
- Size guide scraping for 5 sites:
  - ASOS
  - Zara
  - Boohoo
  - PrettyLittleThing
  - H&M
- Confidence score calculation (0-100%)
- Fit warnings (tight/loose alerts)
- Privacy-first architecture (all data local)
- Open source (MIT License)
- Comprehensive documentation
- Purple gradient UI with professional styling
- Generic UK sizing fallback
- Measurement validation

### Technical
- Vanilla JavaScript (no dependencies)
- Chrome Storage API for local data
- DOM-based size guide extraction
- Rule-based size matching algorithm
- Responsive UI injection

### Documentation
- README.md with full user guide
- CONTRIBUTING.md for contributors
- TESTING.md for QA
- INSTALL.md for installation
- PROJECT_SUMMARY.md for strategy
- LICENSE (MIT)

---

## Version History

- **0.1.0** - MVP (Feb 24, 2026) - Initial release, 5 sites supported
- **0.2.0** - Planned (March 2026) - Community features, more sites
- **0.3.0** - Planned (April 2026) - iOS app, body scanning
- **1.0.0** - Planned (Q3 2026) - Multi-browser, local ML, international

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to suggest features or report bugs.

---

**Note:** This project is in active development. Breaking changes may occur before v1.0.0.
