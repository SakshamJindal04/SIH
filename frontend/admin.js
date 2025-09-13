// frontend/admin.js
document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTS ---
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const loginError = document.getElementById('login-error');

    // --- CREDENTIALS ---
    const CORRECT_USERNAME = 'admin';
    const CORRECT_PASSWORD = 'password';

    // --- FUNCTIONS ---
    const showDashboard = () => {
        loginScreen.style.display = 'none';
        dashboard.classList.remove('content-hidden');
        fetchAndDisplayLogs();
    };

    const showLogin = () => {
        sessionStorage.removeItem('isAdminLoggedIn');
        loginScreen.style.display = 'flex';
        dashboard.classList.add('content-hidden');
    };

    const fetchAndDisplayLogs = async () => {
        const tableBody = document.getElementById('logs-table-body');
        tableBody.innerHTML = '<tr><td colspan="5">Loading logs...</td></tr>';

        try {
            // Using a relative URL, which is best practice
            const response = await fetch('/logs');
            const logs = await response.json();

            populateTable(logs);
            calculateStats(logs);

        } catch (error) {
            console.error('Error fetching logs:', error);
            tableBody.innerHTML = '<tr><td colspan="5">Failed to load logs.</td></tr>';
        }
    };

    const populateTable = (logs) => {
        const tableBody = document.getElementById('logs-table-body');
        tableBody.innerHTML = ''; // Clear loading state

        if (logs.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">No verification logs found.</td></tr>';
            return;
        }

        logs.forEach(log => {
            const row = document.createElement('tr');
            const formattedTimestamp = new Date(log.timestamp).toLocaleString();
            const customerName = log.customer ? log.customer.name : 'N/A';
            const statusClass = `status-${log.status.toLowerCase()}`;
            
            row.innerHTML = `
                <td>${formattedTimestamp}</td>
                <td>${log.barcode}</td>
                <td><span class="status-badge ${statusClass}">${log.status}</span></td>
                <td>${customerName}</td>
                <td>${log.reason || 'N/A'}</td>
            `;
            tableBody.appendChild(row);
        });
    };

    const calculateStats = (logs) => {
        const total = logs.length;
        const successful = logs.filter(log => log.status === 'PASS').length;
        const failed = total - successful;
        const successRate = total > 0 ? ((successful / total) * 100).toFixed(1) : 0;

        document.getElementById('total-verifications').textContent = total;
        document.getElementById('successful-verifications').textContent = successful;
        document.getElementById('failed-verifications').textContent = failed;
        document.getElementById('success-rate').textContent = `${successRate}%`;
    };

    // --- EVENT LISTENERS ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
            sessionStorage.setItem('isAdminLoggedIn', 'true');

            showDashboard();
        } else {
            loginError.textContent = 'Invalid username or password.';
        }
    });

    logoutBtn.addEventListener('click', showLogin);

    // --- INITIAL PAGE LOAD ---
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
        showDashboard();
    } else {
        showLogin();
    }
});