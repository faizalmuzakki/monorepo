# Quick Start: Publishing Your Extension

## Prerequisites Checklist

Before you can publish, you need:

- [ ] **Icons** - Create 16x16, 48x48, and 128x128px icon images
- [ ] **Screenshots** - Take 2-3 screenshots of your extension (1280x800px recommended)
- [ ] **Privacy Policy URL** - Host PRIVACY_POLICY.md somewhere public (GitHub, your website, etc.)
- [ ] **Update manifest.json** - Change "Your Name" to your actual name
- [ ] **Google Account** - For Chrome Web Store
- [ ] **$5 USD** - For Chrome Web Store registration fee
- [ ] **Microsoft Account** - For Edge Add-ons (optional, free)

## Step-by-Step Publishing

### Option 1: Chrome Web Store Only

**Total Time:** ~30 minutes + review time (1-2 days)
**Cost:** $5 USD one-time

1. **Prepare Your Extension**
   ```bash
   cd chrome-extension
   ./package-for-store.sh
   ```
   This creates `website-blocker-v1.0.0.zip` in the parent directory

2. **Create Developer Account**
   - Go to https://chrome.google.com/webstore/devconsole/
   - Pay $5 registration fee
   - Verify your email

3. **Upload Extension**
   - Click "New Item"
   - Upload your ZIP file
   - Wait for it to process

4. **Fill Out Store Listing**
   - Copy description from README.md
   - Upload screenshots
   - Upload 128x128px icon
   - Add privacy policy URL
   - Set category to "Productivity"
   - Choose "Free" pricing

5. **Submit for Review**
   - Review all fields
   - Click "Submit for Review"
   - Wait 1-2 days for approval

### Option 2: Both Chrome & Edge (Recommended)

**Total Time:** ~45 minutes + review time
**Cost:** $5 USD (only Chrome has a fee)

Do everything in Option 1, then:

6. **Create Edge Partner Account**
   - Go to https://partner.microsoft.com/dashboard/microsoftedge/
   - Sign in with Microsoft account (FREE, no fee)

7. **Submit to Edge**
   - Click "Create new extension"
   - Upload the SAME ZIP file you used for Chrome
   - Fill out similar information
   - Submit for review (usually 1-3 days)

## After Publishing

### Monitor Your Extension
- Check reviews daily for the first week
- Respond to user feedback
- Fix any reported bugs quickly

### Update Your Extension
When you make changes:
1. Update version number in manifest.json (e.g., 1.0.0 → 1.0.1)
2. Run `./package-for-store.sh` again
3. Upload new ZIP to store dashboards
4. Describe what changed in the update notes

## Common Issues & Solutions

**Issue:** "Manifest file is invalid"
- Check manifest.json syntax with a JSON validator
- Make sure all required fields are present

**Issue:** "Icons missing"
- You must add icon images to manifest.json
- Create PNG files in 16x16, 48x48, 128x128 sizes

**Issue:** "Privacy policy required"
- Host PRIVACY_POLICY.md on GitHub or your website
- Add the public URL to your store listing

**Issue:** "Permission warnings are scary"
- Explain CLEARLY why you need each permission
- Use the justification template in PUBLISHING_GUIDE.md

## Need Icons?

You can create simple icons using:
- **Figma** (free, web-based): https://figma.com
- **Canva** (free): https://canva.com
- **GIMP** (free, downloadable): https://gimp.org
- **Online Icon Generator**: https://favicon.io

Or hire a designer on:
- Fiverr ($5-20)
- Upwork ($20-50)

## Publishing Costs Summary

| Store | Registration Fee | Time to Review | Difficulty |
|-------|-----------------|----------------|------------|
| Chrome Web Store | $5 USD one-time | 1-2 days | Easy |
| Edge Add-ons | FREE | 1-3 days | Easy |
| **Total** | **$5 USD** | **~2 days** | **Easy** |

## Tips for Success

1. **Good Screenshots**: Show the extension in action
2. **Clear Description**: Explain what it does and why people need it
3. **Fast Support**: Respond to reviews and issues quickly
4. **Regular Updates**: Keep the extension maintained
5. **Ask for Reviews**: Happy users often forget to review

## Marketing Your Extension (Optional)

Once published, share on:
- Reddit (r/chrome, r/productivity, r/chrome_extensions)
- Twitter/X with #chrome #productivity hashtags
- Product Hunt
- Hacker News (Show HN: ...)
- Your personal blog

## Questions?

Read the full guide: `PUBLISHING_GUIDE.md`

---

**Ready to publish?** Follow the steps above and you'll be live in a few days! 🚀
