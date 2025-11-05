# Clear Browser Cache Instructions

The blank screen and 404 errors are caused by browser cache loading old files.

## Steps to Fix:

1. **Hard Refresh (Fastest Method)**
   - Press `Ctrl + Shift + R` (Windows/Linux)
   - Or `Cmd + Shift + R` (Mac)
   - This forces a hard reload

2. **Clear Browser Cache**
   - Open DevTools (F12)
   - Right-click the refresh button
   - Select "Empty Cache and Hard Reload"

3. **Clear Site Data (Most Thorough)**
   - Open DevTools (F12)
   - Go to Application tab
   - Click "Clear site data" button
   - Check all boxes
   - Click "Clear site data"
   - Refresh the page

4. **Restart Dev Server**
   - Stop the server (Ctrl+C in terminal)
   - Delete `node_modules/.vite` folder if it exists
   - Run `npm run dev` again

5. **If Still Not Working**
   - Close all browser tabs with localhost:5173
   - Close the browser completely
   - Reopen browser
   - Navigate to http://localhost:5173

The errors about `assets.js`, `cartSlice.js`, and `@react-refresh` are from cached files and will disappear after clearing cache.

