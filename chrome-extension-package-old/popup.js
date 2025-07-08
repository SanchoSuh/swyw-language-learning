// Chrome Extension Popup Script
// Add Supabase client import
const SUPABASE_URL = 'https://oynqufsrtensdvgkflub.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95bnF1ZnNydGVuc2R2Z2tmbHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MzE4NjcsImV4cCI6MjA2NjIwNzg2N30.9K0cVjPQISZs0q4vIN3sJQRpLH22IOLFVoUZ5K_U3Ys';

// Load Supabase client
const { createClient } = supabaseJs;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class SWYWPopup {
  constructor() {
    this.init();
  }

  async init() {
    this.bindEvents();
    this.getSelectedText();
    document.getElementById('main-form').style.display = 'block';
  }

  bindEvents() {
    const form = document.getElementById('word-form');
    const clearBtn = document.getElementById('clear-btn');
    form?.addEventListener('submit', (e) => this.handleSubmit(e));
    clearBtn?.addEventListener('click', () => this.clearForm());
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
    const meaningInput = document.getElementById('meaning-input').value.trim();
    const exampleInput = document.getElementById('example-input').value.trim();
    if (!wordInput) return;
    this.setLoading(true);
    this.hideMessages();
    try {
      const { error } = await supabase
        .from('swyw_words')
        .insert([
          {
            word_or_phrase: wordInput,
            meaning: meaningInput || null,
            example_sentence: exampleInput || null
          }
        ]);
      if (error) throw error;
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
    document.getElementById('meaning-input').value = '';
    document.getElementById('example-input').value = '';
    document.getElementById('selected-text-display').style.display = 'none';
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

// Load Supabase JS from CDN if not present
if (typeof supabaseJs === 'undefined') {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/dist/umd/supabase.min.js';
  script.onload = () => { window.supabaseJs = window.supabase; new SWYWPopup(); };
  document.head.appendChild(script);
} else {
  new SWYWPopup();
}