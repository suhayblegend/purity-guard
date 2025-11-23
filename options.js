document.addEventListener('DOMContentLoaded', function() {
    // --- Navigation Logic ---
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-section');
            if (!targetId) return;
            
            console.log('Switching to section:', targetId);
            
            // Update Nav
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Update Sections
            sections.forEach(section => section.classList.remove('active'));
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
                console.log('Section activated:', targetId);
            } else {
                console.error('Section not found:', targetId);
            }
        });
    });

    // DOM Elements
    const whitelistInput = document.getElementById('whitelistInput');
    const blacklistInput = document.getElementById('blacklistInput');
    const addWhitelistBtn = document.getElementById('addWhitelistBtn');
    const addBlacklistBtn = document.getElementById('addBlacklistBtn');
    const whitelistContainer = document.getElementById('whitelistContainer');
    const blacklistContainer = document.getElementById('blacklistContainer');
    
    // Statistics elements
    const blockCountEl = document.getElementById('blockCount');
    const streakCountEl = document.getElementById('streakCount');
    const whitelistCountEl = document.getElementById('whitelistCount');
    const blacklistCountEl = document.getElementById('blacklistCount');
    
    // Action buttons
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');
    const resetStatsBtn = document.getElementById('resetStatsBtn');
    const resetAllBtn = document.getElementById('resetAllBtn');
    const relapseBtn = document.getElementById('relapseBtn');
    const showUninstallWarningBtn = document.getElementById('showUninstallWarningBtn');
    const showDNSGuideBtn = document.getElementById('showDNSGuideBtn');
    
    // Message elements
    const whitelistSuccess = document.getElementById('whitelistSuccess');
    const whitelistError = document.getElementById('whitelistError');
    const blacklistSuccess = document.getElementById('blacklistSuccess');
    const blacklistError = document.getElementById('blacklistError');
    const relapseSuccess = document.getElementById('relapseSuccess');
    
    // Sadaqah elements
    const enableSadaqahCheckbox = document.getElementById('enableSadaqahCheckbox');
    const sadaqahSettings = document.getElementById('sadaqahSettings');
    const sadaqahAmountSelect = document.getElementById('sadaqahAmountSelect');
    const customAmountDiv = document.getElementById('customAmountDiv');
    const customAmountInput = document.getElementById('customAmountInput');
    const preferredCharitySelect = document.getElementById('preferredCharitySelect');
    const accountabilityEmailInput = document.getElementById('accountabilityEmailInput');
    const saveSadaqahBtn = document.getElementById('saveSadaqahBtn');
    const sadaqahOwedSection = document.getElementById('sadaqahOwedSection');
    const sadaqahOwedEl = document.getElementById('sadaqahOwed');
    const totalOwedDisplay = document.getElementById('totalOwedDisplay');
    const markPaidBtn = document.getElementById('markPaidBtn');
    const sadaqahAdviceText = document.getElementById('sadaqahAdviceText');
    const sadaqahRelapseWarning = document.getElementById('sadaqahRelapseWarning');
    const activityFilter = document.getElementById('activityFilter');
    
    // Guardian Lock elements
    const enableGuardianLockCheckbox = document.getElementById('enableGuardianLockCheckbox');
    const guardianLockSettings = document.getElementById('guardianLockSettings');
    const guardianLockStatus = document.getElementById('guardianLockStatus');
    const guardianPinInput = document.getElementById('guardianPinInput');
    const guardianPinConfirmInput = document.getElementById('guardianPinConfirmInput');
    const guardianRecoveryEmailInput = document.getElementById('guardianRecoveryEmailInput');
    const saveGuardianLockBtn = document.getElementById('saveGuardianLockBtn');
    const changeGuardianPinBtn = document.getElementById('changeGuardianPinBtn');
    const disableGuardianLockBtn = document.getElementById('disableGuardianLockBtn');
    const guardianLockSuccess = document.getElementById('guardianLockSuccess');
    const guardianLockError = document.getElementById('guardianLockError');
    
    // Accountability Partner elements (Telegram-based)
    const partnerStreakDisplay = document.getElementById('partnerStreakDisplay');
    const partnerRelapsesDisplay = document.getElementById('partnerRelapsesDisplay');
    const partnerSuccess = document.getElementById('partnerSuccess');
    const partnerError = document.getElementById('partnerError');
    
    // Telegram elements
    const telegramBotTokenInput = document.getElementById('telegramBotTokenInput');
    const saveTelegramConfigBtn = document.getElementById('saveTelegramConfigBtn');
    const testTelegramBtn = document.getElementById('testTelegramBtn');
    const myTelegramChatIdInput = document.getElementById('myTelegramChatIdInput');
    const partnerTelegramChatIdInput = document.getElementById('partnerTelegramChatIdInput');
    const telegramStatusIcon = document.getElementById('telegramStatusIcon');
    const telegramStatusText = document.getElementById('telegramStatusText');
    const telegramStatusDetails = document.getElementById('telegramStatusDetails');
    
    // PocketBase elements (legacy - kept for backward compatibility)
    const pocketbaseAccessSection = document.getElementById('pocketbaseAccessSection');
    const pocketbaseServiceTokenInput = document.getElementById('pocketbaseServiceTokenInput');
    const savePocketbaseServiceTokenBtn = document.getElementById('savePocketbaseServiceTokenBtn');
    const clearPocketbaseServiceTokenBtn = document.getElementById('clearPocketbaseServiceTokenBtn');
    const pocketbaseTokenStatus = document.getElementById('pocketbaseTokenStatus');
    const pocketbaseServiceStatus = document.getElementById('pocketbaseServiceStatus');
    
    // New settings elements
    const reminderTypeSelect = document.getElementById('reminderTypeSelect');
    const enableAudioCheckbox = document.getElementById('enableAudioCheckbox');
    const autoplayAudioCheckbox = document.getElementById('autoplayAudioCheckbox');
    const enableNotificationsCheckbox = document.getElementById('enableNotificationsCheckbox');
    const enableStreakNotificationsCheckbox = document.getElementById('enableStreakNotificationsCheckbox');
    const blockIncognitoCheckbox = document.getElementById('blockIncognitoCheckbox');
    const themeSelect = document.getElementById('themeSelect');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const settingsSuccess = document.getElementById('settingsSuccess');
    const viewVictoryJournalBtn = document.getElementById('viewVictoryJournalBtn');
    const victoryJournalModal = document.getElementById('victoryJournalModal');
    const victoryJournalBackdrop = document.getElementById('victoryJournalBackdrop');
    const closeVictoryJournalBtn = document.getElementById('closeVictoryJournalBtn');
    const blocksRingEl = document.getElementById('blocksProgressRing');
    const blocksRingValueEl = document.getElementById('blocksProgressValue');
    const blocksRingCaptionEl = document.getElementById('blocksProgressCaption');
    const streakRingEl = document.getElementById('streakProgressRing');
    const streakRingValueEl = document.getElementById('streakProgressValue');
    const streakRingCaptionEl = document.getElementById('streakProgressCaption');

    // Utility Functions
    let partnerToastTimer = null;

    function showMessage(element, message, duration = 3000) {
        if (!element) {
            return;
        }
        element.textContent = message;
        element.style.display = 'block';
        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    }

    function showPartnerToast(message, type = 'info', duration = 4000) {
        let toast = document.getElementById('partnerToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'partnerToast';
            toast.className = 'partner-toast';
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.dataset.type = type;
        toast.classList.remove('hide');
        toast.classList.add('show');

        if (partnerToastTimer) {
            clearTimeout(partnerToastTimer);
        }

        partnerToastTimer = setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hide');
        }, duration);
    }

    let celebrationCssInjected = false;
    function triggerCelebration(message = 'Great job!', detail = '') {
        if (!celebrationCssInjected) {
            const style = document.createElement('style');
            style.textContent = `
                .pg-celebration {
                    position: fixed;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(15, 23, 42, 0.75);
                    backdrop-filter: blur(6px);
                    z-index: 99999;
                    opacity: 0;
                    transition: opacity 0.25s ease-out;
                }
                .pg-celebration.show { opacity: 1; }
                .pg-celebration .card {
                    background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(99,102,241,0.15));
                    border: 1px solid rgba(148,163,184,0.2);
                    border-radius: 20px;
                    padding: 24px 28px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.35);
                    color: #f8fafc;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                .pg-confetti span {
                    position: absolute;
                    width: 8px;
                    height: 14px;
                    border-radius: 2px;
                    animation: pg-fall 1.8s linear forwards;
                }
                @keyframes pg-fall {
                    0% { transform: translate3d(var(--x), -40px, 0) rotate(0deg); opacity: 1; }
                    100% { transform: translate3d(calc(var(--x) * 1.2), 180px, 0) rotate(320deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
            celebrationCssInjected = true;
        }

        const overlay = document.createElement('div');
        overlay.className = 'pg-celebration';
        overlay.innerHTML = `
            <div class="card">
                <div class="pg-confetti"></div>
                <h2 style="margin: 0 0 8px; font-size: 1.5rem;">${message}</h2>
                <p style="margin: 0; color: #cbd5e1;">${detail}</p>
            </div>
        `;
        document.body.appendChild(overlay);

        const confetti = overlay.querySelector('.pg-confetti');
        const colors = ['#38bdf8', '#22c55e', '#f59e0b', '#a855f7', '#ef4444'];
        for (let i = 0; i < 24; i++) {
            const piece = document.createElement('span');
            piece.style.setProperty('--x', `${(Math.random() * 260 - 130).toFixed(0)}px`);
            piece.style.left = `${Math.random() * 100}%`;
            piece.style.background = colors[i % colors.length];
            confetti.appendChild(piece);
        }

        requestAnimationFrame(() => overlay.classList.add('show'));
        setTimeout(() => overlay.classList.remove('show'), 1700);
        setTimeout(() => overlay.remove(), 2050);
    }

    function revealPocketbaseAccessSection() {
        if (!pocketbaseAccessSection) {
            return;
        }

        pocketbaseAccessSection.style.display = 'block';
        pocketbaseAccessSection.classList.add('highlight');
        setTimeout(() => pocketbaseAccessSection.classList.remove('highlight'), 1200);

        try {
            pocketbaseAccessSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (error) {
            // Ignore scroll issues
        }
    }

    function enforceManagedPocketbaseUi() {
        if (!pocketbaseAccessSection) {
            return;
        }

        const legacyIntro = pocketbaseAccessSection.querySelector('p');
        if (legacyIntro && /sign in with your pocketbase service account/i.test(legacyIntro.textContent)) {
            legacyIntro.textContent = 'Backend access is managed automatically by the administrators. No action is required unless support asks you to refresh the connection or apply a manual override token.';
        }

        const legacyInputs = pocketbaseAccessSection.querySelectorAll('input[type="email"], input[type="password"]');
        legacyInputs.forEach((input) => {
            if (input.id === 'pocketbaseServiceTokenInput') {
                return;
            }
            const wrapper = input.closest('div');
            if (wrapper) {
                wrapper.remove();
            } else {
                input.remove();
            }
        });

        const legacyButtons = pocketbaseAccessSection.querySelectorAll('button');
        legacyButtons.forEach((button) => {
            if (button.id === 'savePocketbaseServiceTokenBtn' || button.id === 'clearPocketbaseServiceTokenBtn') {
                return;
            }
            if (/sign\s*in/i.test(button.textContent) || /credentials/i.test(button.textContent)) {
                button.remove();
            }
        });

        const manualLabel = pocketbaseAccessSection.querySelector('label[for="pocketbaseServiceTokenInput"]');
        if (manualLabel && /manual service token/i.test(manualLabel.textContent) && !/support use only/i.test(manualLabel.textContent)) {
            manualLabel.textContent = 'Manual service token override (support use only)';
        }

        if (pocketbaseServiceTokenInput && (!pocketbaseServiceTokenInput.placeholder || /after login/i.test(pocketbaseServiceTokenInput.placeholder))) {
            pocketbaseServiceTokenInput.placeholder = 'Paste override token provided by support';
        }

        if (pocketbaseTokenStatus && /sign in/i.test(pocketbaseTokenStatus.textContent || '')) {
            pocketbaseTokenStatus.textContent = 'No token saved locally. The extension will use the managed service account when available.';
        }
    }

    function handlePocketbaseForbidden(error, toastMessage, inlineMessage) {
        if (!error || error.status !== 403) {
            return false;
        }

    const toastMsg = toastMessage || 'PocketBase rejected the request. Refresh access under Backend Access or apply an override token from support.';
    const inlineMsg = inlineMessage || 'PocketBase rejected the request. Refresh access under Backend Access below or apply the override token from support.';

        revealPocketbaseAccessSection();
        showPartnerToast(toastMsg, 'warning', 7000);
        if (partnerError) {
            showMessage(partnerError, `❌ ${inlineMsg}`, 7000);
        }
        updateBackendStatus(false, 'forbidden');
        return true;
    }

    function updatePocketbaseServiceStatus(message, state = 'info') {
        if (!pocketbaseServiceStatus) {
            return;
        }
        pocketbaseServiceStatus.textContent = message || '';
        pocketbaseServiceStatus.dataset.state = state;
    }

    async function loadPocketbaseAccessSettings() {
        // PocketBase disabled - function no longer needed
        return;
    }

    function isValidDomain(domain) {
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
        return domainRegex.test(domain) && domain.length <= 253;
    }

    function normalizeDomain(domain) {
        return domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
    }

    function loadVictoryLog(limit = 200) {
        return new Promise((resolve) => {
            chrome.storage.local.get(['victoryLog'], (result) => {
                const log = Array.isArray(result.victoryLog) ? result.victoryLog.slice(0, limit) : [];
                resolve(log);
            });
        });
    }

    function addVictoryNote(timestamp, userNote) {
        return new Promise((resolve) => {
            chrome.storage.local.get(['victoryLog'], (result) => {
                const log = Array.isArray(result.victoryLog) ? result.victoryLog : [];
                const updated = log.map((entry) => {
                    // Match by ID (new format) or timestamp (old format)
                    if (entry.id === timestamp || entry.timestamp === timestamp) {
                        return { ...entry, note: userNote };
                    }
                    return entry;
                });
                chrome.storage.local.set({ victoryLog: updated }, () => {
                    console.log('✅ Victory note saved:', userNote);
                    // Re-render the journal to show the update
                    renderVictoryLog(updated);
                    triggerCelebration('Journal updated', 'Reflection saved to your victories.');
                    resolve(updated);
                });
            });
        });
    }

    function clearVictoryLog() {
        return new Promise((resolve) => {
            chrome.storage.local.set({ victoryLog: [] }, () => resolve());
        });
    }

    // Render performance graph with actual data
    function renderPerformanceGraph(weeklyBlocks, days = 7) {
        const graphContainer = document.getElementById('performanceGraphBars');
        if (!graphContainer) return;
        
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Get the past N days data
        const blocksData = [];
        const labels = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = date.toDateString();
            blocksData.push(weeklyBlocks[dateKey] || 0);
            
            // Label format depends on range
            if (days <= 14) {
                labels.push(daysOfWeek[date.getDay()]);
            } else {
                // For longer ranges, show date (e.g., "12/1")
                labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
            }
        }
        
        // Find max value for scaling
        const maxBlocks = Math.max(...blocksData, 5); // At least 5 for scale
        
        // Clear and rebuild
        graphContainer.innerHTML = '';
        graphContainer.style.alignItems = 'flex-end';
        
        blocksData.forEach((blocks, index) => {
            const height = (blocks / maxBlocks) * 100; // Percentage height
            const dayLabel = labels[index];
            
            const barWrapper = document.createElement('div');
            barWrapper.style.cssText = `
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                height: 100%;
                justify-content: flex-end;
                position: relative;
                group: true;
            `;
            
            const bar = document.createElement('div');
            // Dynamic color based on intensity
            const intensity = Math.min(blocks / 10, 1);
            const colorStart = blocks > 0 ? '#10b981' : '#3b82f6'; // Green for activity, Blue for quiet
            
            bar.style.cssText = `
                width: 60%;
                max-width: 40px;
                background: linear-gradient(180deg, ${colorStart}, rgba(59, 130, 246, 0.2));
                height: ${Math.max(height, 2)}%;
                border-radius: 6px 6px 0 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                cursor: pointer;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            `;
            
            // Tooltip
            const tooltip = document.createElement('div');
            tooltip.textContent = `${blocks} Blocks`;
            tooltip.style.cssText = `
                position: absolute;
                top: -35px;
                background: var(--card-bg);
                color: var(--text-main);
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 0.75rem;
                font-weight: bold;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.2s ease;
                pointer-events: none;
                white-space: nowrap;
                z-index: 10;
                border: 1px solid rgba(255,255,255,0.1);
            `;
            
            // Hover effects
            bar.addEventListener('mouseenter', () => {
                bar.style.transform = 'scaleY(1.05)';
                bar.style.filter = 'brightness(1.2)';
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translateY(0)';
            });
            bar.addEventListener('mouseleave', () => {
                bar.style.transform = 'scaleY(1)';
                bar.style.filter = 'none';
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translateY(10px)';
            });
            
            // Day label
            const label = document.createElement('span');
            label.textContent = dayLabel;
            label.style.cssText = `
                margin-top: 8px;
                font-size: 0.75rem;
                color: var(--text-muted);
                font-weight: 500;
            `;
            
            barWrapper.appendChild(tooltip);
            barWrapper.appendChild(bar);
            barWrapper.appendChild(label);
            graphContainer.appendChild(barWrapper);
        });
    }

    // Render Victory Journal
    function renderVictoryLog(entries) {
        const container = document.getElementById('victoryLogContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!entries || entries.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📓</div>
                    <p>No victories logged yet.</p>
                    <p style="font-size: 0.85rem;">When you block a site, it will appear here.</p>
                </div>
            `;
            return;
        }
        
        entries.forEach((entry, index) => {
            const card = document.createElement('div');
            card.className = 'victory-card';
            card.style.cssText = `
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 1rem;
                transition: all 0.2s ease;
            `;
            
            const date = new Date(entry.date).toLocaleString(undefined, {
                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', 
                hour: '2-digit', minute: '2-digit'
            });
            
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <div>
                        <span style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">VICTORY</span>
                        <span style="color: var(--text-muted); font-size: 0.85rem; margin-left: 8px;">${date}</span>
                    </div>
                    <button class="delete-entry-btn" data-index="${index}" style="background: none; border: none; color: var(--text-muted); cursor: pointer; opacity: 0.5; font-size: 1.2rem;">&times;</button>
                </div>
                <div style="font-weight: 600; margin-bottom: 0.5rem; color: var(--text-main);">
                    Blocked: <span style="color: #f472b6;">${entry.domain || 'Unknown Site'}</span>
                </div>
                <div class="note-section">
                    ${entry.note ? 
                        `<p style="color: var(--text-muted); font-size: 0.9rem; margin: 0; font-style: italic;">"${entry.note}"</p>` : 
                        `<button class="add-note-btn" data-index="${index}" style="background: none; border: none; color: #3b82f6; cursor: pointer; font-size: 0.85rem; padding: 0;">+ Add Note</button>`
                    }
                </div>
            `;
            
            container.appendChild(card);
        });
        
        // Add event listeners for delete and add note
        container.querySelectorAll('.delete-entry-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                entries.splice(idx, 1);
                chrome.storage.local.set({ victoryLog: entries }, () => renderVictoryLog(entries));
            });
        });
        
        container.querySelectorAll('.add-note-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                const note = prompt('Add a note to this victory:');
                if (note) {
                    entries[idx].note = note;
                    chrome.storage.local.set({ victoryLog: entries }, () => renderVictoryLog(entries));
                }
            });
        });
    }

    // Load and display statistics
    function loadStatistics() {
        chrome.storage.local.get(['blockCount', 'streak', 'whitelist', 'blacklist', 'sadaqahOwed', 'enableSadaqah', 'monthlyGoal', 'weeklyBlocks'], async (result) => {
            const blockCount = result.blockCount || 0;
            const streakData = result.streak || { count: 1, longestStreak: 1 };
            // Force 1 if streak is 0 or missing
            const currentStreak = (streakData.count && streakData.count > 0) ? streakData.count : 1;
            const longestStreak = streakData.longestStreak || currentStreak;
            const whitelistLength = (result.whitelist || []).length;
            const blacklistLength = (result.blacklist || []).length;
            const monthlyGoal = result.monthlyGoal || null;

            if (blockCountEl) blockCountEl.textContent = blockCount;
            if (streakCountEl) {
                streakCountEl.textContent = `${currentStreak}`;
            }
            if (whitelistCountEl) whitelistCountEl.textContent = whitelistLength;
            if (blacklistCountEl) blacklistCountEl.textContent = blacklistLength;
            
            // Render the performance graph
            renderPerformanceGraph(result.weeklyBlocks || {});
            
            // Update Sadaqah display
            const owed = result.sadaqahOwed || 0;
            const isSadaqahEnabled = result.enableSadaqah === true;
            
            if (sadaqahOwedEl) sadaqahOwedEl.textContent = owed.toFixed(2);
            if (totalOwedDisplay) totalOwedDisplay.textContent = `$${owed.toFixed(2)}`;
            if (sadaqahOwedSection) {
                // Show section if Sadaqah is enabled OR if there's debt
                sadaqahOwedSection.style.display = (isSadaqahEnabled || owed > 0) ? 'block' : 'none';
            }

            // Visual progress: monthly goal
            if (blocksRingEl) {
                const goalLimit = monthlyGoal && typeof monthlyGoal.limit === 'number' ? monthlyGoal.limit : 0;
                const goalCount = monthlyGoal && typeof monthlyGoal.count === 'number' ? monthlyGoal.count : 0;
                const goalProgress = goalLimit > 0 ? Math.min((goalCount / goalLimit) * 100, 100) : 0;
                const remainderColor = 'rgba(148, 163, 184, 0.22)';

                blocksRingEl.style.background = `conic-gradient(#38bdf8 ${goalProgress}%, ${remainderColor} ${goalProgress}% 100%)`;
                blocksRingEl.style.setProperty('--progress', `${goalProgress}%`);

                if (blocksRingValueEl) {
                    if (goalLimit > 0) {
                        blocksRingValueEl.textContent = `${goalCount}/${goalLimit}`;
                    } else {
                        blocksRingValueEl.textContent = `${blockCount}`;
                    }
                }

                if (blocksRingCaptionEl) {
                    if (goalLimit > 0) {
                        const remaining = Math.max(goalLimit - goalCount, 0);
                        blocksRingCaptionEl.textContent = remaining > 0
                            ? `${Math.round(goalProgress)}% of goal complete · ${remaining} left`
                            : 'Goal complete! MashaAllah!';
                    } else {
                        blocksRingCaptionEl.textContent = 'Set a monthly goal to track progress.';
                    }
                }
            }
            
            // Streak ring progress
            if (streakRingEl) {
                const bestStreak = longestStreak || currentStreak;
                const streakProgress = bestStreak > 0 ? Math.min((currentStreak / bestStreak) * 100, 100) : 0;
                const remainderColor = 'rgba(148, 163, 184, 0.22)';

                streakRingEl.style.background = `conic-gradient(#10b981 ${streakProgress}%, ${remainderColor} ${streakProgress}% 100%)`;
                streakRingEl.style.setProperty('--progress', `${streakProgress}%`);

                if (streakRingValueEl) {
                    streakRingValueEl.textContent = currentStreak;
                }

                if (streakRingCaptionEl) {
                    if (bestStreak > 0 && bestStreak > currentStreak) {
                        streakRingCaptionEl.textContent = `Best streak ${bestStreak} day${bestStreak === 1 ? '' : 's'}.`;
                    } else if (currentStreak > 0) {
                        streakRingCaptionEl.textContent = 'Keep pushing—new record incoming!';
                    } else {
                        streakRingCaptionEl.textContent = 'Take the first step today to start your streak.';
                    }
                }
            }

            renderVictoryLog(await loadVictoryLog());
        });
    }

    function formatVictoryRelativeTime(timestamp) {
        if (!timestamp) {
            return '';
        }

        const target = new Date(timestamp);
        if (Number.isNaN(target.getTime())) {
            return '';
        }

        const diffMs = Date.now() - target.getTime();
        if (diffMs < 0) {
            return target.toLocaleDateString();
        }

        const diffMinutes = Math.floor(diffMs / 60000);
        if (diffMinutes <= 1) {
            return 'just now';
        }
        if (diffMinutes < 60) {
            return `${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ago`;
        }

        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) {
            return `${diffHours} hr${diffHours === 1 ? '' : 's'} ago`;
        }

        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) {
            return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
        }

        const diffWeeks = Math.floor(diffDays / 7);
        if (diffWeeks < 5) {
            return `${diffWeeks} wk${diffWeeks === 1 ? '' : 's'} ago`;
        }

        return target.toLocaleDateString();
    }

    function buildVictoryEntry(entry, enableNotes = false) {
        const row = document.createElement('div');
        row.className = 'victory-entry';

        // Handle both old and new data formats
        const blockedUrl = entry.domain || (entry.blockedUrl ? entry.blockedUrl.replace(/^https?:\/\//i, '').split('/')[0] : 'Unknown site');
        
        // Parse ISO timestamp or fallback to date string
        let localTime = 'Unknown time';
        let timestamp = entry.id || entry.timestamp || Date.now();
        
        if (entry.date) {
            // New format: ISO string from background.js
            try {
                const dateObj = new Date(entry.date);
                if (!isNaN(dateObj.getTime())) {
                    localTime = dateObj.toLocaleString();
                    timestamp = dateObj.getTime();
                } else {
                    localTime = entry.date;
                }
            } catch (e) {
                localTime = entry.date;
            }
        } else if (entry.timestamp) {
            // Old format: timestamp
            localTime = new Date(entry.timestamp).toLocaleString();
        }
        
        const noteContent = entry.note || entry.userNote || '';
        const hasNote = noteContent && noteContent !== 'Auto-logged victory: Blocked a temptation.';

        row.innerHTML = `
            <div class="victory-meta">
                <strong>🛡️ ${blockedUrl}</strong>
                <span style="font-size: 0.85em; color: #888;">${localTime}</span>
            </div>
            <div class="victory-note" data-timestamp="${timestamp}">
                ${hasNote ? noteContent : '<em style="color: #999;">Click "+ Add Note" to add a reflection...</em>'}
            </div>
            ${enableNotes ? '<button class="add-note-btn" data-timestamp="' + timestamp + '">+ Add Note</button>' : ''}
        `;

        if (enableNotes) {
            const addNoteBtn = row.querySelector('.add-note-btn');
            if (addNoteBtn) {
                addNoteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const noteEl = row.querySelector('.victory-note');
                    const currentNote = entry.note && entry.note !== 'Auto-logged victory: Blocked a temptation.' ? entry.note : '';
                    const updated = prompt('Add a reflection for this victory:', currentNote || 'Today I chose patience over impulse…');
                    
                    if (updated === null) return; // User cancelled
                    
                    const trimmed = updated.trim();
                    noteEl.innerHTML = trimmed ? trimmed : '<em style="color: #999;">Click "+ Add Note" to add a reflection...</em>';
                    
                    // Save note back to storage
                    addVictoryNote(timestamp, trimmed || 'Auto-logged victory: Blocked a temptation.');
                });
            }
        }

        return row;
    }

    function renderVictoryLog(entries) {
        const list = Array.isArray(entries) ? entries : [];

        const modalContainer = document.getElementById('victoryLogContainer');
        const modalEmpty = document.getElementById('victoryModalEmpty');
        const countBadge = document.getElementById('victoryCountBadge');
        const latestEntryLabel = document.getElementById('victoryLatestEntry');

        if (countBadge) {
            countBadge.textContent = list.length;
        }

        if (latestEntryLabel) {
            if (list.length > 0) {
                const latest = list[0];
                const relative = formatVictoryRelativeTime(latest.timestamp);
                latestEntryLabel.textContent = relative ? `Latest victory logged ${relative}.` : 'Latest victory logged.';
            } else {
                latestEntryLabel.textContent = 'Log your first win to start the streak.';
            }
        }

        if (modalContainer) {
            modalContainer.innerHTML = '';
            if (list.length > 0) {
                list.forEach((entry) => {
                    modalContainer.appendChild(buildVictoryEntry(entry, true));
                });
            } else {
                modalContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No victories logged yet. Block a site to start your journal!</p>';
            }
        }

        if (modalEmpty) {
            modalEmpty.style.display = list.length === 0 ? 'block' : 'none';
        }
    }

    function openVictoryJournalModal() {
        if (!victoryJournalModal) {
            return;
        }

        victoryJournalModal.style.display = 'block';
        if (victoryJournalBackdrop) victoryJournalBackdrop.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Load and render victory log
        chrome.storage.local.get(['victoryLog'], (result) => {
            renderVictoryLog(result.victoryLog || []);
        });
    }

    function closeVictoryJournalModal() {
        if (!victoryJournalModal) {
            return;
        }

        victoryJournalModal.style.display = 'none';
        if (victoryJournalBackdrop) victoryJournalBackdrop.style.display = 'none';
        document.body.style.overflow = '';

        if (viewVictoryJournalBtn) {
            try {
                viewVictoryJournalBtn.focus({ preventScroll: true });
            } catch (error) {
                // Ignore focus errors (e.g., element hidden)
            }
        }
    }
    
    // Load Sadaqah settings
    function loadSadaqahSettings() {
        const baseAdvice = 'Choose a trusted charity. If you have existing debt, prioritize clearing it while still keeping your Sadaqah commitments humble and consistent.';
        chrome.storage.local.get(['enableSadaqah', 'sadaqahAmount', 'accountabilityEmail', 'sadaqahOwed', 'preferredCharity'], (result) => {
            if (enableSadaqahCheckbox) {
                enableSadaqahCheckbox.checked = result.enableSadaqah === true;
                if (sadaqahSettings) sadaqahSettings.style.display = result.enableSadaqah ? 'block' : 'none';
                if (sadaqahRelapseWarning) sadaqahRelapseWarning.style.display = result.enableSadaqah ? 'inline' : 'none';
            }
            if (sadaqahAmountSelect) {
                const amount = result.sadaqahAmount || 5;
                if ([1, 5, 10, 20, 50].includes(amount)) {
                    sadaqahAmountSelect.value = amount;
                } else {
                    sadaqahAmountSelect.value = 'custom';
                    if (customAmountDiv) customAmountDiv.style.display = 'block';
                    if (customAmountInput) customAmountInput.value = amount;
                }
            }
            if (preferredCharitySelect) {
                preferredCharitySelect.value = result.preferredCharity || '';
            }
            if (accountabilityEmailInput) accountabilityEmailInput.value = result.accountabilityEmail || '';

            if (sadaqahAdviceText) {
                const owed = result.sadaqahOwed || 0;
                if (owed > 0) {
                    sadaqahAdviceText.textContent = `You currently owe $${owed}. Pay it down first, then keep your pledges consistent.`;
                } else {
                    sadaqahAdviceText.textContent = baseAdvice;
                }
            }
        });
    }
    
    // Save Sadaqah settings
    function saveSadaqahSettings() {
        if (!enableSadaqahCheckbox || !sadaqahAmountSelect) {
            alert("Sadaqah controls are missing from the page. Please reload and try again.");
            return;
        }

        let amount = parseInt(sadaqahAmountSelect.value);
        if (sadaqahAmountSelect.value === "custom") {
            amount = parseInt(customAmountInput ? customAmountInput.value : "") || 5;
        }

        const settings = {
            enableSadaqah: enableSadaqahCheckbox.checked,
            sadaqahAmount: amount
        };

        if (accountabilityEmailInput) {
            settings.accountabilityEmail = accountabilityEmailInput.value.trim();
        }
        
        if (preferredCharitySelect) {
            settings.preferredCharity = preferredCharitySelect.value;
        }
        
        chrome.storage.local.set(settings, () => {
            const charityMsg = settings.preferredCharity ? `\nPreferred charity: ${settings.preferredCharity}` : '';
            alert("🕌 Sadaqah commitment saved!\n\nYou will donate $" + amount + " for each block/relapse." + charityMsg + "\n\nMay Allah accept your efforts! 🤲");
            loadSadaqahSettings();
        });
    }

    // Guardian Lock Functions
    function loadGuardianLockSettings() {
        chrome.storage.local.get(['guardianLockEnabled', 'guardianLockPin', 'guardianRecoveryEmail', 'guardianLockoutUntil'], (result) => {
            const isEnabled = result.guardianLockEnabled || false;
            const hasPin = result.guardianLockPin ? true : false;
            
            if (enableGuardianLockCheckbox) {
                enableGuardianLockCheckbox.checked = isEnabled;
            }
            
            if (guardianRecoveryEmailInput && result.guardianRecoveryEmail) {
                guardianRecoveryEmailInput.value = result.guardianRecoveryEmail;
            }
            
            // Show appropriate UI based on state
            if (isEnabled && hasPin) {
                if (guardianLockSettings) guardianLockSettings.style.display = 'none';
                if (guardianLockStatus) guardianLockStatus.style.display = 'block';
            } else {
                if (guardianLockSettings) guardianLockSettings.style.display = isEnabled ? 'block' : 'none';
                if (guardianLockStatus) guardianLockStatus.style.display = 'none';
            }
            
            // Check if in lockout period
            if (result.guardianLockoutUntil) {
                const now = Date.now();
                const lockoutEnd = result.guardianLockoutUntil;
                if (now < lockoutEnd) {
                    const hoursLeft = Math.ceil((lockoutEnd - now) / (1000 * 60 * 60));
                    if (guardianLockError) {
                        showMessage(guardianLockError, `🔒 Account locked. Wait ${hoursLeft} hours for recovery.`, 10000);
                    }
                }
            }
        });
    }
    
    function saveGuardianLock() {
        const pin = guardianPinInput ? guardianPinInput.value : '';
        const confirmPin = guardianPinConfirmInput ? guardianPinConfirmInput.value : '';
        const recoveryEmail = guardianRecoveryEmailInput ? guardianRecoveryEmailInput.value : '';
        
        // Validate PIN
        if (!/^\d{4}$/.test(pin)) {
            if (guardianLockError) {
                showMessage(guardianLockError, '❌ PIN must be exactly 4 digits!');
            }
            return;
        }
        
        if (pin !== confirmPin) {
            if (guardianLockError) {
                showMessage(guardianLockError, '❌ PINs do not match!');
            }
            return;
        }
        
        // Hash the PIN (simple hash for demonstration - in production use crypto.subtle)
        const hashedPin = btoa(pin); // Base64 encoding (NOT secure for production!)
        
        chrome.storage.local.set({
            guardianLockEnabled: true,
            guardianLockPin: hashedPin,
            guardianRecoveryEmail: recoveryEmail,
            guardianLockSetDate: Date.now()
        }, () => {
            if (guardianLockSuccess) {
                showMessage(guardianLockSuccess, '✅ Guardian Lock activated! Extension is now protected.');
            }
            
            // Clear inputs
            if (guardianPinInput) guardianPinInput.value = '';
            if (guardianPinConfirmInput) guardianPinConfirmInput.value = '';
            
            // Update UI
            loadGuardianLockSettings();
        });
    }
    
    function verifyPinPrompt(action) {
        return new Promise((resolve) => {
            chrome.storage.local.get(['guardianLockPin', 'guardianLockAttempts', 'guardianLockoutUntil'], (result) => {
                const now = Date.now();
                
                // Check if in lockout period
                if (result.guardianLockoutUntil && now < result.guardianLockoutUntil) {
                    const hoursLeft = Math.ceil((result.guardianLockoutUntil - now) / (1000 * 60 * 60));
                    alert(`🔒 LOCKED OUT\n\nToo many failed attempts!\nPlease wait ${hoursLeft} hours before trying again.\n\nThis protects you during moments of weakness.`);
                    resolve(false);
                    return;
                }
                
                // Reset attempts if lockout expired
                if (result.guardianLockoutUntil && now >= result.guardianLockoutUntil) {
                    chrome.storage.local.set({ guardianLockAttempts: 0, guardianLockoutUntil: null });
                }
                
                const enteredPin = prompt(`🔐 Guardian Lock\n\nEnter your 4-digit PIN to ${action}:\n\n⚠️ Warning: 3 failed attempts = 24-hour lockout!`);
                
                if (!enteredPin) {
                    resolve(false);
                    return;
                }
                
                const hashedEntered = btoa(enteredPin);
                const attempts = result.guardianLockAttempts || 0;
                
                if (hashedEntered === result.guardianLockPin) {
                    // Correct PIN
                    chrome.storage.local.set({ guardianLockAttempts: 0 });
                    resolve(true);
                } else {
                    // Wrong PIN
                    const newAttempts = attempts + 1;
                    
                    if (newAttempts >= 3) {
                        // Lock out for 24 hours
                        const lockoutUntil = now + (24 * 60 * 60 * 1000);
                        chrome.storage.local.set({ 
                            guardianLockAttempts: 0,
                            guardianLockoutUntil: lockoutUntil
                        });
                        alert('🚫 LOCKED OUT FOR 24 HOURS\n\n3 failed PIN attempts detected!\n\nYou cannot disable or change Guardian Lock for 24 hours.\n\nThis is protecting you from making decisions you\'ll regret.');
                    } else {
                        chrome.storage.local.set({ guardianLockAttempts: newAttempts });
                        alert(`❌ Incorrect PIN!\n\nAttempts remaining: ${3 - newAttempts}\n\nBe careful - 3 failed attempts = 24-hour lockout!`);
                    }
                    
                    resolve(false);
                }
            });
        });
    }
    
    async function changeGuardianPin() {
        const verified = await verifyPinPrompt('change your PIN');
        if (!verified) return;
        
        // Show settings to enter new PIN
        if (guardianLockSettings) guardianLockSettings.style.display = 'block';
        if (guardianLockStatus) guardianLockStatus.style.display = 'none';
        if (guardianPinInput) guardianPinInput.focus();
    }
    
    async function disableGuardianLock() {
        const verified = await verifyPinPrompt('DISABLE Guardian Lock');
        if (!verified) return;
        
        if (!confirm('⚠️ ARE YOU SURE?\n\nDisabling Guardian Lock removes PIN protection.\n\nYou will be vulnerable during weak moments!\n\nAre you absolutely sure?')) {
            return;
        }
        
        chrome.storage.local.set({
            guardianLockEnabled: false,
            guardianLockPin: null,
            guardianLockAttempts: 0
        }, () => {
            alert('✅ Guardian Lock disabled.\n\nMay Allah protect you from temptation.');
            loadGuardianLockSettings();
        });
    }
    
    // ============================================
    // ACCOUNTABILITY PARTNER FUNCTIONS
    // ============================================
    
    // PocketBase client removed - extension now uses Telegram-only mode
    let currentUserId = null;
    
    // Initialize accountability partner system
    async function initializePartnerSystem() {
        try {
            // Load Telegram configuration
            const telegramData = await chrome.storage.sync.get(['telegramChatId', 'telegramPartnerChatId']);
            
            if (telegramData.telegramChatId && telegramData.telegramPartnerChatId) {
                console.log('Telegram configured');
                // Update status indicators if they exist
                const statusIcon = document.getElementById('telegramStatusIcon');
                const statusText = document.getElementById('telegramStatusText');
                const statusDetails = document.getElementById('telegramStatusDetails');
                
                if (statusIcon) statusIcon.textContent = '🟢';
                if (statusText) statusText.textContent = 'Telegram Connected!';
                if (statusDetails) statusDetails.textContent = 'Alerts enabled! Partner notified instantly.';
            } else {
                console.log('Telegram not configured yet');
            }
        } catch (error) {
            console.error('Error initializing partner system:', error);
        }
    }
    
    // Update backend status indicator (legacy - not used)
    function updateBackendStatus(isAvailable, reason = '') {
        // Removed - no longer using PocketBase for partner matching
    }
    
    // Load partner status and display appropriate view
    async function loadPartnerStatus() {
        // PocketBase partner status disabled - extension now uses Telegram-only mode
        return;
    }
    
    function displayPartnerStats(partner) {
        // PocketBase partner stats disabled - extension now uses Telegram-only mode
        return;
    }
    
    // Show specific partner view
    function showPartnerView(view) {
        if (noPartnerView) noPartnerView.style.display = view === 'none' ? 'block' : 'none';
        if (hasPartnerView) hasPartnerView.style.display = view === 'has' ? 'block' : 'none';
        if (waitingPartnerView) waitingPartnerView.style.display = view === 'waiting' ? 'block' : 'none';
    }
    
    // Display partner stats
    function displayPartnerStats(partner) {
        if (partnerStreakDisplay) partnerStreakDisplay.textContent = partner.streak || 0;
        if (partnerRelapsesDisplay) partnerRelapsesDisplay.textContent = partner.relapses || 0;
        
        const partnerBlocksDisplay = document.getElementById('partnerBlocksDisplay');
        if (partnerBlocksDisplay) partnerBlocksDisplay.textContent = partner.blocksAttempted || 0;
        
        const partnerLastActiveElement = document.getElementById('partnerLastActive');
        if (partnerLastActiveElement && partner.lastActiveDate) {
            try {
                const lastActive = new Date(partner.lastActiveDate);
                const now = new Date();
                const diffMs = now - lastActive;
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMs / 3600000);
                const diffDays = Math.floor(diffMs / 86400000);
                
                if (diffMins < 60) {
                    partnerLastActiveElement.textContent = `${diffMins} minutes ago`;
                } else if (diffHours < 24) {
                    partnerLastActiveElement.textContent = `${diffHours} hours ago`;
                } else {
                    partnerLastActiveElement.textContent = `${diffDays} days ago`;
                }
            } catch (error) {
                console.error('Error displaying last active time:', error);
                partnerLastActiveElement.textContent = 'Recently';
            }
        }
    }
    
    // Copy user ID to clipboard
    function copyUserId() {
        if (myUserIdDisplay) {
            myUserIdDisplay.select();
            document.execCommand('copy');
            showMessage(partnerSuccess, '✅ User ID copied to clipboard!');
        }
    }
    
    // Find a random partner
    async function findRandomPartner() {
        // PocketBase matchmaking disabled - extension now uses Telegram-only mode
        showMessage(partnerError, '❌ Random matchmaking disabled. Use Telegram User IDs instead.');
        return;
    }
    
    // Connect with a specific partner
    async function connectWithPartner() {
        // PocketBase partner connection disabled - extension now uses Telegram-only mode
        showMessage(partnerError, '❌ PocketBase partner system disabled. Use Telegram User IDs instead.');
        return;
    }
    
    // Disconnect from partner
    async function disconnectPartner() {
        // PocketBase disconnect disabled - extension now uses Telegram-only mode
        showMessage(partnerError, '❌ PocketBase partner system disabled. Use Telegram User IDs instead.');
        return;
    }
    
    // Cancel waiting for partner
    async function cancelWaiting() {
        // PocketBase waiting disabled - extension now uses Telegram-only mode
        showMessage(partnerError, '❌ PocketBase matchmaking disabled. Use Telegram User IDs instead.');
        return;
    }
    
    // Mark Sadaqah as paid
        // Mark Sadaqah as paid
    function markSadaqahPaid() {
        chrome.storage.local.get(["sadaqahOwed", "paymentHistory"], (result) => {
            const currentOwed = result.sadaqahOwed || 0;

            if (currentOwed <= 0) {
                alert("Nothing owed right now. Keep up the streak!");
                return;
            }

            const amountInput = prompt("How much did you donate?", currentOwed.toString());
            if (amountInput === null) return;
            const amountPaid = parseFloat(amountInput);

            if (!amountPaid || amountPaid <= 0) {
                alert("Please enter a valid amount greater than $0");
                return;
            }

            const locationInput = prompt("Where did you give this sadaqah?", "Charity or Masjid");
            const payment = {
                amount: amountPaid,
                location: (locationInput || "Charity").trim() || "Charity",
                date: new Date().toISOString(),
                timestamp: Date.now()
            };

            const paymentHistory = result.paymentHistory || [];
            paymentHistory.unshift(payment);
            if (paymentHistory.length > 50) {
                paymentHistory.length = 50;
            }

            const newOwed = Math.max(0, currentOwed - amountPaid);

            chrome.storage.local.set({
                sadaqahOwed: newOwed,
                paymentHistory: paymentHistory
            }, () => {
                if (typeof sadaqahOwedEl !== "undefined" && sadaqahOwedEl) {
                    sadaqahOwedEl.textContent = newOwed.toFixed(2);
                }
                const paymentSuccessMsg = document.getElementById("paymentSuccessMsg");
                if (paymentSuccessMsg) {
                    paymentSuccessMsg.style.display = "block";
                    setTimeout(() => { paymentSuccessMsg.style.display = "none"; }, 3000);
                }
                triggerCelebration("Sadaqah paid", "May it be accepted.");
                loadStatistics();
                loadPaymentHistory();
                loadSadaqahSettings();
            });
        });
    }

    // Load payment history
    function loadPaymentHistory() {
        const paymentHistoryList = document.getElementById('paymentHistoryList');
        if (!paymentHistoryList) return;
        
        chrome.storage.local.get(['paymentHistory'], (result) => {
            const paymentHistory = result.paymentHistory || [];
            
            if (paymentHistory.length === 0) {
                paymentHistoryList.innerHTML = `
                    <div style="text-align: center; color: #64748b; padding: 1.5rem; font-style: italic;">
                        No payment history yet. Make your first payment! 🌟
                    </div>
                `;
                return;
            }
            
            // Calculate total paid
            const totalPaid = paymentHistory.reduce((sum, p) => sum + p.amount, 0);
            
            let html = `
                <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem; text-align: center;">
                    <div style="color: #10b981; font-size: 0.9rem; margin-bottom: 0.25rem;">Total Donated</div>
                    <div style="color: #10b981; font-size: 1.5rem; font-weight: bold;">$${totalPaid.toFixed(2)}</div>
                    <div style="color: #64748b; font-size: 0.85rem; margin-top: 0.25rem;">${paymentHistory.length} payment${paymentHistory.length === 1 ? '' : 's'}</div>
                </div>
                <div style="max-height: 300px; overflow-y: auto;">
            `;
            
            paymentHistory.forEach((payment, index) => {
                const date = new Date(payment.date);
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                
                html += `
                    <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(51, 65, 85, 0.5); border-radius: 0.5rem; padding: 1rem; margin-bottom: 0.75rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <span style="color: #10b981; font-weight: bold; font-size: 1.1rem;">$${payment.amount.toFixed(2)}</span>
                            <span style="color: #94a3b8; font-size: 0.85rem;">${dateStr}</span>
                        </div>
                        <div style="color: #cbd5e1; font-size: 0.9rem; margin-bottom: 0.25rem;">
                            📍 ${payment.location}
                        </div>
                        <div style="color: #64748b; font-size: 0.8rem;">
                            🕒 ${timeStr}
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            paymentHistoryList.innerHTML = html;
        });
    }
    
    // Load settings
    function loadSettings() {
        chrome.storage.local.get(['reminderType', 'enableAudio', 'autoplayAudio', 'enableNotifications', 'enableStreakNotifications', 'blockIncognito', 'blockPageTheme'], (result) => {
            if (reminderTypeSelect) reminderTypeSelect.value = result.reminderType || 'both';
            if (enableAudioCheckbox) enableAudioCheckbox.checked = result.enableAudio !== false;
            if (autoplayAudioCheckbox) autoplayAudioCheckbox.checked = result.autoplayAudio !== false;
            if (enableNotificationsCheckbox) enableNotificationsCheckbox.checked = result.enableNotifications !== false;
            if (enableStreakNotificationsCheckbox) enableStreakNotificationsCheckbox.checked = result.enableStreakNotifications !== false;
            if (blockIncognitoCheckbox) blockIncognitoCheckbox.checked = result.blockIncognito !== false;
            if (themeSelect) themeSelect.value = result.blockPageTheme || 'dark';
        });
    }
    
    // Save settings
    function saveSettings() {
        const settings = {
            reminderType: reminderTypeSelect ? reminderTypeSelect.value : 'both',
            enableAudio: enableAudioCheckbox ? enableAudioCheckbox.checked : true,
            autoplayAudio: autoplayAudioCheckbox ? autoplayAudioCheckbox.checked : true,
            enableNotifications: enableNotificationsCheckbox ? enableNotificationsCheckbox.checked : true,
            enableStreakNotifications: enableStreakNotificationsCheckbox ? enableStreakNotificationsCheckbox.checked : true,
            blockIncognito: blockIncognitoCheckbox ? blockIncognitoCheckbox.checked : true,
            blockPageTheme: themeSelect ? themeSelect.value : 'dark'
        };
        
        chrome.storage.local.set(settings, () => {
            if (settingsSuccess) {
                showMessage(settingsSuccess, '✅ Settings saved successfully!');
            }
        });
    }

    // Render domain list
    function renderDomainList(container, domains, listType) {
        container.innerHTML = '';
        
        if (domains.length === 0) {
            container.innerHTML = '<div class="empty-state">No domains added yet</div>';
            return;
        }

        domains.forEach((domain, index) => {
            const domainItem = document.createElement('div');
            domainItem.className = 'domain-item';
            domainItem.innerHTML = `
                <span class="domain-name">${domain}</span>
                <button class="btn btn-danger remove-domain" data-domain="${domain}" data-list="${listType}">
                    Remove
                </button>
            `;
            container.appendChild(domainItem);
        });

        // Add event listeners for remove buttons
        container.querySelectorAll('.remove-domain').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const domain = e.target.dataset.domain;
                const list = e.target.dataset.list;
                removeDomain(domain, list);
            });
        });
    }

    // Load and render lists
    function loadLists() {
        chrome.storage.local.get(['whitelist', 'blacklist'], (result) => {
            const whitelist = result.whitelist || [];
            const blacklist = result.blacklist || [];
            
            renderDomainList(whitelistContainer, whitelist, 'whitelist');
            renderDomainList(blacklistContainer, blacklist, 'blacklist');
            
            loadStatistics(); // Update counts
        });
    }

    // Add domain to list
    function addDomain(domain, listType) {
        const normalizedDomain = normalizeDomain(domain);
        
        if (!normalizedDomain) {
            const errorEl = listType === 'whitelist' ? whitelistError : blacklistError;
            showMessage(errorEl, 'Please enter a valid domain');
            return;
        }

        if (!isValidDomain(normalizedDomain)) {
            const errorEl = listType === 'whitelist' ? whitelistError : blacklistError;
            showMessage(errorEl, 'Please enter a valid domain format');
            return;
        }

        chrome.storage.local.get(['whitelist', 'blacklist'], (result) => {
            let { whitelist = [], blacklist = [] } = result;
            
            if (listType === 'whitelist') {
                if (whitelist.includes(normalizedDomain)) {
                    showMessage(whitelistError, 'Domain already in whitelist');
                    return;
                }
                
                // Remove from blacklist if present
                blacklist = blacklist.filter(d => d !== normalizedDomain);
                whitelist.push(normalizedDomain);
                
                chrome.storage.local.set({ whitelist, blacklist }, () => {
                    showMessage(whitelistSuccess, `Added ${normalizedDomain} to whitelist`);
                    whitelistInput.value = '';
                    loadLists();
                });
            } else {
                if (blacklist.includes(normalizedDomain)) {
                    showMessage(blacklistError, 'Domain already in blacklist');
                    return;
                }
                
                // Remove from whitelist if present
                whitelist = whitelist.filter(d => d !== normalizedDomain);
                blacklist.push(normalizedDomain);
                
                chrome.storage.local.set({ whitelist, blacklist }, () => {
                    showMessage(blacklistSuccess, `Added ${normalizedDomain} to blacklist`);
                    blacklistInput.value = '';
                    loadLists();
                });
            }
        });
    }

    // Remove domain from list
    function removeDomain(domain, listType) {
        chrome.storage.local.get(['whitelist', 'blacklist'], (result) => {
            let { whitelist = [], blacklist = [] } = result;
            
            if (listType === 'whitelist') {
                whitelist = whitelist.filter(d => d !== domain);
                chrome.storage.local.set({ whitelist }, () => {
                    showMessage(whitelistSuccess, `Removed ${domain} from whitelist`);
                    loadLists();
                });
            } else {
                blacklist = blacklist.filter(d => d !== domain);
                chrome.storage.local.set({ blacklist }, () => {
                    showMessage(blacklistSuccess, `Removed ${domain} from blacklist`);
                    loadLists();
                });
            }
        });
    }

    // Export settings
    function exportSettings() {
        chrome.storage.local.get(['whitelist', 'blacklist', 'blockCount', 'streak', 'monthlyGoal'], (result) => {
            const settings = {
                whitelist: result.whitelist || [],
                blacklist: result.blacklist || [],
                blockCount: result.blockCount || 0,
                streak: result.streak || { count: 0, lastUpdate: new Date().toDateString() },
                monthlyGoal: result.monthlyGoal || null,
                exportDate: new Date().toISOString(),
                version: '2.3'
            };
            
            const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `purity-guard-settings-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    // Import settings
    function importSettings(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const settings = JSON.parse(e.target.result);
                
                // Validate settings structure
                if (!settings.whitelist || !Array.isArray(settings.whitelist) ||
                    !settings.blacklist || !Array.isArray(settings.blacklist)) {
                    throw new Error('Invalid settings file format');
                }
                
                // Apply settings
                chrome.storage.local.set({
                    whitelist: settings.whitelist,
                    blacklist: settings.blacklist,
                    blockCount: settings.blockCount || 0,
                    streak: settings.streak || { count: 0, lastUpdate: new Date().toDateString() },
                    monthlyGoal: settings.monthlyGoal || null
                }, () => {
                    alert('Settings imported successfully!');
                    loadLists();
                    loadStatistics();
                });
            } catch (error) {
                alert('Error importing settings: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    // Reset statistics only
    function resetStatistics() {
        if (confirm('⚠️ Reset Statistics Only?\n\nThis will reset:\n• Block count\n• Streak (but keeps longest streak)\n• Monthly goal\n\nYour whitelist and blacklist will NOT be affected.\n\nContinue?')) {
            chrome.storage.local.get(['streak'], (result) => {
                const currentStreak = result.streak || { count: 0, longestStreak: 0 };
                chrome.storage.local.set({
                    blockCount: 0,
                    streak: { count: 0, lastUpdate: new Date().toDateString(), longestStreak: currentStreak.longestStreak || 0 },
                    monthlyGoal: null
                }, () => {
                    alert('✅ Statistics reset successfully!\n\n📊 Your longest streak has been preserved.');
                    loadStatistics();
                });
            });
        }
    }

    // Reset lists only
    function resetLists() {
        if (confirm('⚠️ Reset Lists Only?\n\nThis will clear:\n• Whitelist\n• Blacklist\n\nYour statistics will NOT be affected.\n\nContinue?')) {
            chrome.storage.local.set({
                whitelist: [],
                blacklist: []
            }, () => {
                alert('✅ Lists reset successfully!');
                loadLists();
            });
        }
    }

    // Reset everything
    function resetEverything() {
        if (confirm('⚠️⚠️⚠️ RESET EVERYTHING? ⚠️⚠️⚠️\n\nThis will permanently delete:\n• All statistics\n• All streaks\n• Whitelist and blacklist\n• All settings\n• Monthly goals\n\nThis action CANNOT be undone!\n\nAre you ABSOLUTELY SURE?')) {
            if (confirm('FINAL WARNING!\n\nThis is your last chance to cancel.\n\nPress OK to delete EVERYTHING permanently.')) {
                chrome.storage.local.clear(() => {
                    alert('🗑️ All data has been permanently deleted!');
                    location.reload(); // Reload the page to reset everything
                });
            }
        }
    }

    // Relapse reset - resets block count and streak to 0
    function handleRelapse() {
        chrome.storage.local.get(['enableSadaqah', 'sadaqahAmount', 'sadaqahOwed', 'relapseCount'], (result) => {
            const enableSadaqah = result.enableSadaqah === true;
            const sadaqahAmount = result.sadaqahAmount || 5;
            const currentOwed = result.sadaqahOwed || 0;
            const currentRelapseCount = result.relapseCount || 0;
            
            console.log('💰 Sadaqah Debug:', { enableSadaqah, sadaqahAmount, currentOwed, currentRelapseCount });
            
            let message = '💔 Relapse Recovery\n\nThis will reset:\n• Block count to 0\n• Streak to 0\n• Rank to lowest\n';
            
            if (enableSadaqah) {
                message += `\n💰 Sadaqah: +$${sadaqahAmount} added to your charity debt\n(Total will be: $${currentOwed + sadaqahAmount})\n`;
            }
            
            message += '\nYour longest streak will be preserved.\nYour lists and settings will NOT be affected.\n\nIt\'s okay to start over. Every day is a new chance.\n\nContinue?';
            
            if (confirm(message)) {
                chrome.storage.local.get(['streak'], (streakResult) => {
                    const currentStreak = streakResult.streak || { count: 0, longestStreak: 0 };
                    const streakLost = currentStreak.count || 0;
                    
                    const updates = {
                        blockCount: 0,
                        streak: { count: 0, lastUpdate: new Date().toDateString(), longestStreak: currentStreak.longestStreak || 0 },
                        relapseCount: currentRelapseCount + 1  // Increment actual relapse count
                    };
                    
                    // Add Sadaqah if enabled
                    if (enableSadaqah) {
                        updates.sadaqahOwed = currentOwed + sadaqahAmount;
                        console.log('💰 Adding Sadaqah:', updates.sadaqahOwed);
                    }
                    
                    chrome.storage.local.set(updates, async () => {
                        let successMsg = '💔 Progress reset. Remember: Recovery is a journey, not a destination. You can do this! 💪';
                        if (enableSadaqah) {
                            successMsg += `\n\n💰 You now owe $${currentOwed + sadaqahAmount} in Sadaqah. Don\'t forget to donate!`;
                        }
                        showMessage(relapseSuccess, successMsg, 6000);
                        loadStatistics();
                        
                        // Send INSTANT Telegram alert to partner
                        try {
                            // Make sure TelegramClient is loaded
                            if (typeof TelegramClient !== 'undefined') {
                                const tempTelegramClient = new TelegramClient();
                                await tempTelegramClient.init();
                                if (tempTelegramClient.isConfigured()) {
                                    const result = await tempTelegramClient.sendRelapseAlert(streakLost);
                                    if (result.success) {
                                        console.log('📱 Telegram relapse alert sent to partner!');
                                    } else {
                                        console.error('Telegram alert failed:', result.error);
                                    }
                                } else {
                                    console.log('Telegram not configured yet');
                                }
                            } else {
                                console.error('TelegramClient not loaded');
                            }
                        } catch (error) {
                            console.error('Error sending Telegram alert:', error);
                        }
                        
                        // PocketBase backup alerts removed - Telegram-only mode
                    });
                });
            }
        });
    }

    // Event Listeners
    if (addWhitelistBtn) {
        addWhitelistBtn.addEventListener('click', () => {
            addDomain(whitelistInput.value, 'whitelist');
        });
    }

    if (addBlacklistBtn) {
        addBlacklistBtn.addEventListener('click', () => {
            addDomain(blacklistInput.value, 'blacklist');
        });
    }

    if (whitelistInput) {
        whitelistInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addDomain(whitelistInput.value, 'whitelist');
            }
        });
    }

    if (blacklistInput) {
        blacklistInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addDomain(blacklistInput.value, 'blacklist');
            }
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', exportSettings);
    }

    if (importBtn) {
        importBtn.addEventListener('click', () => {
            if (importFile) importFile.click();
        });
    }

    if (importFile) {
        importFile.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                importSettings(e.target.files[0]);
            }
        });
    }

    if (resetStatsBtn) {
        resetStatsBtn.addEventListener('click', resetStatistics);
    }

    const resetListsBtn = document.getElementById('resetListsBtn');
    if (resetListsBtn) {
        resetListsBtn.addEventListener('click', resetLists);
    }

    if (resetAllBtn) {
        resetAllBtn.addEventListener('click', resetEverything);
    }

    if (relapseBtn) {
        relapseBtn.addEventListener('click', handleRelapse);
    }

    // New settings event listeners
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
    }

    // Sadaqah event listeners
    if (enableSadaqahCheckbox) {
        enableSadaqahCheckbox.addEventListener('change', function() {
            if (sadaqahSettings) sadaqahSettings.style.display = this.checked ? 'block' : 'none';
            if (sadaqahRelapseWarning) sadaqahRelapseWarning.style.display = this.checked ? 'inline' : 'none';
        });
    }

    if (sadaqahAmountSelect) {
        sadaqahAmountSelect.addEventListener('change', function() {
            if (customAmountDiv) customAmountDiv.style.display = this.value === 'custom' ? 'block' : 'none';
        });
    }
    
    // Charity selector
    const charitySelect = document.getElementById('charitySelect');
    const charityInfo = document.getElementById('charityInfo');
    const charityName = document.getElementById('charityName');
    const charityDescription = document.getElementById('charityDescription');
    const charityLink = document.getElementById('charityLink');
    
    const charityData = {
        'local': {
            name: '🕌 Local Masjid',
            description: 'Supporting your local Islamic center helps your immediate community. Your Masjid can guide you on local needs and verified causes.',
            url: ''
        },
        'islamic-relief': {
            name: 'Islamic Relief Worldwide',
            description: 'One of the largest Muslim charities providing humanitarian aid, emergency response, and sustainable development programs in over 40 countries.',
            url: 'https://www.irusa.org/'
        },
        'penny-appeal': {
            name: 'Penny Appeal',
            description: 'International charity working in 30 countries providing food, water, education, and emergency aid to vulnerable communities.',
            url: 'https://pennyappeal.org/'
        },
        'human-appeal': {
            name: 'Human Appeal',
            description: 'UK-based charity delivering humanitarian aid and development programs globally, with focus on orphan care and education.',
            url: 'https://humanappeal.org.uk/'
        },
        'muslim-aid': {
            name: 'Muslim Aid',
            description: 'Provides emergency relief and long-term development programs focused on poverty alleviation in disadvantaged communities worldwide.',
            url: 'https://muslimaid.org/'
        },
        'zakat-foundation': {
            name: 'Zakat Foundation of America',
            description: 'Manages Zakat and Sadaqah donations to provide clean water, food security, orphan sponsorships, and emergency relief globally.',
            url: 'https://www.zakat.org/'
        },
        'launchgood': {
            name: 'LaunchGood',
            description: 'Muslim crowdfunding platform connecting you directly with verified campaigns for individuals and communities in need.',
            url: 'https://www.launchgood.com/'
        },
        'ummah-welfare': {
            name: 'Ummah Welfare Trust',
            description: '100% donation policy charity providing aid in conflict zones, refugee camps, and disaster-stricken areas.',
            url: 'https://uwt.org/'
        },
        'helping-hand': {
            name: 'Helping Hand for Relief and Development',
            description: 'International relief organization providing emergency aid, healthcare, education, and sustainable development programs.',
            url: 'https://hhrd.org/'
        }
    };
    
    if (charitySelect) {
        charitySelect.addEventListener('change', function() {
            const selectedCharity = this.value;
            if (selectedCharity && charityData[selectedCharity]) {
                const charity = charityData[selectedCharity];
                charityName.textContent = charity.name;
                charityDescription.textContent = charity.description;
                
                if (charity.url) {
                    charityLink.href = charity.url;
                    charityLink.style.display = 'inline';
                } else {
                    charityLink.style.display = 'none';
                }
                
                charityInfo.style.display = 'block';
            } else {
                charityInfo.style.display = 'none';
            }
        });
    }

    if (saveSadaqahBtn) {
        saveSadaqahBtn.addEventListener('click', saveSadaqahSettings);
    }

    if (markPaidBtn) {
        markPaidBtn.addEventListener('click', markSadaqahPaid);
    }

    // Activity filter event listener
    if (activityFilter) {
        activityFilter.addEventListener('change', function() {
            const days = parseInt(this.value);
            chrome.storage.local.get(['weeklyBlocks'], (result) => {
                renderPerformanceGraph(result.weeklyBlocks || {}, days);
            });
        });
    }

    // Open Sadaqah Tracker button
    const openSadaqahTrackerBtn = document.getElementById('openSadaqahTrackerBtn');
    if (openSadaqahTrackerBtn) {
        openSadaqahTrackerBtn.addEventListener('click', () => {
            chrome.tabs.create({ url: chrome.runtime.getURL('sadaqah_tracker.html') });
        });
    }

    if (viewVictoryJournalBtn) {
        viewVictoryJournalBtn.addEventListener('click', () => {
            triggerCelebration('Victory Journal', 'Celebrate your wins and add notes.');
            openVictoryJournalModal();
        });
    }

    if (victoryJournalBackdrop) {
        victoryJournalBackdrop.addEventListener('click', () => {
            closeVictoryJournalModal();
        });
    }

    if (closeVictoryJournalBtn) {
        closeVictoryJournalBtn.addEventListener('click', () => {
            closeVictoryJournalModal();
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && victoryJournalModal && victoryJournalModal.classList.contains('active')) {
            closeVictoryJournalModal();
        }
    });
    
    // AUTO-OPEN JOURNAL: Listen for hash changes (when user clicks "View Journal" from Block Page)
    function checkHashAndOpenJournal() {
        if (window.location.hash === '#victory-journal' || window.location.hash === '#journal') {
            console.log('📖 Auto-opening Victory Journal from URL hash');
            openVictoryJournalModal();
            // Clear hash so it doesn't reopen on refresh
            history.replaceState(null, null, ' ');
        }
    }
    
    // Check on page load
    checkHashAndOpenJournal();
    
    // Listen for hash changes (in case user navigates with back/forward)
    window.addEventListener('hashchange', checkHashAndOpenJournal);

    const clearVictoryLogBtn = document.getElementById('clearVictoryLogBtn');
    if (clearVictoryLogBtn) {
        clearVictoryLogBtn.addEventListener('click', async () => {
            if (!confirm('Clear your victory journal? This removes all logged wins and notes.')) {
                return;
            }

            await clearVictoryLog();
            renderVictoryLog([]);
        });
    }

    // Local Masjid button handler (CSP compliant)
    const showLocalMasjidBtn = document.getElementById('showLocalMasjidBtn');
    if (showLocalMasjidBtn) {
        showLocalMasjidBtn.addEventListener('click', function() {
            const paymentTrackerSection = document.getElementById('paymentTrackerSection');
            if (paymentTrackerSection) {
                paymentTrackerSection.style.display = 'block';
                this.style.display = 'none';
            }
        });
    }

    // Guardian Lock event listeners
    if (enableGuardianLockCheckbox) {
        enableGuardianLockCheckbox.addEventListener('change', function() {
            if (guardianLockSettings) guardianLockSettings.style.display = this.checked ? 'block' : 'none';
            if (!this.checked) {
                // User unchecked - verify PIN if already enabled
                chrome.storage.local.get(['guardianLockEnabled', 'guardianLockPin'], async (result) => {
                    if (result.guardianLockEnabled && result.guardianLockPin) {
                        // PIN is set, require verification
                        const verified = await verifyPinPrompt('disable Guardian Lock');
                        if (!verified) {
                            // Verification failed, keep it checked
                            this.checked = true;
                            if (guardianLockSettings) guardianLockSettings.style.display = 'none';
                            if (guardianLockStatus) guardianLockStatus.style.display = 'block';
                        } else {
                            // Verification successful, disable it
                            chrome.storage.local.set({
                                guardianLockEnabled: false,
                                guardianLockPin: null,
                                guardianLockAttempts: 0
                            }, () => {
                                alert('✅ Guardian Lock disabled.');
                                loadGuardianLockSettings();
                            });
                        }
                    }
                });
            }
        });
    }

    if (saveGuardianLockBtn) {
        saveGuardianLockBtn.addEventListener('click', saveGuardianLock);
    }

    if (changeGuardianPinBtn) {
        changeGuardianPinBtn.addEventListener('click', changeGuardianPin);
    }

    if (disableGuardianLockBtn) {
        disableGuardianLockBtn.addEventListener('click', disableGuardianLock);
    }

    // Show uninstall warning button
    if (showUninstallWarningBtn) {
        showUninstallWarningBtn.addEventListener('click', function() {
            chrome.tabs.create({ url: chrome.runtime.getURL('uninstall.html') });
        });
    }

    // Show DNS setup guide button
    if (showDNSGuideBtn) {
        showDNSGuideBtn.addEventListener('click', function() {
            const guides = {
                windows: 'https://developers.cloudflare.com/1.1.1.1/setup/windows/',
                mac: 'https://developers.cloudflare.com/1.1.1.1/setup/mac/',
                android: 'https://developers.cloudflare.com/1.1.1.1/setup/android/',
                ios: 'https://developers.cloudflare.com/1.1.1.1/setup/ios/'
            };
            
            alert('📖 DNS Setup Guides:\n\n' +
                  '🪟 Windows: ' + guides.windows + '\n\n' +
                  '🍎 Mac: ' + guides.mac + '\n\n' +
                  '📱 Android: ' + guides.android + '\n\n' +
                  '📱 iOS: ' + guides.ios + '\n\n' +
                  'Opening Windows guide...');
            
            chrome.tabs.create({ url: guides.windows });
        });
    }

    // Telegram Configuration - Users provide their own bot token
    // This keeps your bot 100% secure - each user has their own bot!
    if (saveTelegramConfigBtn) {
        saveTelegramConfigBtn.addEventListener('click', async () => {
            const botToken = telegramBotTokenInput ? telegramBotTokenInput.value.trim() : '';
            const chatId = myTelegramChatIdInput ? myTelegramChatIdInput.value.trim() : '';
            const partnerChatId = partnerTelegramChatIdInput ? partnerTelegramChatIdInput.value.trim() : '';

            if (!botToken) {
                alert('❌ Please enter your Bot Token\n\nCreate one at @BotFather on Telegram');
                return;
            }

            if (!chatId || !partnerChatId) {
                alert('❌ Please enter both Chat IDs');
                return;
            }

            // Validate bot token format
            if (!botToken.includes(':') || botToken.length < 40) {
                alert('❌ Invalid Bot Token format\n\nShould look like: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz');
                return;
            }

            // Save to BOTH sync and local storage (service worker needs local)
            const telegramConfig = {
                telegramBotToken: botToken,
                telegramChatId: chatId,
                telegramPartnerChatId: partnerChatId
            };
            
            await chrome.storage.sync.set(telegramConfig);
            await chrome.storage.local.set(telegramConfig); // Service worker needs this!

            // VERIFY IT WAS SAVED
            const verification = await chrome.storage.sync.get(['telegramBotToken', 'telegramChatId', 'telegramPartnerChatId']);
            const localVerification = await chrome.storage.local.get(['telegramBotToken', 'telegramChatId', 'telegramPartnerChatId']);
            console.log('✅ Saved to SYNC storage:', verification);
            console.log('✅ Saved to LOCAL storage:', localVerification);

            if (telegramStatusIcon) telegramStatusIcon.textContent = '🟢';
            if (telegramStatusText) telegramStatusText.textContent = 'Telegram Connected!';
            if (telegramStatusDetails) telegramStatusDetails.textContent = 'Alerts will be sent instantly (1-2 seconds!)';
            
            alert('✅ Telegram configured! Your partner will receive instant alerts.\n\nCheck console to verify settings were saved to both sync and local storage.');
        });
    }

    if (testTelegramBtn) {
        testTelegramBtn.addEventListener('click', async () => {
            if (typeof TelegramClient === 'undefined') {
                alert('❌ TelegramClient not loaded. Please reload the extension.');
                return;
            }

            const client = new TelegramClient();
            await client.init();

            if (!client.isConfigured()) {
                alert('❌ Please save configuration first');
                return;
            }

            const result = await client.sendTestMessage();
            if (result.success) {
                alert('✅ Test alert sent! Check your Telegram');
            } else {
                alert(`❌ Failed: ${result.error}`);
            }
        });
    }

    // PocketBase-related buttons removed - not using backend matching anymore

    // Update partner stats manually (since we're using Telegram API, not PocketBase)
    const updatePartnerStatsBtn = document.getElementById('updatePartnerStatsBtn');
    const partnerStreakInput = document.getElementById('partnerStreakInput');
    const partnerBlocksInput = document.getElementById('partnerBlocksInput');
    const partnerRelapsesInput = document.getElementById('partnerRelapsesInput');

    if (updatePartnerStatsBtn) {
        updatePartnerStatsBtn.addEventListener('click', async () => {
            const streak = parseInt(partnerStreakInput?.value || '0') || 0;
            const blocks = parseInt(partnerBlocksInput?.value || '0') || 0;
            const relapses = parseInt(partnerRelapsesInput?.value || '0') || 0;

            await chrome.storage.local.set({
                partnerStreak: streak,
                partnerBlocks: blocks,
                partnerRelapses: relapses
            });

            // Update display if in connected view
            if (partnerStreakDisplay) partnerStreakDisplay.textContent = streak;
            if (partnerRelapsesDisplay) partnerRelapsesDisplay.textContent = relapses;

            alert(`✅ Partner stats updated!\n\nStreak: ${streak}\nBlocks: ${blocks}\nRelapses: ${relapses}`);
        });

        // Load existing partner stats
        chrome.storage.local.get(['partnerStreak', 'partnerBlocks', 'partnerRelapses'], (result) => {
            if (partnerStreakInput) partnerStreakInput.value = result.partnerStreak || '0';
            if (partnerBlocksInput) partnerBlocksInput.value = result.partnerBlocks || '0';
            if (partnerRelapsesInput) partnerRelapsesInput.value = result.partnerRelapses || '0';
        });
    }

    if (savePocketbaseServiceTokenBtn) {
        savePocketbaseServiceTokenBtn.addEventListener('click', async () => {
            // PocketBase service token disabled - extension now uses Telegram-only mode
            alert('PocketBase has been removed. Please use Telegram configuration instead.');
        });
    }

    if (clearPocketbaseServiceTokenBtn) {
        clearPocketbaseServiceTokenBtn.addEventListener('click', async () => {
            // PocketBase service token disabled - extension now uses Telegram-only mode
            alert('PocketBase has been removed. Please use Telegram configuration instead.');
        });
    }

    // Send comparison report button    // Telegram save button handler already exists above - DO NOT DUPLICATE!

    // Test Telegram button handler already added above - DO NOT DUPLICATE!

    // Send comparison report
    const sendComparisonBtn = document.getElementById('sendComparisonBtn');
    if (sendComparisonBtn) {
        sendComparisonBtn.addEventListener('click', async () => {
            if (typeof TelegramClient === 'undefined') {
                alert('❌ TelegramClient not loaded. Please reload the extension.');
                return;
            }

            const client = new TelegramClient();
            await client.init();

            if (!client.isConfigured()) {
                alert('❌ Please save Telegram configuration first');
                return;
            }

            // Get my stats
            const myStats = await chrome.storage.local.get(['blockCount', 'streak', 'relapseCount']);
            
            // Get partner stats from local storage (they share manually via Telegram)
            const partnerData = await chrome.storage.local.get(['partnerStreak', 'partnerBlocks', 'partnerRelapses']);
            
            const partnerStats = {
                blockCount: partnerData.partnerBlocks || 0,
                streak: { count: partnerData.partnerStreak || 0 },
                relapseCount: partnerData.partnerRelapses || 0
            };

            const result = await client.sendComparisonReport(myStats, partnerStats);
            
            if (result.success) {
                alert('✅ Comparison report sent to your partner via Telegram!\n\n💡 Tip: Ask your partner to share their latest stats so you can update them.');
            } else {
                alert(`❌ Failed: ${result.error}`);
            }
        });
    }

    // Load Telegram configuration on page load
    async function loadTelegramConfig() {
        const data = await chrome.storage.sync.get(['telegramChatId', 'telegramPartnerChatId']);
        
        if (myTelegramChatIdInput) myTelegramChatIdInput.value = data.telegramChatId || '';
        if (partnerTelegramChatIdInput) partnerTelegramChatIdInput.value = data.telegramPartnerChatId || '';
        
        if (data.telegramChatId && data.telegramPartnerChatId) {
            if (telegramStatusIcon) telegramStatusIcon.textContent = '🟢';
            if (telegramStatusText) telegramStatusText.textContent = 'Telegram Connected!';
            if (telegramStatusDetails) telegramStatusDetails.textContent = `Alerts enabled! Partner notified instantly.`;
        }
    }

    // Initialize
    loadLists();
    loadStatistics();
    loadSettings();
    loadSadaqahSettings();
    loadGuardianLockSettings();
    loadPocketbaseAccessSettings();
    enforceManagedPocketbaseUi();
    initializePartnerSystem();
    loadTelegramConfig(); // Load Telegram config
    loadPaymentHistory(); // Load payment history
    loadVictoryLog().then((entries) => {
        renderVictoryLog(entries);

        if (window.location.hash === '#victory' || window.location.hash === '#victory-journal') {
            setTimeout(() => {
                openVictoryJournalModal();
            }, 250);
        }
    });
    
    // Listen for messages from block page to open Victory Journal
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'openVictoryJournal') {
            openVictoryJournalModal();
            sendResponse({ success: true });
        }
        return true;
    });
});


