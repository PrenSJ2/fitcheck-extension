# Automated Releases

## ✅ GitHub Actions Workflow Active

FitCheck now has automated release builds! Every push to `master` triggers:

### What Happens Automatically

1. **Builds the extension** - Packages all necessary files into a ZIP
2. **Creates GitHub Release** - With version from manifest.json
3. **Generates release notes** - Installation instructions, features, changelog
4. **Uploads ZIP file** - Ready for download

### Concurrency Control

The workflow includes `cancel-in-progress: true` which means:
- ✅ New pushes cancel old builds automatically
- ✅ No wasted resources on outdated builds
- ✅ Always building the latest code

### Workflow File

Located at: `.github/workflows/release.yml`

### How It Works

```yaml
on:
  push:
    branches:
      - master

concurrency:
  group: release-${{ github.ref }}
  cancel-in-progress: true  # <-- Cancels old builds
```

## 📦 Download Links

### Latest Release (Automatic)
Always points to the newest version:
- https://github.com/PrenSJ2/fitcheck-extension/releases/latest

### Specific Version
Current: v0.1.0
- https://github.com/PrenSJ2/fitcheck-extension/releases/download/v0.1.0/fitcheck-extension-v0.1.0.zip

## 🔄 Creating a New Release

### Option 1: Push to Master (Automatic)
```bash
# Any push to master triggers a release
git push origin master

# If you push multiple times quickly:
# - Old builds are canceled automatically
# - Only the latest push builds
```

### Option 2: Bump Version (Manual)
```bash
# 1. Update version in manifest.json
# Edit manifest.json: "version": "0.2.0"

# 2. Update CHANGELOG.md

# 3. Commit and push
git add manifest.json CHANGELOG.md
git commit -m "Bump version to 0.2.0"
git push origin master

# GitHub Actions will:
# - Detect the new version (0.2.0)
# - Create release v0.2.0
# - Package and upload ZIP
```

## 📋 Release Checklist

Before pushing to master:

- [ ] Update `manifest.json` version
- [ ] Update `CHANGELOG.md` with changes
- [ ] Test extension locally
- [ ] Commit changes with clear message
- [ ] Push to master
- [ ] Wait ~30 seconds for release to build
- [ ] Verify release appears at /releases/latest

## 🐛 Troubleshooting

### Build Failed
Check workflow logs:
```bash
gh run list --limit 1
gh run view <run-id>
```

### Release Not Created
1. Check if `manifest.json` has valid version
2. Verify GitHub Actions has write permissions
3. Check workflow logs for errors

### Old Build Still Running
This shouldn't happen (auto-cancel is enabled), but if it does:
```bash
# Cancel all runs
gh run list --status in_progress --json databaseId -q '.[].databaseId' | \
  xargs -I {} gh run cancel {}
```

## 📊 Workflow Status

Check current status:
- Live: https://github.com/PrenSJ2/fitcheck-extension/actions
- Badge: ![Build](https://github.com/PrenSJ2/fitcheck-extension/actions/workflows/release.yml/badge.svg)

## 🎯 What Gets Packaged

The ZIP includes:
- ✅ Extension code (manifest.json, popup, content scripts)
- ✅ Icons
- ❌ Documentation (excluded to reduce size)
- ❌ .github folder (excluded)
- ❌ Dev files (excluded)

Clean, production-ready package for Chrome Web Store submission.

## 🚀 First Release

**Status:** ✅ COMPLETE

- **Version:** v0.1.0
- **Created:** 2026-02-24
- **Build Time:** 5 seconds
- **Download:** https://github.com/PrenSJ2/fitcheck-extension/releases/latest

---

**Now when you share the extension, just link to /releases/latest and people always get the newest version!** 🎉
