// FitCheck Background Service Worker
// Handles extension lifecycle and smart content script injection

// Known shopping domains - these always get the content script
const KNOWN_SHOPPING_DOMAINS = [
  'asos.com',
  'zara.com',
  'boohoo.com',
  'prettylittlething.com',
  'hm.com',
  'nordstrom.com',
  'macys.com',
  'uniqlo.com',
  'gap.com',
  'forever21.com',
  'urbanoutfitters.com',
  'topshop.com',
  'riverisland.com',
  'newlook.com',
  'missguided.com',
  'nastygal.com',
  'lulus.com',
  'fashionnova.com',
  'shein.com',
  'amazon.com',
  'amazon.co.uk',
  'amazon.de',
  'amazon.fr',
  'levis.com',
  'diesel.com',
  'wrangler.com',
  'target.com',
  'walmart.com',
  'kohls.com',
  'jcpenney.com',
  'oldnavy.com',
  'bananarepublic.com',
  'athleta.com',
  'anthropologie.com',
  'freepeople.com',
  'express.com',
  'abercrombie.com',
  'hollisterco.com',
  'ae.com',
  'americaneagle.com',
  'pacsun.com',
  'tillys.com',
  'zumiez.com',
  'hottopic.com',
  'torrid.com',
  'lanebryant.com',
  'calvinklein.com',
  'tommy.com',
  'ralphlauren.com',
  'nike.com',
  'adidas.com',
  'puma.com',
  'reebok.com',
  'underarmour.com',
  'lululemon.com',
  'gymshark.com',
  'revolve.com',
  'ssense.com',
  'farfetch.com',
  'net-a-porter.com',
  'mytheresa.com',
  'matchesfashion.com',
  'shopbop.com',
  'saksfifthavenue.com',
  'bloomingdales.com',
  'neimanmarcus.com',
  'bergdorfgoodman.com',
  'selfridges.com',
  'harrods.com',
  'johnlewis.com',
  'debenhams.com',
  'next.co.uk',
  'marksandspencer.com',
  'very.co.uk',
  'littlewoods.com',
  'jdsports.com',
  'footlocker.com',
  'finishline.com',
  'dickssportinggoods.com',
  'zappos.com',
  'dsw.com',
  'shoecarnival.com',
  'motelrocks.com',
  'princesspolly.com'
];

// URL patterns that suggest shopping/e-commerce
const SHOPPING_URL_PATTERNS = [
  /\/product[s]?\//i,
  /\/item[s]?\//i,
  /\/p\//i,
  /\/pd\//i,
  /\/dp\//i,
  /\/shop\//i,
  /\/buy\//i,
  /\/store\//i,
  /\/(clothing|shoes|accessories|dress|top|shirt|pants|jeans|skirt|jacket|coat|sweater|hoodie|romper|jumpsuit)\//i,
  /[?&]productid=/i,
  /[?&]sku=/i,
  /[?&]itemid=/i,
  /\/collections?\//i,
  /\/catalog\//i,
  /\/en-[a-z]{2}\/[a-z]+-p\d+/i,  // Zara-style URLs
  /\/[a-z]{2}\/[a-z-]+-\d+\.html/i,  // H&M-style URLs
  /\/-\/[A-Z]\d+/i,  // Various EU retailers
  /\/goods\//i,
  /\/merchandise\//i,
  /\/apparel\//i
];

// Domains to never inject on (non-shopping sites)
const BLOCKED_DOMAINS = [
  'google.com',
  'google.',
  'youtube.com',
  'facebook.com',
  'twitter.com',
  'x.com',
  'instagram.com',
  'tiktok.com',
  'reddit.com',
  'linkedin.com',
  'github.com',
  'stackoverflow.com',
  'wikipedia.org',
  'netflix.com',
  'spotify.com',
  'discord.com',
  'slack.com',
  'zoom.us',
  'microsoft.com',
  'apple.com',
  'docs.google.com',
  'drive.google.com',
  'mail.google.com',
  'outlook.com',
  'yahoo.com',
  'bing.com',
  'duckduckgo.com',
  'twitch.tv',
  'pinterest.com',
  'tumblr.com',
  'medium.com',
  'substack.com',
  'notion.so',
  'figma.com',
  'canva.com',
  'dropbox.com',
  'icloud.com',
  'paypal.com',
  'stripe.com',
  'bank',
  'chase.com',
  'wellsfargo.com',
  'bankofamerica.com',
  'capitalone.com'
];

// Track which tabs we've already injected into
const injectedTabs = new Set();

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[FitCheck] Extension installed');
    chrome.tabs.create({ url: 'popup.html' });
  } else if (details.reason === 'update') {
    console.log('[FitCheck] Extension updated to', chrome.runtime.getManifest().version);
  }
});

// Check if URL is likely a shopping site
function isShoppingSite(url) {
  if (!url || !url.startsWith('http')) return false;

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Check blocked domains first
    for (const blocked of BLOCKED_DOMAINS) {
      if (hostname.includes(blocked)) {
        return false;
      }
    }

    // Check known shopping domains
    for (const domain of KNOWN_SHOPPING_DOMAINS) {
      if (hostname.includes(domain)) {
        return true;
      }
    }

    // Check URL patterns for unknown domains
    for (const pattern of SHOPPING_URL_PATTERNS) {
      if (pattern.test(url)) {
        return true;
      }
    }

    return false;
  } catch (e) {
    return false;
  }
}

// Inject content script into tab
async function injectContentScript(tabId) {
  // Skip if already injected
  if (injectedTabs.has(tabId)) return;

  // Check if user has measurements saved
  const { measurements } = await chrome.storage.local.get('measurements');
  if (!measurements) {
    console.log('[FitCheck] No measurements saved, skipping injection');
    return;
  }

  try {
    // Inject CSS first
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ['content.css']
    });

    // Then inject JS
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    });

    injectedTabs.add(tabId);
    console.log('[FitCheck] Injected content script into tab', tabId);
  } catch (e) {
    // Silently fail - tab might not be accessible
    console.log('[FitCheck] Could not inject into tab', tabId, e.message);
  }
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only check when page is fully loaded
  if (changeInfo.status !== 'complete') return;

  // Check if this looks like a shopping site
  if (tab.url) {
    const isShopping = isShoppingSite(tab.url);
    console.log('[FitCheck] Tab loaded:', tab.url.substring(0, 50), '| Shopping site:', isShopping);
    if (isShopping) {
      injectContentScript(tabId);
    }
  }
});

// Clean up when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  injectedTabs.delete(tabId);
});

// Clean up when tab navigates or reloads
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  // Clear on URL change OR when page starts loading (covers refresh)
  if (changeInfo.url || changeInfo.status === 'loading') {
    injectedTabs.delete(tabId);
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getMeasurements') {
    chrome.storage.local.get('measurements').then(data => {
      sendResponse(data.measurements || null);
    });
    return true;
  }
});

console.log('[FitCheck] Background service worker loaded');
