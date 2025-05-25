const fs = require('fs').promises;
const path = require('path');

const historyFilePath = path.join(__dirname, '..', 'data', 'history.json');

// Read history file with proper error handling
async function readHistory() {
    try {
        const data = await fs.readFile(historyFilePath, 'utf8');
        return JSON.parse(data) || [];
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

// Write history file with proper error handling
async function writeHistory(history) {
    try {
        await fs.writeFile(historyFilePath, JSON.stringify(history, null, 2));
    } catch (error) {
        throw error;
    }
}

// Add an order to history
async function addToHistory(order) {
    try {
        if (!order) {
            throw new Error('No order data provided');
        }

        // Read existing history
        const history = await readHistory();

        // Add deletion timestamp
        order.deletedAt = new Date().toLocaleString();

        // Add new order to history
        history.push(order);

        // Write updated history
        await writeHistory(history);

        return true;
    } catch (error) {
        console.error('Error adding order to history:', error);
        throw error;
    }
}

// Get all order history
async function getHistory(req, res) {
    try {
        const history = await readHistory();
        // Sort history by deletion timestamp in descending order (newest first)
        history.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
        res.status(200).json(history);
    } catch (error) {
        console.error('Error getting history:', error);
        res.status(500).json({ error: 'Failed to get order history' });
    }
}

// Remove an order from history by ID
async function removeFromHistory(req, res) {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        // Read existing history
        const history = await readHistory();

        // Find and remove the order
        const updatedHistory = history.filter(order => order.id !== id);

        if (history.length === updatedHistory.length) {
            return res.status(404).json({ error: 'Order not found in history' });
        }

        // Write updated history
        await writeHistory(updatedHistory);

        res.status(200).json({ message: 'Order removed from history successfully' });
    } catch (error) {
        console.error('Error removing order from history:', error);
        res.status(500).json({ error: 'Failed to remove order from history' });
    }
}

module.exports = {
    addToHistory,
    getHistory,
    removeFromHistory
};
