// Sadaqah Tracker - External JavaScript (CSP Compliant)

// Charity selector auto-fill
document.getElementById('charitySelector').addEventListener('change', function() {
    const customInput = document.getElementById('paymentLocation');
    if (this.value && this.value !== 'custom') {
        customInput.value = this.value;
    } else if (this.value === 'custom') {
        customInput.value = '';
        customInput.focus();
    }
});

// Load stats
async function loadStats() {
    const data = await chrome.storage.local.get(['blockCount', 'sadaqahOwed', 'sadaqahAmount', 'paymentHistory']);
    
    // Debug logging
    console.log('📊 Sadaqah Tracker - Storage Data:', data);
    console.log('💰 Amount Owed:', data.sadaqahOwed);
    console.log('🚫 Block Count:', data.blockCount);
    
    const blockCount = data.blockCount || 0;
    const amountOwed = data.sadaqahOwed || 0;
    const sadaqahAmount = data.sadaqahAmount || 5;
    const history = data.paymentHistory || [];

    // Calculate total paid
    const totalPaid = history.reduce((sum, payment) => sum + payment.amount, 0);

    document.getElementById('totalBlocks').textContent = blockCount;
    document.getElementById('amountOwed').textContent = `$${amountOwed.toFixed(2)}`;
    document.getElementById('totalPaid').textContent = `$${totalPaid.toFixed(2)}`;
    document.getElementById('paymentCount').textContent = history.length;

    // Load payment history
    displayHistory(history);
}

function displayHistory(history) {
    const historyList = document.getElementById('historyList');
    
    if (history.length === 0) {
        historyList.innerHTML = '<div class="no-history">No payment history yet. Make your first payment! 🌟</div>';
        return;
    }

    historyList.innerHTML = history.map(payment => `
        <div class="history-item">
            <div>
                <div style="font-weight: 600; color: #e2e8f0;">${payment.location || 'Sadaqah Payment'}</div>
                ${payment.notes ? `<div style="font-size: 0.85rem; color: #94a3b8; margin-top: 4px;">${payment.notes}</div>` : ''}
                <div class="date">${new Date(payment.date).toLocaleDateString()} at ${new Date(payment.date).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
            </div>
            <div class="amount">$${payment.amount.toFixed(2)}</div>
        </div>
    `).join('');
}

async function markAsPaid() {
    const paidAmount = parseFloat(document.getElementById('paidAmount').value);
    const charitySelector = document.getElementById('charitySelector').value;
    const paymentLocation = document.getElementById('paymentLocation').value || charitySelector;
    const paymentNotes = document.getElementById('paymentNotes').value;

    if (!paidAmount || paidAmount <= 0) {
        alert('⚠️ Please enter a valid payment amount');
        return;
    }

    if (!paymentLocation) {
        alert('⚠️ Please select or enter where you donated');
        return;
    }

    // Get current data
    const data = await chrome.storage.local.get(['sadaqahOwed', 'paymentHistory']);
    const currentOwed = data.sadaqahOwed || 0;
    const history = data.paymentHistory || [];

    // Calculate new amount owed
    const newOwed = Math.max(0, currentOwed - paidAmount);

    // Add to payment history
    const payment = {
        amount: paidAmount,
        location: paymentLocation,
        notes: paymentNotes,
        date: new Date().toISOString()
    };
    history.unshift(payment); // Add to beginning

    // Save to storage
    await chrome.storage.local.set({
        sadaqahOwed: newOwed,
        paymentHistory: history
    });

    // Show success message
    const successMsg = document.getElementById('successMessage');
    successMsg.style.display = 'block';
    setTimeout(() => {
        successMsg.style.display = 'none';
    }, 3000);

    // Clear inputs
    document.getElementById('paidAmount').value = '';
    document.getElementById('charitySelector').value = '';
    document.getElementById('paymentLocation').value = '';
    document.getElementById('paymentNotes').value = '';

    // Reload stats
    loadStats();
}

// Add click handlers for donation links (no inline onclick to fix CSP)
document.getElementById('recordPaymentBtn').addEventListener('click', markAsPaid);

document.querySelectorAll('[data-url]').forEach(el => {
    el.addEventListener('click', () => {
        const url = el.getAttribute('data-url');
        if (url) {
            chrome.tabs.create({ url: url });
        }
    });
    el.style.cursor = 'pointer';
});

// Load stats on page load
console.log('🚀 Sadaqah Tracker page loaded - calling loadStats()...');
loadStats();

// Reload stats when storage changes (keeps pages in sync)
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && (changes.sadaqahOwed || changes.blockCount || changes.paymentHistory)) {
        console.log('🔄 Storage changed, reloading stats...', changes);
        loadStats();
    }
});
