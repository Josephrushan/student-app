# Quick Testing Guide

## To Test the Fix

### Step 1: Start the App
```bash
npm install  # Make sure all dependencies are installed
npm run dev  # Start development server
```

### Step 2: Open Browser Console
1. Press **F12** or Right-click → Inspect
2. Click **Console** tab
3. Clear any old messages (Ctrl+L)

### Step 3: Login & Check Profile
1. Log in with your teacher account
2. Go to **Profile** module
3. Verify these fields are filled:
   - ✅ Name
   - ✅ Role (should be "Teacher")
   - ✅ Grade
   - ✅ School
   - ✅ School ID (should have a value)

If any field is empty, fill it and save!

### Step 4: Create a Test Resource
1. Go to **Institutional Library**
2. Click **"Publish New Entry"**
3. Fill in:
   - **Title:** `TEST_RESOURCE`
   - **Subject:** `English`
   - **Type:** `Link (YouTube/Vimeo)`
   - **URL:** `https://www.youtube.com/embed/dQw4w9WgXcQ`
   - **Visibility:** `My School Only`
4. **Click Submit**

### Step 5: Watch the Console
You should see logs like:
```
Starting resource creation... 
  newTitle: "TEST_RESOURCE"
  newSubject: "English"
  schoolId: "someSchoolId"

Saving resource to Firestore: {id: "...", title: "TEST_RESOURCE", ...}

Resource saved successfully!
```

Then the app should show: **✅ Resource "TEST_RESOURCE" published successfully!**

### Step 6: Verify in App
1. Refresh the page (F5)
2. Go back to **Institutional Library**
3. You should see "TEST_RESOURCE" in the list

### Step 7: Test with File
Repeat Step 4-6 but use:
- **Type:** `File Upload`
- **Choose File:** Pick a PDF, image, or video
- Watch console for: `Uploading file: [filename]`

---

## If Something Goes Wrong

### 1. Console Shows No Logs
- **Problem:** JavaScript not loading
- **Fix:** 
  - Press Ctrl+Shift+R (hard refresh)
  - Check Network tab for JS errors
  - Clear browser cache

### 2. Console Shows Error
- **Error: "schoolId is required"**
  - Go to Profile → Fill in School field → Save
  - Try again
  
- **Error: "Permission Denied"**
  - Run: `firebase deploy --only firestore:rules`
  - Wait 30 seconds
  - Try again

- **Error: "File too large"**
  - Use file < 500MB
  - Compress if needed

- **Error: "storage/unauthorized"**
  - Run: `firebase deploy --only storage`
  - Log out and log back in

### 3. Says "Success" but Resource Doesn't Appear
- **Problem:** Read rules issue or visibility mismatch
- **Fix:**
  - Hard refresh (Ctrl+Shift+R)
  - Check visibility setting (should be "My School Only" for test)
  - Go to Profile → verify School matches resource school

### 4. File Upload Progress is Stuck
- **Problem:** Network issue or Firebase timeout
- **Fix:**
  - Check internet connection
  - Try with smaller file
  - Try in Incognito mode
  - Restart development server

---

## Commands to Run if Stuck

```bash
# Hard restart everything
npm run dev   # If using npm
# OR
npm start     # If using npm start

# Deploy Firebase rules if changed
firebase deploy --only firestore:rules
firebase deploy --only storage

# Check Firebase connectivity
firebase emulators:start  # If using emulator
```

---

## Success Indicators

✅ **All Good** if you see:
1. Console logs starting with "Starting resource creation..."
2. Alert saying "✅ Resource published successfully!"
3. Resource appears in list after refresh
4. No red errors in console

❌ **Something Wrong** if:
1. No console logs appear
2. Alert shows error message
3. Resource doesn't appear even with "success" message
4. Red error in console

---

## Next Steps After Test

1. **If everything works:**
   - Try with different file types (PDF, DOCX, MP4, images)
   - Test visibility settings (Grade Only, Specific Grades, All Schools)
   - Have a student login and verify they see resources correctly

2. **If console shows errors:**
   - Screenshot the error
   - Note the exact error message
   - Reference the TROUBLESHOOTING_SAVE_ISSUES.md guide

3. **If no console logs:**
   - Hard refresh (Ctrl+Shift+R)
   - Try Incognito mode
   - Check Network tab for JS errors
