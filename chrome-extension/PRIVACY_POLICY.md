# Privacy Policy for Website Blocker Extension

**Last Updated:** November 18, 2025

## Overview
Website Blocker is committed to protecting your privacy. This privacy policy explains how the extension handles your data.

## Data Collection
**We do NOT collect any personal data.** The extension does not:
- Track your browsing history
- Monitor which websites you visit
- Collect personal information
- Send any data to external servers
- Use analytics or tracking tools

## Data Storage
All extension data is stored locally on your device using Chrome's built-in storage API:

- **Workspace Settings**: Names of your custom workspaces
- **Blocked Website Lists**: Domains you've chosen to block in each workspace
- **Block Mode Preferences**: Your chosen block mode (close tab or warning) per workspace
- **Window-Workspace Mappings**: Which workspace is assigned to which browser window

### Chrome Sync
If you have Chrome Sync enabled, your extension settings will automatically sync across your Chrome browsers. This synchronization is handled entirely by Google Chrome's sync infrastructure - we do not have access to this data.

## Permissions Explained

### "tabs" Permission
**Why needed:** To monitor tab URLs and detect when you navigate to a blocked website.
**What we do:** Check if the current tab's URL matches your blocked sites list.
**What we DON'T do:** We don't track, record, or send your browsing history anywhere.

### "storage" Permission
**Why needed:** To save your workspace configurations and blocked website lists locally.
**What we do:** Store your settings in Chrome's local storage.
**What we DON'T do:** We don't send this data to any external servers.

## Third-Party Services
This extension does NOT use any third-party services, analytics, or tracking tools.

## Data Sharing
We do NOT share, sell, or transmit your data to anyone. All data remains on your device.

## Data Deletion
You can delete all extension data at any time by:
1. Uninstalling the extension (removes all stored data)
2. Using Chrome's "Clear browsing data" feature and selecting "Hosted app data"
3. Manually deleting workspaces through the extension interface

## Children's Privacy
This extension does not knowingly collect information from children under 13. The extension is intended for general use and does not target children.

## Changes to This Policy
If we update this privacy policy, we will:
- Update the "Last Updated" date above
- Notify users through the Chrome Web Store listing
- Require no action from users unless data collection practices change

## Open Source
This extension is open source. You can review the source code to verify these privacy claims at:
[Your GitHub repository URL]

## Contact
If you have questions about this privacy policy or the extension, please contact:
- Email: [Your email address]
- GitHub Issues: [Your GitHub issues URL]

## Compliance
This extension complies with:
- Chrome Web Store Developer Program Policies
- GDPR (EU General Data Protection Regulation)
- CCPA (California Consumer Privacy Act)

## Your Rights
You have the right to:
- Access your data (viewable in the extension popup)
- Delete your data (by removing workspaces or uninstalling)
- Export your data (no export feature currently, but all data is viewable in the extension)

## Security
Your data security is important. All data is stored using Chrome's secure storage API and never leaves your device except through Chrome Sync (if you have it enabled).

---

**Summary:** This extension respects your privacy. All your settings stay on your device, nothing is tracked, and nothing is sent to external servers.
