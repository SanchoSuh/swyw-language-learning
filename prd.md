# SWYW (Say What You Want) - Product Requirements Document (PRD)

## Objective
To build a suite of products — SWYW (Say What You Want) — for new language learners to (1) save new words and phrases easily from anywhere, and (2) view/check them regularly at the most relevant moments for learning, maximizing memorization efficiency.

## Current Version (v1.0.0) - IMPLEMENTED ✅

### Core Features

#### **Web Application**
- **Authentication System**: Complete login/signup flow with Supabase Auth
- **Word Management**: 
  - Add new words/phrases with meaning and optional example sentences
  - View all saved words in a responsive card layout
  - Delete words with confirmation
  - Search functionality to filter words
- **User Interface**:
  - Clean, modern design with Tailwind CSS
  - Responsive layout for desktop and mobile
  - Loading states and error handling
  - Real-time authentication state management

#### **Chrome Extension**
- **Authentication Integration**: 
  - Automatic detection of user login status from web app
  - Seamless authentication flow with the web app
  - Session persistence across browser sessions
- **Word Saving**:
  - Capture selected text from any webpage
  - Add meaning and example sentences
  - Direct database integration with Supabase
  - Real-time sync with web app
- **User Experience**:
  - Automatic login status detection
  - Clear feedback for all operations
  - Debug tools for troubleshooting
  - Sign out functionality

#### **Database & Backend**
- **Supabase Integration**:
  - PostgreSQL database with `swyw_words` table
  - Row Level Security (RLS) for user data protection
  - Real-time authentication with JWT tokens
- **Data Schema**:
  ```sql
  swyw_words {
    id: uuid (primary key)
    word_or_phrase: text (required)
    meaning: text (optional)
    example_sentence: text (optional)
    created_at: timestamp (default: now())
    user_id: uuid (references auth.users)
  }
  ```
- **Security**: 
  - User data isolation with RLS policies
  - Secure authentication tokens
  - CORS protection for API calls

#### **Deployment & Infrastructure**
- **Web App**: Deployed on Netlify at https://extraordinary-granita-59f6fd.netlify.app/
- **Chrome Extension**: Available for local development and testing
- **Database**: Supabase hosted PostgreSQL with automatic backups
- **Environment**: Production-ready with proper environment variables

### Authentication System

#### **Web App Authentication**
- **Login/Signup**: Email and password authentication
- **Session Management**: Automatic session persistence
- **Sign Out**: Proper session cleanup and redirect
- **UI States**: Loading, authenticated, and unauthenticated states

#### **Chrome Extension Authentication**
- **Automatic Detection**: Monitors web app tabs for login status
- **Session Sharing**: Retrieves authentication tokens from web app
- **Real-time Updates**: Detects login/logout changes automatically
- **Fallback Methods**: Multiple detection strategies for reliability

### Technical Implementation

#### **Frontend Stack**
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Supabase JS Client** for database operations

#### **Chrome Extension Architecture**
- **Manifest V3** compliance
- **Background Script**: Monitors authentication state changes
- **Content Script**: Detects authentication in web app
- **Popup Script**: Main extension interface
- **Permissions**: tabs, storage, scripting, activeTab

#### **Database Operations**
- **Direct API Calls**: Chrome extension makes authenticated requests to Supabase
- **Web App Integration**: Extension can use web app's Supabase client
- **Error Handling**: Comprehensive error handling and user feedback
- **Data Validation**: Proper validation before database operations

### User Flows

#### **New User Flow**
1. User visits web app → sees login page
2. User signs up with email/password → redirected to main app
3. User can start saving words immediately
4. User installs Chrome extension → automatic login detection
5. User can save words from any webpage

#### **Existing User Flow**
1. User opens Chrome extension → automatic login detection
2. If not logged in → extension shows auth prompt
3. User clicks "Open SWYW App" → web app opens
4. User logs in → extension automatically detects login
5. User can save words from any webpage

#### **Word Saving Flow**
1. User selects text on any webpage
2. User clicks Chrome extension icon
3. Selected text is auto-filled in the form
4. User adds meaning and example (optional)
5. User clicks "Save" → word is saved to database
6. Word appears in web app immediately

### Security & Privacy

#### **Data Protection**
- **User Isolation**: Each user only sees their own words
- **RLS Policies**: Database-level security
- **Secure Tokens**: JWT-based authentication
- **No Data Leakage**: Extension only accesses user's own data

#### **Privacy Features**
- **Local Storage**: Minimal data stored locally
- **Session Management**: Proper token handling
- **GDPR Ready**: User data control and deletion capabilities

### Performance & Reliability

#### **Optimizations**
- **Lazy Loading**: Components load as needed
- **Efficient Queries**: Optimized database queries
- **Caching**: Smart caching of authentication state
- **Error Recovery**: Graceful handling of network issues

#### **Monitoring**
- **Console Logging**: Detailed debugging information
- **Error Tracking**: Comprehensive error reporting
- **User Feedback**: Clear success/error messages

### Definition of Success ✅

- ✅ Users can authenticate and manage their account
- ✅ Users can add, view, search, and delete words via web app
- ✅ Users can save words from any webpage using Chrome extension
- ✅ All data is properly stored in Supabase with user isolation
- ✅ Chrome extension provides seamless authentication flow
- ✅ Real-time synchronization between extension and web app
- ✅ Comprehensive error handling and user feedback
- ✅ Production-ready deployment on Netlify

### Acceptance Criteria ✅

- ✅ Web app provides complete authentication system
- ✅ Word management with full CRUD operations
- ✅ Responsive design works on all devices
- ✅ Chrome extension requires authentication
- ✅ Extension automatically detects login status
- ✅ Words saved via extension appear in web app
- ✅ Database operations work with proper user isolation
- ✅ Comprehensive error handling and user feedback
- ✅ Production deployment is stable and secure

## Future Iterations (Planned)

### **v1.1 - Enhanced Features**
- Mobile app with voice input
- Spaced repetition reminders
- Word categories and tags
- Export/import functionality

### **v1.2 - Social Features**
- Word sharing between users
- Collaborative learning groups
- Social login options (Google, GitHub)
- Public word lists

### **v1.3 - Advanced Learning**
- AI-powered word suggestions
- Pronunciation guides
- Integration with language learning APIs
- Progress tracking and analytics

### **v2.0 - Mobile App**
- Native iOS and Android apps
- Offline support
- Push notifications
- Voice recognition for word input

## Technical Notes

### **Current Architecture**
- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Extension**: Chrome Extension Manifest V3
- **Deployment**: Netlify (web) + Chrome Web Store (extension)

### **Environment Variables**
```env
VITE_SUPABASE_URL=https://oynqufsrtensdvgkflub.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Database Schema**
```sql
-- Enable RLS
ALTER TABLE swyw_words ENABLE ROW LEVEL SECURITY;

-- Policy for user data isolation
CREATE POLICY "Users can only access their own words" ON swyw_words
  FOR ALL USING (auth.uid() = user_id);
```

### **Security Considerations**
- All user data is isolated by user_id
- RLS policies prevent data leakage
- Authentication tokens are properly managed
- CORS is configured for secure API access
- No sensitive data is stored in local storage

---

**Status**: ✅ **PRODUCTION READY** - All core features implemented and tested
**Last Updated**: January 2025
**Version**: 1.0.0
