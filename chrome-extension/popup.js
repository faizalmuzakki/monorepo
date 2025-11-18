// DOM elements
const siteInput = document.getElementById('siteInput');
const addButton = document.getElementById('addButton');
const blacklistElement = document.getElementById('blacklist');
const emptyMessage = document.getElementById('emptyMessage');
const blockModeSelect = document.getElementById('blockMode');

// Load blacklist and block mode when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  await loadBlacklist();
  await loadBlockMode();
});

// Add site to blacklist
addButton.addEventListener('click', async () => {
  const site = siteInput.value.trim().toLowerCase();

  if (!site) {
    alert('Please enter a website');
    return;
  }

  // Remove protocol and path if provided
  let cleanSite = site
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];

  if (!cleanSite) {
    alert('Please enter a valid website');
    return;
  }

  // Get current blacklist
  const result = await chrome.storage.sync.get(['blacklist']);
  const blacklist = result.blacklist || [];

  // Check if already exists
  if (blacklist.includes(cleanSite)) {
    alert('This website is already blocked');
    return;
  }

  // Add to blacklist
  blacklist.push(cleanSite);
  await chrome.storage.sync.set({ blacklist });

  // Clear input
  siteInput.value = '';

  // Reload list
  await loadBlacklist();
});

// Allow adding by pressing Enter
siteInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addButton.click();
  }
});

// Handle block mode change
blockModeSelect.addEventListener('change', async () => {
  await chrome.storage.sync.set({ blockMode: blockModeSelect.value });
});

// Load and display blacklist
async function loadBlacklist() {
  const result = await chrome.storage.sync.get(['blacklist']);
  const blacklist = result.blacklist || [];

  blacklistElement.innerHTML = '';

  if (blacklist.length === 0) {
    emptyMessage.style.display = 'block';
  } else {
    emptyMessage.style.display = 'none';

    blacklist.forEach(site => {
      const li = document.createElement('li');

      const siteSpan = document.createElement('span');
      siteSpan.textContent = site;
      siteSpan.className = 'site-name';

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Remove';
      deleteButton.className = 'delete-button';
      deleteButton.addEventListener('click', async () => {
        await removeSite(site);
      });

      li.appendChild(siteSpan);
      li.appendChild(deleteButton);
      blacklistElement.appendChild(li);
    });
  }
}

// Load block mode
async function loadBlockMode() {
  const result = await chrome.storage.sync.get(['blockMode']);
  const blockMode = result.blockMode || 'close';
  blockModeSelect.value = blockMode;
}

// Remove site from blacklist
async function removeSite(site) {
  const result = await chrome.storage.sync.get(['blacklist']);
  let blacklist = result.blacklist || [];

  blacklist = blacklist.filter(s => s !== site);
  await chrome.storage.sync.set({ blacklist });

  await loadBlacklist();
}
