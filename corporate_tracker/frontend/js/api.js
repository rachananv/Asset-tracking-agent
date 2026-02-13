const BASE_URL = '';

export const ApiService = {
    async getAssets() {
        const response = await fetch(`${BASE_URL}/assets`);
        return response.json();
    },

    async addAsset(assetData) {
        const response = await fetch(`${BASE_URL}/assets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assetData)
        });
        return response.json();
    },

    async updateAsset(assetId, assetData) {
        const response = await fetch(`${BASE_URL}/assets/${assetId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assetData)
        });
        return response.json();
    },

    async deleteAsset(assetId) {
        const response = await fetch(`${BASE_URL}/assets/${assetId}`, {
            method: 'DELETE'
        });
        return response.json();
    },

    async assignAsset(assetId, employeeId) {
        const response = await fetch(`${BASE_URL}/assign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ asset_id: assetId, employee_id: employeeId })
        });
        return response.json();
    },

    async sendChatMessage(sessionId, message) {
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
