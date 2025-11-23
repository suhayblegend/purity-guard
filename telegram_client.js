/**
 * Telegram Bot Integration for Purity Guard
 * Sends instant alerts to accountability partners via Telegram
 */

console.log('📱 Loading Telegram Client...');

class TelegramClient {
    constructor(botToken = null, chatId = null, partnerChatId = null) {
        this.botToken = botToken;
        this.chatId = chatId;
        this.partnerChatId = partnerChatId;
    }

    /**
     * Initialize Telegram settings from storage
     */
    async init() {
        try {
            // Try sync storage first, fallback to local storage
            let data = await new Promise((resolve) => {
                chrome.storage.sync.get(['telegramBotToken', 'telegramChatId', 'telegramPartnerChatId', 'partnerChatId'], (result) => {
                    if (chrome.runtime.lastError) {
                        console.error('Sync storage error:', chrome.runtime.lastError);
                        resolve({});
                        return;
                    }
                    resolve(result);
                });
            });
            
            if (!data.telegramBotToken || !data.telegramChatId || !data.telegramPartnerChatId) {
                data = await new Promise((resolve) => {
                    chrome.storage.local.get(['telegramBotToken', 'telegramChatId', 'telegramPartnerChatId', 'partnerChatId'], (result) => {
                        resolve(result || {});
                    });
                });
            }
            
            // Check managed_credentials.js as final fallback (for legacy support)
            if (!data.telegramBotToken && typeof globalThis !== 'undefined' && globalThis.TELEGRAM_BOT_TOKEN) {
                console.log('📱 Using token from managed_credentials.js (fallback)');
                data.telegramBotToken = globalThis.TELEGRAM_BOT_TOKEN;
            }
            
            this.botToken = data.telegramBotToken || null;
            this.chatId = data.telegramChatId || null;
            this.partnerChatId = data.telegramPartnerChatId || data.partnerChatId || null;
            
            return !!(this.botToken && (this.chatId || this.partnerChatId));
        } catch (error) {
            console.error('Error initializing Telegram client:', error);
            return false;
        }
    }

    isConfigured() {
        return !!(this.botToken && this.chatId && this.partnerChatId);
    }

    isSelfConfigured() {
        return !!(this.botToken && this.chatId);
    }

    async sendMessage(chatId, message, options = {}) {
        if (!this.botToken) return { success: false, error: 'Bot token not configured' };
        if (!chatId) return { success: false, error: 'Chat ID not provided' };

        try {
            const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
            const payload = {
                chat_id: chatId,
                text: message,
                parse_mode: options.parseMode || 'HTML',
                disable_notification: options.silent || false
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            return { success: response.ok && data.ok, data: data.result };
        } catch (error) {
            console.error('❌ Error sending Telegram message:', error);
            return { success: false, error: error.message };
        }
    }

    async sendRelapseAlert(streakLost = 0) {
        if (!this.partnerChatId) return { success: false, error: 'No partner configured' };

        const message = `
🚨 <b>URGENT: PARTNER RELAPSED</b> 🚨

Your accountability partner just logged a relapse.
${streakLost > 0 ? `💔 They lost a <b>${streakLost} day</b> streak.\n` : ''}
🆘 <b>THEY NEED YOU RIGHT NOW!</b>

Please contact them immediately. Remind them that this is just a setback, not the end.

<i>"Indeed, Allah loves those who are constantly repentant." - Quran 2:222</i>
        `.trim();

        return await this.sendMessage(this.partnerChatId, message);
    }

    // UPDATED: More direct message as requested
    async sendBlockAlert(streakLost = 0, blockedDomain = 'unknown', currentStreak = 0) {
        if (!this.partnerChatId) return { success: false, error: 'No partner configured' };

        const message = `
🛡️ <b>PARTNER VISITED A BAD WEBSITE</b>

Your friend just tried to access a harmful site:
🚫 <b>${blockedDomain}</b>

The site was blocked, but <b>YOU NEED TO TALK TO THEM.</b>
This is a warning sign. Hold them accountable.

📞 <b>Message or call them now.</b> Ask them what triggered this and help them get back on track.

<i>Current Streak: ${currentStreak} days</i>
        `.trim();

        return await this.sendMessage(this.partnerChatId, message);
    }

    async sendSelfBlockAlert(blockedDomain = 'unknown', currentStreak = 0) {
        if (!this.isSelfConfigured()) return { success: false, error: 'User chat not configured' };

        const message = `
🛡️ <b>We blocked a temptation</b>
Blocked: <code>${blockedDomain}</code>
Streak: <b>${currentStreak || 1}</b>

Stay strong! Log a note in your Victory Journal.
        `.trim();

        return await this.sendMessage(this.chatId, message, { silent: false });
    }

    async sendDisableAlert(action = 'disabled') {
        if (!this.partnerChatId) return { success: false, error: 'No partner configured' };

        const message = `
⚠️ <b>URGENT: PROTECTION REMOVED</b> ⚠️

Your partner just <b>${action}</b> the Purity Guard extension!
This is a major red flag. They are vulnerable right now.

📞 <b>CALL THEM IMMEDIATELY!</b>
        `.trim();

        return await this.sendMessage(this.partnerChatId, message);
    }

    async sendDailyStreakReminder(myStreak, partnerStreak) {
        if (!this.chatId) return { success: false, error: 'No chat ID configured' };

        const message = `
🔥 <b>DAILY STREAK CHECK-IN</b>
━━━━━━━━━━━━━━━━━━━
👤 <b>YOU: ${myStreak} DAYS</b>
🤝 <b>PARTNER: ${partnerStreak} DAYS</b>
━━━━━━━━━━━━━━━━━━━
${myStreak > partnerStreak ? '🏆 You are leading!' : '💪 Keep pushing!'}

<i>"Indeed, with hardship comes ease."</i>
        `.trim();

        return await this.sendMessage(this.chatId, message);
    }
    
    // Helper for other report types...
    async sendDailyCheckIn(stats) { return this.sendMessage(this.partnerChatId, `📊 Partner Stats: Streak ${stats.streak}, Blocks ${stats.blocksAttempted}`); }
    async sendMilestoneNotification(milestone, msg) { return this.sendMessage(this.chatId, `🎉 <b>${milestone} DAYS CLEAN!</b>\n${msg}`); }
    async sendComparisonReport(myStats, partnerStats) { return this.sendMessage(this.chatId, `📊 <b>Comparison</b>\nYou: ${myStats.blockCount} blocks\nPartner: ${partnerStats.blockCount} blocks`); }
    
    async sendTestMessage() {
        if (!this.chatId) return { success: false, error: 'Chat ID not configured' };
        return await this.sendMessage(this.chatId, '✅ <b>Test Successful!</b>\nPurity Guard is connected to Telegram.');
    }
}

// Expose globally
if (typeof self !== 'undefined') {
    self.TelegramClient = TelegramClient;
}
if (typeof window !== 'undefined') {
    window.TelegramClient = TelegramClient;
}