# Website Blocker Chrome Extension

A simple and effective Chrome extension to block access to websites you want to avoid. Help yourself stay focused and productive by blocking distracting websites.

## Features

- **Workspace-Specific Blocking**: Create multiple workspaces with different blocked sites for each browser window
- **Easy Website Management**: Add or remove websites from your blacklist with a simple interface
- **Two Block Modes**:
  - **Close Tab**: Automatically closes the tab when you try to visit a blocked website
  - **Show Warning**: Displays a warning page instead of closing the tab
- **Smart URL Matching**: Blocks the main domain and all subdomains
- **Persistent Storage**: Your blacklist is saved and synced across your Chrome browsers
- **Flexible Workspace Management**: Create, rename, and delete workspaces as needed

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top right corner
4. Click "Load unpacked" button
5. Select the `chrome-extension` folder from this repository
6. The extension is now installed and ready to use!

## How to Use

### Understanding Workspaces

Workspaces allow you to have different blocked website lists for different browser windows. This is perfect if you use multiple windows for different purposes (e.g., one for work, one for personal browsing).

- Each browser window can be assigned to a workspace
- Each workspace has its own blacklist and block mode settings
- When you switch a window to a different workspace, the blocked sites for that window change accordingly
- A default workspace is created automatically on installation

### Managing Workspaces

1. Click on the Website Blocker extension icon in your Chrome toolbar
2. Click the "Manage" button next to "Current Workspace"
3. In the workspace manager you can:
   - **Create a new workspace**: Enter a name and click "Create"
   - **Rename a workspace**: Click "Rename" next to any workspace (except Default)
   - **Delete a workspace**: Click "Delete" next to any workspace (except Default)
   - View the number of blocked sites in each workspace

### Switching Workspaces

1. Click on the extension icon
2. Use the "Current Workspace" dropdown to select a workspace
3. The current browser window will now use the selected workspace's settings

### Adding a Website to Block

1. Click on the Website Blocker extension icon in your Chrome toolbar
2. Select the workspace you want to add the site to (or use the current one)
3. Enter the website domain in the input field (e.g., `youtube.com`)
   - You can enter just the domain name
   - Protocol (http/https) and www prefix are automatically removed
   - Paths are ignored
4. Click the "Add Site" button or press Enter
5. The website is now blocked in the current workspace!

### Removing a Website

1. Click on the extension icon
2. Make sure you're viewing the correct workspace
3. Find the website in your blocked list
4. Click the "Remove" button next to it

### Changing Block Mode

1. Click on the extension icon
2. Select the workspace you want to configure
3. Use the "Block Mode" dropdown to select:
   - **Close Tab**: Blocked tabs will be automatically closed
   - **Show Warning**: Blocked tabs will show a warning page instead

## How It Works

- The extension monitors all tabs and checks their URLs against the blacklist of the current window's workspace
- Each browser window is assigned to a workspace (default workspace is used initially)
- When a match is found:
  - In "Close Tab" mode: The tab is immediately closed
  - In "Show Warning" mode: A warning page is displayed
- URL matching is smart:
  - `youtube.com` will block `youtube.com`, `www.youtube.com`, `m.youtube.com`, etc.
  - Subdomains are automatically included
- Workspace assignments persist across browser sessions

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

- **Use workspaces strategically**: Create separate workspaces for work, personal, and focus time
- **Example workspace setup**:
  - "Work": Block social media and entertainment sites
  - "Personal": Block work-related sites to help you disconnect
  - "Focus": Block all distracting sites for deep work sessions
- Be specific with domains to avoid blocking too much (e.g., use `facebook.com` instead of `fb.com`)
- You can always temporarily disable the extension from `chrome://extensions/` if needed
- The extension works immediately after adding a site or switching workspaces - no need to restart Chrome
- Each workspace can have different block modes (close vs. warning) to suit different use cases

## Troubleshooting

**The extension isn't blocking a website:**
- Make sure you're viewing the correct workspace
- Check that the domain is correctly entered in the blacklist for the current workspace
- Verify that the extension is enabled in `chrome://extensions/`
- Try refreshing the tab after adding the website to the blacklist

**I can't remove a website from the blacklist:**
- Make sure you're viewing the correct workspace
- Try closing and reopening the extension popup
- Check if the extension has the necessary permissions

**My blocked sites disappeared:**
- Check if you've switched to a different workspace
- Each workspace has its own separate blacklist
- Use the workspace dropdown to switch between workspaces

## Contributing

Feel free to submit issues or pull requests if you have suggestions for improvements!

## License

MIT License - Feel free to use and modify as needed.
