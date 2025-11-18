# Website Blocker Chrome Extension

A simple and effective Chrome extension to block access to websites you want to avoid. Help yourself stay focused and productive by blocking distracting websites.

## Features

- **Easy Website Management**: Add or remove websites from your blacklist with a simple interface
- **Two Block Modes**:
  - **Close Tab**: Automatically closes the tab when you try to visit a blocked website
  - **Show Warning**: Displays a warning page instead of closing the tab
- **Smart URL Matching**: Blocks the main domain and all subdomains
- **Persistent Storage**: Your blacklist is saved and synced across your Chrome browsers

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top right corner
4. Click "Load unpacked" button
5. Select the `chrome-extension` folder from this repository
6. The extension is now installed and ready to use!

## How to Use

### Adding a Website to Block

1. Click on the Website Blocker extension icon in your Chrome toolbar
2. Enter the website domain in the input field (e.g., `youtube.com`)
   - You can enter just the domain name
   - Protocol (http/https) and www prefix are automatically removed
   - Paths are ignored
3. Click the "Add Site" button or press Enter
4. The website is now blocked!

### Removing a Website

1. Click on the extension icon
2. Find the website in your blocked list
3. Click the "Remove" button next to it

### Changing Block Mode

1. Click on the extension icon
2. Use the "Block Mode" dropdown to select:
   - **Close Tab**: Blocked tabs will be automatically closed
   - **Show Warning**: Blocked tabs will show a warning page instead

## How It Works

- The extension monitors all tabs and checks their URLs against your blacklist
- When a match is found:
  - In "Close Tab" mode: The tab is immediately closed
  - In "Show Warning" mode: A warning page is displayed
- URL matching is smart:
  - `youtube.com` will block `youtube.com`, `www.youtube.com`, `m.youtube.com`, etc.
  - Subdomains are automatically included

## File Structure

```
chrome-extension/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker for monitoring tabs
├── popup.html            # Extension popup interface
├── popup.js              # Popup logic and blacklist management
├── styles.css            # Popup styling
├── blocked.html          # Warning page shown when site is blocked (warn mode)
└── README.md             # This file
```

## Permissions

This extension requires the following permissions:
- **tabs**: To monitor and manage browser tabs
- **storage**: To save your blacklist and preferences

## Privacy

- All data is stored locally in your browser using Chrome's sync storage
- No data is sent to any external servers
- Your browsing history is not tracked or recorded

## Tips

- Be specific with domains to avoid blocking too much (e.g., use `facebook.com` instead of `fb.com`)
- You can always temporarily disable the extension from `chrome://extensions/` if needed
- The extension works immediately after adding a site - no need to restart Chrome

## Troubleshooting

**The extension isn't blocking a website:**
- Make sure the domain is correctly entered in the blacklist
- Check that the extension is enabled in `chrome://extensions/`
- Try refreshing the tab after adding the website to the blacklist

**I can't remove a website from the blacklist:**
- Try closing and reopening the extension popup
- Check if the extension has the necessary permissions

## Contributing

Feel free to submit issues or pull requests if you have suggestions for improvements!

## License

MIT License - Feel free to use and modify as needed.
