// Initialize default workspace on install
chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.sync.get(['workspaces', 'windowWorkspaces']);

  // Create default workspace if none exists
  if (!result.workspaces) {
    const defaultWorkspace = {
      id: 'default',
      name: 'Default Workspace',
      blacklist: [],
      blockMode: 'close'
    };
    await chrome.storage.sync.set({
      workspaces: { 'default': defaultWorkspace },
      windowWorkspaces: {}
    });
  }
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only check when the URL is updated
  if (changeInfo.url) {
    checkAndBlockURL(tabId, changeInfo.url, tab.windowId);
  }
});

// Listen for new tabs being created
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.url) {
    checkAndBlockURL(tab.id, tab.url, tab.windowId);
  }
});

// Listen for window removal to clean up workspace assignments
chrome.windows.onRemoved.addListener(async (windowId) => {
  const result = await chrome.storage.sync.get(['windowWorkspaces']);
  const windowWorkspaces = result.windowWorkspaces || {};

  if (windowWorkspaces[windowId]) {
    delete windowWorkspaces[windowId];
    await chrome.storage.sync.set({ windowWorkspaces });
  }
});

// Function to get workspace for a window
async function getWorkspaceForWindow(windowId) {
  const result = await chrome.storage.sync.get(['windowWorkspaces', 'workspaces']);
  const windowWorkspaces = result.windowWorkspaces || {};
  const workspaces = result.workspaces || {};

  // Get the workspace ID for this window
  let workspaceId = windowWorkspaces[windowId];

  // If no workspace assigned, use default
  if (!workspaceId || !workspaces[workspaceId]) {
    workspaceId = 'default';
    // Assign default workspace to this window
    windowWorkspaces[windowId] = workspaceId;
    await chrome.storage.sync.set({ windowWorkspaces });
  }

  return workspaces[workspaceId] || { id: 'default', name: 'Default Workspace', blacklist: [], blockMode: 'close' };
}

// Function to check if URL should be blocked
async function checkAndBlockURL(tabId, url, windowId) {
  try {
    // Get the workspace for this window
    const workspace = await getWorkspaceForWindow(windowId);
    const blacklist = workspace.blacklist || [];
    const blockMode = workspace.blockMode || 'close';

    // Parse the URL
    let hostname;
    try {
      const urlObj = new URL(url);
      hostname = urlObj.hostname;
    } catch (e) {
      // Invalid URL, ignore
      return;
    }

    // Check if the hostname matches any blacklisted site
    const isBlocked = blacklist.some(blockedSite => {
      // Remove www. prefix for comparison
      const cleanHostname = hostname.replace(/^www\./, '');
      const cleanBlocked = blockedSite.replace(/^www\./, '');

      // Check if hostname matches or is a subdomain
      return cleanHostname === cleanBlocked || cleanHostname.endsWith('.' + cleanBlocked);
    });

    if (isBlocked) {
      if (blockMode === 'close') {
        // Close the tab
        chrome.tabs.remove(tabId);
      } else {
        // Show warning page
        chrome.tabs.update(tabId, {
          url: chrome.runtime.getURL('blocked.html') + '?site=' + encodeURIComponent(hostname)
        });
      }
    }
  } catch (error) {
    console.error('Error checking URL:', error);
  }
}
