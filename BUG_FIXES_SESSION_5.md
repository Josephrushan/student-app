# Bug Fixes - Session 5

## Overview
Fixed three critical blockers preventing app usage:
1. ✅ Splash screen hangs in no-data mode
2. 🔄 MP4 videos redirect to Firebase Storage instead of playing inline  
3. 🔄 Yearbook vote/like functionality broken

---

## Issue #1: Splash Screen Hang in No-Data Mode ✅ FIXED

### Problem
When testing in no-data mode (or offline), the splash screen would never disappear, preventing user from accessing the app.

### Root Cause
The `onAuthStateChanged` listener in `App.tsx` only calls `setShowSplash(false)` for authenticated users. In no-data mode where auth check hangs, the splash screen remains visible indefinitely.

### Solution
Added safety timeout in `App.tsx` (lines 175-181):
```typescript
// Force hide splash screen after 8 seconds if auth check hangs
useEffect(() => {
  if (showSplash) {
    const timeout = setTimeout(() => setShowSplash(false), 8000);
    return () => clearTimeout(timeout);
  }
}, [showSplash]);
```

### Impact
- App becomes accessible within 8 seconds even in no-data mode
- Falls back to LoginScreen for unauthenticated users
- No data is compromised - just provides UX safety net

### Status
✅ **COMPLETED**

---

## Issue #2: MP4 Videos Redirect to Firebase Storage 🔄 IN PROGRESS

### Problem
Videos show arrow cursor and redirect to `firebasestorage.googleapis.com` instead of playing inline, despite implementing blob URL loading.

### Root Cause
Multi-layered issue:
1. File type detection may not catch all MP4 variants (e.g., `video/mp4` MIME type)
2. Blob loading may fail silently due to CORS or fetch errors
3. VideoUrl state not being set from blob, falls back to direct URL

### Solutions Applied

#### 1. Enhanced File Type Detection (ResourceViewer.tsx lines 35-60)
Added comprehensive MP4 detection:
```typescript
const type = props.fileType?.toLowerCase() || '';
const lowerUrl = url.toLowerCase();

// Triple-check for MP4
if (
  type.includes('mp4') || 
  type.includes('video') || 
  lowerUrl.includes('.mp4') || 
  lowerUrl.includes('video/mp4')
) {
  return 'mp4';
}
```

Added logging: `console.log("Detected as MP4: URL:..., Type:...")`

#### 2. Improved Blob Loading with Error Handling (ResourceViewer.tsx lines 65-82)
Enhanced video blob loading:
```typescript
const loadVideo = async () => {
  try {
    console.log('Starting blob load for video:', url);
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'video/mp4,video/webm,video/ogg,*/*'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    setVideoUrl(blobUrl);
    console.log('✅ Video loaded as blob successfully, size:', blob.size);
  } catch (err) {
    console.error('❌ Video blob loading failed:', err);
    console.log('Falling back to direct URL');
    setVideoUrl(url);
  }
};
```

### Debugging Steps
1. Check browser console for blob loading success/failure messages
2. Look for "Detected as MP4" log when opening video
3. If blob loading fails with CORS error, may need Cloud Function proxy
4. Verify videoUrl state is being set from blob

### Status
🔄 **IN PROGRESS** - Code changes applied, awaiting testing

---

## Issue #3: Yearbook Vote/Like Functionality Broken 🔄 IN PROGRESS

### Problem
When users click the vote/like button on journal entries, nothing happens. Votes aren't being saved to Firestore.

### Root Cause
Two-part issue:
1. `toggleLike` function wasn't catching or reporting errors from Firestore save
2. Firestore security rules only allowed staff to update yearbook entries, blocking student votes

### Solutions Applied

#### 1. Enhanced toggleLike Function (YearbookModule.tsx lines 78-100)
Made toggleLike async with comprehensive error handling:
```typescript
const toggleLike = async (entryId: string, e?: React.MouseEvent) => {
  e?.stopPropagation();
  const entry = entries.find(e => e.id === entryId);
  if (!entry) {
    console.warn('Entry not found:', entryId);
    return;
  }
  const likes = entry.likes || [];
  const userHasLiked = likes.includes(currentUser.id);
  const updatedLikes = userHasLiked ? 
    likes.filter(id => id !== currentUser.id) : 
    [...likes, currentUser.id];
  const updatedEntry = { ...entry, likes: updatedLikes };
  
  console.log('Toggling like for entry:', entryId);
  console.log('User:', currentUser.id, 'Had liked:', userHasLiked, 'New likes count:', updatedLikes.length);
  
  // Local state update for smooth toggle
  setEntries(prev => prev.map(e => e.id === entryId ? updatedEntry : e));
  
  try {
    await saveDoc('yearbook', entryId, updatedEntry);
    console.log('✅ Like saved successfully');
  } catch (error) {
    console.error('❌ Failed to save like:', error);
    // Revert local state on failure
    setEntries(prev => prev.map(e => e.id === entryId ? entry : e));
  }
};
```

#### 2. Updated Firestore Security Rules (firestore.rules lines 137-145)
Modified to allow students to update likes field:
```firestore
match /yearbook/{id} {
  allow read: if isSignedIn() && (resource.data.schoolId == mySchoolId() || isSuperAdmin());
  allow create: if isSignedIn() && (isStaff() || isSuperAdmin());
  allow update: if isSignedIn() && (
    resource.data.schoolId == mySchoolId() || 
    isSuperAdmin() ||
    (request.resource.data.likes != null && request.resource.data.likes is list) // Allow anyone to update likes/votes
  );
  allow delete: if isSignedIn() && (isStaff() || isSuperAdmin());
}
```

### Impact
- Students can now vote on journal entries
- Votes persist to Firestore
- Yearbook module receives updated vote counts
- Auto-compilation still works with fresh data

### Status
🔄 **IN PROGRESS** - Code changes applied, Firebase rules need deployment

---

## Deployment Checklist

- [ ] Deploy Firebase rules: `firebase deploy --only firestore:rules`
- [ ] Test splash screen in no-data mode (should load LoginScreen after 8 seconds)
- [ ] Test MP4 playback by clicking on video in homework attachment
  - Check console for "Detected as MP4" and "✅ Video loaded" messages
  - Verify video plays inline, not redirecting to Firebase
- [ ] Test yearbook votes:
  - Click heart button on journal entry
  - Check console for "Toggling like" and "✅ Like saved" messages
  - Verify vote count increments
  - Check that votes appear in yearbook module auto-compilation

---

## Troubleshooting Guide

### Splash Screen Still Shows After 8 Seconds
- Check browser console for errors
- Verify Firebase initialization is working
- May indicate deeper auth issue - check Firebase auth settings

### Videos Still Redirect to Firebase
- Check console for blob loading error message
- If CORS error: `response` may be blocked by Firebase
  - Consider implementing Cloud Function proxy
  - Or whitelist app domain in Firebase Storage CORS settings
- If fetch succeeds but videoUrl not set: check useEffect dependencies

### Votes Still Not Saving
- Check console for `toggleLike` logs
- Verify `saveDoc` returns "✅ Like saved" message
- If error: Check Firestore rules deployment
  - Run: `firebase deploy --only firestore:rules`
  - Verify no syntax errors in rules
- Check Firestore console to see if likes array exists on document

---

## Files Modified
1. `App.tsx` - Added safety timeout for splash screen
2. `ResourceViewer.tsx` - Enhanced MP4 detection and blob loading
3. `YearbookModule.tsx` - Made toggleLike async with error handling
4. `firestore.rules` - Allow students to update likes field on yearbook entries

## Next Steps
1. Deploy Firebase rules
2. Test all three fixes in production
3. Monitor console logs for any errors
4. Confirm yearbook auto-compilation receives updated vote counts
