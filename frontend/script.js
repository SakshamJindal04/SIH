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
 * Handles the logic for the item verification form on verify.html.
 */
function initializeVerifyPage() {
    const form = document.getElementById('verify-form');
    const verifyBtn = document.getElementById('verify-btn');
    const inlineResult = document.getElementById('inline-result');
    const resultIcon = document.getElementById('result-icon');
    const resultStatus = document.getElementById('result-status');
    const resultDetails = document.getElementById('result-details');
    const inlineQrSection = document.getElementById('inline-qr-section');
    const inlineQrCode = document.getElementById('inline-qr-code');
    const inlineQrImg = document.getElementById('inline-qr-img');
    const viewQrBtn = document.getElementById('view-qr-btn');

    if (viewQrBtn) {
        viewQrBtn.addEventListener('click', () => {
            inlineQrCode.style.display = inlineQrCode.style.display === 'none' ? 'block' : 'none';
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission
        
        verifyBtn.textContent = "Verifying...";
        verifyBtn.disabled = true;
        inlineResult.style.display = 'none';
        inlineQrSection.style.display = 'none';

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

            // Display inline result
            inlineResult.style.display = 'block';
            inlineResult.className = 'verification-result'; // reset classes
            
            if (result.status === 'PASS') {
                inlineResult.classList.add('pass');
                resultIcon.textContent = '✅';
                resultStatus.textContent = 'Authentic Product';
                resultStatus.style.color = 'var(--success-color)';
                resultDetails.textContent = `Item with barcode ${result.verification.barcode} has been successfully verified.`;
                
                // Set QR code data
                if (result.verification.qrCodeData) {
                    inlineQrImg.src = result.verification.qrCodeData;
                    inlineQrSection.style.display = 'block';
                    inlineQrCode.style.display = 'none'; // hidden by default
                }
            } else {
                inlineResult.classList.add('fail');
                resultIcon.textContent = '❌';
                resultStatus.textContent = 'Verification Failed';
                resultStatus.style.color = 'var(--error-color)';
                resultDetails.textContent = `Reason: ${result.reason}`;
            }

        } catch (error) {
            console.error('Error verifying item:', error);
            inlineResult.style.display = 'block';
            inlineResult.className = 'verification-result fail';
            resultIcon.textContent = '⚠️';
            resultStatus.textContent = 'Connection Error';
            resultStatus.style.color = 'var(--error-color)';
            resultDetails.textContent = 'Could not connect to the verification server. Please try again later.';
        } finally {
            verifyBtn.textContent = "Verify Item";
            verifyBtn.disabled = false;
        }
    });
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