// frontend/script.js

// API endpoint for the backend
const API_URL = 'http://localhost:3000';

/**
 * Main logic router that runs on every page load.
 * It checks which page is active and calls the appropriate function.
 */
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('verify-form')) {
        initializeVerifyPage();
    }
    if (document.getElementById('result-display')) {
        initializeResultPage();
    }
    if (document.getElementById('qrImage')) {
        initializeQrPage();
    }
    if (document.getElementById('logs-table-body')) {
        initializeAdminPage();
    }
});

/**
 * Handles the logic for the item verification form on index.html.
 */
function initializeVerifyPage() {
    const form = document.getElementById('verify-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission

        // Collect form data
        const itemData = {
            barcode: document.getElementById('barcode').value,
            weight: parseFloat(document.getElementById('weight').value),
            mrp: parseFloat(document.getElementById('mrp').value),
            expiry: document.getElementById('expiry').value,
        };

        try {
            const response = await fetch(`${API_URL}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData),
            });

            const result = await response.json();

            // Store result in sessionStorage to pass it to the next page
            sessionStorage.setItem('verificationResult', JSON.stringify(result));

            // Redirect to the result page
            window.location.href = 'result.html';

        } catch (error) {
            console.error('Error verifying item:', error);
            alert('Could not connect to the server. Please ensure it is running.');
        }
    });
}

/**
 * Handles the logic for the result.html page.
 */
function initializeResultPage() {
    const resultData = JSON.parse(sessionStorage.getItem('verificationResult'));
    if (!resultData) {
        // If no result data is found, redirect back to the home page
        window.location.href = 'index.html';
        return;
    }

    const resultDisplay = document.getElementById('result-display');
    const statusEl = document.getElementById('status');
    const detailsEl = document.getElementById('details');
    const qrSection = document.getElementById('qr-section');

    if (resultData.status === 'PASS') {
        statusEl.textContent = '✅ PASS';
        statusEl.className = 'status-pass';
        resultDisplay.classList.add('pass');
        detailsEl.textContent = `Item with barcode ${resultData.verification.barcode} is authentic.`;
        qrSection.style.display = 'block'; // Show the 'View QR' button
    } else {
        statusEl.textContent = '❌ FAIL';
        statusEl.className = 'status-fail';
        resultDisplay.classList.add('fail');
        detailsEl.textContent = `Reason: ${resultData.reason}`;
    }
}

/**
 * Handles logic for the qr.html page.
 */
function initializeQrPage() {
    const resultData = JSON.parse(sessionStorage.getItem('verificationResult'));
    if (!resultData || resultData.status !== 'PASS') {
        // Redirect if there's no valid PASS data
        window.location.href = 'index.html';
        return;
    }

    const qrImage = document.getElementById('qrImage');
    qrImage.src = resultData.verification.qrCodeData; // Set the image source to the base64 QR code
}

/**
 * Fetches and displays logs on the admin.html page.
 */
async function initializeAdminPage() {
    const tableBody = document.getElementById('logs-table-body');
    tableBody.innerHTML = '<tr><td colspan="7">Loading logs...</td></tr>'; // Loading state

    try {
        const response = await fetch(`${API_URL}/logs`);
        const logs = await response.json();

        tableBody.innerHTML = ''; // Clear loading state

        if (logs.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7">No verification logs found.</td></tr>';
            return;
        }

        logs.forEach(log => {
            const row = document.createElement('tr');
            
            // Format date for better readability
            const formattedTimestamp = new Date(log.timestamp).toLocaleString();
            const formattedExpiry = new Date(log.expiry).toLocaleDateString();

            row.innerHTML = `
                <td>${formattedTimestamp}</td>
                <td>${log.barcode}</td>
                <td>${log.weight}</td>
                <td>${log.mrp.toFixed(2)}</td>
                <td>${formattedExpiry}</td>
                <td><span class="status-${log.status.toLowerCase()}">${log.status}</span></td>
                <td>${log.reason || 'N/A'}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
        tableBody.innerHTML = '<tr><td colspan="7">Failed to load logs. Is the server running?</td></tr>';
    }
}