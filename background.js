// --- STATE MANAGEMENT ---
const blockingInProgress = new Set();

// Suppress common service worker startup warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  const message = args.join(' ');
  // Ignore harmless "No SW" warnings during startup
  if (message.includes('No SW') || message.includes('service worker not ready')) {
    return;
  }
  originalWarn.apply(console, args);
};

// Import required scripts - load each one separately to avoid duplicate errors
try {
  importScripts('managed_credentials.js');
} catch (e) {
  if (!e.message.includes('already been declared')) {
    console.warn('managed_credentials.js load issue:', e.message);
  }
}

// PocketBase removed - extension now uses Telegram-only mode
// try {
//   importScripts('pocketbase_client.js');
// } catch (e) {
//   if (!e.message.includes('already been declared')) {
//     console.warn('pocketbase_client.js load issue:', e.message);
//   }
// }

try {
  importScripts('telegram_client.js');
} catch (e) {
  if (!e.message.includes('already been declared')) {
    console.warn('telegram_client.js load issue:', e.message);
  }
}

console.log('🛡️ Purity Guard background.js v2.8 initializing...');

const PERSISTED_STATE_KEYS = [
  'whitelist',
  'blacklist',
  'streak',
  'blockCount',
  'relapseCount',
  'sadaqahOwed',
  'enableSadaqah',
  'sadaqahAmount',
  'accountabilityEmail',
  'guardianLockEnabled',
  'guardianLockPin',
  'guardianRecoveryEmail',
  'guardianLockAttempts',
  'guardianLockoutUntil',
  'reminderType',
  'enableAudio',
  'autoplayAudio',
  'enableNotifications',
  'enableStreakNotifications',
  'blockIncognito',
  'blockPageTheme',
  'monthlyGoal',
  'goalHistory',
  'monthlyGoalTarget',
  'monthlyGoalProgress',
  'telegramBotToken',
  'telegramChatId',
  'telegramPartnerChatId',
  'partnerChatId',
  'partnerUserId',
  'partnerStreak',
  'partnerRelapses',
  'partnerBlocks',
  'sadaqahOwedHistory',
  'remoteBlocklistSource',
  'remoteBlocklistLastFetch'
];

const PERSISTED_STATE_SET = new Set(PERSISTED_STATE_KEYS);
const RESTORE_FLAG_KEY = '__purityGuardRestoredOnce';

const REDDIT_MEDIA_HOSTS = ['v.redd.it', 'i.redd.it', 'preview.redd.it', 'external-preview.redd.it'];

const HIGH_RISK_DNR_DOMAINS = [
  ...REDDIT_MEDIA_HOSTS,
  'onlyfans.com',
  'onlyfanscdn.com',
  'fansly.com',
  'chaturbate.com',
  'stripchat.com',
  'bongacams.com',
  'cam4.com',
  'camsoda.com',
  'livejasmin.com'
];

const REMOTE_BLOCKLIST_LOCAL_KEY = 'remoteDomainBlockList';
const REMOTE_BLOCKLIST_SOURCE_KEY = 'remoteBlocklistSource';
const REMOTE_BLOCKLIST_LAST_FETCH_KEY = 'remoteBlocklistLastFetch';

let runtimeRemoteDomains = [];

function getAggregatedDomainList() {
  if (!Array.isArray(runtimeRemoteDomains) || runtimeRemoteDomains.length === 0) {
    return domainBlockList;
  }
  return domainBlockList.concat(runtimeRemoteDomains);
}

let mirroringFromLocal = false;
let mirroringFromSync = false;
let pocketbaseBackupTimer = null;
let restoreAttempted = false;

if (typeof pocketbase !== 'undefined' && pocketbase.setServiceToken) {
  chrome.storage.local.get(['pb_service_token', 'pb_service_token_expires_at', 'pocketbaseServiceToken'], async (items) => {
    let token = items.pb_service_token || null;
    const legacy = items.pocketbaseServiceToken;
    const expiresAt = typeof items.pb_service_token_expires_at === 'number' ? items.pb_service_token_expires_at : 0;

    if (!token && legacy) {
      token = legacy;
      await chrome.storage.local.set({ pb_service_token: legacy });
      await chrome.storage.local.remove('pocketbaseServiceToken');
    }

    pocketbase.setServiceToken(token, expiresAt || null);
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') {
      return;
    }

    if (changes.pb_service_token || changes.pb_service_token_expires_at) {
      chrome.storage.local.get(['pb_service_token', 'pb_service_token_expires_at'], (items) => {
        const token = changes.pb_service_token
          ? (changes.pb_service_token.newValue || null)
          : (items.pb_service_token || null);
        const expiresAt = changes.pb_service_token_expires_at
          ? changes.pb_service_token_expires_at.newValue
          : items.pb_service_token_expires_at;
        pocketbase.setServiceToken(token, typeof expiresAt === 'number' ? expiresAt : null);
      });
      return;
    }

    if (changes.pocketbaseServiceToken) {
      const token = changes.pocketbaseServiceToken.newValue || null;
      pocketbase.setServiceToken(token);
      chrome.storage.local.set({ pb_service_token: token });
      chrome.storage.local.remove('pocketbaseServiceToken');
    }
  });
}

function extractPersistedKeys(source = {}) {
  const snapshot = {};
  for (const key of PERSISTED_STATE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) {
      snapshot[key] = source[key];
    }
  }
  return snapshot;
}

function schedulePocketbaseBackup() {
  if (pocketbaseBackupTimer) {
    clearTimeout(pocketbaseBackupTimer);
  }

  pocketbaseBackupTimer = setTimeout(() => {
    chrome.storage.local.get(PERSISTED_STATE_KEYS, async (data) => {
      pocketbaseBackupTimer = null;
      try {
        const snapshot = extractPersistedKeys(data);
        if (Object.keys(snapshot).length === 0) {
          return;
        }
        snapshot.__timestamp = new Date().toISOString();
        await backupStateToPocketBase(snapshot);
      } catch (error) {
        console.log('PocketBase backup skipped:', error && error.message ? error.message : error);
      }
    });
  }, 2000);
}

async function backupStateToPocketBase(snapshot) {
  // PocketBase disabled - using Telegram only
  return;
}

async function restoreStateFromBackups() {
  // PocketBase restore disabled - extension now uses local storage only
  if (restoreAttempted) {
    return;
  }
  restoreAttempted = true;
}

async function refreshRemoteBlocklist(force = false) {
  const outcome = { success: true, updated: false, reason: 'ok' };
  try {
    const syncConfig = await chrome.storage.sync.get([REMOTE_BLOCKLIST_SOURCE_KEY, REMOTE_BLOCKLIST_LAST_FETCH_KEY]);
    const sourceUrl = syncConfig[REMOTE_BLOCKLIST_SOURCE_KEY];
    const lastFetch = syncConfig[REMOTE_BLOCKLIST_LAST_FETCH_KEY] || 0;

    if (!sourceUrl) {
      outcome.success = false;
      outcome.reason = 'no-source';
      return outcome;
    }

    const maxAge = 12 * 60 * 60 * 1000; // 12 hours
    if (!force && Date.now() - lastFetch < maxAge) {
      const cached = await chrome.storage.local.get([REMOTE_BLOCKLIST_LOCAL_KEY]);
      if (Array.isArray(cached[REMOTE_BLOCKLIST_LOCAL_KEY])) {
        runtimeRemoteDomains = cached[REMOTE_BLOCKLIST_LOCAL_KEY].map((entry) => String(entry).toLowerCase());
        installDynamicBlockingRules();
        outcome.updated = true;
        outcome.reason = 'using-cache';
      } else {
        outcome.reason = 'no-cache';
      }
      return outcome;
    }

    const response = await fetch(sourceUrl, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    let rawDomains = [];
    if (Array.isArray(payload)) {
      rawDomains = payload;
    } else if (payload && Array.isArray(payload.domains)) {
      rawDomains = payload.domains;
    } else if (payload && typeof payload === 'object') {
      rawDomains = Object.values(payload).flat().filter((entry) => typeof entry === 'string');
    }

    runtimeRemoteDomains = rawDomains
      .map((entry) => String(entry).toLowerCase().trim())
      .filter((entry) => entry.length > 0 && !entry.startsWith('#'));

    await chrome.storage.local.set({ [REMOTE_BLOCKLIST_LOCAL_KEY]: runtimeRemoteDomains });
    await chrome.storage.sync.set({ [REMOTE_BLOCKLIST_LAST_FETCH_KEY]: Date.now() });
    schedulePocketbaseBackup();
    installDynamicBlockingRules();
    outcome.updated = true;
    outcome.reason = 'fetched';
    return outcome;
  } catch (error) {
    const message = error && error.message ? error.message : error;
    console.log('Remote blocklist refresh failed (ignored):', message);
    return { success: false, updated: false, reason: message };
  }
}

// Wait for Chrome APIs to be ready before doing anything
if (typeof chrome === 'undefined') {
  console.error('Chrome APIs not available!');
}

// Service Worker Error Handler - Suppress harmless "No SW" errors
self.addEventListener('error', (event) => {
  // Suppress "No SW" and script fetching errors - these are timing issues
  if (event.error && event.error.message) {
    if (event.error.message.includes('No SW') || 
        event.error.message.includes('fetching the script') ||
        event.message.includes('No SW') ||
        event.message.includes('fetching the script')) {
      event.preventDefault();
      return;
    }
  }
  console.error('🚨 Service Worker Error:', event.error);
  console.error('Error at:', event.filename, 'Line:', event.lineno, 'Column:', event.colno);
});

self.addEventListener('unhandledrejection', (event) => {
  // Suppress "No SW" errors - these are harmless service worker initialization timing issues
  if (event.reason) {
    const errorMsg = event.reason.message || event.reason.toString() || '';
    if (errorMsg.includes('No SW') || errorMsg.includes('fetching the script')) {
      event.preventDefault(); // Prevent the error from being logged
      return;
    }
  }
  console.error('🚨 Unhandled Promise Rejection:', event.reason);
});

// Keep service worker alive
let keepAliveInterval;
function startKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
  
  keepAliveInterval = setInterval(() => {
    chrome.runtime.getPlatformInfo(() => {
      if (chrome.runtime.lastError) {
        // Suppress "No SW" errors silently
        return;
      }
      // Just a keepalive ping
    });
  }, 20000); // Every 20 seconds
}

console.log('🔄 Starting keepalive mechanism...');
startKeepAlive();

setTimeout(() => {
  restoreStateFromBackups();
}, 2000);

setTimeout(() => {
  chrome.storage.local.get([REMOTE_BLOCKLIST_LOCAL_KEY], (result) => {
    if (Array.isArray(result[REMOTE_BLOCKLIST_LOCAL_KEY])) {
      runtimeRemoteDomains = result[REMOTE_BLOCKLIST_LOCAL_KEY].map((entry) => String(entry).toLowerCase());
      installDynamicBlockingRules();
    }
    refreshRemoteBlocklist();
  });
}, 3000);

setInterval(() => {
  refreshRemoteBlocklist();
}, 6 * 60 * 60 * 1000);

// Import Telegram client (optional - extension works without it)
let TelegramClient = null;
let telegramClientLoadAttempted = false;

// Delay telegram client loading to avoid service worker timing issues
setTimeout(() => {
  if (!telegramClientLoadAttempted) {
    telegramClientLoadAttempted = true;
    try {
      // Telegram client already imported at top of file
      console.log('✅ Telegram client loaded successfully');
      // Get TelegramClient from global scope
      if (typeof self.TelegramClient !== 'undefined') {
        TelegramClient = self.TelegramClient;
      }
    } catch (error) {
      // Silently fail - Telegram is optional
      console.log('ℹ️ Telegram client not loaded (optional feature)');
      // Create a dummy TelegramClient class so the extension still works
      TelegramClient = class {
        constructor() {}
        async init() { return false; }
        isConfigured() { return false; }
        isSelfConfigured() { return false; }
        async sendBlockAlert() { return { success: false, error: 'Telegram not loaded' }; }
        async sendSelfBlockAlert() { return { success: false, error: 'Telegram not loaded' }; }
        async sendDisableAlert() { return { success: false, error: 'Telegram not loaded' }; }
      };
    }
  }
}, 1000); // Wait 1 second for service worker to be ready

// Create dummy TelegramClient immediately so code doesn't break
TelegramClient = class {
  constructor() {}
  async init() { return false; }
  isConfigured() { return false; }
  isSelfConfigured() { return false; }
  async sendBlockAlert() { return { success: false, error: 'Telegram not loaded yet' }; }
  async sendSelfBlockAlert() { return { success: false, error: 'Telegram not loaded yet' }; }
  async sendDisableAlert() { return { success: false, error: 'Telegram not loaded yet' }; }
};

// ================== DYNAMIC NETWORK BLOCKING (DNR) ==================
// Install aggressive dynamic rules to block adult domains and media at the network level.
async function installDynamicBlockingRules() {
  try {
    if (!chrome.declarativeNetRequest || typeof chrome.declarativeNetRequest.updateDynamicRules !== 'function') {
      console.log('ℹ️ DNR not available; skipping dynamic block rules');
      return;
    }

    // Build a compact set of block rules from our domainBlockList
  const baseResourceTypes = ['sub_frame', 'image', 'media', 'websocket'];
  const maxRules = 300; // keep it reasonable
  const aggregatedTerms = getAggregatedDomainList();
  const uniqueTerms = Array.from(new Set(aggregatedTerms.map(t => String(t).toLowerCase()))).slice(0, maxRules);

    const rules = uniqueTerms.map((term, idx) => ({
      id: 10000 + idx,
      priority: 1,
      action: { type: 'block' },
      condition: { urlFilter: term, resourceTypes: baseResourceTypes }
    }));

    // Add a few wildcard patterns for main_frame/sub_frame only (avoid overblocking scripts/styles)
    const wildcardPatterns = ['porn', 'xxx', 'hentai', 'nsfw', 'sex'];
    wildcardPatterns.forEach((w, i) => {
      rules.push({
        id: 11000 + i,
        priority: 1,
        action: { type: 'block' },
        condition: { urlFilter: w, resourceTypes: ['sub_frame', 'websocket'] }
      });
    });

    const uniqueHighRiskDomains = Array.from(new Set(HIGH_RISK_DNR_DOMAINS));
    const highRiskResourceTypes = ['main_frame', 'sub_frame', 'image', 'media', 'websocket'];
    uniqueHighRiskDomains.forEach((domain, index) => {
      rules.push({
        id: 13000 + index,
        priority: 2,
        action: { type: 'block' },
        condition: { urlFilter: domain, resourceTypes: highRiskResourceTypes }
      });
    });

    // Remove any existing rules in our id ranges and add fresh ones
    const removeIds = [];
    for (let i = 0; i < maxRules; i++) removeIds.push(10000 + i);
    for (let i = 0; i < wildcardPatterns.length; i++) removeIds.push(11000 + i);
    for (let i = 0; i < uniqueHighRiskDomains.length; i++) removeIds.push(13000 + i);

    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: removeIds, addRules: rules });
    console.log(`✅ Installed ${rules.length} dynamic network blocking rules`);
  } catch (e) {
    console.error('Failed to install dynamic rules:', e && e.message ? e.message : e);
  }
}

// Defer rule installation until startup settles
setTimeout(() => { installDynamicBlockingRules(); }, 1500);

// Generate unique user ID
function generateUserId() {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Initialize user on first install
async function initializeUser() {
  let userId = null;
  try {
    // Check if user already exists
    const existing = await chrome.storage.sync.get(['userId']).catch(err => {
      console.log('⚠️ Storage not ready yet, skipping user init');
      return {};
    });
    
    if (existing.userId) {
      console.log('User already initialized:', existing.userId);
      return existing.userId;
    }
    
    // Generate new userId
  userId = generateUserId();
    
    // Store in sync storage (persists across devices)
    await chrome.storage.sync.set({ userId: userId }).catch(err => {
      console.log('⚠️ Could not save user ID (storage not ready)');
    });
    
    // PocketBase disabled - using Telegram only for accountability
    console.log('🆔 New user initialized (local mode):', userId);
    return userId;
  } catch (error) {
    console.error('Error initializing user:', error);
  }
}

// Sync stats with PocketBase periodically
async function syncStatsWithBackend() {
  // PocketBase sync disabled - extension now uses Telegram-only mode
  return;
}

// Setup all alarms - wrap in setTimeout to ensure chrome APIs are ready
setTimeout(() => {
  // Some browsers may delay exposing APIs; guard each access
  if (chrome && chrome.alarms && typeof chrome.alarms.create === 'function') {
    try {
      // Sync every 5 minutes
      chrome.alarms.create('syncStats', { periodInMinutes: 5 });
      
      // Check streak daily at midnight (not on every startup)
      chrome.alarms.get('dailyStreakCheck', (existingAlarm) => {
        if (!existingAlarm) {
          // Calculate minutes until next midnight
          const now = new Date();
          const midnight = new Date(now);
          midnight.setHours(24, 0, 0, 0);
          const delayMinutes = Math.max(1, Math.floor((midnight - now) / 60000));
          
         // Check if alarm exists first. If it does, DO NOT touch it.
      chrome.alarms.get('dailyStreakCheck', (alarm) => {
        if (!alarm) {
            console.log('Creating new daily streak alarm');
            chrome.alarms.create('dailyStreakCheck', { periodInMinutes: 1440 });
        }
      });
          console.log(`✅ Daily streak check scheduled for midnight (${delayMinutes} min)`);
        } else {
          console.log('✅ Daily streak check alarm already exists');
        }
      });
      
      // Check for partner alerts every 2 minutes (optional feature)
      chrome.alarms.create('checkPartnerAlerts', { periodInMinutes: 2 });
      
      console.log('✅ All alarms created successfully');
    } catch (e) {
      console.log('⚠️ Could not create alarms:', e && e.message ? e.message : e);
    }

    if (chrome.alarms.onAlarm && typeof chrome.alarms.onAlarm.addListener === 'function') {
      // Unified alarm listener for all alarms
      chrome.alarms.onAlarm.addListener((alarm) => {
        try {
          console.log('⏰ Alarm triggered:', alarm.name);
          if (alarm.name === 'syncStats') {
            syncStatsWithBackend();
          } else if (alarm.name === 'dailyStreakCheck') {
            console.log('Running daily streak check...');
            updateStreak(true); // Force report on daily alarm
          } else if (alarm.name === 'checkPartnerAlerts') {
            // Partner alerts check (checks PocketBase for partner notifications)
            if (typeof checkPartnerAlerts === 'function') {
              checkPartnerAlerts();
            }
          }
        } catch (error) {
          console.error('Error in alarm handler:', error);
        }
      });
    }
  } else {
    console.log('⚠️ chrome.alarms API not available');
  }
}, 1000);

// Guardian Lock: Monitor extension state changes
// NOTE: Chrome extensions CANNOT prevent themselves from being disabled/uninstalled
// This is a Chrome security feature. The best we can do is alert your partner.
setTimeout(() => {
  if (!chrome.management || typeof chrome.management.getSelf !== 'function') {
    console.log('⚠️ chrome.management API not available');
    return;
  }
  
  chrome.management.getSelf((info) => {
    if (!info) {
      console.warn('Could not get extension info');
      return;
    }
  
  chrome.storage.local.get(['guardianLockEnabled', 'guardianLockPin'], (result) => {
    if (chrome.runtime.lastError) {
      console.error('Error getting guardian lock settings:', chrome.runtime.lastError);
      return;
    }
    
    if (!result) {
      console.log('No guardian lock settings found');
      return;
    }
    if (result.guardianLockEnabled && result.guardianLockPin && info.enabled) {
      console.log('🔐 Guardian Lock is active - Extension is protected');
      
      // Monitor for disable attempts
      chrome.management.onDisabled.addListener(async (extensionInfo) => {
        if (extensionInfo.id === chrome.runtime.id) {
          console.log('⚠️ Extension disable detected!');
          
          // Log violation
          chrome.storage.local.set({
            guardianLockViolation: Date.now(),
            guardianLockViolationType: 'disable'
          });
          
          // Send INSTANT Telegram alert to partner
          try {
            if (telegramClient) {
              await telegramClient.init();
              if (telegramClient.isConfigured()) {
                await telegramClient.sendDisableAlert('disabled');
                console.log('📱 Telegram alert sent to partner!');
              }
            }
          } catch (error) {
            // Silently handle Telegram errors - extension still works without it
            console.log('⚠️ Telegram alert not sent (service not ready)');
          }
          
          // Also alert partner via PocketBase (backup)
          try {
            if (typeof pocketbase !== 'undefined') {
              const syncData = await chrome.storage.sync.get(['userId']).catch(() => ({}));
              if (syncData.userId) {
                const isAvailable = await pocketbase.checkAvailability();
                if (isAvailable) {
                  await pocketbase.sendPartnerAlert(syncData.userId, 'disable', {
                    message: 'Partner disabled Purity Guard extension!'
                  });
                  console.log('⚠️ PocketBase alert logged');
                }
              }
            }
          } catch (error) {
            if (error && error.status === 403) {
              console.warn('PocketBase denied disable alert. Configure service token.');
            } else {
              console.error('Could not alert partner via PocketBase:', error);
            }
          }
        }
      });
    }
  });
  });
}, 1000); // Close setTimeout for Guardian Lock

// Try to detect uninstall/disable - this is limited in Chrome
// The best we can do is log it and alert the partner
chrome.runtime.onSuspend.addListener(async () => {
  console.log('Extension is being suspended/uninstalled');
  
  // Check if Guardian Lock is enabled and log violation
  chrome.storage.local.get(['guardianLockEnabled', 'guardianLockPin'], async (result) => {
    if (result.guardianLockEnabled && result.guardianLockPin) {
      console.log('⚠️ Guardian Lock violation: Extension being removed!');
      
      // Log violation
      chrome.storage.local.set({
        guardianLockViolation: Date.now(),
        guardianLockViolationType: 'uninstall'
      });
      
      // Send INSTANT Telegram alert
      try {
        if (telegramClient) {
          await telegramClient.init();
          if (telegramClient.isConfigured()) {
            await telegramClient.sendDisableAlert('uninstalled');
            console.log('📱 Telegram uninstall alert sent!');
          }
        }
      } catch (error) {
        // Silently handle Telegram errors - extension still works without it
        console.log('⚠️ Telegram alert not sent (service not ready)');
      }
      
      // Alert partner if connected (PocketBase backup)
      try {
        if (typeof pocketbase !== 'undefined') {
          const syncData = await chrome.storage.sync.get(['userId']).catch(() => ({}));
          if (syncData.userId) {
            const isAvailable = await pocketbase.checkAvailability();
            if (isAvailable) {
              await pocketbase.sendPartnerAlert(syncData.userId, 'disable', {
                message: 'Partner uninstalled Purity Guard extension!'
              });
              console.log('⚠️ Partner alerted about uninstall');
            }
          }
        }
      } catch (error) {
        if (error && error.status === 403) {
          console.warn('PocketBase denied uninstall alert. Configure service token.');
        } else {
          console.error('Could not alert partner:', error);
        }
      }
    }
  });
  // Can't open tabs here, extension is shutting down
});

// Unified onInstalled listener
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed/updated:', details.reason);

  // 1. Create Context Menus
  chrome.contextMenus.removeAll(() => {
    // Uninstall warning
    chrome.contextMenus.create({
      id: 'showUninstallWarning',
      title: '⚠️ Before You Remove This Extension...',
      contexts: ['action']
    });
    
    // Whitelist/Blacklist helpers
    chrome.contextMenus.create({
      id: "addToWhitelist",
      title: "Add domain to Purity Guard whitelist",
      contexts: ["page"]
    });
    chrome.contextMenus.create({
      id: "addToBlacklist",
      title: "Add domain to Purity Guard blacklist",
      contexts: ["page"]
    });
  });
  
  // 2. Initialize Settings & User
  const today = new Date().toDateString();
  
  chrome.storage.local.get(['whitelist', 'blacklist', 'streak', 'blockCount', 'reminderType', 'enableAudio', 'enableNotifications', 'blockPageTheme', 'lastStreakCheck'], (result) => {
    const updates = {};
    
    // Default Lists
    if (!result.whitelist) updates.whitelist = [];
    if (!result.blacklist) updates.blacklist = [];
    
    // Default Settings
    if (result.blockCount === undefined) updates.blockCount = 0;
    if (!result.reminderType) updates.reminderType = 'both';
    if (result.enableAudio === undefined) updates.enableAudio = true;
    if (result.enableNotifications === undefined) updates.enableNotifications = true;
    if (!result.blockPageTheme) updates.blockPageTheme = 'dark';

    // STREAK LOGIC: ALWAYS ensure it starts at 1 for new installs
    if (!result.streak || result.streak.count == 0 || result.streak.count === undefined) {
      console.log('🔧 Initializing streak to 1');
      updates.streak = { 
        count: 1, 
        lastUpdate: today, 
        longestStreak: Math.max(1, (result.streak ? Number(result.streak.longestStreak) || 1 : 1))
      };
      updates.lastStreakCheck = today;
      updates.lastCelebratedStreak = 0; // Initialize so first block shows celebration
      
      // Update badge immediately
      chrome.action.setBadgeText({ text: '1' });
      chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
    }

    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      chrome.storage.local.set(updates, () => {
        console.log('✅ Settings initialized/updated:', updates);
        
        // Send initial partner notification if this was a fresh install
        if (details.reason === 'install' && updates.streak) {
          setTimeout(() => {
         // Send self-report only (optional)
        chrome.storage.local.get(['telegramChatId', 'telegramBotToken', 'partnerStreak'], (tgResult) => {
             if(tgResult.telegramChatId && tgResult.telegramBotToken && typeof TelegramClient !== 'undefined') {
                 const client = new TelegramClient(tgResult.telegramBotToken, tgResult.telegramChatId, null);
                 const myStreak = streak.count || 0;
                 const partnerStreak = tgResult.partnerStreak || 0;
                 client.sendSelfDailyReport(myStreak, partnerStreak).catch(() => {}); 
             }
        });

        // SEND THE ONE MAIN REPORT TO PARTNER
        sendDailyTelegramReport();
          }, 2000);
        }
      });
    }
  });

  // 3. First Install Specific Actions
  if (details.reason === 'install') {
    console.log('🎉 First install detected - initializing user...');
    chrome.storage.local.set({ showWelcomeCelebration: true });
    initializeUser();
    
    // Show welcome notification
    showNotification('🎉 Welcome to Purity Guard!', 'Your journey starts with 1 Streak! Stay strong!');
    
    // Trigger initial streak check
    setTimeout(() => {
      updateStreak();
    }, 3000);
  }
});

// Check streak on browser startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Browser started - checking streak...');
  updateStreak();
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'showUninstallWarning') {
    chrome.tabs.create({ url: chrome.runtime.getURL('uninstall.html') });
  }
});

// --- BUILT-IN BLOCKLISTS ---
// AGGRESSIVE BLOCKING: Block KNOWN porn sites and explicit phrases
// Multi-word explicit phrases + common adult terms

const explicitPhrases = [
  // Full domain names
  'pornhub', 'xvideos', 'xnxx', 'youporn', 'redtube', 'tube8', 'spankbang', 'xhamster',
  'porn.com', 'xxx.com', 'hentai.com', 'sexvideos', 'xvid', 'pornsite',
  
  // Explicit multi-word terms
  'pornography', 'hentai', 'camgirl', 'camshow', 'webcam girl', 'live cam',
  'blowjob', 'handjob', 'footjob', 'titjob', 'boobjob',
  'gangbang', 'gloryhole', 'creampie', 'bukakke', 'facial',
  'sextoy', 'sex toy', 'fleshlight', 'buttplug', 'butt plug', 'dildo',
  'redgifs', 'erome', 'imagefap', 'xbooru',
  'pornhd', 'pornstar', 'porn star', 'porntube', 'xtube', 'adult video',
  'sexcam', 'sex cam', 'livecam', 'webcam sex', 'cam sex',
  'nudevideo', 'nude video', 'nude pic', 'nudepic', 'nudes',
  'xxx video', 'xxx pic', 'xxx image', 'xxxvideo', 'xxxpic',
  'adult content', 'adult film', 'adult movie', 'adult site',
  'erotic video', 'erotic content', 'erotic film',
  'strip tease', 'striptease', 'lap dance', 'lapdance',
  'phone sex', 'sexting', 'sex chat', 'adult chat',
  'onlyfans.com', 'fansly.com', 'patreon nsfw',
  
  // Common URL patterns
  '/porn/', '/xxx/', '/adult/', '/nsfw/', '/nude/', '/sex/',
  '/hentai/', '/erotic/', '/18+/', '/+18/', '/mature/',
  
  // Video/image terms combined with adult
  'porn video', 'porn pic', 'porn image', 'porn gif',
  'sex video', 'sex pic', 'sex image', 'sex gif',
  'nude video', 'nude pic', 'nude image', 'nude gif',
  'adult video', 'adult pic', 'adult image', 'adult gif',
  
  // Acts and categories
  'anal sex', 'oral sex', 'group sex', 'rough sex',
  'lesbian sex', 'gay sex', 'trans sex', 'shemale',
  'masturbation', 'self pleasure', 'solo porn',
  'teen porn', 'milf porn', 'mature porn', 'granny porn',
  'amateur porn', 'homemade porn', 'real sex',
  'public sex', 'outdoor sex', 'car sex',
  'bdsm porn', 'bondage porn', 'fetish porn',
  
  // Fetishes
  'foot fetish', 'feet fetish', 'ass worship', 'femdom',
  'cuckold', 'hotwife', 'swinger', 'threesome',
  
  // Common misspellings/variations
  'pron', 'pr0n', 'p0rn', 's3x', 'xxx', 'xxxx'
];

// Keywords that indicate explicit intent in search queries
const nsfwSearchTokens = [
  'porn', 'porno', 'pornography', 'xxx', 'sex', 'nsfw', 'hentai', 'nude', 'naked', 'adult',
  'erotic', 'fetish', 'bdsm', 'milf', 'teen', 'anal', 'blowjob', 'handjob', 'lesbian',
  'gay', 'shemale', 'trans', 'jerk', 'masturbation', 'cam', 'webcam', 'onlyfans',
  'strip', 'hookup', 'creampie', 'orgasm', 'deepthroat', 'cum', 'pawg', 'bbw'
];

// Reddit NSFW paths - Comprehensive list of adult subreddits
const redditNSFWPaths = [
  // General NSFW
  '/r/nsfw', '/r/porn', '/r/pornvids', '/r/nsfw_gif', '/r/nsfw_gifs',
  '/r/porninfifteenseconds', '/r/60fpsporn', '/r/nsfwhardcore', '/r/pornid',
  '/r/sex', '/r/sexstories', '/r/gonewildstories', '/r/sluttyconfessions',
  
  // Body parts
  '/r/gonewild', '/r/realgirls', '/r/ass', '/r/boobs', '/r/tits', '/r/pussy',
  '/r/buttplug', '/r/anal', '/r/asshole', '/r/booty', '/r/thick', '/r/curvy',
  '/r/pawg', '/r/paag', '/r/thighs', '/r/legs', '/r/feet', '/r/hips',
  
  // Acts
  '/r/blowjobs', '/r/deepthroat', '/r/cumsluts', '/r/creampie', '/r/cumshots',
  '/r/handjobs', '/r/girlsfinishingthejob', '/r/facials', '/r/oralcreampie',
  
  // Categories
  '/r/milf', '/r/gilf', '/r/amateur', '/r/collegesluts', '/r/legalteens',
  '/r/asiansgonewild', '/r/latinas', '/r/ebony', '/r/pawg', '/r/bbw',
  
  // 🌍 COUNTRY/ETHNICITY SPECIFIC NSFW
  '/r/arabporn', '/r/arabsgonewild', '/r/repressedgonewild', '/r/hijabigirls',
  '/r/japaneseporn2', '/r/jav', '/r/javdownloadcenter', '/r/asianporn',
  '/r/asiansgonewild', '/r/asiangirls4you', '/r/koreanporn', '/r/kpopfap',
  '/r/indiansgonewild', '/r/indianporn', '/r/desiboners', '/r/muslimgirls',
  '/r/brazilianporn', '/r/latinaporn', '/r/mexicansgonewild',
  '/r/germanporn', '/r/germansgonewild', '/r/frenchporn',
  '/r/russianporn', '/r/russiansgonewild', '/r/filipinaporn',
  '/r/thaigirls', '/r/filipinagirls', '/r/vietnameseporn',
  
  // LGBTQ+
  '/r/gay', '/r/gayporn', '/r/gaybros', '/r/gaynsfw', '/r/gaygifs',
  '/r/lesbian', '/r/dyke', '/r/actuallesbians', '/r/lesbians',
  '/r/traps', '/r/tgirls', '/r/shemales', '/r/trans',
  
  // Specific interests
  '/r/bdsm', '/r/bondage', '/r/femdom', '/r/maledom', '/r/ddlg',
  '/r/incest', '/r/breeding', '/r/hentai', '/r/rule34', '/r/yiff',
  '/r/furry', '/r/furryyiff', '/r/hentai_gif', '/r/doujinshi',
  
  // Webcam/Amateur
  '/r/camwhores', '/r/camsluts', '/r/streamers', '/r/gonewildaudio',
  '/r/dirtypenpals', '/r/dirtyr4r', '/r/randomactsofblowjob',
  
  // Celebrity/Premium
  '/r/celebnsfw', '/r/celebs', '/r/watchitfortheplot', '/r/onlyfans',
  '/r/gonewild30plus', '/r/gonewild18', '/r/petitegonewild',
  
  // Extreme (block these especially)
  '/r/rape', '/r/rapefantasy', '/r/rapeplay', '/r/struggle',
  '/r/torturedsex', '/r/painal', '/r/freeuse', '/r/misogyny'
];

const redditNSFWKeywords = [
  'nsfw', 'porn', 'pornvid', 'pornpic', 'pornvids', 'pornpics', 'xxx', 'sex', 'nude', 'nudes', 'nudity',
  'adult', 'explicit', 'fetish', 'bdsm', 'bondage', 'kink', 'lewd', 'hentai', 'rule34', 'gonewild',
  'slut', 'sluts', 'slutty', 'thot', 'thots', 'titty', 'titties', 'boob', 'boobs', 'tits', 'ass', 'booty',
  'butt', 'anal', 'cum', 'creampie', 'blowjob', 'handjob', 'deepthroat', 'facial', 'facials', 'milf', 'gilf',
  'teen', 'pawg', 'bbw', 'lingerie', 'jerk', 'jerkoff', 'masturbation', 'fap', 'doujin', 'yiff', 'furry',
  'shemale', 'tgirls', 'trap', 'dominatrix', 'domme', 'submissive', 'webcam', 'camgirl', 'camgirls',
  'stripper', 'strippers', 'striptease', 'spicy'
];

// Comprehensive domain blocklist - MORE RELIABLE than keywords
// ULTRA AGGRESSIVE BLOCKING - Block everything possible
const domainBlockList = [
  // TOP TIER - Most popular adult sites (MUST BLOCK)
  'pornhub', 'xvideos', 'xnxx', 'youporn', 'redtube', 'tube8', 'spankbang', 'xhamster',
  'xhamsterlive', 'pornhd', 'porn.com', 'xxx.com', 'beeg', 'tnaflix', 'porntrex',
  'v.redd.it', 'i.redd.it', 'preview.redd.it', 'external-preview.redd.it',
  'onlyfans.com', 'onlyfanscdn.com', 'static.onlyfans.com', 'cdn.onlyfans.com',
  
  // TIER 2 - Very popular video sites
  'upornia', 'txxx', 'drtuber', 'porngo', 'sunporno', 'alphaporno', 'porndoe',
  'eporner', 'hclips', 'vjav', 'jav', 'javmost', 'javhd', 'javfinder',
  'motherless', 'heavy-r', 'vporn', 'pornone', 'porn300', 'porn555',
  'porndig', 'pornky', 'pornerbros', 'sex.com', 'sexvid', 'daftsex',
  'watchmygf', 'homemade', 'voyeurweb', 'sexu', 'wetpussy', 'faphouse',
  'porntube', 'xtube', 'pornpics', 'porngifs', 'slutload', 'empflix',
  'pornative', 'fuq.com', 'gotporn', 'pornzog', 'nuvid', 'megatube',
  'porn00', 'tubegalore', 'tubev', 'pornwhite', 'fapdu', 'youjizz',
  'pornrabbit', 'pornhat', 'pornktube', 'anybunny', 'hardtube',
  'porncom', 'pornone', 'porn365', 'epornx', 'anysex', 'freeones',
  'thumbzilla', 'pornhost', 'sexix', 'pornflip', 'hotmovs', 'pornworld',
  'pornvideo', 'pornmz', 'porn7', 'porn8', 'porn9', 'pornxp',
  'hotebonytube', 'ebonytube.tv', 'leslez.com', 'lesbify.com',
  'ok.xxx', 'pornhd3x', 'xxxfiles', 'pornhoarder', 'pornhits', 'whoreshub',
  'xxxfiles', 'pornktube.com', 'pornhat.com', 'tnaboard.com', 'paradisehill',
  'trendyporn', 'pornhd8k', 'xfreehd', 'perfectgirls', 'pornslash', 'yourdailypornvideos',
  'erome', 'porn300', 'vxxx', 'veporn', 'drtuber', 'netfapx', 'letsjerk',
  'pornobae', 'pornmz', 'xmegadrive', 'brazzers3x', 'hitprn', 'czechvideo',
  'joysporn', 'watchxxxfree', 'hdporn92', 'yespornpleasexxx', 'fuxnxx', '4kporn',
  'watchporn', 'latestpornvideo', 'inporn', 'latestleaks', 'anyporn', 'cliphunter',
  'severeporn', 'bananamovies', 'collectionofbestporn', 'xtapes', 'xkeezmovies',
  'sextvx', 'pornovideoshub', 'pandamovies', 'fullxxxmovies', 'iceporncasting',
  'pussyspace', 'pornvibe', 'siska', 'megatube', 'fakings', 'justfullporn',
  'xxvideoss', 'thepornarea', 'xozilla', 'eroticmv', 'perverzija', 'pornvideoBB',
  'mangoporn', 'gimmeporn', 'whereismyporn', 'allpornstream', 'pornoflix',
  'tubeorigin', 'neporn', 'pornez', 'euroxxx', 'americass', 'sextu',
  'yespornvip', 'galaxyporn', 'taxi69', 'sexu', 'definebabe', 'hutporner',
  'ogporn', 'titfap', 'xcum', 'pornwex', 'bibamax', 'upornia', 'xcafe',
  'hdzog', 'xxxtube', 'pornlib', 'abxxx', 'bingato', 'letmejerk',
  'xfuntazy', 'xvgold', 'freeones.tube', 'hd-easyporn', 'brazz', 'bigbuttshub',
  'xxam', 'fapnado', 'inxxx', 'ladybanana', 'usersporn', 'mypornerleak',
  'youperv', 'pornve', 'coralxxx', 'justporn', 'pornhd4k', 'porneec',
  'freepornsex.net', 'amigosporn', 'veporn.net', 'veporns', '143porn',
  'mygoodporn', 'xleech', 'fuxxx', 'sxyland', 'brazzpw', 'zhornyhub',
  'pornbusy', '8kporner', 'saintporn', 'sinpartytube', 'vrsmash',
  'watchxxxfree.com', 'pornxp', 'pornxp.org', 'pornxp.net', 'pornxp.xxx',
  
  // TIER 3 - Additional video sites (catching the ones getting through)
  'xnxx.tv', 'xnxx2.com', 'xnxx3.com', 'pornhubpremium', 'modelhub',
  'spankwire', 'keezmovies', 'extremetube', 'mofosex', 'pornoxo',
  'sexvid.xxx', 'pornhits', 'porndig.com', 'vjav.com', 'javfor.me',
  'jable.tv', 'missav', 'avgle', 'netfapx', 'asianporn', 'japanhdv',
  'pornkino', 'pornstash', 'fullporner', 'cliphunter', 'yourlust',
  'definebabe', 'vxxx', 'pornder', 'yourporn', 'justporno',
  'tubent', 'pornthunder', 'pornpics.de', 'sex3', 'hqporner',
  'ixxx', 'drpornofilme', 'pornofilm', 'pornovoisine', 'cliti.com',
  '18qt.com', '4tube', '91porn', 'ah-me', 'alotporn', 'analdin',
  'bigtits.com', 'bustybloom', 'deviantclip', 'drunkenstepfather',
  'empornium', 'extremeass', 'fatcat', 'freshporn', 'gaypornhd',
  'h2porn', 'hdsex', 'hentaistream', 'hentaitube', 'hornygamer',
  'hub.xxx', 'jizzbunker', 'keekass', 'largeporntube', 'lucyporn',
  'madthumbs', 'mamacitas', 'manhub', 'milffox', 'mobileporn',
  'newporn', 'orgasm.com', 'pichunter', 'playvids', 'pornative.com',
  'pornbb.org', 'porndig.org', 'porneskimo', 'pornheed', 'pornheed.com',
  'pornheed.xyz', 'pornhub.com', 'pornhubthree', 'pornid.xxx',
  'pornid.com', 'pornj', 'pornking', 'pornmega', 'pornmz.com',
  'pornobae', 'pornocarioca', 'pornolab', 'pornorama', 'pornorips',
  'pornos.xxx', 'pornotube.xxx', 'pornoxo.com', 'pornrewind',
  'pornsocket', 'porntop', 'porntrex.com', 'pornult', 'pornxbit',
  'pornyard', 'pornzilla', 'privatehomeclips', 'proporn', 'realitykings',
  'sexalarab', 'sexbot', 'sexlikereal', 'sexloving', 'sexsaoy',
  'sextvx', 'sexu.com', 'sexxxymovs', 'shameless.com', 'sheshaft',
  'shooshtime', 'simply4tube', 'slutload.com', 'smutty.com',
  'sneakysex', 'spankbang.com', 'stepmomvideos', 'submityourflicks',
  'sxyprn', 'teenport', 'thegay', 'thenewporn', 'theporncloud',
  'tiava', 'titsbox', 'tnaboard', 'tnaflix.com', 'tnagals',
  'tubecup', 'tubedupe', 'tubeland', 'tubeoffline', 'tubeporn',
  'tubesafari', 'tubeterria', 'tubewolf', 'tubxporn', 'upornia.com',
  'userempire', 'vjav.com', 'vporn.com', 'vrporn', 'watchmyexgf',
  'watchmygf.com', 'wetplace', 'wixvi', 'worldsex', 'xcafe',
  'xfantazy', 'xfree', 'xfreehdporn', 'xfreehd', 'xgroovy',
  'xhamster.com', 'xmoviesforyou', 'xnxx.com', 'xnxx.es',
  'xnxx.fun', 'xnxx.gold', 'xnxx.link', 'xnxx.name', 'xnxx.nu',
  'xnxx.one', 'xnxx.photos', 'xnxx.red', 'xnxx.rocks', 'xnxx.tv',
  'xnxx.video', 'xnxx1', 'xnxx2', 'xnxx3', 'xnxx4', 'xnxx8',
  'xnxxvideo', 'xopenload', 'xpanas', 'xpee', 'xporn',
  'xtits', 'xtube.com', 'xvideo', 'xvideos.es', 'xvideos.com',
  'xvideos.red', 'xvideos1', 'xvideos2', 'xvideos3', 'xvideosporn',
  'xxcel', 'xxx.com', 'xxxbunker', 'xxxdan', 'xxxfilme',
  'xxxkinky', 'xxxmom', 'xxxmoviestream', 'xxxpawn', 'xxxstreams',
  'xxxvideoss', 'xxxvogue', 'xxxx', 'xxxxkinky', 'xxxxxcom',
  'yesporn', 'yespornplease', 'youngpornvideos', 'youporn.com',
  'youramateurporn', 'yourfreeporn', 'yourlust.com', 'yourporn.sexy',
  'youx.xxx', 'zeloporn', 'zetporn', 'zzcartoon',
  
  // LGBTQ+ sites
  'twinki', 'boyfriendtv', 'gaytube', 'aebn', 'gaydemon', 'mygaytube',
  'boysfood', 'gaybingo', 'gayfuror', 'gaypornhd', 'gay0day',
  'pornhubgay', 'xvideosgay',
  
  // Cam/live sites
  'chaturbate', 'stripchat', 'bongacams', 'cam4', 'camsoda', 'livejasmin', 
  'myfreecams', 'flirt4free', 'imlive', 'streamate', 'camster', 'cam2cam',
  'cams.com', 'camcontacts', 'naked.com', 'jerkmate', 'slutroulette',
  'camwhores', 'camvideos', 'recordbate', 'webcamamateurs',
  
  // Premium/paid sites
  'brazzers', 'bangbros', 'naughtyamerica', 'realitykings', 'mofos', 'babes',
  'digitalplayground', 'twistys', 'evilangel', 'wicked', 'hustler', 'playboy',
  'penthouse', 'vivid', 'kink', 'pornpros', 'teamskeet', 'familystrokes',
  'faketaxi', 'fakehospital', 'fakeagent', 'milfed', 'blacked', 'tushy',
  'vixen', 'deeper', 'slayed', 'blackedraw', 'tushyraw',
  
  // OnlyFans and creator platforms
  'onlyfans', 'fansly', 'patreon', 'manyvids', 'clips4sale', 'iwantclips',
  'modelhub', 'fancentro', 'justfor.fans', 'loyalfans', 'admire.me',
  
  // Image/GIF sites
  'rule34', 'gelbooru', 'danbooru', 'e621', 'xbooru', 'realbooru',
  'redgifs', 'gfycat', 'erome', 'imagefap', 'imagetwist', 'imgsrc',
  'seximg', 'xxximg', 'imgchili', 'imgbox', 'pixhost',
  
  // Hentai/anime
  'nhentai', 'hentaihaven', 'hanime', 'hentaigasm', 'tsumino',
  'hentai2read', 'hentaifox', 'simply-hentai', 'muchohentai',
  
  // Forums and communities
  'sex.com', 'xnxx.com', 'pornbb', 'sexyforum', 'adultdvdtalk',
  'phun.org', 'phuket-1337', 'planet-suzy', 'pornfidelity',
  
  // Dating/hookup
  'adultfriendfinder', 'ashleymadison', 'fling.com', 'xmatch', 'passion.com',
  'benaughty', 'hookup.com', 'naughtydate', 'together2night',
  
  // Erotic stories/text
  'literotica', 'sexstories', 'lushstories', 'nifty', 'asstr',
  
  // Telegram adult channels (common patterns)
  't.me/+', 'telegram.me/', 'telegram.dog/',
  
  // Gambling sites
  'bet365', 'williamhill', '1xbet', '22bet', 'parimatch', 'stake',
  'pokerstars', 'betfair', 'ladbrokes', 'coral', 'paddy',
  
  // Proxy/VPN sites that bypass blocks
  'hideproxy', 'proxysite', 'hide.me', 'hidemyass', 'kproxy',
  'anonymouse', 'filterbypass', 'unblockwebsites'
];

// Expanded internal whitelist for essential services
const INTERNAL_WHITELIST = [
  // Google services
  'google.com', 'google.co.uk', 'google.ca', 'google.com.au',
  'accounts.google.com', 'mail.google.com', 'drive.google.com', 
  'docs.google.com', 'youtube.com', 'gmail.com',
  
  // Microsoft services
  'microsoft.com', 'office.com', 'outlook.com', 'live.com',
  'login.live.com', 'bing.com', 'msn.com',
  
  // Social media and communication
  'facebook.com', 'twitter.com', 'x.com', 'instagram.com', 
  'linkedin.com', 'discord.com', 'slack.com',
  'whatsapp.com', 'telegram.org',
  
  // Educational and professional
  'github.com', 'gitlab.com', 'stackoverflow.com', 'stackexchange.com',
  'wikipedia.org', 'coursera.org', 'udemy.com', 'khanacademy.org',
  
  // E-commerce and services
  'amazon.com', 'ebay.com', 'paypal.com', 'stripe.com',
  
  // Authentication services
  'auth.openai.com', 'auth0.com', 'okta.com',
  
  // News and media
  'bbc.com', 'cnn.com', 'nytimes.com', 'theguardian.com',  // Islamic resources
  'islamqa.info', 'quran.com', 'sunnah.com', 'islamweb.net',
  'islamicfinder.org', 'seekersguidance.org'
];

// --- UTILITY FUNCTIONS ---
function showNotification(title, message) {
  try {
    chrome.storage.local.get(['enableNotifications'], (result) => {
      if (result.enableNotifications !== false) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/logo-48.png',
          title: title,
          message: message
        });
      }
    });
  } catch (error) {
    console.error('Error showing notification (extension context may be invalidated):', error);
  }
}

function getDomainFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase();
  } catch (e) {
    console.error('Error parsing URL:', url, e);
    return null;
  }
}

function normalizeUrl(url) {
  if (!url) return null;
  return url.toLowerCase().trim();
}

function domainMatches(domain, pattern) {
  if (!domain || !pattern) return false;
  const normalizedDomain = domain.toLowerCase();
  const normalizedPattern = pattern.toLowerCase();
  
  // Exact match
  if (normalizedDomain === normalizedPattern) return true;
  
  // Subdomain match (e.g., "example.com" matches "www.example.com")
  if (normalizedDomain.endsWith('.' + normalizedPattern)) return true;
  
  return false;
}

// --- REVISED BLOCKING LOGIC V3.0 - AGGRESSIVE ---
function shouldBlockUrl_V2(url) {
  return new Promise((resolve) => {
    console.log('🚨🚨🚨 V3.0 AGGRESSIVE BLOCKING 🚨🚨🚨');
    console.log('Checking URL for blocking:', url);
    
    // 1. Basic checks to ignore non-web pages and extension pages
    if (!url || !url.startsWith("http")) {
      console.log('Not a web URL, skipping');
      resolve(false);
      return;
    }
    
    // Skip Chrome/Edge internal pages
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || 
        url.startsWith('about:') || url.startsWith('edge://') || 
        url.startsWith('browser://') || url.startsWith('file://')) {
      console.log('Browser internal page, skipping');
      resolve(false);
      return;
    }

    const domain = getDomainFromUrl(url);
    if (!domain) {
      console.log('Could not extract domain from URL');
      resolve(false);
      return;
    }

    console.log('🔍 FULL URL:', url);
    console.log('🔍 EXTRACTED DOMAIN:', domain);
    const lowerUrl = url.toLowerCase();
    const lowerDomain = domain.toLowerCase();

    // ==================== WHITELIST FIRST (HIGHEST PRIORITY) ====================
    // ✅ NEVER block these - check BEFORE any blocking logic
    const alwaysAllowDomains = [
      'sussex.ac.uk', 'essex.ac.uk', 'middlesex.ac.uk', 'wessex.ac.uk',
      'massachusetts.gov', 'massachusetts.edu',
      'classroom.google.com', 'assignment', 'assessment', 'canvas', 'blackboard',
      'moodle', 'schoology', 'edmodo'
    ];
    
    for (const allowedDomain of alwaysAllowDomains) {
      if (lowerDomain.includes(allowedDomain) || lowerUrl.includes(allowedDomain)) {
        console.log('✅✅✅ WHITELISTED DOMAIN:', domain);
        resolve(false);
        return;
      }
    }

    // ✅ NEVER block academic or government domains
    const safeDomainPatterns = ['.edu', '.ac.uk', '.edu.au', '.edu.ca', '.gov', '.gov.uk', '.ac.nz'];
    
    for (const pattern of safeDomainPatterns) {
      if (lowerDomain.endsWith(pattern)) {
        console.log('✅✅✅ ACADEMIC/GOVERNMENT DOMAIN WHITELISTED:', domain);
        resolve(false);
        return;
      }
    }

    // 2. Get user's lists and settings from storage
    chrome.storage.local.get(['whitelist', 'blacklist', 'blockIncognito'], (result) => {
      if (chrome.runtime.lastError) {
        console.error('Storage error:', chrome.runtime.lastError);
        resolve(false);
        return;
      }

      const { whitelist = [], blacklist: userBlacklist = [], blockIncognito = true } = result;

      // 3. User Blacklist Check (High Priority)
      for (const d of userBlacklist) {
        if (domainMatches(domain, d)) {
          console.log('🚫 Domain in user blacklist, BLOCKING');
          resolve(true);
          return;
        }
      }

      // 4. User Whitelist Check
      for (const d of whitelist) {
        if (domainMatches(domain, d)) {
          console.log('✅ Domain in user whitelist, allowing');
          resolve(false);
          return;
        }
      }

      // 5. Internal Whitelist Check (allows trusted sites)
      for (const d of INTERNAL_WHITELIST) {
        if (domainMatches(lowerDomain, d)) {
          console.log('✅ Domain in internal whitelist, allowing');
          resolve(false);
          return;
        }
      }

      // Guard known Reddit media CDNs before running broader checks
      if (REDDIT_MEDIA_HOSTS.includes(lowerDomain) || (lowerDomain.endsWith('.redd.it') && lowerDomain !== 'redd.it')) {
        console.log('🚫 BLOCKED: Reddit media host detected:', lowerDomain);
        resolve(true);
        return;
      }

      // ==================== AGGRESSIVE BLOCKING STARTS HERE ====================

      // 6. SEARCH QUERY CHECK - Block NSFW searches even on allowed engines
      try {
        const urlObj = new URL(url);
        const searchParamKeys = ['q', 'query', 'search', 'search_query', 'keywords', 'keyword', 'term', 's'];
        let collectedTerms = '';
        let foundParam = false;
        for (const key of searchParamKeys) {
          const values = urlObj.searchParams.getAll(key);
          for (const value of values) {
            if (value) {
              const normalizedValue = decodeURIComponent(value).toLowerCase();
              collectedTerms += ' ' + normalizedValue;
              foundParam = true;
            }
          }
        }

        const pathname = decodeURIComponent(urlObj.pathname).toLowerCase();
        if (!foundParam && pathname.includes('/search')) {
          collectedTerms += ' ' + pathname;
          foundParam = true;
        }

        if (urlObj.hash && urlObj.hash.length > 1) {
          const hashContent = decodeURIComponent(urlObj.hash.substring(1)).toLowerCase();
          if (hashContent.includes('search') || searchParamKeys.some((key) => hashContent.includes(`${key}=`))) {
            collectedTerms += ' ' + hashContent;
            foundParam = true;
          }
        }

        if (foundParam && collectedTerms.trim().length > 0) {
          for (const token of nsfwSearchTokens) {
            if (collectedTerms.includes(token)) {
              console.log(`🚫 BLOCKED: NSFW search query detected (${token})`);
              resolve(true);
              return;
            }
          }
        }
      } catch (err) {
        console.log('Search query parsing error (ignored):', err && err.message ? err.message : err);
      }
      
      // 7. DOMAIN BLOCKLIST - Check FULL URL and DOMAIN (BUT RESPECT USER WHITELIST!)
      console.log('🔍 Checking domain blocklist...');
      const combinedDomainList = getAggregatedDomainList();
      for (const blockedTerm of combinedDomainList) {
        const lowerTerm = blockedTerm.toLowerCase();
        
        // Check if domain contains the blocked term
        if (lowerDomain.includes(lowerTerm)) {
          // BUT CHECK USER WHITELIST FIRST!
          let isWhitelisted = false;
          for (const whitelistDomain of whitelist) {
            if (domainMatches(domain, whitelistDomain)) {
              console.log(`✅ Domain "${domain}" is in user whitelist, overriding blocklist match for "${blockedTerm}"`);
              isWhitelisted = true;
              break;
            }
          }
          
          if (!isWhitelisted) {
            console.log(`🚫 BLOCKED: Found "${blockedTerm}" in domain: ${domain}`);
            resolve(true);
            return;
          }
        }
        
        // Check if FULL URL contains the blocked term
        if (lowerUrl.includes(lowerTerm)) {
          // BUT CHECK USER WHITELIST FIRST!
          let isWhitelisted = false;
          for (const whitelistDomain of whitelist) {
            if (domainMatches(domain, whitelistDomain)) {
              console.log(`✅ Domain "${domain}" is in user whitelist, overriding blocklist match for "${blockedTerm}"`);
              isWhitelisted = true;
              break;
            }
          }
          
          if (!isWhitelisted) {
            console.log(`🚫 BLOCKED: Found "${blockedTerm}" in URL: ${url}`);
            resolve(true);
            return;
          }
        }
      }

  // 7.5 WILDCARD PATTERN MATCHING - Catch variations and mirrors
      console.log('🔍 Checking wildcard patterns...');
      const suspiciousPatterns = [
        /porn/i, /xxx/i, /sex/i, /nude/i, /adult/i, /nsfw/i,
        /\bxvid/i, /\bxnxx/i, /\bxham/i, /\bxxx\d/i,
        /\btube\d+/i, /porn\w+\.(?:com|net|org|tv|xxx)/i,
        /\d{2,}porn/i, /porn\d{2,}/i, /\bfap/i, /\bjizz/i,
        /\bcum/i, /\bslut/i, /\bmilf/i, /\bteen.*porn/i,
        /\bhentai/i, /\bcam.*(?:girl|show|sex)/i, /\blive.*(?:sex|cam)/i,
        /\berotic/i, /\bfetish/i, /\bbdsm/i
      ];
      
      for (const pattern of suspiciousPatterns) {
        // Only check if not in whitelist domains
        const inWhitelist = whitelist.some(d => lowerDomain.includes(d.toLowerCase()));
        if (!inWhitelist && pattern.test(lowerUrl)) {
          console.log(`🚫 BLOCKED: Matched suspicious pattern: ${pattern}`);
          resolve(true);
          return;
        }
      }

  // 8. REDDIT NSFW CHECK - Block specific NSFW subreddit paths
      if (lowerDomain.includes('reddit.com')) {
        console.log('🔍 Reddit detected, checking NSFW paths...');
        for (const nsfwPath of redditNSFWPaths) {
          if (lowerUrl.includes(nsfwPath)) {
            console.log(`🚫 BLOCKED: Reddit NSFW subreddit: ${nsfwPath}`);
            resolve(true);
            return;
          }
        }

        if (lowerUrl.includes('over18=1') || lowerUrl.includes('nsfw=1') || lowerUrl.includes('adultcontent=1')) {
          console.log('🚫 BLOCKED: Reddit NSFW flag detected in query string');
          resolve(true);
          return;
        }

        const subredditMatch = lowerUrl.match(/reddit\.com\/r\/([a-z0-9_+]+)/);
        if (subredditMatch && subredditMatch[1]) {
          const subredditName = subredditMatch[1];
          for (const keyword of redditNSFWKeywords) {
            if (subredditName.includes(keyword)) {
              console.log(`🚫 BLOCKED: Reddit subreddit matched NSFW keyword (${keyword}) -> ${subredditName}`);
              resolve(true);
              return;
            }
          }
        }
      }

  // 9. EXPLICIT PHRASE CHECK - Check FULL URL for multi-word adult terms
      // Skip search engines (don't block search results)
      const isSearchEngine = (
        lowerDomain.includes('google.com') ||
        lowerDomain.includes('bing.com') ||
        lowerDomain.includes('duckduckgo.com') ||
        lowerDomain.includes('yahoo.com') ||
        lowerDomain.includes('yandex.com')
      );
      
      if (!isSearchEngine) {
        console.log('🔍 Checking explicit phrases...');
        for (const phrase of explicitPhrases) {
          const lowerPhrase = phrase.toLowerCase();
          
          // Check domain
          if (lowerDomain.includes(lowerPhrase)) {
            console.log(`🚫 BLOCKED: Explicit phrase "${phrase}" in domain`);
            resolve(true);
            return;
          }
          
          // Check full URL
          if (lowerUrl.includes(lowerPhrase)) {
            console.log(`🚫 BLOCKED: Explicit phrase "${phrase}" in URL`);
            resolve(true);
            return;
          }
        }
      }

      // If no rules match, don't block
      console.log('✅ No blocking rules matched, allowing');
      resolve(false);
    });
  });
}

// --- STREAK MANAGEMENT ---
// Streak counts consecutive CLEAN DAYS (days without blocks)
// If user gets blocked, streak resets to 0
function updateStreak(forceReport = false) {
  chrome.storage.local.get(['streak', 'lastStreakCheck', 'enableStreakNotifications', 'lastMilestoneNotified'], (result) => {
    const today = new Date().toDateString();
    const lastCheck = result.lastStreakCheck || '';
    let streak = result.streak || { count: 1, lastUpdate: today, longestStreak: 1 };
    const enableStreakNotifications = result.enableStreakNotifications !== false; // Default true
    const lastMilestoneNotified = result.lastMilestoneNotified || 0;
    
    // Skip if already checked today - UNLESS forcing a report
    if (lastCheck === today && !forceReport) {
      console.log('Streak already checked today, skipping');
      return;
    }
    
    // Calculate how many days have passed since last check
    const lastCheckDate = lastCheck ? new Date(lastCheck) : new Date();
    const todayDate = new Date(today);
    const daysDifference = Math.floor((todayDate - lastCheckDate) / (1000 * 60 * 60 * 24));
    
    console.log('Streak check - Days since last check:', daysDifference);
    
    // If it's been exactly 1 day (or first check after install), increment streak
    if (daysDifference === 1 || !lastCheck) {
      // User survived yesterday without major blocks - increment streak
      streak.count += 1;
      streak.lastUpdate = today;
      
      // Update longest streak
      if (streak.count > (streak.longestStreak || 0)) {
        streak.longestStreak = streak.count;
      }
      
      console.log('Streak incremented to:', streak.count);
      
      // Milestone notifications: 7, 14, 30, 60, 90 days
      const milestones = [7, 14, 30, 60, 90];
      const reachedMilestone = milestones.find(m => streak.count === m && lastMilestoneNotified < m);
      
      chrome.storage.local.set({ 
        streak, 
        lastStreakCheck: today,
        lastMilestoneNotified: reachedMilestone || lastMilestoneNotified
      }, () => {
        console.log('Streak updated:', streak);
        
        // Update badge text
        chrome.action.setBadgeText({ text: streak.count.toString() });
        chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
        
        // Show milestone notification
        if (enableStreakNotifications && reachedMilestone) {
          const messages = {
            7: "🌟 7 Days Clean! You are stronger than you think. Allah loves those who fight their desires!",
            14: "🔥 14 Days Clean! Your willpower is growing. Keep protecting your heart!",
            30: "💎 30 Days Clean! One month of purity! The angels are proud of you!",
            60: "👑 60 Days Clean! Two months of victory! You are becoming unstoppable!",
            90: "🏆 90 Days Clean! THREE MONTHS! You have achieved something incredible! Never give up!"
          };
          
          const milestoneMessage = messages[reachedMilestone] || 'Keep going strong! 💪';
          showNotification('🎉 Purity Milestone Achieved!', milestoneMessage);
          
          // Send milestone notification to Telegram
          chrome.storage.local.get(['telegramChatId', 'telegramBotToken', 'telegramPartnerChatId', 'partnerChatId'], (tgResult) => {
            const partnerId = tgResult.telegramPartnerChatId || tgResult.partnerChatId;
            if (tgResult.telegramChatId && tgResult.telegramBotToken) {
              const telegramClient = new TelegramClient(tgResult.telegramBotToken, tgResult.telegramChatId, partnerId);
              telegramClient.sendMilestoneNotification(reachedMilestone, milestoneMessage)
                .then(() => console.log('Milestone notification sent to Telegram'))
                .catch(err => console.error('Failed to send milestone to Telegram:', err));
            }
          });
        }
        
        // Daily report will be sent by sendDailyTelegramReport() below
        // (which includes streak reminder) - no need to send duplicate here
        
        // Send comprehensive daily report (includes streak reminder)
        sendDailyTelegramReport();
      });
    } else if (daysDifference > 1) {
      // More than 1 day has passed - reset streak
      console.log('More than 1 day passed, resetting streak');
      streak.count = 1; // Reset to 1 (fresh start)
      streak.lastUpdate = today;
      
      chrome.storage.local.set({ 
        streak, 
        lastStreakCheck: today 
      }, () => {
        console.log('Streak reset due to missed days:', streak);
        // Update badge text
        chrome.action.setBadgeText({ text: streak.count.toString() });
        chrome.action.setBadgeBackgroundColor({ color: '#10b981' });

        // Send report even on reset
        if (forceReport) sendDailyTelegramReport();
      });
    } else if (forceReport) {
      // Same day (daysDifference === 0), but forced report requested
      console.log('Sending forced daily report (streak unchanged)');
      sendDailyTelegramReport();
    }
  });
}

// --- DAILY TELEGRAM REPORT ---
// Send comprehensive daily report to partner via Telegram
function sendDailyTelegramReport() {
  console.log('📊 Sending daily Telegram report to partner...');
  
  chrome.storage.local.get([
    'telegramChatId', 
    'telegramBotToken', 
    'partnerChatId',
    'streak',
    'relapseCount',
    'blockCount',
    'partnerStreak'
  ], (result) => {
    // Check if Telegram is configured with partner (support legacy + new key)
    const partnerId = result.telegramPartnerChatId || result.partnerChatId;
    if (!result.telegramChatId || !result.telegramBotToken || !partnerId) {
      console.log('?s??,? Telegram or partner not fully configured, skipping daily report');
      return;
    }
    
    const telegramClient = new TelegramClient(
      result.telegramBotToken, 
      result.telegramChatId, 
      partnerId
    );
    const myStreak = result.streak?.count || 0;
    const partnerStreak = result.partnerStreak || 0;
    const myRelapses = result.relapseCount || 0;
    const myBlocks = result.blockCount || 0;
    
    // Send streak reminder (includes both streaks)
    telegramClient.sendDailyStreakReminder(myStreak, partnerStreak)
      .then(() => {
        console.log('✅ Daily Telegram report sent successfully');
        
        // Also send detailed stats to partner if they have many blocks
        if (myBlocks > 5) {
          const stats = {
            streak: myStreak,
            relapses: myRelapses,
            blocksAttempted: myBlocks,
            relapseTimes: myRelapses
          };
          
          return telegramClient.sendDailyCheckIn(stats);
        }
      })
      .then(() => {
        if (myBlocks > 5) {
          console.log('✅ Detailed stats sent to partner');
        }
      })
      .catch(err => {
        console.error('❌ Failed to send daily Telegram report:', err);
      });
  });
}

// Streak alarm is now set up in the unified alarms section above

// --- MONTHLY GOAL TRACKING ---
function updateMonthlyGoal() {
  chrome.storage.local.get(['monthlyGoal'], (result) => {
    const currentMonth = new Date().getMonth();
    let goalData = result.monthlyGoal;
    
    if (goalData && goalData.month === currentMonth) {
      // Same month, increment count
      goalData.count = (goalData.count || 0) + 1;
      chrome.storage.local.set({ monthlyGoal: goalData });
    }
  });
}

// --- CORE EVENT LISTENERS ---
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  try {
    // Check both 'loading' and 'complete' status to catch all navigation events
    if ((changeInfo.status === 'loading' || changeInfo.status === 'complete') && tab.url) {
      console.log('Tab updated:', tabId, changeInfo.status, tab.url, 'Incognito:', tab.incognito);
      
      // Skip our own block page
      if (tab.url.includes(chrome.runtime.getURL("block_page.html"))) {
        console.log('Skipping our own block page');
        return;
      }
      
      // Skip if already blocking this tab
      if (blockingInProgress.has(tabId)) {
        console.log('Already blocking this tab, skipping');
        return;
      }

      // For incognito tabs, always block (can't reliably sync settings due to split mode)
      if (tab.incognito) {
        console.log('Incognito mode detected - proceeding with block check');
        performBlockCheck(tabId, tab);
        return;
      }
      
      // For normal tabs, check the blockIncognito setting (for future use)
      // Not incognito, proceed with normal blocking
      performBlockCheck(tabId, tab);
    }
  } catch (error) {
    console.error('❌ Error in chrome.tabs.onUpdated listener:', error);
    console.error('Error details:', error.message, error.stack);
  }
});

function attachNavigationWatchers() {
  if (!chrome.webNavigation || !chrome.webNavigation.onCommitted || typeof chrome.webNavigation.onCommitted.addListener !== 'function') {
    console.log('ℹ️ chrome.webNavigation API not available');
    return;
  }

  const handler = (details) => {
    try {
      if (!details || details.frameId !== 0) {
        return;
      }
      if (!details.url || !details.url.startsWith('http')) {
        return;
      }
      chrome.tabs.get(details.tabId, (tabInfo) => {
        if (chrome.runtime.lastError || !tabInfo) {
          return;
        }
        const syntheticTab = {
          url: details.url,
          incognito: tabInfo.incognito
        };
        performBlockCheck(details.tabId, syntheticTab);
      });
    } catch (error) {
      console.log('webNavigation handler error (ignored):', error && error.message ? error.message : error);
    }
  };

  const filter = { url: [{ schemes: ['http', 'https'] }] };
  chrome.webNavigation.onCommitted.addListener(handler, filter);

  if (chrome.webNavigation.onHistoryStateUpdated && typeof chrome.webNavigation.onHistoryStateUpdated.addListener === 'function') {
    chrome.webNavigation.onHistoryStateUpdated.addListener(handler, filter);
  }
}

attachNavigationWatchers();

// Helper function to perform the actual blocking check
async function performBlockCheck(tabId, tab) {
    if (!tab || !tab.url) {
      return;
    }

    if (blockingInProgress.has(tabId)) {
      console.log('⏳ Block already in progress for tab', tabId);
      return;
    }

    blockingInProgress.add(tabId);

    let shouldBlock = false;
    try {
      shouldBlock = await shouldBlockUrl_V2(tab.url);
      console.log('Should block result:', shouldBlock);

      if (shouldBlock) {
        console.log('🚫 BLOCKING URL:', tab.url);
        
        // CALCULATE STATS IN MEMORY FIRST (no race condition)
        const storageData = await chrome.storage.local.get(['blockCount', 'streak', 'victoryLog', 'enableSadaqah', 'sadaqahAmount', 'sadaqahOwed', 'weeklyBlocks', 'lastCelebratedStreak']);
        const newCount = (storageData.blockCount || 0) + 1;
        const currentStreak = storageData.streak || { count: 0, lastUpdate: new Date().toDateString(), longestStreak: 0 };
        
        // Update weekly blocks for graph
        const today = new Date().toDateString();
        const weeklyBlocks = storageData.weeklyBlocks || {};
        weeklyBlocks[today] = (weeklyBlocks[today] || 0) + 1;
        
        // STREAK LOGIC: Blocking is a VICTORY, not a failure!
        // If streak is 0 (or undefined), set to 1 (First Victory)
        // If streak > 0, keep it (it increments daily via updateStreak)
        let newStreak = currentStreak;
        if (!newStreak.count || newStreak.count === 0) {
           newStreak = {
              count: 1,
              lastUpdate: today,
              longestStreak: Math.max(1, currentStreak.longestStreak || 0)
           };
        }
        
        // Check if this is the FIRST VICTORY (first block ever or after celebrating)
        const isFirstVictory = (storageData.lastCelebratedStreak === undefined || storageData.lastCelebratedStreak === 0) && newStreak.count === 1;
        
        // Log this victory automatically (USE SAME FORMAT AS block_page.js to prevent duplicates!)
        const victoryLog = storageData.victoryLog || [];
        const now = Date.now();
        victoryLog.unshift({
          id: now,
          timestamp: new Date(now).toISOString(),
          blockedUrl: tab.url,
          domain: new URL(tab.url).hostname,
          userNote: null,
          note: 'Auto-logged victory: Blocked a temptation.',
          type: 'auto'
        });
        
        // Keep only last 50 entries
        if (victoryLog.length > 50) victoryLog.pop();
        
        // BUILD URL WITH STATS (instant display, no race condition)
        const blockPageUrl = chrome.runtime.getURL("block_page.html") + 
          "?blocked=" + encodeURIComponent(tab.url) +
          "&streak=" + newStreak.count +
          "&count=" + newCount +
          "&firstVictory=" + (isFirstVictory ? 'true' : 'false');
        
        console.log('📊 Stats passed via URL:', { streak: newStreak.count, count: newCount, firstVictory: isFirstVictory });
        
        // BRAVE FIX: Use remove + create instead of update (Brave blocks chrome.tabs.update redirects)
        // Robust fallback: if tabs.get fails (tab closed/changed), still open block page
        if (!chrome.tabs || typeof chrome.tabs.create !== 'function') {
          console.log('⚠️ chrome.tabs API not available; skipping block UI');
          blockingInProgress.delete(tabId);
          return;
        }

        chrome.tabs.get(tabId, (tabInfo) => {
          if (chrome.runtime.lastError || !tabInfo) {
            const msg = chrome.runtime.lastError && chrome.runtime.lastError.message ? chrome.runtime.lastError.message : 'unknown';
            console.warn('Error getting tab; falling back to simple create. Reason:', msg);
            // Fallback: create the block page without relying on the original tab info
            chrome.tabs.create({ url: blockPageUrl, active: true }, () => {
              if (chrome.runtime.lastError) {
                console.warn('Fallback block tab creation failed:', chrome.runtime.lastError.message);
              }
              chrome.tabs.remove(tabId, () => {
                if (chrome.runtime.lastError) {
                  console.log('Note: original tab already gone during fallback:', chrome.runtime.lastError.message);
                }
              });
              blockingInProgress.delete(tabId);
            });
            return;
          }

          // Create new tab with block page next to original
          chrome.tabs.create({
            url: blockPageUrl,
            active: true,
            index: tabInfo.index,
            openerTabId: tabInfo.openerTabId,
            windowId: tabInfo.windowId
          }, () => {
            if (chrome.runtime.lastError) {
              console.warn('Block tab creation failed:', chrome.runtime.lastError.message);
            }
            chrome.tabs.remove(tabId, () => {
              if (chrome.runtime.lastError) {
                console.log('Note: original tab already gone:', chrome.runtime.lastError.message);
              }
            });
            blockingInProgress.delete(tabId);
          });
        });

        // Update statistics AFTER redirecting (save to storage now)
        const updates = {
          blockCount: newCount,
          streak: newStreak,
          weeklyBlocks: weeklyBlocks,
          victoryLog: victoryLog
        };
        
        // Mark first victory as celebrated so it doesn't show again
        if (isFirstVictory) {
          updates.lastCelebratedStreak = 1;
        }
        
        // Add Sadaqah if enabled
        if (storageData.enableSadaqah === true) {
          const sadaqahAmount = storageData.sadaqahAmount || 5;
          const currentOwed = storageData.sadaqahOwed || 0;
          updates.sadaqahOwed = currentOwed + sadaqahAmount;
        }
        
        chrome.storage.local.set(updates, () => {
           console.log('✅ Stats saved to storage:', updates);
           
           // Update badge text
           chrome.action.setBadgeText({ text: newStreak.count.toString() });
           chrome.action.setBadgeBackgroundColor({ color: '#10b981' }); // Green for victory
           
           // Broadcast update to ALL open extension pages (popup, options)
           try {
             chrome.runtime.sendMessage({ 
                type: 'statsUpdated', 
                blockCount: newCount,
                streak: newStreak.count,
                sadaqahOwed: updates.sadaqahOwed || 0
             }).catch(() => {
               // Ignore "Receiving end does not exist" error if no pages are open
             });
           } catch (e) {
             // Ignore errors
           }
        });
          
        // Update monthly goal
        updateMonthlyGoal();
        
        // 🚨 SEND TELEGRAM ALERT TO PARTNER - They tried to visit a bad site!
        try {
          if (TelegramClient && typeof TelegramClient !== 'undefined') {
            const telegramClient = new TelegramClient();
            
            console.log('🔧 Initializing Telegram client...');
            const initSuccess = await telegramClient.init();
            console.log('🔧 Init result:', initSuccess);
            console.log('🔧 isConfigured:', telegramClient.isConfigured());
            console.log('🔧 Bot Token:', telegramClient.botToken ? 'SET' : 'MISSING');
            console.log('🔧 Chat ID:', telegramClient.chatId ? 'SET' : 'MISSING');
            console.log('🔧 Partner Chat ID:', telegramClient.partnerChatId ? 'SET' : 'MISSING');
            
            const blockedDomain = getDomainFromUrl(tab.url);
            const partnerReady = initSuccess && telegramClient.isConfigured();
            const selfReady = typeof telegramClient.isSelfConfigured === "function"
              ? telegramClient.isSelfConfigured()
              : !!(telegramClient.botToken && telegramClient.chatId);

            if (partnerReady) {
              const alertResult = await telegramClient.sendBlockAlert(0, blockedDomain, newStreak.count);
              console.log("Telegram block alert result:", alertResult);
            }

            if (selfReady) {
              const selfResult = await telegramClient.sendSelfBlockAlert(blockedDomain, newStreak.count);
              console.log("Telegram self-alert result:", selfResult);
            }

            if (!partnerReady && !selfReady) {
              console.log("Telegram not configured - missing:", {
                token: !telegramClient.botToken,
                chatId: !telegramClient.chatId,
                partnerChatId: !telegramClient.partnerChatId
              });
            }
          } else {
            console.log("Telegram client not available");
          }
        } catch (error) {
          // Silently handle Telegram errors - extension still works without it
          console.error('⚠️ Telegram alert error:', error);
        }
        
        // Show notification
        let notifMessage = `Harmful page blocked! Stay strong! 💪`;
        
        if (storageData.enableSadaqah === true) {
          const sadaqahAmount = storageData.sadaqahAmount || 5;
          const newOwed = (storageData.sadaqahOwed || 0) + sadaqahAmount;
          notifMessage += `\n💰 You now owe $${newOwed} in Sadaqah.`;
        }
        
        showNotification('🛡️ Purity Guard', notifMessage);
      }
      if (!shouldBlock) {
        blockingInProgress.delete(tabId);
      }
    } catch (error) {
      console.error('Error in blocking logic:', error);
      blockingInProgress.delete(tabId);
    }
}

// Clean up blocking state when tab is removed
chrome.tabs.onRemoved.addListener((tabId) => {
  blockingInProgress.delete(tabId);
  console.log('Cleaned up blocking state for closed tab:', tabId);
});

// --- CONTEXT MENU FUNCTIONALITY ---
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const domain = getDomainFromUrl(tab.url);
  if (!domain) {
    console.log('Could not extract domain for context menu action');
    return;
  }

  console.log('Context menu clicked:', info.menuItemId, 'for domain:', domain);

  chrome.storage.local.get(['whitelist', 'blacklist'], (result) => {
    let { whitelist = [], blacklist = [] } = result;

    if (info.menuItemId === "addToWhitelist") {
      // Remove from blacklist if present
      blacklist = blacklist.filter(d => d !== domain);
      // Add to whitelist if not already present
      if (!whitelist.includes(domain)) {
        whitelist.push(domain);
      }
      console.log('Added to whitelist:', domain);
    } else if (info.menuItemId === "addToBlacklist") {
      // Remove from whitelist if present
      whitelist = whitelist.filter(d => d !== domain);
      // Add to blacklist if not already present
      if (!blacklist.includes(domain)) {
        blacklist.push(domain);
      }
      console.log('Added to blacklist:', domain);
    }

    chrome.storage.local.set({ whitelist, blacklist }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving lists:', chrome.runtime.lastError);
      } else {
        console.log('Successfully updated lists');
        showNotification('Purity Guard', `Successfully updated lists for ${domain}.`);
      }
    });
  });
});

// --- INSTALLATION & SETUP ---
// (Unified into the main onInstalled listener above)
// chrome.runtime.onInstalled.addListener((details) => { ... });

chrome.storage.onChanged.addListener((changes, areaName) => {
  try {
    if (areaName === 'local') {
      if (mirroringFromSync) {
        return;
      }
      const updates = {};
      for (const [key, change] of Object.entries(changes)) {
        if (!PERSISTED_STATE_SET.has(key) || change.newValue === undefined) {
          continue;
        }
        updates[key] = change.newValue;
      }
      if (Object.keys(updates).length > 0) {
        mirroringFromLocal = true;
        chrome.storage.sync.set(updates, () => {
          mirroringFromLocal = false;
        });
        schedulePocketbaseBackup();
      }
    } else if (areaName === 'sync') {
      if (Object.prototype.hasOwnProperty.call(changes, REMOTE_BLOCKLIST_SOURCE_KEY)) {
        const newValue = changes[REMOTE_BLOCKLIST_SOURCE_KEY].newValue;
        if (!newValue) {
          runtimeRemoteDomains = [];
          chrome.storage.local.remove(REMOTE_BLOCKLIST_LOCAL_KEY, () => {
            installDynamicBlockingRules();
          });
          schedulePocketbaseBackup();
        } else {
          refreshRemoteBlocklist(true);
        }
      }

      if (mirroringFromLocal) {
        return;
      }
      const updates = {};
      for (const [key, change] of Object.entries(changes)) {
        if (!PERSISTED_STATE_SET.has(key) || change.newValue === undefined) {
          continue;
        }
        updates[key] = change.newValue;
      }
      if (Object.keys(updates).length > 0) {
        mirroringFromSync = true;
        chrome.storage.local.set(updates, () => {
          mirroringFromSync = false;
        });
      }
    }
  } catch (error) {
    console.log('Storage mirror error (ignored):', error && error.message ? error.message : error);
  }
});

// --- DEBUG FUNCTIONS ---
// Add these for debugging - you can remove them later
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getLists') {
    chrome.storage.local.get(['whitelist', 'blacklist'], (result) => {
      sendResponse(result);
    });
    return true; // Indicates we'll send a response asynchronously
  }
  
  if (request.action === 'testBlocking') {
    shouldBlockUrl_V2(request.url).then(shouldBlock => {
      sendResponse({ shouldBlock, url: request.url });
    });
    return true;
  }
  
  // NEW: Handle content script URL checks
  if (request.action === 'checkUrl') {
    shouldBlockUrl_V2(request.url).then(shouldBlock => {
      console.log('📨 Content script check for', request.url, ':', shouldBlock);
      sendResponse({ shouldBlock, url: request.url });
    }).catch(error => {
      console.error('Error checking URL from content script:', error);
      sendResponse({ shouldBlock: false, url: request.url });
    });
    return true;
  }

  if (request.action === 'refreshRemoteBlocklist') {
    const force = request.force === true;
    refreshRemoteBlocklist(force).then((result) => {
      sendResponse(result || { success: true, updated: false, reason: 'noop' });
    }).catch((error) => {
      sendResponse({ success: false, updated: false, reason: error && error.message ? error.message : String(error) });
    });
    return true;
  }
});

// ============================================
// ACCOUNTABILITY PARTNER FUNCTIONS
// ============================================

// Check for partner alerts periodically
async function checkPartnerAlerts() {
  // PocketBase alerts disabled - extension now uses Telegram-only mode for partner alerts
  return;
}

// Partner alerts alarm is now set up in the unified alarms section above

console.log('✅ Purity Guard background.js v2.8 fully loaded and ready!');
console.log('📊 All event listeners registered successfully');

// Force reload: 2025-11-20 (Whitelist fix + Daily Telegram reports)
