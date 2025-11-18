// DOM elements - will be initialized after DOM loads
let siteInput;
let addButton;
let blacklistElement;
let emptyMessage;
let blockModeSelect;
let workspaceSelect;
let manageWorkspacesBtn;
let workspaceManager;
let newWorkspaceName;
let createWorkspaceBtn;
let workspaceList;

let currentWindowId = null;
let currentWorkspaceId = null;

// Load everything when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize DOM elements
  siteInput = document.getElementById('siteInput');
  addButton = document.getElementById('addButton');
  blacklistElement = document.getElementById('blacklist');
  emptyMessage = document.getElementById('emptyMessage');
  blockModeSelect = document.getElementById('blockMode');
  workspaceSelect = document.getElementById('workspaceSelect');
  manageWorkspacesBtn = document.getElementById('manageWorkspacesBtn');
  workspaceManager = document.getElementById('workspaceManager');
  newWorkspaceName = document.getElementById('newWorkspaceName');
  createWorkspaceBtn = document.getElementById('createWorkspaceBtn');
  workspaceList = document.getElementById('workspaceList');

  // Set up event listeners
  setupEventListeners();

  // Get current window ID
  const [currentWindow] = await chrome.windows.getCurrent();
  currentWindowId = currentWindow.id;

  // Ensure default workspace exists
  await ensureDefaultWorkspace();

  await loadWorkspaces();
  await loadCurrentWorkspace();
  await loadBlacklist();
  await loadBlockMode();
});

// Setup all event listeners
function setupEventListeners() {
  // Toggle workspace manager
  manageWorkspacesBtn.addEventListener('click', () => {
    workspaceManager.classList.toggle('hidden');
    if (!workspaceManager.classList.contains('hidden')) {
      loadAllWorkspaces();
    }
  });

  // Create new workspace
  createWorkspaceBtn.addEventListener('click', async () => {
    const name = newWorkspaceName.value.trim();

    if (!name) {
      alert('Please enter a workspace name');
      return;
    }

    const result = await chrome.storage.sync.get(['workspaces']);
    const workspaces = result.workspaces || {};

    // Generate unique ID
    const id = 'workspace_' + Date.now();

    // Create new workspace
    workspaces[id] = {
      id: id,
      name: name,
      blacklist: [],
      blockMode: 'close'
    };

    await chrome.storage.sync.set({ workspaces });

    // Clear input
    newWorkspaceName.value = '';

    // Reload
    await loadWorkspaces();
    await loadAllWorkspaces();
  });

  // Allow creating workspace by pressing Enter
  newWorkspaceName.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      createWorkspaceBtn.click();
    }
  });

  // Handle workspace selection change
  workspaceSelect.addEventListener('change', async () => {
    const workspaceId = workspaceSelect.value;

    // Update window-workspace mapping
    const result = await chrome.storage.sync.get(['windowWorkspaces']);
    const windowWorkspaces = result.windowWorkspaces || {};
    windowWorkspaces[currentWindowId] = workspaceId;

    await chrome.storage.sync.set({ windowWorkspaces });

    currentWorkspaceId = workspaceId;
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

    // Get current workspace
    const result = await chrome.storage.sync.get(['workspaces']);
    const workspaces = result.workspaces || {};
    const workspace = workspaces[currentWorkspaceId];

    if (!workspace) {
      alert('No workspace selected');
      return;
    }

    const blacklist = workspace.blacklist || [];

    // Check if already exists
    if (blacklist.includes(cleanSite)) {
      alert('This website is already blocked in this workspace');
      return;
    }

    // Add to blacklist
    blacklist.push(cleanSite);
    workspace.blacklist = blacklist;
    workspaces[currentWorkspaceId] = workspace;

    await chrome.storage.sync.set({ workspaces });

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
    const result = await chrome.storage.sync.get(['workspaces']);
    const workspaces = result.workspaces || {};
    const workspace = workspaces[currentWorkspaceId];

    if (workspace) {
      workspace.blockMode = blockModeSelect.value;
      workspaces[currentWorkspaceId] = workspace;
      await chrome.storage.sync.set({ workspaces });
    }
  });
}

// Ensure default workspace exists in storage
async function ensureDefaultWorkspace() {
  const result = await chrome.storage.sync.get(['workspaces']);
  let workspaces = result.workspaces || {};

  // Create default workspace if it doesn't exist
  if (!workspaces['default'] || Object.keys(workspaces).length === 0) {
    workspaces['default'] = {
      id: 'default',
      name: 'Default Workspace',
      blacklist: [],
      blockMode: 'close'
    };
    await chrome.storage.sync.set({ workspaces });
  }
}

// Load workspaces into dropdown
async function loadWorkspaces() {
  const result = await chrome.storage.sync.get(['workspaces', 'windowWorkspaces']);
  const workspaces = result.workspaces || {};
  const windowWorkspaces = result.windowWorkspaces || {};

  workspaceSelect.innerHTML = '';

  // Get current workspace for this window
  currentWorkspaceId = windowWorkspaces[currentWindowId] || 'default';

  // Check if we have any workspaces
  const workspaceArray = Object.values(workspaces);

  if (workspaceArray.length === 0) {
    // This shouldn't happen because ensureDefaultWorkspace runs first,
    // but just in case, create a default option
    const option = document.createElement('option');
    option.value = 'default';
    option.textContent = 'Default Workspace';
    option.selected = true;
    workspaceSelect.appendChild(option);
    return;
  }

  // Populate dropdown
  workspaceArray.forEach(workspace => {
    const option = document.createElement('option');
    option.value = workspace.id;
    option.textContent = workspace.name;
    if (workspace.id === currentWorkspaceId) {
      option.selected = true;
    }
    workspaceSelect.appendChild(option);
  });
}

// Load current workspace details
async function loadCurrentWorkspace() {
  const result = await chrome.storage.sync.get(['workspaces', 'windowWorkspaces']);
  const workspaces = result.workspaces || {};
  const windowWorkspaces = result.windowWorkspaces || {};

  currentWorkspaceId = windowWorkspaces[currentWindowId] || 'default';

  // If workspace doesn't exist, use default
  if (!workspaces[currentWorkspaceId]) {
    currentWorkspaceId = 'default';
    windowWorkspaces[currentWindowId] = 'default';
    await chrome.storage.sync.set({ windowWorkspaces });
  }
}

// Load and display blacklist for current workspace
async function loadBlacklist() {
  const result = await chrome.storage.sync.get(['workspaces']);
  const workspaces = result.workspaces || {};
  const workspace = workspaces[currentWorkspaceId];

  blacklistElement.innerHTML = '';

  const blacklist = workspace ? workspace.blacklist || [] : [];

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

// Load block mode for current workspace
async function loadBlockMode() {
  const result = await chrome.storage.sync.get(['workspaces']);
  const workspaces = result.workspaces || {};
  const workspace = workspaces[currentWorkspaceId];

  const blockMode = workspace ? workspace.blockMode || 'close' : 'close';
  blockModeSelect.value = blockMode;
}

// Remove site from blacklist
async function removeSite(site) {
  const result = await chrome.storage.sync.get(['workspaces']);
  const workspaces = result.workspaces || {};
  const workspace = workspaces[currentWorkspaceId];

  if (workspace) {
    let blacklist = workspace.blacklist || [];
    blacklist = blacklist.filter(s => s !== site);
    workspace.blacklist = blacklist;
    workspaces[currentWorkspaceId] = workspace;

    await chrome.storage.sync.set({ workspaces });
  }

  await loadBlacklist();
}

// Load all workspaces for management view
async function loadAllWorkspaces() {
  const result = await chrome.storage.sync.get(['workspaces']);
  const workspaces = result.workspaces || {};

  workspaceList.innerHTML = '';

  Object.values(workspaces).forEach(workspace => {
    const li = document.createElement('li');
    li.className = 'workspace-item';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = `${workspace.name} (${workspace.blacklist ? workspace.blacklist.length : 0} sites)`;
    nameSpan.className = 'workspace-name';

    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'workspace-buttons';

    // Only show delete for non-default workspaces
    if (workspace.id !== 'default') {
      const renameButton = document.createElement('button');
      renameButton.textContent = 'Rename';
      renameButton.className = 'rename-button';
      renameButton.addEventListener('click', () => renameWorkspace(workspace.id));

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'delete-button-small';
      deleteButton.addEventListener('click', () => deleteWorkspace(workspace.id));

      buttonsDiv.appendChild(renameButton);
      buttonsDiv.appendChild(deleteButton);
    }

    li.appendChild(nameSpan);
    li.appendChild(buttonsDiv);
    workspaceList.appendChild(li);
  });
}

// Rename workspace
async function renameWorkspace(workspaceId) {
  const newName = prompt('Enter new workspace name:');

  if (!newName || !newName.trim()) {
    return;
  }

  const result = await chrome.storage.sync.get(['workspaces']);
  const workspaces = result.workspaces || {};
  const workspace = workspaces[workspaceId];

  if (workspace) {
    workspace.name = newName.trim();
    workspaces[workspaceId] = workspace;
    await chrome.storage.sync.set({ workspaces });
    await loadWorkspaces();
    await loadAllWorkspaces();
  }
}

// Delete workspace
async function deleteWorkspace(workspaceId) {
  if (workspaceId === 'default') {
    alert('Cannot delete the default workspace');
    return;
  }

  if (!confirm('Are you sure you want to delete this workspace? All blocked sites in this workspace will be lost.')) {
    return;
  }

  const result = await chrome.storage.sync.get(['workspaces', 'windowWorkspaces']);
  const workspaces = result.workspaces || {};
  const windowWorkspaces = result.windowWorkspaces || {};

  // Delete workspace
  delete workspaces[workspaceId];

  // Update any windows using this workspace to use default
  Object.keys(windowWorkspaces).forEach(windowId => {
    if (windowWorkspaces[windowId] === workspaceId) {
      windowWorkspaces[windowId] = 'default';
    }
  });

  await chrome.storage.sync.set({ workspaces, windowWorkspaces });

  // If current workspace was deleted, switch to default
  if (currentWorkspaceId === workspaceId) {
    currentWorkspaceId = 'default';
    await loadBlacklist();
    await loadBlockMode();
  }

  await loadWorkspaces();
  await loadAllWorkspaces();
}
