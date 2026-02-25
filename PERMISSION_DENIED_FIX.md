# 🔧 Permission Denied Error - FIXED

## The Problem

You were seeing these errors in the console:
```
Permission denied for resources. SID: school_1767719181915
Permission denied for assignments. SID: school_1767719181915
```

Even though resources **were saving successfully** (logs showed ✅ Successfully saved).

## Root Cause

The Firestore security rules required a `visibility` field on all documents. When reading documents:
- Documents with the `visibility` field → Rules evaluated correctly
- Documents WITHOUT the `visibility` field → **READ ACCESS DENIED**

Many existing documents didn't have the visibility field, so students couldn't read them.

## The Fix

✅ **Updated Firestore Rules** to handle missing visibility field:

```firestore
function canReadAssignment(assign) {
  // If visibility field is MISSING, allow read based on schoolId (backward compatibility)
  // If visibility field EXISTS, check specific visibility rules
  return !('visibility' in assign) ? 
    assign.schoolId == mySchoolId() :
    assign.visibility == 'all-schools' ||
    (assign.visibility == 'school' && assign.schoolId == mySchoolId()) ||
    (assign.visibility == 'grade' && assign.grade == myGrade()) ||
    (assign.visibility == 'specific-grade' && myGrade() in assign.visibleGrades);
}
```

**What This Does:**
1. Checks if `visibility` field exists on the document
2. If MISSING → Allow read if student is in same school ✅
3. If EXISTS → Apply the visibility rules ✅

## Status

✅ **Fixed and Deployed** to Firebase (commit 1bc9f39)

## What Happens Now

### Scenario 1: Document HAS visibility field ✅
```
Teacher creates assignment with visibility = 'school'
Student in same school tries to read it
↓
Rules check: visibility == 'school' && schoolId matches
↓
✅ Permission GRANTED → Student can see assignment
```

### Scenario 2: Document MISSING visibility field (existing docs) ✅
```
Old assignment from before visibility was added
Student tries to read it
↓
Rules check: !('visibility' in assign) → TRUE (field is missing)
↓
Fall back to: schoolId == mySchoolId()
↓
If same school: ✅ Permission GRANTED
If different school: ❌ Permission DENIED (correct)
```

## Action Required

### Immediate (Do This Now)
1. **Hard refresh the app** (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)
2. **Go to Institutional Library or Homework**
3. **Assignments/Resources should now appear** ✅

### Verify It Works
- Go to your school's Institutional Library
- Should see resources that were created
- Click to view → Should open with media player
- No more "Permission denied" errors

### Test with Students
- Have students log in
- Go to Homework section
- They should see assignments from their grade/school
- Click to view → Should work

## Technical Details

### Files Changed
1. **firestore.rules** - Updated visibility check functions
2. **firebase.json** - Added (required for Firebase CLI)
3. **firestore.indexes.json** - Added (required for Firebase CLI)

### What Was Deployed
- New security rules are now **LIVE** on Firebase
- They apply to ALL read operations
- Backward compatible with old documents

### Why This Works

**Before:**
```
Read request for assignment
↓
Rule checks: canReadAssignment(resource.data)
↓
assignment.visibility == 'school' && schoolId matches
↓
But visibility field doesn't exist!
↓
Expression fails → Permission DENIED ❌
```

**After:**
```
Read request for assignment
↓
Rule checks: canReadAssignment(resource.data)
↓
If no visibility field → Allow by schoolId ✅
If visibility field exists → Check visibility rules ✅
↓
Permission GRANTED or DENIED based on correct logic ✅
```

## Troubleshooting

### Still Seeing Permission Denied?
1. **Hard refresh**: Ctrl+Shift+R
2. **Clear cache**: DevTools → Application → Storage → Clear Site Data
3. **Wait 30 seconds** - Rules can take time to propagate
4. **Try incognito mode** - Bypasses cache

### Resources Still Not Appearing?
1. **Check browser console** (F12)
2. Look for permission denied error
3. If you see it, try the steps above
4. If no error → Resource might not have been saved (check Firestore manually)

### Check Firestore Directly
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **websitey-9f8e4**
3. Go to Firestore Database
4. Check collections:
   - `assignments` → Should see documents
   - `resources` → Should see documents
5. Click a document → Check if `visibility` field exists
   - If it does → Rules are checking it
   - If it doesn't → Rules use fallback (schoolId matching)

## Expected Behavior Now

### When Teacher Creates Resource
```javascript
// Logs show:
✅ Starting resource creation...
✅ Uploading file...
✅ ✅ Successfully saved resources/123456
```

### When Student Views List
```javascript
// No "Permission denied" errors
// Resources appear in the list
// Students see only resources matching their:
  - School (if visibility = 'school')
  - Grade (if visibility = 'grade')
  - Selected grades (if visibility = 'specific-grade')
  - All schools (if visibility = 'all-schools')
```

## Timeline

- **Before:** Resources saved but couldn't be read ❌
- **Now:** Resources save AND students can read them ✅
- **Commit:** 1bc9f39 (main branch)
- **Deployed:** Yes ✅

## Next Steps

1. **Refresh your browser** (Ctrl+Shift+R)
2. **Try accessing assignments/resources**
3. **Should work now** ✅

If you still have issues:
1. Check browser console for actual error
2. Check Firebase console for documents
3. Verify student's school and grade match document visibility

---

**Status:** ✅ FIXED & DEPLOYED  
**Time to Apply Fix:** Instant (already deployed)  
**Action Required:** Refresh browser and test
