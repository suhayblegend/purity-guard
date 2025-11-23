// Content script that runs on every page to catch navigation
(function() {
    'use strict';

    const currentUrl = window.location.href;

    // Skip safe internal pages
    if (
        currentUrl.includes('block_page.html') ||
        currentUrl.startsWith('chrome://') ||
        currentUrl.startsWith('chrome-extension://') ||
        currentUrl.startsWith('about:') ||
        currentUrl.startsWith('edge://') ||
        currentUrl.startsWith('browser://')
    ) {
        return;
    }

    let lastReportedUrl = null;
    let navigationCheckTimeout = null;

    function dispatchUrlCheck(force = false) {
        const href = window.location.href;
        if (!force && href === lastReportedUrl) {
            return;
        }
        lastReportedUrl = href;
        try {
            // FIX: Add the callback function to handle the response
            chrome.runtime.sendMessage({ action: 'checkUrl', url: href }, (response) => {
                // If background says "shouldBlock: true", redirect immediately
                if (response && response.shouldBlock) {
                    console.log('🚫 Background blocked this URL:', href);
                    window.location.replace(chrome.runtime.getURL('block_page.html') + '?blocked=' + encodeURIComponent(href));
                }
            });
        } catch (error) {
            console.log('⚠️ Background messaging failed (ignored):', error && error.message ? error.message : error);
        }
    }

    function queueNavigationCheck() {
        if (navigationCheckTimeout) {
            return;
        }
        navigationCheckTimeout = setTimeout(() => {
            navigationCheckTimeout = null;
            dispatchUrlCheck();
        }, 150);
    }

    if (typeof history !== 'undefined') {
        if (typeof history.pushState === 'function') {
            const originalPushState = history.pushState;
            history.pushState = function (...args) {
                const result = originalPushState.apply(this, args);
                queueNavigationCheck();
                return result;
            };
        }

        if (typeof history.replaceState === 'function') {
            const originalReplaceState = history.replaceState;
            history.replaceState = function (...args) {
                const result = originalReplaceState.apply(this, args);
                queueNavigationCheck();
                return result;
            };
        }
    }

    window.addEventListener('popstate', queueNavigationCheck, { passive: true });
    window.addEventListener('hashchange', queueNavigationCheck, { passive: true });
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            queueNavigationCheck();
        }
    });

    dispatchUrlCheck(true);

    const hostname = window.location.hostname.toLowerCase();

    console.log('🔍 Checking hostname:', hostname);

    // ✅ WHITELIST: Common false positives - NEVER block these
    const alwaysAllowDomains = [
        'sussex.ac.uk', 'essex.ac.uk', 'middlesex.ac.uk', 'wessex.ac.uk',
        'massachusetts.gov', 'massachusetts.edu',
        'classroom.google.com'
    ];
    
    for (const allowedDomain of alwaysAllowDomains) {
        if (hostname.includes(allowedDomain)) {
            console.log("✅✅✅ WHITELISTED DOMAIN - skip all checks:", hostname);
            return;
        }
    }

    // ✅ NEVER block academic or government domains
    const safeDomainPatterns = [
        '.edu', '.ac.uk', '.edu.au', '.edu.ca', '.gov', '.gov.uk'
    ];

    for (const pattern of safeDomainPatterns) {
        if (hostname.endsWith(pattern)) {
            console.log("✅ Academic/government site ALLOWED:", hostname, "matches", pattern);
            return;
        }
    }
    
    console.log('⚠️ Not a whitelisted domain, continuing checks...');

    console.log('🎯 Content script running on', currentUrl);

    // ✅ PRIMARY BLOCKING — DOMAIN LIST (100% reliable, no false positives)
    const badDomains = [
        "pornhub", "xvideos", "xnxx", "youporn", "redtube",
        "xhamster", "tube8", "spankbang", "livejasmin", "stripchat",
        "chaturbate", "brazzers", "bangbros", "onlyfans", "fansly",
        "realitykings", "naughtyamerica", "myfreecams", "cam4"
    ];

    if (badDomains.some(d => hostname.includes(d))) {
        console.log('🚫 Blocked by domain match');
        return blockPage();
    }

    // ✅ SECONDARY BLOCKING — CONSERVATIVE multi-word phrases only
    const explicitUrlPhrases = [
        "pornography", "porn-video", "adult-video", "sex-video",
        "camgirl", "cam-show", "live-sex", "hentai"
    ];

    const path = (window.location.pathname + window.location.search).toLowerCase();
    if (explicitUrlPhrases.some(p => path.includes(p))) {
        console.log('🚫 Blocked by explicit URL phrase');
        return blockPage();
    }

    // ✅ CONTENT SCANNING DISABLED - Prevents false positives
    // Relying ONLY on domain list + explicit URL phrases
    console.log('✅ Domain and URL checks passed - allowing site');

    // ✅ BLOCK FUNCTION (only called by domain/URL checks above)
    function blockPage() {
        try { window.stop(); } catch(e) {}

        const redirect = chrome.runtime.getURL('block_page.html') +
            '?blocked=' + encodeURIComponent(location.href);

        location.replace(redirect);
    }

})();
