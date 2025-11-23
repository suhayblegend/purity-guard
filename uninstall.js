document.addEventListener('DOMContentLoaded', function() {
    const keepBtn = document.getElementById('keepBtn');
    const removeBtn = document.getElementById('removeBtn');
    const streakValue = document.getElementById('streakValue');
    const blocksValue = document.getElementById('blocksValue');
    const sadaqahReminder = document.getElementById('sadaqahReminder');
    const sadaqahAmount = document.getElementById('sadaqahAmount');
    
    // Load user's stats
    chrome.storage.local.get(['blockCount', 'streak', 'sadaqahOwed', 'enableSadaqah'], (result) => {
        const blocks = result.blockCount || 0;
        const streak = result.streak ? result.streak.count : 0;
        const owed = result.sadaqahOwed || 0;
        const sadaqahEnabled = result.enableSadaqah === true;
        
        if (blocksValue) blocksValue.textContent = blocks;
        if (streakValue) streakValue.textContent = streak;
        
        // Show Sadaqah reminder if they owe money
        if (sadaqahEnabled && owed > 0) {
            if (sadaqahReminder) sadaqahReminder.style.display = 'block';
            if (sadaqahAmount) sadaqahAmount.textContent = `$${owed}`;
        }
    });
    
    // Keep protection button
    keepBtn.addEventListener('click', function() {
        // Close the tab and go back to browsing
        window.close();
        
        // If window.close() doesn't work (some browsers block it), redirect to options
        setTimeout(() => {
            window.location.href = 'options.html';
        }, 100);
    });
    
    // Remove anyway button - show additional warnings
    removeBtn.addEventListener('click', function() {
        if (confirm('💔 One More Chance\n\nShaytan wants you to remove this.\n\nDon\'t give him the victory.\n\nStay strong. You\'ve come this far.\n\nAre you really sure you want to remove it?')) {
            if (confirm('🤲 Final Reminder\n\nAllah is watching.\n\nEvery struggle is recorded.\n\nEvery moment of resistance is rewarded.\n\nThis is your last chance to turn back.\n\nRemove anyway?')) {
                // Let them remove it if they really want to
                alert('😔 May Allah guide you back to the straight path.\n\nThe door to repentance is always open.\n\nWe hope to see you again soon.');
                
                // Log the uninstall attempt
                chrome.storage.local.get(['blockCount', 'streak'], (result) => {
                    const stats = {
                        uninstallDate: new Date().toISOString(),
                        finalBlockCount: result.blockCount || 0,
                        finalStreak: result.streak ? result.streak.count : 0
                    };
                    chrome.storage.local.set({ lastUninstallStats: stats });
                });
                
                // Allow the uninstall to proceed
                // The actual uninstall happens in the Chrome extensions page
                window.close();
            }
        }
    });
});
