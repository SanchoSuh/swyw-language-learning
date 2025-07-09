// Background script to monitor authentication state
const SWYW_WEB_APP_URL = 'https://extraordinary-granita-59f6fd.netlify.app';

// Monitor when SWYW web app tabs are updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes(SWYW_WEB_APP_URL)) {
    // Check for authentication state changes
    setTimeout(() => {
      checkAuthState(tabId);
    }, 500); // Wait for page to load
  }
});

// Monitor when tabs are activated (user switches to SWYW tab)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url?.includes(SWYW_WEB_APP_URL)) {
      setTimeout(() => {
        checkAuthState(activeInfo.tabId);
      }, 200);
    }
  } catch (error) {
    console.error('Error checking auth state on tab activation:', error);
  }
});

// Monitor when tabs are focused (user clicks on SWYW tab)
chrome.tabs.onHighlighted.addListener(async (highlightInfo) => {
  try {
    const tabs = await chrome.tabs.query({ tabIds: highlightInfo.tabIds });
    for (const tab of tabs) {
      if (tab.url?.includes(SWYW_WEB_APP_URL)) {
        setTimeout(() => {
          checkAuthState(tab.id);
        }, 200);
      }
    }
  } catch (error) {
    console.error('Error checking auth state on tab highlight:', error);
  }
});

// Monitor when SWYW web app tabs are activated
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url?.includes(SWYW_WEB_APP_URL)) {
      setTimeout(() => {
        checkAuthState(activeInfo.tabId);
      }, 500);
    }
  } catch (error) {
    console.error('Error checking auth state on tab activation:', error);
  }
});

async function checkAuthState(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      function: () => {
        // Check for authentication tokens
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
        
        // Check for logout indicators
        const logoutIndicators = document.querySelectorAll('.logout, [data-logout], .sign-out');
        if (logoutIndicators.length === 0) {
          // Check for user elements in DOM
          const userElements = document.querySelectorAll('[data-user], [data-user-id], .user-info, .profile');
          if (userElements.length > 0) {
            return { authenticated: true, source: 'DOM' };
          }
        }
        
        return { authenticated: false };
      }
    });

    const authState = results[0]?.result;
    
    if (authState?.authenticated) {
      // Store the authentication state in extension storage
      await chrome.storage.local.set({ 
        userSession: authState.token || authState,
        lastAuthCheck: Date.now()
      });
      console.log('Authentication detected in background');
    } else {
      // Clear authentication state if user is logged out
      await chrome.storage.local.remove(['userSession']);
      console.log('User logged out, cleared authentication state');
    }
  } catch (error) {
    console.error('Error checking auth state in background:', error);
  }
}

// Listen for messages from popup and content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkAuth') {
    // Find SWYW tabs and check auth state
    chrome.tabs.query({ url: `${SWYW_WEB_APP_URL}/*` }, (tabs) => {
      if (tabs.length > 0) {
        checkAuthState(tabs[0].id).then(() => {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false, message: 'No SWYW tabs found' });
      }
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'authStateChanged') {
    // Handle auth state changes from content script
    const authState = request.authState;
    
    if (authState?.authenticated) {
      chrome.storage.local.set({ 
        userSession: authState.token || authState,
        lastAuthCheck: Date.now()
      });
      console.log('Authentication state changed - logged in');
    } else {
      chrome.storage.local.remove(['userSession']);
      console.log('Authentication state changed - logged out');
    }
  }
}); 