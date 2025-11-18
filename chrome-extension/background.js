// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only check when the URL is updated
  if (changeInfo.url) {
    checkAndBlockURL(tabId, changeInfo.url);
  }
});

// Listen for new tabs being created
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.url) {
    checkAndBlockURL(tab.id, tab.url);
  }
});

// Function to check if URL should be blocked
async function checkAndBlockURL(tabId, url) {
  try {
    // Get the blacklist from storage
    const result = await chrome.storage.sync.get(['blacklist', 'blockMode']);
    const blacklist = result.blacklist || [];
    const blockMode = result.blockMode || 'close'; // 'close' or 'warn'

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
