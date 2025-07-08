Read file: prd.md
I am unable to write to `prd.md` directly due to a read-only file system restriction.  
However, here is the updated PRD content for you to copy and save as `prd.md` in your project:

---

# SWYW (Say What You Want) - Product Requirements Document (PRD)

## Objective
To build a suite of products — SWYW (Say What You Want) — for new language learners to (1) save new words and phrases easily from anywhere, and (2) view/check them regularly at the most relevant moments for learning, maximizing memorization efficiency.

## Current Version (MVP)

### Features
- **Web App**
  - Anyone can add a new word or phrase, its meaning, and an optional example sentence.
  - All saved entries are displayed as cards, showing:
    - The word or phrase (bold, top of card)
    - The meaning (below the word/phrase)
    - The example sentence (optional, below the meaning)
    - The date saved
  - Users can delete any entry.
  - No authentication required for MVP (open access).
- **Chrome Extension**
  - Users can save words/phrases directly from any webpage.
  - Extension captures selected text and allows users to add meaning and example sentences.
  - **Authentication Required**: Users must be signed in to their SWYW account to save words.
  - Extension opens the SWYW web app for authentication if user is not signed in.
  - Saved words appear in the user's personal word list on the SWYW website.
- **Database**
  - Uses Supabase (PostgreSQL) with a table `swyw_words`:
    - `id` (uuid, primary key)
    - `word_or_phrase` (text, required)
    - `meaning` (text, optional)
    - `example_sentence` (text, optional)
    - `created_at` (timestamp, default now)
    - `user_id` (uuid, references auth.users, required for authenticated users)
  - Row Level Security (RLS) enabled for user data protection.
- **Deployment**
  - Web app is designed for deployment on Netlify.
  - Chrome extension is published on Chrome Web Store.
  - Environment variables for Supabase URL and anon key are required.

### Authentication Requirements
- **Web App**: No authentication required for MVP (open access).
- **Chrome Extension**: User authentication required for security and data privacy.
- **Authentication Flow**:
  1. User clicks extension icon
  2. If not authenticated: Extension shows sign-in prompt with "Open SWYW App" button
  3. User clicks button to open SWYW web app for authentication
  4. After successful authentication: Extension shows word-saving form
  5. Saved words are associated with the authenticated user's account

### Definition of Success
- Users can add, view, and delete words/phrases with meanings and example sentences via web app.
- Users can save words from any webpage using the Chrome extension (when authenticated).
- All data is stored and retrieved from Supabase with proper user isolation.
- Chrome extension provides seamless authentication flow with the web app.

### Acceptance Criteria
- The web app provides a form to add a word/phrase, meaning, and example sentence.
- All entries are displayed as cards with the correct information.
- Users can delete entries.
- The app works both locally and when deployed to Netlify.
- The Supabase table includes the `meaning` field and `user_id` field.
- Chrome extension requires authentication before allowing word saves.
- Chrome extension provides clear feedback for authentication status and save operations.
- User data is properly isolated using RLS policies.

## Future Iterations (for reference)
- Mobile app with voice input and spaced repetition reminders.
- Enhanced user authentication with social login options.
- GDPR compliance and user data management features.
- Offline support for Chrome extension.
- Word sharing and collaboration features.

## Notes
- The web app MVP is open to all users (no authentication).
- The Chrome extension requires authentication for security and data privacy.
- GDPR compliance will be addressed in future iterations when user data is linked to accounts.
- RLS policies ensure user data isolation and security.
