const API_BASE = '/api/consultancy/law';
let currentCaseId = null;
let currentUserRole = null; // 'user' or 'lawyer'

// --- Navigation & Animation ---

function showView(viewId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active-view'));
    document.getElementById('landing-view').style.display = 'none';
    
    if (viewId === 'landing-view') {
        document.getElementById('landing-view').style.display = 'block';
    } else {
        document.getElementById(viewId).classList.add('active-view');
    }
}

function showLanding() {
    showView('landing-view');
}

function logout() {
    currentCaseId = null;
    currentUserRole = null;
    showLanding();
}

// Simple Bubble Animation for Landing
const bubbles = document.querySelectorAll('.law-bubble');
bubbles.forEach((bubble, index) => {
    // Initial random placement
    const size = 180;
    bubble.style.left = `${Math.random() * (window.innerWidth - size)}px`;
    bubble.style.top = `${Math.random() * (window.innerHeight - size)}px`;
    
    let vx = (Math.random() - 0.5) * 2;
    let vy = (Math.random() - 0.5) * 2;

    function animate() {
        if(document.getElementById('landing-view').style.display === 'none') {
            requestAnimationFrame(animate);
            return; 
        }

        let x = parseFloat(bubble.style.left);
        let y = parseFloat(bubble.style.top);

        x += vx;
        y += vy;

        if (x <= 0 || x >= window.innerWidth - size) vx *= -1;
        if (y <= 0 || y >= window.innerHeight - size) vy *= -1;

        bubble.style.left = `${x}px`;
        bubble.style.top = `${y}px`;
        requestAnimationFrame(animate);
    }
    animate();
});


// --- User Actions ---

document.getElementById('submit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('sub-name').value;
    const email = document.getElementById('sub-email').value;
    const query = document.getElementById('sub-query').value;

    try {
        const res = await fetch(`${API_BASE}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, query })
        });
        const data = await res.json();
        if (data.success) {
            alert(`Case Submitted!\nCase ID: ${data.caseId}\nPassword: ${data.password}\n(Save these credentials!)`);
            showLanding();
            e.target.reset();
        }
    } catch (err) {
        alert('Error submitting case');
    }
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('login-id').value;
    const password = document.getElementById('login-pass').value;

    try {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, password })
        });
        const data = await res.json();
        
        if (data.success && data.role === 'user') {
            currentCaseId = data.caseId;
            currentUserRole = 'user';
            loadUserDashboard();
            showView('user-dashboard');
        } else {
            alert('Invalid Credentials');
        }
    } catch (err) {
        alert('Login Error');
    }
});

async function loadUserDashboard() {
    const res = await fetch(`${API_BASE}/case/${currentCaseId}`);
    const { data } = await res.json();
    renderUserUI(data);
}

function renderUserUI(c) {
    document.getElementById('ud-case-id').textContent = c.id;
    document.getElementById('ud-status').textContent = c.status;
    document.getElementById('ud-status').className = `status-badge status-${c.status}`;
    document.getElementById('ud-query').textContent = c.query;
    document.getElementById('ud-quote').textContent = c.quote ? `₹${c.quote}` : 'Pending Review';

    const actionsDiv = document.getElementById('ud-actions');
    actionsDiv.innerHTML = '';

    if (c.status === 'Reviewed' && c.quote) {
        const payBtn = document.createElement('button');
        payBtn.className = 'btn btn-success';
        payBtn.textContent = 'Pay Now';
        payBtn.onclick = () => updateCase('pay');
        actionsDiv.appendChild(payBtn);

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-danger';
        cancelBtn.textContent = 'Cancel Case';
        cancelBtn.style.marginLeft = '10px';
        cancelBtn.onclick = () => updateCase('cancel');
        actionsDiv.appendChild(cancelBtn);
    }
    
    if (c.status === 'Processing' || c.status === 'Reviewed') {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'btn';
        closeBtn.style.background = '#95a5a6';
        closeBtn.textContent = 'Close & Feedback';
        closeBtn.style.marginLeft = '10px';
        closeBtn.onclick = () => promptFeedback();
        actionsDiv.appendChild(closeBtn);
    }

    renderMessages('ud-messages', c.messages);
}

async function updateCase(action, payload = {}) {
    const res = await fetch(`${API_BASE}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentCaseId, action, payload })
    });
    const data = await res.json();
    if(data.success) {
        if(currentUserRole === 'user') loadUserDashboard();
        else loadLawyerDashboard(); // Refresh lawyer view if needed
    }
}

function promptFeedback() {
    const feedback = prompt("Rate us (Poor, Good, Excellent):");
    if (feedback) {
        updateCase('close', { feedback });
    }
}


// --- Lawyer Actions ---

document.getElementById('lawyer-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('adm-id').value;
    const password = document.getElementById('adm-pass').value;

    try {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, password, isAdmin: true })
        });
        const data = await res.json();
        
        if (data.success && data.role === 'lawyer') {
            currentUserRole = 'lawyer';
            showView('lawyer-dashboard');
            loadLawyerDashboard();
        } else {
            alert('Invalid Admin Credentials');
        }
    } catch (err) {
        alert('Login Error');
    }
});

async function loadLawyerDashboard() {
    const res = await fetch(`${API_BASE}/all`);
    const { cases, stats } = await res.json();

    document.getElementById('stats-total').textContent = stats.total;
    document.getElementById('stats-open').textContent = stats.open;
    document.getElementById('stats-revenue').textContent = '₹' + stats.revenue;

    const tbody = document.getElementById('ld-cases-body');
    tbody.innerHTML = '';
    
    cases.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.id}</td>
            <td>${c.name}</td>
            <td><span class="status-badge status-${c.status}">${c.status}</span></td>
            <td>${c.ageDays}</td>
            <td><button class="btn" style="padding: 2px 5px; font-size: 0.8em;" onclick="openCaseDetail('${c.id}')">Manage</button></td>
        `;
        tbody.appendChild(tr);
    });
}

async function openCaseDetail(id) {
    currentCaseId = id; // Temporarily focus on this case
    const res = await fetch(`${API_BASE}/case/${id}`);
    const { data } = await res.json();
    
    document.getElementById('ld-case-detail').style.display = 'block';
    document.getElementById('ld-detail-id').textContent = data.id;
    document.getElementById('ld-detail-query').textContent = data.query;
    document.getElementById('ld-quote-input').value = data.quote || '';
    
    renderMessages('ld-messages', data.messages);
}

function setQuote() {
    const amount = document.getElementById('ld-quote-input').value;
    if(amount) updateCase('set_quote', { amount });
}

function closeCaseByLawyer() {
    if(confirm('Are you sure you want to close this case?')) {
        updateCase('cancel');
    }
}

// --- Shared ---

function renderMessages(elementId, messages) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    messages.forEach(m => {
        const div = document.createElement('div');
        div.className = `msg ${m.sender}`;
        div.innerHTML = `<strong>${m.sender === 'user' ? 'Client' : 'Lawyer'}:</strong> ${m.text}`;
        container.appendChild(div);
    });
    container.scrollTop = container.scrollHeight;
}

function sendMessage(sender) {
    const inputId = sender === 'user' ? 'ud-msg-input' : 'ld-msg-input';
    const text = document.getElementById(inputId).value;
    if(!text) return;
    
    updateCase('message', { sender, text }).then(() => {
        document.getElementById(inputId).value = '';
        if(sender === 'lawyer') openCaseDetail(currentCaseId); // Refresh detail view
    });
}
