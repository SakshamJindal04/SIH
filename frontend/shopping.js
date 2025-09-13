document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const searchForm = document.getElementById('search-form');
    const searchQuery = document.getElementById('search-query');
    const searchResultsContainer = document.getElementById('search-results');
    
    const checkoutModal = document.getElementById('checkout-modal');
    const modalSteps = document.querySelectorAll('.modal-step');
    const closeBtn = document.querySelector('.close-btn');

    // --- State Variables ---
    let currentStep = 1;
    let productToPurchase = null;

    // --- Event Listeners ---
    searchForm.addEventListener('submit', handleSearch);
    
    checkoutModal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-next-btn')) {
            handleNextStep();
        }
        if (e.target.classList.contains('modal-back-btn')) {
            handlePrevStep();
        }
        if (e.target.id === 'confirm-order-btn') {
            confirmOrder();
        }
    });

    document.querySelectorAll('input[name="delivery-mode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const paymentOptions = document.getElementById('online-payment-options');
            paymentOptions.style.display = e.target.value === 'online' ? 'block' : 'none';
        });
    });

    // --- Functions ---
    async function handleSearch(e) {
        e.preventDefault();
        const query = searchQuery.value.trim();
        if (!query) return;

        searchResultsContainer.innerHTML = '<p>Searching our inventory...</p>';
        try {
            const response = await fetch(`/search-products/${query}`);
            const results = await response.json();
            displayResults(results);
        } catch (error) {
            searchResultsContainer.innerHTML = '<p class="error">Failed to fetch search results.</p>';
        }
    }

    function displayResults(results) {
        searchResultsContainer.innerHTML = '';
        if (results.length === 0) {
            searchResultsContainer.innerHTML = '<p>No products found in our inventory.</p>';
            return;
        }

        results.forEach(product => {
            const card = document.createElement('div');
            card.className = 'result-card';
            card.innerHTML = `<h3>${product.name}</h3><div class="price">₹${product.mrp.toFixed(2)}</div>`;
            
            const button = document.createElement('button');
            button.className = 'btn';
            button.textContent = 'Buy & Get Verifiable QR';
            button.addEventListener('click', () => {
                productToPurchase = product;
                openCheckoutModal();
            });
            
            card.appendChild(button);
            searchResultsContainer.appendChild(card);
        });
    }

    function openCheckoutModal() {
        currentStep = 1;
        showStep(currentStep);
        checkoutModal.style.display = 'block';
    }
    
    function showStep(stepNumber) {
        modalSteps.forEach(step => {
            step.style.display = step.dataset.step == stepNumber ? 'block' : 'none';
        });
    }

    function handleNextStep() {
        currentStep++;
        showStep(currentStep);
    }

    function handlePrevStep() {
        currentStep--;
        showStep(currentStep);
    }

    async function confirmOrder() {
        const confirmBtn = document.getElementById('confirm-order-btn');
        confirmBtn.textContent = 'Processing...';
        confirmBtn.disabled = true;

        // GATHER CUSTOMER DETAILS, INCLUDING THE NEW MOBILE NUMBER
        const customerDetails = {
            customerName: document.getElementById('customer-name').value,
            customerEmail: document.getElementById('customer-email').value,
            customerMobile: document.getElementById('customer-mobile').value, // <-- Mobile number collected
            productBarcode: productToPurchase.barcode
        };

        try {
            const purchaseRes = await fetch('/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerDetails),
            });
            const purchaseData = await purchaseRes.json();
            if (!purchaseRes.ok) throw new Error(purchaseData.message);

            const verifyRes = await fetch('/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    barcode: purchaseData.product.barcode,
                    weight: purchaseData.product.weight,
                    mrp: purchaseData.product.mrp,
                    customerId: purchaseData.customerId
                }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.reason);

            document.getElementById('modal-qr-code').innerHTML = `<img src="${verifyData.verification.qrCodeData}" alt="Verifiable QR Code">`;
            currentStep = 4;
            showStep(currentStep);

        } catch (error) {
            alert('Order failed: ' + error.message);
            closeModal();
        } finally {
            confirmBtn.textContent = 'Confirm & Place Order';
            confirmBtn.disabled = false;
        }
    }

    function closeModal() {
        checkoutModal.style.display = "none";
    }

    closeBtn.onclick = closeModal;
    window.onclick = (event) => {
        if (event.target == checkoutModal) {
            closeModal();
        }
    };
});