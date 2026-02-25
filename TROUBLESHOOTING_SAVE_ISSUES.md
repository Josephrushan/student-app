# Troubleshooting: Resource/Assignment Not Saving

## What We Just Added

Enhanced error handling and debugging in:
- `TutoringModule.tsx` - Better error messages + console logs
- `HomeworkModule.tsx` - Better error messages + console logs
- `firebaseService.ts` - Detailed upload/save logging

## How to Debug

### Step 1: Open Browser Console
1. Right-click anywhere in the app
2. Select "Inspect" or "Inspect Element"
3. Click "Console" tab
4. Clear old messages (Ctrl+L or click trash icon)

### Step 2: Try to Save a Resource/Assignment
Watch the console for messages. You should see:

**✅ Success Flow:**
```
Starting resource creation...
Uploading file: myfile.pdf
File uploaded successfully: https://firebasestorage.googleapis.com/...
Saving resource to Firestore: { ... resource data ... }
✅ Successfully saved resources/1234567890
Resource saved successfully!
```

**❌ Error Flow:**
```
Starting resource creation...
Uploading file: myfile.pdf
❌ Image upload failed: Error: permission-denied
Error details: User does not have permission to access the file
```

### Step 3: Identify the Problem

#### **Problem: "Nothing happens when I click save"**
- Check console for errors
- If no logs appear → Page might not be loading JS properly
  - Try refreshing the page
  - Check for network errors in Network tab

#### **Problem: "File upload fails"**
Console shows:
- `storage/unauthorized` → Storage rules issue
- `File too large` → File > 500MB, try smaller file
- `storage/unauthenticated` → Not logged in properly

**Fix:**
1. Check Firebase Storage rules:
   ```bash
   firebase emulators:start  # If using emulator
   firebase deploy --only storage:rules  # If using production
   ```
2. Verify file size < 500MB
3. Check login status (should show user avatar)

#### **Problem: "Upload succeeds but Firestore save fails"**
Console shows:
- `Permission Denied: permission-denied` → Firestore rules issue
- `schoolId is required for assignments` → schoolId missing in profile
- `Not authenticated` → Session expired

**Fix:**
1. Check your profile has schoolId set:
   - Go to Profile Module
   - Verify "School" field is filled
   - Save profile
2. Check Firestore rules deployed:
   ```bash
   firebase deploy --only firestore:rules
   ```
3. Try logging out and logging back in

#### **Problem: "Saved successfully but resource doesn't appear"**
Console shows `✅ Successfully saved` but resource not visible

**Possible causes:**
1. **Visibility settings** - You set visibility but don't match the criteria
   - Created with "Grade 10 Only" but you're Grade 11?
   - Go back and check your visibility setting
   
2. **Different grade/school** - Student looking in wrong place
   - Resource saved for Grade 10, but viewing Grade 11
   - Have students check their current grade setting
   
3. **Cache issue** - Browser cached old data
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Clear browser cache

### Step 4: Check Firestore Rules

**Test your Firestore rules:**

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Try to read a document manually
4. Check the "Rules" tab for errors

**Look for:**
- Syntax errors in rules
- Missing `visibility` field checks
- `schoolId` validation issues

### Step 5: Check User Profile

Go to **Profile Module** and verify:

```
✅ Name: [Your Name]
✅ Role: Teacher or Principal
✅ Grade: [Selected Grade]
✅ School: [Your School Name]
✅ schoolId: [Should be populated]
```

If any are missing → Fill them in and save

## Common Error Messages & Fixes

| Error Message | Cause | Fix |
|---------------|-------|-----|
| `Permission Denied` | Firestore rules blocking | `firebase deploy --only firestore:rules` |
| `File too large` | File > 500MB | Compress file or split into chunks |
| `storage/unauthorized` | Storage rules issue | Check Firebase Storage rules |
| `schoolId is required` | Missing in profile | Add schoolId to profile and save |
| `Not authenticated` | Session expired | Log out and log back in |
| `Invalid data structure` | Missing required field | Check `visibility` field exists |

## Quick Fixes (Try These First)

### 1. **Hard Refresh**
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### 2. **Log Out & Log In**
- Click Profile
- Click Logout
- Log back in
- Try saving again

### 3. **Check Profile**
- Go to Profile Module
- Verify all fields filled (especially School & Grade)
- Click Save
- Try creating resource again

### 4. **Check Console**
- Open DevTools (F12)
- Go to Console tab
- Look for red error messages
- Note the exact error
- Reference above table

### 5. **Deploy Rules**
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## Network Tab Debugging

If console shows no logs:

1. Open DevTools → Network tab
2. Try to save a resource
3. Look for requests to:
   - `firebasestorage.googleapis.com` - Should be 200 OK
   - `www.googleapis.com/identitytoolkit` - Should be 200 OK
   - `firestore.googleapis.com` - Should be 200 OK

4. Click each request and check Response
5. Look for error details

## Firebase Console Debugging

### Check Firestore
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Firestore Database
4. Check Collections:
   - `assignments` - Do your assignments appear?
   - `resources` - Do your resources appear?
5. If not → Problem is with saving to Firestore

### Check Storage
1. Go to Storage section
2. Check folders:
   - `assignments/` - Are files uploading?
   - `resources/` - Are files uploading?
3. If not → Problem is with file upload

### Check Rules
1. Go to Firestore Rules tab
2. Look for syntax errors (red underlines)
3. Check `canReadAssignment()` and `canReadResource()` functions exist
4. Deploy if needed

## Test Data Creation

Try creating a simple test resource:

**Test Resource:**
```
Title: TEST_RESOURCE_DO_NOT_USE
Subject: English
Description: This is a test
Visibility: My School Only  ← Important!
Attachment: None
```

If this works → Your setup is OK, problem is with specific files/settings
If this fails → Problem is with Firestore/rules/authentication

## Final Troubleshooting Checklist

- [ ] Browser console shows logs (not blank)
- [ ] No red errors in console
- [ ] Profile has schoolId filled
- [ ] Role is Teacher or Principal
- [ ] Firestore rules deployed recently
- [ ] Storage rules are set correctly
- [ ] Not using "All Schools" visibility on first test
- [ ] File size < 500MB
- [ ] Internet connection is stable
- [ ] Logged in properly (avatar shows)

## Still Not Working?

If you've tried all above:

1. **Save a screenshot** of the console error
2. **Note the exact error message**
3. **Check Firebase project ID** - is it the right project?
4. **Verify you're using correct Firebase credentials**
5. **Try in Incognito/Private mode** - bypasses cache
6. **Try different file** - might be file-specific issue

## Support

**Quick test:** Try this in console:
```javascript
// Check authentication
console.log('User ID:', window.currentUserId || 'NOT SET');

// Check Firestore connection
console.log('Firestore:', db ? 'Connected' : 'NOT CONNECTED');

// Check Storage connection  
console.log('Storage:', storage ? 'Connected' : 'NOT CONNECTED');
```

If any show NOT SET/NOT CONNECTED → Initialization issue
