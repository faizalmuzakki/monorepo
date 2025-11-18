# Publishing Guide for Website Blocker Extension

## Required Assets for Publishing

### Icons
You need to create icons in the following sizes:
- 16x16px (manifest icon)
- 48x48px (manifest icon)
- 128x128px (Chrome Web Store listing)

Add these to your manifest.json:
```json
"icons": {
  "16": "icons/icon16.png",
  "48": "icons/icon48.png",
  "128": "icons/icon128.png"
}
```

### Screenshots
Take screenshots of:
1. Main popup showing workspace selector
2. Workspace management panel
3. Blocked sites list
4. (Optional) The warning page when a site is blocked

Recommended size: 1280x800px or 640x400px

## Chrome Web Store Publishing

### 1. Developer Account Setup
- URL: https://chrome.google.com/webstore/devconsole/
- Cost: $5 USD one-time fee
- Required: Google account

### 2. Package Your Extension
```bash
cd chrome-extension
zip -r ../website-blocker.zip . -x "*.git*" -x "*.DS_Store" -x "README.md" -x "PUBLISHING_GUIDE.md"
```

### 3. Store Listing Details

**Short Description (132 chars max):**
Block distracting websites with workspace-specific settings for different browser windows. Stay focused and productive!

**Detailed Description:**
A simple and effective Chrome extension to block access to websites you want to avoid. Help yourself stay focused and productive by blocking distracting websites with powerful workspace management.

KEY FEATURES:
✓ Workspace-Specific Blocking - Create multiple workspaces with different blocked sites for each browser window
✓ Easy Management - Add or remove websites with a simple, intuitive interface
✓ Two Block Modes - Choose between closing tabs automatically or showing a warning page
✓ Smart URL Matching - Automatically blocks main domains and all subdomains
✓ Flexible Workspace Management - Create, rename, and delete workspaces as needed

PERFECT FOR:
• Professionals who need different blocking rules for work vs. personal windows
• Students who want to block social media during study time
• Anyone looking to improve focus and productivity

PRIVACY:
• All data stored locally in your browser
• No data sent to external servers
• Your browsing history is never tracked or recorded

### 4. Privacy Policy

You need to create a privacy policy. Here's a template:

**Privacy Policy for Website Blocker**

Last updated: [Date]

This extension respects your privacy. Here's what you need to know:

DATA COLLECTION:
- We do NOT collect any personal data
- We do NOT track your browsing history
- We do NOT send any data to external servers

DATA STORAGE:
- All settings and blocked website lists are stored locally in your browser using Chrome's sync storage
- If you use Chrome Sync, your settings will sync across your Chrome browsers (this is handled by Chrome, not us)

PERMISSIONS:
- "tabs": Required to monitor tab URLs and apply blocking rules
- "storage": Required to save your workspace settings and blocked website lists

CHANGES:
If we update this privacy policy, we will notify you through the extension listing.

CONTACT:
[Your email or contact method]

### 5. Category and Language
- **Primary Category**: Productivity
- **Language**: English
- **Additional Categories**: (optional)

### 6. Distribution Settings
- **Visibility**: Public (or Unlisted if you only want people with the link to find it)
- **Regions**: All regions (or select specific countries)
- **Pricing**: Free

## Microsoft Edge Add-ons Publishing

Microsoft Edge now uses Chromium, so your extension works without changes!

### 1. Partner Center Account
- URL: https://partner.microsoft.com/en-us/dashboard/microsoftedge/
- Cost: FREE (no registration fee)
- Required: Microsoft account

### 2. Package Your Extension
Use the same ZIP file as Chrome Web Store

### 3. Submit to Edge Add-ons
1. Go to Partner Center Dashboard
2. Click "Create new extension"
3. Upload your ZIP file
4. Fill out similar information as Chrome Web Store
5. Review process is typically 1-3 business days

### Benefits of Edge Add-ons:
- No registration fee
- Often faster review process
- Access to Edge users
- Same codebase works for both stores

## Before Publishing Checklist

- [ ] Create icon images (16px, 48px, 128px)
- [ ] Add icons to manifest.json
- [ ] Take screenshots of extension
- [ ] Write privacy policy
- [ ] Test extension thoroughly in fresh Chrome/Edge install
- [ ] Verify all features work as expected
- [ ] Create promotional images (optional but recommended)
- [ ] Set up support email or website
- [ ] Create ZIP package
- [ ] Review manifest.json for any issues
- [ ] Test ZIP file loads correctly as unpacked extension

## Post-Publishing

### Marketing Your Extension
- Share on social media (Reddit, Twitter, ProductHunt)
- Write a blog post about building it
- Ask friends/colleagues to try it and leave reviews
- Respond to user reviews and feedback
- Keep the extension updated

### Maintenance
- Monitor reviews for bug reports
- Release updates for new features
- Keep permissions minimal
- Respond to user support requests
- Update for new Chrome/Edge API changes

## Tips for Approval

1. **Clear Description**: Explain exactly what your extension does
2. **Justify Permissions**: Clearly state why each permission is needed
3. **Privacy Policy**: Must be clear and accurate
4. **Screenshots**: Show the extension in action
5. **Test Thoroughly**: Make sure it works perfectly before submitting
6. **No Misleading Info**: Don't overpromise features
7. **Follow Guidelines**: Read Chrome Web Store and Edge Add-ons policies

## Useful Links

**Chrome Web Store:**
- Developer Dashboard: https://chrome.google.com/webstore/devconsole/
- Developer Program Policies: https://developer.chrome.com/docs/webstore/program-policies/
- Best Practices: https://developer.chrome.com/docs/webstore/best_practices/

**Microsoft Edge Add-ons:**
- Partner Center: https://partner.microsoft.com/dashboard/microsoftedge/
- Publish Guide: https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/publish-extension
- Store Policies: https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/store-policies/

## Cost Summary

- **Chrome Web Store**: $5 USD one-time registration fee
- **Microsoft Edge Add-ons**: FREE
- **Total**: $5 USD to publish on both stores

## Timeline

- Chrome Web Store review: Few hours to few days (usually 1-2 days)
- Edge Add-ons review: 1-3 business days
- Updates/Revisions: Usually faster than initial review
