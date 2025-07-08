# SWYW Chrome Extension - Testing Instructions

## How to Load the Extension in Chrome

1. **Open Chrome Extensions Page**
   - Go to `chrome://extensions/` in your Chrome browser
   - Or click the three dots menu → More tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner

3. **Load the Extension**
   - Click "Load unpacked" button
   - Select the `chrome-extension-package` folder (this folder)
   - The extension should now appear in your extensions list

4. **Pin the Extension**
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "SWYW - Language Learning Helper"
   - Click the pin icon to keep it visible

## How to Test

1. **Basic Functionality**
   - Visit any webpage
   - Click the SWYW extension icon
   - Try entering a word and example sentence
   - Click "Save" (currently saves to local storage)

2. **Text Selection**
   - Select some text on any webpage
   - Click the SWYW extension icon
   - The selected text should appear in the word input field

3. **Authentication Flow**
   - The extension will show "Sign in Required" initially
   - Click "Open SWYW App" to go to the main application

## Current Limitations

- **Local Storage Only**: Currently saves to Chrome's local storage, not to the database
- **No Real Authentication**: Shows demo authentication flow
- **Development URLs**: Links point to localhost (needs production URL)

## Next Steps for Production

1. **Connect to Supabase**: Integrate with the actual database
2. **Authentication**: Implement real user authentication
3. **Production URLs**: Update links to deployed application
4. **Chrome Web Store**: Publish to Chrome Web Store

## Troubleshooting

- **Extension not loading**: Make sure you selected the correct folder
- **No selected text**: Try selecting text before opening the extension
- **Permissions error**: The extension needs "activeTab" and "scripting" permissions

## Files in this Package

- `manifest.json` - Extension configuration
- `popup.html` - Extension popup interface
- `popup.js` - Extension popup logic
- `content.js` - Content script for text selection
- `README.md` - This file