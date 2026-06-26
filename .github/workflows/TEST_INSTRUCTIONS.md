# GitHub Actions Release Workflow - Test Instructions

## Overview
This workflow automatically builds and packages the Math Question Generator application for Windows, macOS, and Linux when a new release is created on GitHub.

## What the Workflow Does

### 1. **Trigger**
- Runs when a new GitHub Release is created
- Builds all platforms in parallel

### 2. **Build Targets (4 platforms total)**

**Windows:**
- 64-bit (x86_64-pc-windows-msvc) → `.exe` installer

**macOS:**
- Intel x64 (x86_64-apple-darwin) → `.dmg` bundle
- Apple Silicon (aarch64-apple-darwin) → `.dmg` bundle

**Linux:**
- 64-bit (x86_64-unknown-linux-gnu) → `.AppImage` + `.deb`

### 3. **Outputs**
- Web application build (static files)
- Desktop installers for all 4 platforms
- Auto-generated release notes with download links

## How to Test the Workflow

### Option 1: Create a Test Release (Recommended)
1. Go to your GitHub repository: https://github.com/richie-rich90454/random-math-question-generator-app
2. Click "Releases" → "Create a new release"
3. Create a tag (e.g., `v3.0.1-test`)
4. Add release title and description
5. Check "Set as pre-release" if you want to mark it as test
6. Click "Publish release"
7. Go to "Actions" tab to monitor the build

### Option 2: Manual Trigger (if enabled)
You can manually trigger the workflow from the Actions tab:
1. Go to "Actions" → "Release Build"
2. Click "Run workflow"
3. Select branch and run

## Expected Results

### Successful Build:
- ✅ Web application built and packaged
- ✅ 4 desktop installers created (one for each platform)
- ✅ All artifacts uploaded to the GitHub Release
- ✅ Auto-generated release notes with download links

### Estimated Build Time:
- Total: ~15-20 minutes (all builds run in parallel)
- Individual platform builds: ~10-15 minutes each

## Cost Considerations
- **FREE** for public repositories
- Uses ~105 minutes of GitHub Actions time per release
- Well within the free tier (2,000 minutes/month)

## Troubleshooting

### Common Issues:

1. **Rust compilation errors**:
   - Ensure `Cargo.toml` and `src-tauri/` are properly configured
   - Check Rust toolchain compatibility

2. **Missing system dependencies**:
   - Linux: WebKitGTK development libraries
   - macOS: Xcode command line tools
   - Windows: MSVC toolchain

3. **Artifact upload failures**:
   - Check GitHub storage limits (500MB free)
   - Verify artifact paths in workflow

4. **Release notes generation**:
   - Ensure git history is fetched properly
   - Check tag naming conventions

## Monitoring
- Check the "Actions" tab for real-time logs
- Each platform build runs in a separate job
- Artifacts are available for 7 days in workflow runs
- Final artifacts are attached to the GitHub Release

## Next Steps After Testing
1. Verify all 4 installers work on their respective platforms
2. Test the web build deployment
3. Update project documentation with release instructions
4. Consider setting up automated testing before builds

## Support
If the workflow fails, check:
1. GitHub Actions logs for specific error messages
2. System dependency requirements for each platform
3. Rust and Node.js version compatibility
4. Tauri configuration in `src-tauri/tauri.conf.json`