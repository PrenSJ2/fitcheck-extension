// FitCheck Background Service Worker
// Handles extension lifecycle and events

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[FitCheck] Extension installed');
    
    // Open welcome page
    chrome.tabs.create({
      url: 'popup.html'
    });
  } else if (details.reason === 'update') {
    console.log('[FitCheck] Extension updated to', chrome.runtime.getManifest().version);
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getMeasurements') {
    chrome.storage.local.get('measurements').then(data => {
      sendResponse(data.measurements || null);
    });
    return true; // Keep channel open for async response
  }
});

console.log('[FitCheck] Background service worker loaded');
