# TODO Before Publishing to Chrome/Edge Stores

## Critical Tasks (Required)

### 1. Create Icon Images ⚠️ REQUIRED
You need to create PNG icons in these sizes:
- `icons/icon16.png` - 16x16 pixels
- `icons/icon48.png` - 48x48 pixels
- `icons/icon128.png` - 128x128 pixels

Then add to manifest.json:
```json
"icons": {
  "16": "icons/icon16.png",
  "48": "icons/icon48.png",
  "128": "icons/icon128.png"
}
```

**Suggestion:** Use a shield or lock icon with a red circle/slash to represent blocking.

### 2. Take Screenshots ⚠️ REQUIRED
Take 2-4 screenshots showing:
1. Main popup with workspace selector and blocked sites list
2. Workspace management panel (with "Manage" button clicked)
3. Multiple workspaces in dropdown
4. (Optional) The warning page when a site is blocked

Recommended size: 1280x800px or 640x400px

### 3. Update manifest.json ⚠️ REQUIRED
Replace "Your Name" with your actual name in:
```json
"author": "Your Name"
```

### 4. Host Privacy Policy ⚠️ REQUIRED
Upload `PRIVACY_POLICY.md` somewhere public:
- GitHub Pages
- Your personal website
- GitHub Gist (https://gist.github.com)

Then get the public URL to use in store listing.

### 5. Create Store Accounts
- **Chrome Web Store**: https://chrome.google.com/webstore/devconsole/ ($5 fee)
- **Edge Add-ons**: https://partner.microsoft.com/dashboard/microsoftedge/ (FREE)

## Optional But Recommended

### 6. Create Promotional Images
These make your listing look more professional:
- Small promotional tile: 440x280px
- Large promotional tile: 920x680px
- Marquee: 1400x560px

### 7. Set Up Support Channel
Choose one:
- GitHub Issues page
- Support email address
- Website with contact form

Add this to your store listing so users can reach you.

### 8. Test Thoroughly
Before submitting:
- [ ] Install as unpacked extension in fresh Chrome profile
- [ ] Create multiple workspaces
- [ ] Add sites to different workspaces
- [ ] Switch between workspaces
- [ ] Verify blocking works correctly
- [ ] Test both block modes (close & warning)
- [ ] Check all UI elements display correctly
- [ ] Test rename and delete workspace features
- [ ] Verify data persists after closing browser

## Nice to Have

### 9. Create Demo Video (Optional)
A 30-60 second video showing:
- How to create workspaces
- How to block sites
- How it works across different windows

Upload to YouTube and add link to store listing.

### 10. Prepare Marketing Assets (Optional)
- Write blog post about building the extension
- Create Twitter/X announcement post
- Prepare Product Hunt listing
- Write Reddit post for r/chrome_extensions

## Quick Check

Before clicking "Submit for Review":
- [ ] All icons created and in manifest.json
- [ ] Screenshots taken and ready to upload
- [ ] Privacy policy hosted at public URL
- [ ] Author name updated in manifest.json
- [ ] Extension tested thoroughly
- [ ] Store listing description written
- [ ] Support email/URL ready
- [ ] $5 payment ready for Chrome Web Store
- [ ] Read Chrome Web Store policies
- [ ] Read Edge Add-ons policies

## Timeline Estimate

- Create icons: 30 minutes - 1 hour
- Take screenshots: 15 minutes
- Set up accounts: 15 minutes
- Fill out listings: 30 minutes
- **Total:** ~2 hours of work
- **Review time:** 1-3 days

## Need Help?

- **Full guide:** See `PUBLISHING_GUIDE.md`
- **Quick start:** See `QUICK_START_PUBLISHING.md`
- **Package extension:** Run `./package-for-store.sh`

---

**Status:** Not yet ready to publish (missing icons and screenshots)

Once you complete the critical tasks above, you'll be ready to submit! 🚀
