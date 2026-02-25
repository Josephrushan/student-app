# Pre-Testing Checklist

Complete this checklist before testing the resource saving functionality.

## ✅ Code Changes Verification

### Files Modified
- [ ] `types.ts` - VisibilityType and visibility fields added
- [ ] `components/ResourceViewer.tsx` - Multi-format viewer implemented
- [ ] `components/HomeworkModule.tsx` - Visibility UI + error handling
- [ ] `components/TutoringModule.tsx` - Visibility UI + error handling
- [ ] `services/firebaseService.ts` - Validation and logging added
- [ ] `firestore.rules` - Visibility enforcement added
- [ ] `package.json` - pdfjs-dist and mammoth added

### Verify with Command
```bash
git status
```
Should show these files as committed (not modified):
```
types.ts
components/ResourceViewer.tsx
components/HomeworkModule.tsx
components/TutoringModule.tsx
services/firebaseService.ts
firestore.rules
package.json
```

---

## 🔧 Environment Setup

### Dependencies Installed
- [ ] Run: `npm install`
- [ ] Check output shows no errors
- [ ] Verify `node_modules/pdfjs-dist` exists
- [ ] Verify `node_modules/mammoth` exists

### Firebase Configuration
- [ ] Firebase SDK initialized in `index.tsx`
- [ ] Environment variables set (check `.env` or `constants.ts`)
- [ ] Firebase project ID correct
- [ ] Database URL correct

### Development Server
- [ ] Run: `npm run dev`
- [ ] Server starts without errors
- [ ] App loads at http://localhost:5173
- [ ] No TypeScript compilation errors

---

## 👤 User Account Setup

### Teacher Account
- [ ] Logged in as teacher (not student/parent)
- [ ] Profile shows: Role = "Teacher"
- [ ] Profile shows: School = [filled with school name]
- [ ] Profile shows: Grade = [has a value]
- [ ] Profile shows: schoolId = [has a value]
  - If empty: Go to Profile, select school, save

### Student Account (for verification)
- [ ] Create/have a student account
- [ ] Logged in with correct school
- [ ] Verify in Profile

---

## 📝 Console Logging Setup

### Browser Console Ready
- [ ] Press F12 to open DevTools
- [ ] Click "Console" tab
- [ ] Clear existing messages (Ctrl+L or trash icon)
- [ ] Keep DevTools visible while testing

### Check for Initial Errors
- [ ] No red error messages visible
- [ ] No yellow warning messages (warnings are OK)
- [ ] If errors exist, write them down and fix before proceeding

---

## 🧪 Test Case 1: Simple Link Resource

### Create Resource
1. [ ] Go to "Institutional Library"
2. [ ] Click "Publish New Entry"
3. [ ] Fill in:
   - Title: `TEST_RESOURCE_01`
   - Subject: `English`
   - Type: `Link (YouTube/Vimeo)`
   - URL: `https://www.youtube.com/embed/dQw4w9WgXcQ`
   - Visibility: `My School Only`
4. [ ] Click Submit

### Check Console
Should see logs in order:
```
1. Starting resource creation... {newTitle: "TEST_RESOURCE_01", ...}
2. Saving resource to Firestore: {id: "...", title: "TEST_RESOURCE_01", ...}
3. ✅ Successfully saved resources/...
```

### Verify Result
- [ ] Alert shows: `✅ Resource "TEST_RESOURCE_01" published successfully!`
- [ ] Form closes automatically
- [ ] No red errors in console

### Check in App
1. [ ] Refresh page (F5)
2. [ ] Go back to "Institutional Library"
3. [ ] Search for or scroll to find "TEST_RESOURCE_01"
4. [ ] Resource should be visible in the list
5. [ ] Click resource to view
6. [ ] YouTube video should display in modal

### Result
- [ ] **PASS** - Resource appears and video plays
- [ ] **FAIL** - Resource doesn't appear or video doesn't play

---

## 🧪 Test Case 2: PDF File Upload

### Create Resource
1. [ ] Click "Publish New Entry" again
2. [ ] Fill in:
   - Title: `TEST_PDF_02`
   - Subject: `Mathematics`
   - Type: `File Upload`
   - Choose File: [Select a PDF file < 5MB]
   - Visibility: `My School Only`
3. [ ] Click Submit

### Check Console
Should see logs in order:
```
1. Starting resource creation... {newTitle: "TEST_PDF_02", ...}
2. Uploading file: [filename.pdf]
3. File uploaded successfully: https://firebasestorage.googleapis.com/...
4. Saving resource to Firestore: {id: "...", title: "TEST_PDF_02", ...}
5. ✅ Successfully saved resources/...
```

### Verify Result
- [ ] Alert shows: `✅ Resource "TEST_PDF_02" published successfully!`
- [ ] No errors in console

### Check in App
1. [ ] Refresh page
2. [ ] Find "TEST_PDF_02"
3. [ ] Click to view
4. [ ] PDF should display with page controls
5. [ ] Try navigating pages

### Result
- [ ] **PASS** - PDF displays with page navigation
- [ ] **FAIL** - PDF doesn't display or shows error

---

## 🧪 Test Case 3: Visibility - My School Only

### Create Resource
1. [ ] Click "Publish New Entry"
2. [ ] Fill in:
   - Title: `TEST_VISIBILITY_SCHOOL`
   - Subject: `Science`
   - Type: `Link (YouTube/Vimeo)`
   - URL: `https://www.youtube.com/embed/dQw4w9WgXcQ`
   - Visibility: **My School Only**
3. [ ] Click Submit

### Check Console
- [ ] No errors
- [ ] "Successfully saved" message

### Verify Access
1. [ ] As teacher (logged in): Resource should appear
2. [ ] Log out and log in as student from **same school**: Should see resource
3. [ ] Log out and log in as student from **different school** (if available): Should NOT see resource

### Result
- [ ] **PASS** - Access control working correctly
- [ ] **FAIL** - Visibility not enforced

---

## 🧪 Test Case 4: Visibility - Same Grade Only

### Create Resource
1. [ ] Click "Publish New Entry"
2. [ ] Fill in:
   - Title: `TEST_VISIBILITY_GRADE`
   - Subject: `History`
   - Type: `Link (YouTube/Vimeo)`
   - URL: `https://www.youtube.com/embed/dQw4w9WgXcQ`
   - Visibility: **Same Grade Only**
3. [ ] Click Submit

### Check Console
- [ ] No errors
- [ ] "Successfully saved" message

### Verify Access
1. [ ] As teacher (logged in): Resource should appear
2. [ ] Log out and log in as student with **same grade**: Should see resource
3. [ ] (If available) Log in as student with **different grade**: Should NOT see resource

### Result
- [ ] **PASS** - Grade-based access control working
- [ ] **FAIL** - Grade visibility not enforced

---

## 🧪 Test Case 5: Visibility - Specific Grades

### Create Resource
1. [ ] Click "Publish New Entry"
2. [ ] Fill in:
   - Title: `TEST_SPECIFIC_GRADES`
   - Subject: `Art`
   - Type: `Link (YouTube/Vimeo)`
   - URL: `https://www.youtube.com/embed/dQw4w9WgXcQ`
   - Visibility: **Specific Grades**
3. [ ] Grade selection dropdown appears
4. [ ] Select 2-3 specific grades (check boxes)
5. [ ] Click Submit

### Check Console
- [ ] No errors
- [ ] "Successfully saved" message
- [ ] Console shows `visibleGrades: [array of selected grades]`

### Verify Access
1. [ ] As teacher: Resource should appear
2. [ ] As student in **selected grade**: Should see resource
3. [ ] As student in **non-selected grade**: Should NOT see resource

### Result
- [ ] **PASS** - Specific grade access control working
- [ ] **FAIL** - Specific grade visibility not enforced

---

## 🧪 Test Case 6: Image Upload

### Create Resource
1. [ ] Click "Publish New Entry"
2. [ ] Fill in:
   - Title: `TEST_IMAGE_06`
   - Subject: `Art`
   - Type: `File Upload`
   - Choose File: [Select an image: PNG, JPG, or GIF < 5MB]
   - Visibility: `My School Only`
3. [ ] Click Submit

### Check Console
- [ ] Logs show file uploading
- [ ] No errors

### Check in App
1. [ ] Refresh and find resource
2. [ ] Click to view
3. [ ] Image should display

### Result
- [ ] **PASS** - Image displays correctly
- [ ] **FAIL** - Image doesn't display

---

## 🧪 Test Case 7: Large File (Test Size Limit)

### Try to Upload Large File
1. [ ] Click "Publish New Entry"
2. [ ] Try to select a file > 500MB
3. [ ] Click Submit

### Expected Result
- [ ] Console shows: `File too large (xxx.xMB). Maximum is 500MB.`
- [ ] Alert shows error message
- [ ] Resource NOT saved

### Result
- [ ] **PASS** - File size validation working
- [ ] **FAIL** - No size validation

---

## 🧪 Test Case 8: Missing Visibility Field

### For Existing Resources
Check if old resources (created before visibility update) still work:

1. [ ] Check Firestore console
2. [ ] Look at `resources` collection
3. [ ] Check if new resources have `visibility` field
4. [ ] Check if old resources have `visibility` field

### If Old Resources Missing Field
- [ ] That's a known issue
- [ ] New resources are fine
- [ ] Students won't see old resources (read rule blocks them)
- [ ] Need to migrate old documents (add default visibility)

---

## 📊 Summary of Results

| Test | Result | Notes |
|------|--------|-------|
| Simple Link | ✅ PASS / ❌ FAIL | |
| PDF Upload | ✅ PASS / ❌ FAIL | |
| School-Only Visibility | ✅ PASS / ❌ FAIL | |
| Grade-Only Visibility | ✅ PASS / ❌ FAIL | |
| Specific Grades | ✅ PASS / ❌ FAIL | |
| Image Upload | ✅ PASS / ❌ FAIL | |
| File Size Limit | ✅ PASS / ❌ FAIL | |

---

## 🚨 If Tests Fail

### Immediate Steps
1. [ ] Check browser console for errors
2. [ ] Write down exact error message
3. [ ] Take screenshot of error
4. [ ] Check that schoolId is in profile
5. [ ] Try hard refresh (Ctrl+Shift+R)

### Debugging Commands
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage

# Check Firebase connection
firebase emulators:start

# Restart development server
npm run dev
```

### If Still Failing
1. [ ] Reference TROUBLESHOOTING_SAVE_ISSUES.md
2. [ ] Check error code in console
3. [ ] Match error to troubleshooting section
4. [ ] Follow fix steps
5. [ ] Try test again

---

## ✅ Final Checklist

Before declaring "Testing Complete":

- [ ] All 8 test cases completed
- [ ] Console has no red errors
- [ ] Firebase rules deployed
- [ ] Storage rules deployed
- [ ] All visibility settings work
- [ ] Resources persist after refresh
- [ ] File uploads complete successfully
- [ ] No permissions errors
- [ ] No "schoolId is required" errors
- [ ] Old resources either migrated or acceptable to hide

---

## 📝 Notes

Use this space to document any issues found:

```
Issue 1:
Description: 
Console Error: 
Solution Tried: 
Result: 

Issue 2:
Description: 
Console Error: 
Solution Tried: 
Result: 
```

---

**Status:** Ready for Testing
**Last Updated:** [Today's date]
**Tester:** [Your name]
