const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const readline = require('readline');

const DATA_FILE = path.join(__dirname, 'data.json');
const KEY_FILE = path.join(__dirname, 'secret.key');
const ALGORITHM = 'aes-256-cbc';

function getKey() {
    if (fs.existsSync(KEY_FILE)) {
        return Buffer.from(fs.readFileSync(KEY_FILE, 'utf8'), 'hex');
    }
    console.error("Key file not found. Run server.js first to generate keys.");
    process.exit(1);
}

const ENCRYPTION_KEY = getKey();

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
    } catch (e) { return null; }
}

function readData() {
    if (!fs.existsSync(DATA_FILE)) return { cases: [] };
    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(decrypt(rawData) || '{"cases": []}');
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function showMenu() {
    console.log('\n--- Law Consultancy CLI ---');
    console.log('1. Show Stats');
    console.log('2. List Open Cases');
    console.log('3. List All Cases');
    console.log('4. Exit');
    rl.question('Select option: ', handleMenu);
}

function handleMenu(option) {
    const db = readData();
    switch(option.trim()) {
        case '1':
            const stats = {
                total: db.cases.length,
                open: db.cases.filter(c => c.status !== 'Closed').length,
                closed: db.cases.filter(c => c.status === 'Closed').length
            };
            console.log('\nSTATS:', stats);
            break;
        case '2':
            console.log('\nOPEN CASES:');
            db.cases.filter(c => c.status !== 'Closed').forEach(c => {
                console.log(`[${c.id}] ${c.name} - ${c.status} (Quote: ${c.quote || 'None'})`);
            });
            break;
        case '3':
            console.log('\nALL CASES:');
            db.cases.forEach(c => {
                console.log(`[${c.id}] ${c.name} - ${c.status}`);
            });
            break;
        case '4':
            rl.close();
            return;
        default:
            console.log('Invalid option');
    }
    showMenu();
}

showMenu();
