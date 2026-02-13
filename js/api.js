const BASE_URL = '';
const IS_GITHUB_PAGES = window.location.hostname.includes('github.io');

const LocalStorageService = {
    getAssets() {
        const data = localStorage.getItem('assets');
        return data ? JSON.parse(data) : [
            { id: 'DEMO-1', type: 'Laptop', brand: 'Demo', model: 'MacBook Pro', status: 'Available', purchase_date: '2024-01-01' },
            { id: 'DEMO-2', type: 'Phone', brand: 'Demo', model: 'Pixel 8', status: 'Assigned', purchase_date: '2024-01-02' }
        ];
    },
    saveAssets(assets) {
        localStorage.setItem('assets', JSON.stringify(assets));
    }
};

export const ApiService = {
    async getAssets() {
        if (IS_GITHUB_PAGES) return LocalStorageService.getAssets();
        const response = await fetch(`${BASE_URL}/assets`);
        return response.json();
    },

    async addAsset(assetData) {
        if (IS_GITHUB_PAGES) {
            const assets = LocalStorageService.getAssets();
            const id = `AST-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
            const newAsset = { id, ...assetData };
            assets.push(newAsset);
            LocalStorageService.saveAssets(assets);
            return newAsset;
        }
        const response = await fetch(`${BASE_URL}/assets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assetData)
        });
        return response.json();
    },

    async updateAsset(assetId, assetData) {
        if (IS_GITHUB_PAGES) {
            const assets = LocalStorageService.getAssets();
            const index = assets.findIndex(a => a.id === assetId);
            if (index !== -1) {
                assets[index] = { ...assets[index], ...assetData };
                LocalStorageService.saveAssets(assets);
                return assets[index];
            }
            return null;
        }
        const response = await fetch(`${BASE_URL}/assets/${assetId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assetData)
        });
        return response.json();
    },

    async deleteAsset(assetId) {
        if (IS_GITHUB_PAGES) {
            let assets = LocalStorageService.getAssets();
            assets = assets.filter(a => a.id !== assetId);
            LocalStorageService.saveAssets(assets);
            return { message: 'Asset removed successfully' };
        }
        const response = await fetch(`${BASE_URL}/assets/${assetId}`, {
            method: 'DELETE'
        });
        return response.json();
    },

    async sendChatMessage(sessionId, message) {
        if (IS_GITHUB_PAGES) {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) {
                throw new Error('MISSING_API_KEY');
            }

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are the Corporate Assets Tracker Assistant. 
                    Your goal is to help users manage corporate assets.
                    Current assets: ${JSON.stringify(LocalStorageService.getAssets())}
                    
                    User message: ${message}
                    
                    IMPORTANT: If the user wants to add/delete/update an asset, describe the action clearly. 
                    The tool system is simulated here. Just respond as a helpful assistant.` }]
                    }]
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'AI Connection Failed');
            }

            const data = await response.json();
            return {
                response: data.candidates[0].content.parts[0].text,
                tools_called: [] // Simplified for static preview
            };
        }

        const response = await fetch(`${BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId, message: message })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to connect to AI');
        }

        return response.json();
    }
};
