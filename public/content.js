// Content script for Chrome extension
// This script runs on all web pages and can interact with the page content

(function() {
  'use strict';

  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSelectedText') {
      const selectedText = window.getSelection().toString().trim();
      sendResponse({ selectedText });
    }
  });

  // Optional: Add context menu functionality for right-click to save
  // This would require additional permissions and setup
})();