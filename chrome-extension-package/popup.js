// Chrome Extension Popup Script
const SUPABASE_URL = 'https://oynqufsrtensdvgkflub.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95bnF1ZnNydGVuc2R2Z2tmbHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MzE4NjcsImV4cCI6MjA2NjIwNzg2N30.9K0cVjPQISZs0q4vIN3sJQRpLH22IOLFVoUZ5K_U3Ys';

class SWYWPopup {
  constructor() {
    this.user = null;
    this.init();
  }

  async init() {
    this.bindEvents();
    await this.checkAuth();
    this.getSelectedText();
    
    // Set up periodic auth checks every 10 seconds
    setInterval(async () => {
      await this.checkAuth();
    }, 10000);
  }

  bindEvents() {
    const form = document.getElementById('word-form');
    const clearBtn = document.getElementById('clear-btn');
    const openAppBtn = document.getElementById('open-app');
    const signOutBtn = document.getElementById('sign-out-btn');

    form?.addEventListener('submit', (e) => this.handleSubmit(e));
    clearBtn?.addEventListener('click', () => this.clearForm());
    openAppBtn?.addEventListener('click', () => this.openApp());
    signOutBtn?.addEventListener('click', () => this.signOut());
  }

  async checkAuth() {
    try {
      // First check if user session exists in Chrome storage
      const result = await chrome.storage.local.get(['userSession']);
      this.user = result.userSession;
      
      // If no session in storage, try to detect from open SWYW web app tabs
      if (!this.user) {
        await this.detectLoginFromOpenTabs();
      }
      
      // Always try to get fresh auth state from open tabs
      await this.updateAuthFromOpenTabs();
      
      const authPrompt = document.getElementById('auth-prompt');
      const mainForm = document.getElementById('main-form');

      if (!this.user) {
        authPrompt.style.display = 'block';
        mainForm.style.display = 'none';
      } else {
        authPrompt.style.display = 'none';
        mainForm.style.display = 'block';
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      // Default to showing auth prompt on error
      document.getElementById('auth-prompt').style.display = 'block';
      document.getElementById('main-form').style.display = 'none';
    }
  }

  async detectLoginFromOpenTabs() {
    try {
      // Find any open tabs with the SWYW web app
      const tabs = await chrome.tabs.query({
        url: 'https://extraordinary-granita-59f6fd.netlify.app/*'
      });

      if (tabs.length > 0) {
        // Check the first SWYW tab for login status
        const tab = tabs[0];
        try {
          const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
              // Function to check authentication state
              function checkAuthState() {
                // Check for Supabase auth token
                const supabaseToken = localStorage.getItem('supabase.auth.token');
                if (supabaseToken) {
                  try {
                    const parsed = JSON.parse(supabaseToken);
                    if (parsed && parsed.access_token) {
                      return { authenticated: true, token: parsed };
                    }
                  } catch (e) {
                    console.log('Failed to parse Supabase token');
                  }
                }
                
                // Check for other common auth tokens
                const possibleTokens = [
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
                const userElements = document.querySelectorAll('[data-user], [data-user-id], .user-info, .profile, .user-menu');
                if (userElements.length > 0) {
                  return { authenticated: true, source: 'DOM' };
                }
                
                // Check for logout buttons (indicates user is logged in)
                const logoutButtons = document.querySelectorAll('button[onclick*="logout"], button[onclick*="signout"], .logout, .sign-out');
                if (logoutButtons.length > 0) {
                  return { authenticated: true, source: 'logout_button' };
                }
                
                return { authenticated: false };
              }
              
              return checkAuthState();
            }
          });

          const userSession = results[0]?.result;
          
          if (userSession?.authenticated) {
            // Store the session in Chrome extension storage
            await chrome.storage.local.set({ userSession });
            this.user = userSession;
            console.log('Login detected from open tab');
            return true;
          }
        } catch (error) {
          console.log('Could not check login status from tab:', error);
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error detecting login from open tabs:', error);
      return false;
    }
  }

  async updateAuthFromOpenTabs() {
    try {
      // Find any open tabs with the SWYW web app
      const tabs = await chrome.tabs.query({
        url: 'https://extraordinary-granita-59f6fd.netlify.app/*'
      });

      if (tabs.length > 0) {
        // Check all SWYW tabs for login status
        for (const tab of tabs) {
          try {
            const results = await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              function: () => {
                // Function to check authentication state
                function checkAuthState() {
                  // Check for Supabase auth token
                  const supabaseToken = localStorage.getItem('supabase.auth.token');
                  if (supabaseToken) {
                    try {
                      const parsed = JSON.parse(supabaseToken);
                      if (parsed && parsed.access_token) {
                        return { authenticated: true, token: parsed };
                      }
                    } catch (e) {
                      console.log('Failed to parse Supabase token');
                    }
                  }
                  
                  // Check for user elements in DOM
                  const userElements = document.querySelectorAll('[data-user], [data-user-id], .user-info, .profile, .user-menu');
                  if (userElements.length > 0) {
                    return { authenticated: true, source: 'DOM' };
                  }
                  
                  // Check for logout buttons (indicates user is logged in)
                  const logoutButtons = document.querySelectorAll('button[onclick*="logout"], button[onclick*="signout"], .logout, .sign-out');
                  if (logoutButtons.length > 0) {
                    return { authenticated: true, source: 'logout_button' };
                  }
                  
                  return { authenticated: false };
                }
                
                return checkAuthState();
              }
            });

            const userSession = results[0]?.result;
            
            if (userSession?.authenticated) {
              // Store the session in Chrome extension storage
              await chrome.storage.local.set({ userSession });
              this.user = userSession;
              console.log('Login updated from open tab');
              return;
            }
          } catch (error) {
            console.log('Could not check login status from tab:', error);
          }
        }
        
        // If we checked all tabs and found no authentication, clear the session
        await chrome.storage.local.remove(['userSession']);
        this.user = null;
      }
    } catch (error) {
      console.error('Error updating auth from open tabs:', error);
    }
  }

  async getSelectedText() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => window.getSelection().toString().trim()
      });
      const selectedText = results[0]?.result;
      if (selectedText) {
        document.getElementById('selected-text').textContent = selectedText;
        document.getElementById('selected-text-display').style.display = 'block';
        document.getElementById('word-input').value = selectedText;
      }
    } catch (error) {
      console.log('Could not get selected text:', error);
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    if (!this.user) {
      this.showError('Please sign in to save words.');
      return;
    }

    const wordInput = document.getElementById('word-input').value.trim();
    const meaningInput = document.getElementById('meaning-input').value.trim();
    const exampleInput = document.getElementById('example-input').value.trim();
    
    if (!wordInput) return;

    this.setLoading(true);
    this.hideMessages();

    try {
      // For now, save to local storage until we implement proper Supabase integration
      const wordData = {
        id: crypto.randomUUID(),
        word_or_phrase: wordInput,
        meaning: meaningInput || null,
        example_sentence: exampleInput || null,
        created_at: new Date().toISOString(),
        user_id: this.user.id
      };

      // Store in Chrome storage (temporary until Supabase integration is complete)
      const result = await chrome.storage.local.get(['savedWords']);
      const savedWords = result.savedWords || [];
      savedWords.unshift(wordData);
      
      await chrome.storage.local.set({ savedWords });

      this.showSuccess('Word saved successfully!');
      this.clearForm();
    } catch (error) {
      console.error('Error saving word:', error);
      this.showError('Failed to save word. Please try again.');
    } finally {
      this.setLoading(false);
    }
  }

  clearForm() {
    document.getElementById('word-input').value = '';
    document.getElementById('meaning-input').value = '';
    document.getElementById('example-input').value = '';
    document.getElementById('selected-text-display').style.display = 'none';
  }

  openApp() {
    // Open the SWYW web app for authentication
    chrome.tabs.create({ url: 'https://extraordinary-granita-59f6fd.netlify.app/' });
    this.showSuccess('Please log in to the web app. The extension will automatically detect your login status.');
  }

  async signOut() {
    try {
      // Clear the session from extension storage
      await chrome.storage.local.remove(['userSession']);
      this.user = null;
      
      // Update UI
      document.getElementById('auth-prompt').style.display = 'block';
      document.getElementById('main-form').style.display = 'none';
      
      this.showSuccess('Signed out successfully.');
    } catch (error) {
      console.error('Error signing out:', error);
      this.showError('Could not sign out. Please try again.');
    }
  }

  setLoading(isLoading) {
    const saveBtn = document.getElementById('save-btn');
    const saveText = document.getElementById('save-text');
    const saveLoading = document.getElementById('save-loading');
    if (isLoading) {
      saveBtn.disabled = true;
      saveText.style.display = 'none';
      saveLoading.style.display = 'inline-block';
    } else {
      saveBtn.disabled = false;
      saveText.style.display = 'inline';
      saveLoading.style.display = 'none';
    }
  }

  showSuccess(message) {
    const successMsg = document.getElementById('success-message');
    successMsg.textContent = message || 'Word saved successfully!';
    successMsg.style.display = 'block';
    setTimeout(() => {
      successMsg.style.display = 'none';
    }, 3000);
  }

  showError(message) {
    const errorMsg = document.getElementById('error-message');
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
  }

  hideMessages() {
    document.getElementById('success-message').style.display = 'none';
    document.getElementById('error-message').style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new SWYWPopup();
});