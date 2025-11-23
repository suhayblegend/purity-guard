/**
 * Managed Credentials for Purity Guard Extension
 * SECURITY: This file stores sensitive credentials separately from main code
 * Users viewing source code in browser won't easily see these values
 * 
 * IMPORTANT: Before publishing updates, populate these values:
 * 1. TELEGRAM_BOT_TOKEN - Your @BotFather token
 * 2. Keep this file minified/obfuscated in production builds
 */

if (typeof globalThis !== 'undefined') {
    // PocketBase credentials (disabled - no longer used)
    globalThis.POCKETBASE_MANAGED_CREDENTIALS = globalThis.POCKETBASE_MANAGED_CREDENTIALS || {
        email: '',
        password: '',
        token: '',
        tokenExpiresAt: 0
    };

    // Telegram Bot Token - Users provide their own tokens via settings
    // No default token needed - extension works with user-created bots only
    globalThis.TELEGRAM_BOT_TOKEN = '';
}
