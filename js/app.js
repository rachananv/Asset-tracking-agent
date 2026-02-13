import { ApiService } from './api.js';
console.log('Chatbot App Module Loading...');

// State Management
let currentTab = 'dashboard';
let assets = [];
let sessions = ['Session-1'];
let activeSession = 'Session-1';

// DOM Elements
const assetList = document.getElementById('asset-list');
const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
if (userInput) userInput.disabled = false;
const navDashboard = document.getElementById('nav-dashboard');
const navChat = document.getElementById('nav-chat');
const pageDashboard = document.getElementById('page-dashboard');
const pageChat = document.getElementById('page-chat');
const assetModal = document.getElementById('asset-modal');
const assetForm = document.getElementById('asset-form');
const sessionItems = document.getElementById('session-items');
const connectionStatus = document.getElementById('connection-status');
const settingsModal = document.getElementById('settings-modal');
const settingsForm = document.getElementById('settings-form');
const geminiApiKeyInput = document.getElementById('gemini-api-key');

const IS_GITHUB_PAGES = window.location.hostname.includes('github.io');

if (IS_GITHUB_PAGES) {
    if (connectionStatus) {
        connectionStatus.textContent = 'Static Preview';
        connectionStatus.style.background = '#f59e0b'; // Amber
    }
}

// --- Navigation ---
const switchTab = (tab) => {
    currentTab = tab;
    if (tab === 'dashboard') {
        navDashboard.classList.add('active');
        navChat.classList.remove('active');
        pageDashboard.classList.remove('hidden');
        pageChat.classList.add('hidden');
        loadAssets();
    } else {
        console.log('Switching to Chat tab');
        navChat.classList.add('active');
        navDashboard.classList.remove('active');
        pageChat.classList.remove('hidden');
        pageDashboard.classList.add('hidden');
        renderSessions();
        setTimeout(() => userInput.focus(), 100);
    }
};

navDashboard.addEventListener('click', () => switchTab('dashboard'));
navChat.addEventListener('click', () => switchTab('chat'));

// --- Dashboard Logic ---
const loadAssets = async () => {
    try {
        if (IS_GITHUB_PAGES) {
            assets = [
                { id: 'DEMO-1', type: 'Laptop', brand: 'Demo', model: 'MacBook Pro', status: 'Available', purchase_date: '2024-01-01' },
                { id: 'DEMO-2', type: 'Phone', brand: 'Demo', model: 'Pixel 8', status: 'Assigned', purchase_date: '2024-01-02' }
            ];
            renderAssets();
            return;
        }
        assets = await ApiService.getAssets();
        renderAssets();
    } catch (error) {
        console.error('Failed to load assets:', error);
    }
};

const renderAssets = () => {
    assetList.innerHTML = assets.map(asset => `
    <div class="asset-card">
      <div class="asset-type">${asset.type}</div>
      <div class="asset-title">${asset.brand} ${asset.model}</div>
      <div class="asset-details">
        <div class="detail-item">
          <span class="detail-label">Assigned To:</span>
          <span>${asset.assigned_to || 'None'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Date:</span>
          <span>${asset.purchase_date}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Status:</span>
          <span class="status-badge status-${asset.status.toLowerCase()}">${asset.status}</span>
        </div>
      </div>
      <div class="card-actions">
        <button class="action-btn" onclick="editAsset('${asset.id}')"><i data-lucide="edit"></i></button>
        <button class="action-btn" onclick="deleteAsset('${asset.id}')"><i data-lucide="trash-2"></i></button>
      </div>
    </div>
  `).join('');
    if (window.lucide) lucide.createIcons();
};

window.editAsset = (id) => {
    const asset = assets.find(a => a.id === id);
    if (!asset) return;
    document.getElementById('modal-title').textContent = 'Edit Asset';
    document.getElementById('asset-id-field').value = asset.id;
    document.getElementById('asset-type').value = asset.type;
    document.getElementById('asset-brand').value = asset.brand;
    document.getElementById('asset-model').value = asset.model;
    document.getElementById('asset-date').value = asset.purchase_date;
    document.getElementById('asset-status').value = asset.status;
    assetModal.style.display = 'flex';
};

window.deleteAsset = async (id) => {
    if (confirm('Are you sure you want to remove this asset?')) {
        await ApiService.deleteAsset(id);
        loadAssets();
    }
};

// --- Modal Logic ---
document.getElementById('open-add-modal').onclick = () => {
    document.getElementById('modal-title').textContent = 'Add New Asset';
    assetForm.reset();
    document.getElementById('asset-id-field').value = '';
    assetModal.style.display = 'flex';
};

document.getElementById('close-modal').onclick = () => {
    assetModal.style.display = 'none';
};

// --- Settings Logic ---
document.getElementById('open-settings').onclick = () => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) geminiApiKeyInput.value = savedKey;
    settingsModal.style.display = 'flex';
};

document.getElementById('close-settings').onclick = () => {
    settingsModal.style.display = 'none';
};

settingsForm.onsubmit = (e) => {
    e.preventDefault();
    const key = geminiApiKeyInput.value.trim();
    if (key) {
        localStorage.setItem('gemini_api_key', key);
        settingsModal.style.display = 'none';
        alert('API Key saved! AI features are now active.');
        loadAssets(); // Refresh demo data or indicators
    }
};

assetForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('asset-id-field').value;
    const data = {
        type: document.getElementById('asset-type').value,
        brand: document.getElementById('asset-brand').value,
        model: document.getElementById('asset-model').value,
        purchase_date: document.getElementById('asset-date').value,
        status: document.getElementById('asset-status').value
    };

    if (id) {
        await ApiService.updateAsset(id, data);
    } else {
        await ApiService.addAsset(data);
    }
    assetModal.style.display = 'none';
    loadAssets();
};

// --- Chat Logic ---
const renderSessions = () => {
    sessionItems.innerHTML = sessions.map(s => `
    <div class="session-item ${s === activeSession ? 'active' : ''}" onclick="selectSession('${s}')">
      <span>${s}</span>
      <i data-lucide="trash-2" class="action-btn" style="font-size: 0.9rem" onclick="deleteSession(event, '${s}')"></i>
    </div>
  `).join('');
    if (window.lucide) lucide.createIcons();
};

window.selectSession = (id) => {
    activeSession = id;
    renderSessions();
    // In a real app, we'd load session messages here
};

window.deleteSession = (e, id) => {
    e.stopPropagation();
    sessions = sessions.filter(s => s !== id);
    if (activeSession === id) activeSession = sessions[0] || '';
    renderSessions();
};

document.getElementById('new-session').onclick = () => {
    const newId = `Session-${sessions.length + 1}`;
    sessions.push(newId);
    activeSession = newId;
    renderSessions();
};

const addMessage = (role, content, tools = []) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message message-${role}`;

    let html = `<div>${content}</div>`;
    if (tools && tools.length > 0) {
        tools.forEach(tool => {
            html += `<div class="tool-indicator">⚡ ${tool.name}</div>`;
        });
    }

    msgDiv.innerHTML = html;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
};

const handleSend = async () => {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage('user', message);
    userInput.value = '';

    try {
        if (IS_GITHUB_PAGES) {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) {
                addMessage('ai', 'Welcome to the **Static Preview**! To use the AI Chat, please click the settings icon (⚙️) above and enter your Gemini API Key. Your key is saved locally in your browser.');
                document.getElementById('open-settings').click();
                return;
            }
        }
        const result = await ApiService.sendChatMessage(activeSession, message);
        addMessage('ai', result.response, result.tools_called);

        // If tools were called, refresh assets in background
        if (result.tools_called.length > 0) {
            loadAssets();
        }
    } catch (error) {
        addMessage('ai', `Error: ${error.message}`);
    }
};

chatForm.onsubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted');
    handleSend();
};

userInput.oninput = (e) => {
    console.log('User input detected:', e.target.value);
};

document.getElementById('page-chat').addEventListener('click', () => {
    console.log('Chat page clicked - forcing focus');
    userInput.focus();
});

const initApp = () => {
    console.log('App Initializing...');
    loadAssets();
    if (window.lucide) {
        lucide.createIcons();
    } else {
        console.warn('Lucide not found at init');
    }
    console.log('App initialization complete');
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
