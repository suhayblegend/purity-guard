document.addEventListener('DOMContentLoaded', function() {
    const counterEl = document.getElementById('counter');
    const achievementEl = document.getElementById('achievement');
    const streakEl = document.getElementById('streak');
    const currentSiteEl = document.getElementById('currentSite');
    const siteStatusEl = document.getElementById('siteStatus');
    const whitelistBtn = document.getElementById('whitelistBtn');
    const blacklistBtn = document.getElementById('blacklistBtn');
    const removeBtn = document.getElementById('removeBtn');
    const openOptionsBtn = document.getElementById('openOptionsBtn');
    const viewListsBtn = document.getElementById('viewListsBtn');
    const sadaqahCard = document.getElementById('sadaqahCard');
    const sadaqahOwedEl = document.getElementById('sadaqahOwed');
    const quickPayBtn = document.getElementById('quickPayBtn');
    
    let lastVictoryCount = 0;
    let celebrationCssInjected = false;

    function triggerCelebration(message, detail = '') {
        if (!celebrationCssInjected) {
            const style = document.createElement('style');
            style.textContent = `
                .pg-popup-celebrate {
                    position: fixed;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(15, 23, 42, 0.82);
                    z-index: 9999;
                    backdrop-filter: blur(6px);
                    opacity: 0;
                    transition: opacity 200ms ease-out;
                }
                .pg-popup-celebrate.show { opacity: 1; }
                .pg-popup-celebrate .card {
                    background: linear-gradient(135deg, rgba(59,130,246,0.2), rgba(16,185,129,0.2));
                    border: 1px solid rgba(148,163,184,0.25);
                    border-radius: 16px;
                    padding: 18px 20px;
                    width: 90%;
                    max-width: 320px;
                    text-align: center;
                    color: #f8fafc;
                    box-shadow: 0 12px 35px rgba(0,0,0,0.4);
                    position: relative;
                    overflow: hidden;
                }
                .pg-cele-confetti span {
                    position: absolute;
                    width: 7px;
                    height: 12px;
                    border-radius: 2px;
                    animation: pg-popup-fall 1.5s linear forwards;
                }
                @keyframes pg-popup-fall {
                    0% { transform: translate3d(var(--x), -30px, 0) rotate(0deg); opacity: 1; }
                    100% { transform: translate3d(calc(var(--x) * 1.1), 140px, 0) rotate(320deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
            celebrationCssInjected = true;
        }

        const overlay = document.createElement('div');
        overlay.className = 'pg-popup-celebrate';
        overlay.innerHTML = `
            <div class="card">
                <div class="pg-cele-confetti"></div>
                <h3 style="margin: 0 0 6px; font-size: 1.3rem;">${message}</h3>
                <p style="margin: 0; color: #cbd5e1; font-size: 0.95rem;">${detail}</p>
            </div>
        `;
        document.body.appendChild(overlay);

        const confetti = overlay.querySelector('.pg-cele-confetti');
        const colors = ['#38bdf8', '#22c55e', '#fda4af', '#fbbf24', '#a855f7'];
        for (let i = 0; i < 24; i++) {
            const dot = document.createElement('span');
            dot.style.setProperty('--x', `${(Math.random() * 240 - 120).toFixed(0)}px`);
            dot.style.left = `${Math.random() * 100}%`;
            dot.style.background = colors[i % colors.length];
            confetti.appendChild(dot);
        }

        requestAnimationFrame(() => overlay.classList.add('show'));
        setTimeout(() => overlay.classList.remove('show'), 1400);
        setTimeout(() => overlay.remove(), 1800);
    }
    
    let currentDomain = '';

    function updateStats(count, streakData, sadaqahOwed, fallbackCount = 0) {
        const displayCount = count > 0 ? count : (fallbackCount > 0 ? fallbackCount : count);
        if (counterEl) counterEl.textContent = displayCount;
        // Ensure we never show 0, default to 1 if 0 or undefined
        // If streakData is null/undefined, default to 1
        // If streakData.count is 0, default to 1
        const currentStreak = (streakData && streakData.count > 0) ? streakData.count : 1;
        const longestStreak = streakData ? (streakData.longestStreak || 0) : 0;
        
        // Show current streak (Just the number for the new UI)
        if (streakEl) {
            streakEl.textContent = `${currentStreak}`;
            
            // Optional: If you want to show 'Best' somewhere else, you'd need a new element.
            // For now, we keep the UI clean as requested.
        }
        
        // Update Sadaqah display
        if (sadaqahOwed > 0) {
            if (sadaqahCard) sadaqahCard.style.display = 'block';
            if (sadaqahOwedEl) sadaqahOwedEl.textContent = `$${sadaqahOwed}`;
        } else {
            if (sadaqahCard) sadaqahCard.style.display = 'none';
        }
        
        // Rank system based on BLOCKS (not streak)
        // More blocks = worse rank (you're struggling more)
        let rank = "🌟 Pure Guardian"; // 0-9 blocks
        let rankColor = "#10b981";
        
        if (count >= 500) {
            rank = "⚠️ Struggling Soul";
            rankColor = "#dc2626";
        } else if (count >= 250) {
            rank = "😔 Frequent Faller";
            rankColor = "#ef4444";
        } else if (count >= 100) {
            rank = "🔄 Seeker";
            rankColor = "#f59e0b";
        } else if (count >= 50) {
            rank = "💪 Fighter";
            rankColor = "#eab308";
        } else if (count >= 25) {
            rank = "🛡️ Protected";
            rankColor = "#84cc16";
        } else if (count >= 10) {
            rank = "✨ Strong";
            rankColor = "#22c55e";
        }
        
        if (achievementEl) {
            achievementEl.textContent = rank;
            achievementEl.style.color = rankColor;
        }
    }

    function getDomainFromUrl(url) {
        try {
            return new URL(url).hostname;
        } catch (e) {
            return url;
        }
    }

    function updateSiteStatus(domain, whitelist, blacklist) {
        if (currentSiteEl) currentSiteEl.textContent = domain || 'Unknown';
        
        if (siteStatusEl) {
            if (whitelist.includes(domain)) {
                siteStatusEl.textContent = 'Allowed';
                siteStatusEl.className = 'site-status status-whitelisted';
            } else if (blacklist.includes(domain)) {
                siteStatusEl.textContent = 'Blocked';
                siteStatusEl.className = 'site-status status-blacklisted';
            } else {
                siteStatusEl.textContent = 'Default';
                siteStatusEl.className = 'site-status status-neutral';
            }
        }
    }

    function addToList(domain, listType) {
        chrome.storage.local.get([listType], function(result) {
            const list = result[listType] || [];
            if (!list.includes(domain)) {
                list.push(domain);
                chrome.storage.local.set({[listType]: list}, function() {
                    console.log(`✅ Added "${domain}" to ${listType}`);
                    
                    // Check if we are on a block page and should redirect back
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        if (tabs[0] && tabs[0].url && tabs[0].url.includes('block_page.html')) {
                            try {
                                const urlObj = new URL(tabs[0].url);
                                const blockedUrl = urlObj.searchParams.get('blocked');
                                if (blockedUrl && listType === 'whitelist') {
                                    const decodedUrl = decodeURIComponent(blockedUrl);
                                    if (confirm(`✅ Allowed "${domain}"!\n\nDo you want to go to the site now?`)) {
                                        chrome.tabs.update(tabs[0].id, { url: decodedUrl });
                                        window.close();
                                        return;
                                    }
                                }
                            } catch (e) {
                                console.error('Error parsing block page URL:', e);
                            }
                        }
                        
                        loadCurrentSite();
                        
                        // Show feedback to user
                        const listName = listType === 'whitelist' ? 'Allowed' : 'Blocked';
                        alert(`✅ ${domain}\n\nAdded to ${listName} list!\n\nReload the page for changes to take effect.`);
                    });
                });
            } else {
                console.log(`ℹ️ "${domain}" already in ${listType}`);
                alert(`ℹ️ This site is already in the ${listType === 'whitelist' ? 'Allowed' : 'Blocked'} list.`);
            }
        });
    }

    function removeFromLists(domain) {
        chrome.storage.local.get(['whitelist', 'blacklist'], function(result) {
            const whitelist = result.whitelist || [];
            const blacklist = result.blacklist || [];
            
            const newWhitelist = whitelist.filter(site => site !== domain);
            const newBlacklist = blacklist.filter(site => site !== domain);
            
            chrome.storage.local.set({
                whitelist: newWhitelist,
                blacklist: newBlacklist
            }, function() {
                loadCurrentSite();
            });
        });
    }

    function loadCurrentSite() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && tabs[0].url) {
                const url = tabs[0].url;
                
                // PRIORITY 1: Check if we are on the block page
                // We must do this BEFORE checking for chrome-extension:// because the block page IS an extension page
                if (url.includes('block_page.html')) {
                    try {
                        const urlObj = new URL(url);
                        const blockedUrl = urlObj.searchParams.get('blocked');
                        if (blockedUrl) {
                            currentDomain = getDomainFromUrl(decodeURIComponent(blockedUrl));
                            if (currentSiteEl) {
                                currentSiteEl.textContent = currentDomain + ' (Blocked)';
                                currentSiteEl.style.color = '#ef4444';
                            }
                        } else {
                            currentDomain = 'Blocked Page';
                            if (currentSiteEl) currentSiteEl.textContent = 'Blocked Page';
                        }
                    } catch (e) {
                        currentDomain = 'Blocked Page';
                        if (currentSiteEl) currentSiteEl.textContent = 'Blocked Page';
                    }
                } 
                // PRIORITY 2: Skip other extension pages and chrome:// URLs
                else if (url.startsWith('chrome://') || 
                    url.startsWith('chrome-extension://') || 
                    url.startsWith('about:') ||
                    url.startsWith('edge://')) {
                    currentDomain = 'Extension Page';
                    if (currentSiteEl) currentSiteEl.textContent = 'Extension Page';
                    if (siteStatusEl) {
                        siteStatusEl.textContent = 'N/A';
                        siteStatusEl.className = 'site-status status-neutral';
                    }
                    return;
                }
                // PRIORITY 3: Normal website
                else {
                    currentDomain = getDomainFromUrl(url);
                    if (currentSiteEl) {
                        currentSiteEl.textContent = currentDomain;
                        currentSiteEl.style.color = '';
                        currentSiteEl.style.fontStyle = '';
                    }
                }
                
                // Make sure we got a valid domain
                if (!currentDomain || (currentDomain.includes('chrome-extension://') && !url.includes('block_page.html'))) {
                    currentDomain = 'Unknown';
                }
                
                chrome.storage.local.get(['whitelist', 'blacklist'], function(result) {
                    const whitelist = result.whitelist || [];
                    const blacklist = result.blacklist || [];
                    updateSiteStatus(currentDomain, whitelist, blacklist);
                });
            }
        });
    }

    // Load initial stats and site info
    chrome.storage.local.get(['blockCount', 'streak', 'sadaqahOwed', 'victoryLog'], function(result) {
        console.log('📊 Loading stats from storage:', result);
        
        const count = result.blockCount || 0;
        lastVictoryCount = Array.isArray(result.victoryLog) ? result.victoryLog.length : 0;
        let streakData = result.streak;
        
        // Force streak to 1 if it's missing or 0
        if (!streakData || !streakData.count || streakData.count <= 0) {
            streakData = { 
                count: 1, 
                lastUpdate: new Date().toDateString(), 
                longestStreak: streakData ? Math.max(1, streakData.longestStreak || 1) : 1 
            };
        }
        
        const sadaqahOwed = result.sadaqahOwed || 0;
        
        console.log('📊 Parsed streak data:', streakData);
        console.log('📊 Streak count:', streakData.count);
        
        updateStats(count, streakData, sadaqahOwed, lastVictoryCount);
    });

    loadCurrentSite();
    
    // First install celebration (one-time)
    chrome.storage.local.get(['showWelcomeCelebration'], (res) => {
        if (res && res.showWelcomeCelebration) {
            triggerCelebration('Congratulations on your first streak!', 'Purity Guard is now protecting you.');
            chrome.storage.local.set({ showWelcomeCelebration: false });
        }
    });

    // Listen for LIVE updates from background script (no race condition!)
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'streakUpdated' || message.type === 'statsUpdated') {
            console.log('📡 Received live stats update from background:', message);
            
            // If message includes stats directly, use them (instant update!)
            if (message.blockCount !== undefined && message.streak !== undefined) {
                const streakData = {
                    count: message.streak,
                    lastUpdate: new Date().toDateString(),
                    longestStreak: message.streak
                };
                const sadaqahOwed = message.sadaqahOwed || 0;
                updateStats(message.blockCount, streakData, sadaqahOwed, lastVictoryCount);
                console.log('✅ Popup UI updated instantly from broadcast');
            } else {
                // Fallback: reload from storage
                chrome.storage.local.get(['blockCount', 'streak', 'sadaqahOwed', 'victoryLog'], function(result) {
                    const count = result.blockCount || 0;
                    lastVictoryCount = Array.isArray(result.victoryLog) ? result.victoryLog.length : lastVictoryCount;
                    let streakData = result.streak;
                    
                    if (!streakData || !streakData.count || streakData.count <= 0) {
                        streakData = { 
                            count: 1, 
                            lastUpdate: new Date().toDateString(), 
                            longestStreak: streakData ? Math.max(1, streakData.longestStreak || 1) : 1 
                        };
                    }
                    
                    const sadaqahOwed = result.sadaqahOwed || 0;
                    updateStats(count, streakData, sadaqahOwed, lastVictoryCount);
                });
            }
        }
    });

    // Quick pay button
    if (quickPayBtn) {
        quickPayBtn.addEventListener('click', function() {
            chrome.storage.local.get(['sadaqahOwed', 'paymentHistory'], (result) => {
                const owed = result.sadaqahOwed || 0;
                if (owed === 0) {
                    alert('Nothing owed right now. Keep up the streak!');
                    return;
                }
                
                if (confirm(`💰 Confirm Sadaqah Payment\n\nYou are confirming that you have donated $${owed.toFixed(2)} to charity.\n\nRemember: Allah knows what is in your heart. Be truthful!\n\nHave you truly paid?`)) {
                    // Add to payment history
                    const payment = {
                        amount: owed,
                        location: "Quick Payment",
                        date: new Date().toISOString(),
                        timestamp: Date.now()
                    };
                    
                    const paymentHistory = result.paymentHistory || [];
                    paymentHistory.unshift(payment);
                    if (paymentHistory.length > 50) {
                        paymentHistory.length = 50;
                    }
                    
                    chrome.storage.local.set({ 
                        sadaqahOwed: 0,
                        paymentHistory: paymentHistory
                    }, () => {
                        sadaqahCard.style.display = 'none';
                        alert('✅ Sadaqah marked as paid!\n\nMay Allah accept your charity! 🤲');
                        
                        // Reload stats from storage
                        chrome.storage.local.get(['blockCount', 'streak', 'victoryLog'], (statsResult) => {
                            const count = statsResult.blockCount || 0;
                            const streakData = statsResult.streak || { count: 1, longestStreak: 1 };
                            const victoryCount = Array.isArray(statsResult.victoryLog) ? statsResult.victoryLog.length : 0;
                            updateStats(count, streakData, 0, victoryCount); // sadaqahOwed is now 0
                        });
                    });
                }
            });
        });
    }

    // Event listeners
    whitelistBtn.addEventListener('click', function() {
        // Allow whitelisting if we have a valid domain, even if it was extracted from the block page
        if (currentDomain && 
            currentDomain !== 'Extension Page' && 
            currentDomain !== 'Blocked Page' && 
            currentDomain !== 'Unknown') {
            
            console.log('Adding to whitelist:', currentDomain);
            
            // Remove from blacklist first, then add to whitelist
            chrome.storage.local.get(['blacklist'], function(result) {
                const blacklist = result.blacklist || [];
                const newBlacklist = blacklist.filter(site => site !== currentDomain);
                chrome.storage.local.set({blacklist: newBlacklist}, function() {
                    addToList(currentDomain, 'whitelist');
                });
            });
        } else {
            alert('⚠️ Cannot whitelist this page. Please navigate to a regular website first.');
        }
    });

    blacklistBtn.addEventListener('click', function() {
        if (currentDomain && 
            currentDomain !== 'Extension Page' && 
            currentDomain !== 'Blocked Page' && 
            currentDomain !== 'Unknown') {
            
            console.log('Adding to blacklist:', currentDomain);
            
            // Remove from whitelist first, then add to blacklist
            chrome.storage.local.get(['whitelist'], function(result) {
                const whitelist = result.whitelist || [];
                const newWhitelist = whitelist.filter(site => site !== currentDomain);
                chrome.storage.local.set({whitelist: newWhitelist}, function() {
                    addToList(currentDomain, 'blacklist');
                });
            });
        } else {
            alert('⚠️ Cannot blacklist this page. Please navigate to a regular website first.');
        }
    });

    removeBtn.addEventListener('click', function() {
        if (currentDomain) {
            removeFromLists(currentDomain);
        }
    });

    openOptionsBtn.addEventListener('click', function() {
        chrome.runtime.openOptionsPage();
    });

    viewListsBtn.addEventListener('click', function() {
        // Create a simple view lists page or use options page
        chrome.runtime.openOptionsPage();
    });

    // Add hover effects for support link (CSP compliant)
    const supportLink = document.getElementById('supportLink');
    if (supportLink) {
        supportLink.addEventListener('mouseover', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 6px 20px rgba(255, 221, 0, 0.4)';
        });
        
        supportLink.addEventListener('mouseout', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 15px rgba(255, 221, 0, 0.2)';
        });
    }
});
