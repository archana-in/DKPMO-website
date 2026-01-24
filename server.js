const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '.')));

const DATA_FILE = path.join(__dirname, 'consultancy', 'law', 'data.json');
const KEY_FILE = path.join(__dirname, 'consultancy', 'law', 'secret.key');

// Encryption Settings
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

// Helper: Get or Create Key
function getKey() {
    if (fs.existsSync(KEY_FILE)) {
        return Buffer.from(fs.readFileSync(KEY_FILE, 'utf8'), 'hex');
    } else {
        const key = crypto.randomBytes(32);
        fs.writeFileSync(KEY_FILE, key.toString('hex'));
        return key;
    }
}
const ENCRYPTION_KEY = getKey();

// Helper: Encrypt
function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Helper: Decrypt
function decrypt(text) {
    if (!text) return null;
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        console.error("Decryption failed", e);
        return null;
    }
}

// Helper: Read Data
function readData() {
    if (!fs.existsSync(DATA_FILE)) {
        return { cases: [] };
    }
    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    try {
        const decrypted = decrypt(rawData);
        return JSON.parse(decrypted || '{"cases": []}');
    } catch (e) {
        // If file exists but is not encrypted (initial setup), return empty
        return { cases: [] };
    }
}

// Helper: Write Data
function writeData(data) {
    const stringData = JSON.stringify(data);
    const encrypted = encrypt(stringData);
    fs.writeFileSync(DATA_FILE, encrypted);
}

// Routes

// 1. Submit Case
app.post('/api/consultancy/law/submit', (req, res) => {
    const { name, email, query } = req.body;
    const db = readData();

    const caseId = 'CASE' + Math.floor(1000 + Math.random() * 9000); // Simple ID gen
    const password = Math.random().toString(36).slice(-8); // Random password

    const newCase = {
        id: caseId,
        password: password, // In production, hash this!
        name,
        email,
        query,
        status: 'Submitted', // Submitted, Reviewed, Processing, Closed
        quote: null,
        feedback: null,
        createdAt: new Date().toISOString(),
        messages: []
    };

    db.cases.push(newCase);
    writeData(db);

    // Simulate Email
    console.log(`[EMAIL SENT] To: ${email}, Subject: Case Registered. ID: ${caseId}, Pass: ${password}`);

    res.json({ success: true, caseId, password, message: "Case registered. Check your simulated email (console) for credentials." });
});

// 2. Login
app.post('/api/consultancy/law/login', (req, res) => {
    const { id, password, isAdmin } = req.body;
    
    // Hardcoded Admin for Lawyer
    if (isAdmin && id === 'admin' && password === 'admin123') {
        return res.json({ success: true, role: 'lawyer' });
    }

    const db = readData();
    const caseObj = db.cases.find(c => c.id === id && c.password === password);

    if (caseObj) {
        res.json({ success: true, role: 'user', caseId: caseObj.id });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// 3. Get Case Details (User)
app.get('/api/consultancy/law/case/:id', (req, res) => {
    const db = readData();
    const caseObj = db.cases.find(c => c.id === req.params.id);
    if (caseObj) {
        res.json({ success: true, data: caseObj });
    } else {
        res.status(404).json({ success: false, message: "Case not found" });
    }
});

// 4. Update Case (Shared: Quote, Pay, Message, Feedback)
app.post('/api/consultancy/law/update', (req, res) => {
    const { id, action, payload } = req.body;
    const db = readData();
    const caseIndex = db.cases.findIndex(c => c.id === id);

    if (caseIndex === -1) {
        return res.status(404).json({ success: false, message: "Case not found" });
    }

    const c = db.cases[caseIndex];

    if (action === 'set_quote') {
        c.quote = payload.amount;
        c.status = 'Reviewed';
    } else if (action === 'pay') {
        c.status = 'Processing';
    } else if (action === 'cancel') {
        c.status = 'Closed';
    } else if (action === 'message') {
        c.messages.push({
            sender: payload.sender, // 'user' or 'lawyer'
            text: payload.text,
            time: new Date().toISOString()
        });
    } else if (action === 'close') {
        c.status = 'Closed';
        c.feedback = payload.feedback;
    }

    writeData(db);
    res.json({ success: true, data: c });
});

// 5. Get All Cases (Lawyer) & Stats
app.get('/api/consultancy/law/all', (req, res) => {
    // In real app, verify admin token
    const db = readData();
    
    const stats = {
        total: db.cases.length,
        open: db.cases.filter(c => c.status !== 'Closed').length,
        closed: db.cases.filter(c => c.status === 'Closed').length,
        revenue: db.cases.filter(c => c.status === 'Processing' || c.status === 'Closed').reduce((sum, c) => sum + (Number(c.quote) || 0), 0)
    };

    // Calculate aging
    const now = new Date();
    const casesWithAging = db.cases.map(c => {
        const created = new Date(c.createdAt);
        const ageDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
        return { ...c, ageDays };
    });

    res.json({ success: true, cases: casesWithAging, stats });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Data file: ${DATA_FILE}`);
});
