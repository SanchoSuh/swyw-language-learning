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
  }

  bindEvents() {
    const form = document.getElementById('word-form');
    const clearBtn = document.getElementById('clear-btn');
    const openAppBtn = document.getElementById('open-app');

    form?.addEventListener('submit', (e) => this.handleSubmit(e));
    clearBtn?.addEventListener('click', () => this.clearForm());
    openAppBtn?.addEventListener('click', () => this.openApp());
  }

  async checkAuth() {
    try {
      // Check if user session exists in Chrome storage
      const result = await chrome.storage.local.get(['userSession']);
      this.user = result.userSession;
      
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

      this.showSuccess();
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
    chrome.tabs.create({ url: 'http://localhost:5173' });
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

document.addEventListener('DOMContentLoaded', () => {
  new SWYWPopup();
});