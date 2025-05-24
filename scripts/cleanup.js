const fs = require('fs').promises;
const path = require('path');

// Function to compare orders
function areOrdersEqual(order1, order2) {
    return (
        JSON.stringify(order1.items) === JSON.stringify(order2.items) &&
        order1.timestamp === order2.timestamp &&
        order1.total === order2.total &&
        order1.orderNumber === order2.orderNumber &&
        order1.deliveryInfo.address === order2.deliveryInfo.address &&
        order1.deliveryInfo.phone === order2.deliveryInfo.phone
    );
}

// Function to remove duplicates from an array of orders
function removeDuplicates(orders) {
    const uniqueOrders = [];
    const seen = new Set();

    for (const order of orders) {
        const orderKey = JSON.stringify(order);
        if (!seen.has(orderKey)) {
            seen.add(orderKey);
            uniqueOrders.push(order);
        }
    }

    return uniqueOrders;
}

// Process orders.json
async function cleanupOrders() {
    const ordersFilePath = path.join(__dirname, '..', 'data', 'orders.json');
    const orders = JSON.parse(await fs.readFile(ordersFilePath, 'utf8'));
    
    const uniqueOrders = removeDuplicates(orders);
    
    await fs.writeFile(ordersFilePath, JSON.stringify(uniqueOrders, null, 2));
    console.log(`Removed ${orders.length - uniqueOrders.length} duplicate orders`);
}

// Process history.json
async function cleanupHistory() {
    const historyFilePath = path.join(__dirname, '..', 'data', 'history.json');
    const history = JSON.parse(await fs.readFile(historyFilePath, 'utf8'));
    
    const uniqueHistory = removeDuplicates(history);
    
    await fs.writeFile(historyFilePath, JSON.stringify(uniqueHistory, null, 2));
    console.log(`Removed ${history.length - uniqueHistory.length} duplicate history entries`);
}

async function main() {
    try {
        await cleanupOrders();
        await cleanupHistory();
        console.log('Cleanup completed successfully');
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
}

main();
