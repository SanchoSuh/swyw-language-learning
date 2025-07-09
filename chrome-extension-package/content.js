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
    
    if (request.action === 'checkAuth') {
      // Check for authentication state on SWYW web app
      if (window.location.href.includes('extraordinary-granita-59f6fd.netlify.app')) {
        const authState = checkAuthState();
        sendResponse({ authState });
      } else {
        sendResponse({ authState: null });
      }
    }
  });

  function checkAuthState() {
    // Check for various authentication tokens
    const possibleTokens = [
      'supabase.auth.token',
      'userSession',
      'authToken',
      'user',
      'session'
    ];
    
    for (const tokenKey of possibleTokens) {
      const token = localStorage.getItem(tokenKey) || sessionStorage.getItem(tokenKey);
      if (token) {
        try {
          const parsed = JSON.parse(token);
          if (parsed && (parsed.user || parsed.access_token || parsed.id)) {
            return { authenticated: true, token: parsed };
          }
        } catch (e) {
          // Continue to next token
        }
      }
    }
    
    // Check for user elements in DOM
    const userElements = document.querySelectorAll('[data-user], [data-user-id], .user-info, .profile');
    if (userElements.length > 0) {
      return { authenticated: true, source: 'DOM' };
    }
    
    return { authenticated: false };
  }

  // Monitor for authentication state changes on SWYW web app
  if (window.location.href.includes('extraordinary-granita-59f6fd.netlify.app')) {
    let lastAuthState = null;
    
    // Function to check and report auth state changes
    function checkAndReportAuthState() {
      const authState = checkAuthState();
      if (JSON.stringify(authState) !== JSON.stringify(lastAuthState)) {
        lastAuthState = authState;
        chrome.runtime.sendMessage({ 
          action: 'authStateChanged', 
          authState 
        });
      }
    }
    
    // Set up a mutation observer to detect login/logout
    const observer = new MutationObserver(() => {
      checkAndReportAuthState();
    });
    
    // Start observing
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    // Also check periodically
    setInterval(checkAndReportAuthState, 2000);
    
    // Check immediately
    checkAndReportAuthState();
  }
})();