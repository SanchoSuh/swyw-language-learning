// Chrome Extension Popup Script
class SWYWPopup {
  constructor() {
    this.supabaseUrl = null;
    this.supabaseKey = null;
    this.user = null;
    this.init();
  }

  async init() {
    // Load Supabase configuration (in a real app, this would be from environment)
    // For now, we'll check if user is authenticated via storage
    const result = await chrome.storage.local.get(['supabaseUrl', 'supabaseKey', 'userSession']);
    
    this.supabaseUrl = result.supabaseUrl;
    this.supabaseKey = result.supabaseKey;
    this.user = result.userSession;

    this.bindEvents();
    this.checkAuth();
    this.getSelectedText();
  }

  bindEvents() {
    const form = document.getElementById('word-form');
    const clearBtn = document.getElementById('clear-btn');
    const openAppBtn = document.getElementById('open-app');

    form?.addEventListener('submit', (e) => this.handleSubmit(e));
    clearBtn?.addEventListener('click', () => this.clearForm());
    openAppBtn?.addEventListener('click', () => this.openApp());
  }

  checkAuth() {
    const authPrompt = document.getElementById('auth-prompt');
    const mainForm = document.getElementById('main-form');

    if (!this.user) {
      authPrompt.style.display = 'block';
      mainForm.style.display = 'none';
    } else {
      authPrompt.style.display = 'none';
      mainForm.style.display = 'block';
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
    
    const wordInput = document.getElementById('word-input').value.trim();
    const exampleInput = document.getElementById('example-input').value.trim();
    
    if (!wordInput) return;

    this.setLoading(true);
    this.hideMessages();

    try {
      // In a real implementation, we would use the Supabase client here
      // For now, we'll simulate the API call and store locally
      const wordData = {
        id: crypto.randomUUID(),
        word_or_phrase: wordInput,
        example_sentence: exampleInput || null,
        created_at: new Date().toISOString(),
        user_id: this.user?.id || 'demo-user'
      };

      // Store in Chrome storage (in real app, this would go to Supabase)
      const result = await chrome.storage.local.get(['savedWords']);
      const savedWords = result.savedWords || [];
      savedWords.unshift(wordData);
      
      await chrome.storage.local.set({ savedWords });

      this.showSuccess();
      this.clearForm();
    } catch (error) {
      this.showError('Failed to save word. Please try again.');
    } finally {
      this.setLoading(false);
    }
  }

  clearForm() {
    document.getElementById('word-input').value = '';
    document.getElementById('example-input').value = '';
    document.getElementById('selected-text-display').style.display = 'none';
  }

  openApp() {
    chrome.tabs.create({ url: 'http://localhost:5173' }); // In production, this would be the actual URL
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

  showSuccess() {
    const successMsg = document.getElementById('success-message');
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

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SWYWPopup();
});