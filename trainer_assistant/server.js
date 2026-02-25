const http = require('http');
const fs = require('fs');
const path = require('path');

// --- In-Memory State ---
let pollState = {
    active: false,
    question: "",
    options: [],
    votes: {}
};

// --- List of connected clients for Real-Time Pushes ---
let clients = [];

const server = http.createServer((req, res) => {
    // 1. Serve the Frontend (index.html)
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
        return;
    }

    // 2. SSE Endpoint (The "Real-Time" Connection)
    if (req.url === '/events') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        // Send initial state
        res.write(`data: ${JSON.stringify({ type: 'INIT', state: pollState })}\n\n`);

        // Add this client to our list
        const clientId = Date.now();
        const newClient = { id: clientId, res };
        clients.push(newClient);

        // Remove client when they close the tab
        req.on('close', () => {
            clients = clients.filter(c => c.id !== clientId);
        });
        return;
    }

    // 3. API: Start Poll (Host)
    if (req.url === '/api/start' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const data = JSON.parse(body);
            pollState = {
                active: true,
                question: data.question,
                options: data.options,
                votes: data.options.reduce((acc, _, idx) => ({...acc, [idx]: 0}), {})
            };
            broadcast({ type: 'POLL_STARTED', state: pollState });
            res.end('OK');
        });
        return;
    }

    // 4. API: Vote (Participant)
    if (req.url === '/api/vote' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const data = JSON.parse(body);
            if (pollState.active) {
                pollState.votes[data.index] = (pollState.votes[data.index] || 0) + 1;
                broadcast({ type: 'UPDATE_VOTES', votes: pollState.votes });
            }
            res.end('OK');
        });
        return;
    }

    res.writeHead(404);
    res.end();
});

// Helper: Push data to all connected browsers
function broadcast(data) {
    const msg = `data: ${JSON.stringify(data)}\n\n`;
    clients.forEach(c => c.res.write(msg));
}

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`\n🚀 Trainer Assistant (Zero Dependency) running!`);
    console.log(`Open your browser to: http://localhost:${PORT}\n`);
});
