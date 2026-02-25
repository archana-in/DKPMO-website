// Mock Database using LocalStorage
const DB_KEY = 'dkpmo_csc_data';

// Initialize DB if not exists
function initDB() {
    if (!localStorage.getItem(DB_KEY)) {
        const initialData = {
            customers: [], // { id, name, email }
            suppliers: [], // { id, name, email }
            orders: [],    // { id, customerId, supplierId (nullable), details, status: 'Pending Assignment', 'Assigned', 'Accepted', 'Rejected', 'Completed', timestamp }
        };
        localStorage.setItem(DB_KEY, JSON.stringify(initialData));
    }
}

// Get entire DB
function getDB() {
    initDB();
    return JSON.parse(localStorage.getItem(DB_KEY));
}

// Save entire DB
function saveDB(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
}

// Generate unique ID
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// --- ENTITY FUNCTIONS ---

function registerCustomer(name, email) {
    const db = getDB();
    const id = generateId();
    db.customers.push({ id, name, email });
    saveDB(db);
    return id;
}

function getCustomer(id) {
    return getDB().customers.find(c => c.id === id);
}

function registerSupplier(name, email) {
    const db = getDB();
    const id = generateId();
    db.suppliers.push({ id, name, email });
    saveDB(db);
    return id;
}

function getSupplier(id) {
    return getDB().suppliers.find(s => s.id === id);
}

// --- ORDER FUNCTIONS ---

function createOrder(customerId, details) {
    const db = getDB();
    const order = {
        id: generateId(),
        customerId: customerId,
        supplierId: null,
        details: details,
        status: 'Pending Assignment',
        timestamp: new Date().toISOString()
    };
    db.orders.push(order);
    saveDB(db);
    return order;
}

function getOrdersForCustomer(customerId) {
    return getDB().orders.filter(o => o.customerId === customerId);
}

function getOrdersForSupplier(supplierId) {
    return getDB().orders.filter(o => o.supplierId === supplierId);
}

function assignOrderToSupplier(orderId, supplierId) {
    const db = getDB();
    const order = db.orders.find(o => o.id === orderId);
    if (order) {
        order.supplierId = supplierId;
        order.status = 'Assigned';
        saveDB(db);
        return true;
    }
    return false;
}

function updateOrderStatus(orderId, newStatus) {
    const db = getDB();
    const order = db.orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        saveDB(db);
        return true;
    }
    return false;
}

function getAllOrders() {
    return getDB().orders;
}

function getAllCustomers() {
    return getDB().customers;
}

function getAllSuppliers() {
    return getDB().suppliers;
}

// Initialize on load
initDB();
