# Educater Institute Setup Guide

## Overview
This guide sets up the Educater Institute as a special school where:
- **Principals**: info@visualmotion.co.za (password: Imsocool123) and test@educater.co.za (password: Educater123)
- **Special Feature**: Learning materials created by these principals are automatically global (visible to all schools)
- **Experience**: They log in as normal principals but get the full school management interface

## Step 1: Create the School in Firestore Console

1. Go to Firebase Console → Firestore Database
2. Create a new document in the `schools` collection with ID: `educater-institute`
3. Add these fields:

```json
{
  "id": "educater-institute",
  "name": "Educater Institute",
  "logoUrl": "https://ui-avatars.com/api/?name=Educater+Institute&background=072432&color=fff&size=256",
  "level": "Secondary"
}
```

## Step 2: Create User Documents (Option A - Manual)

### User 1: info@visualmotion.co.za
In the `users` collection, create a document with the Firebase UID (you'll get this from Firebase Auth after login)

```json
{
  "id": "{AUTH_UID}",
  "name": "System",
  "surname": "Admin",
  "email": "info@visualmotion.co.za",
  "role": "Principal",
  "school": "Educater Institute",
  "schoolId": "educater-institute",
  "schoolLogo": "https://ui-avatars.com/api/?name=Educater+Institute&background=072432&color=fff&size=256",
  "grade": "All",
  "avatar": "https://ui-avatars.com/api/?name=System+Admin&background=072432&color=fff",
  "isPaid": true,
  "allowedGrades": ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
  "isGlobalResourceCreator": true
}
```

### User 2: test@educater.co.za
```json
{
  "id": "{AUTH_UID}",
  "name": "Test",
  "surname": "Principal",
  "email": "test@educater.co.za",
  "role": "Principal",
  "school": "Educater Institute",
  "schoolId": "educater-institute",
  "schoolLogo": "https://ui-avatars.com/api/?name=Educater+Institute&background=072432&color=fff&size=256",
  "grade": "All",
  "avatar": "https://ui-avatars.com/api/?name=Test+Principal&background=00ff8e&color=fff",
  "isPaid": true,
  "allowedGrades": ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
  "isGlobalResourceCreator": true
}
```

## Step 3: Update Firebase Rules

The firestore.rules have been updated to support:
- CRM operations creating schools and principals
- Global resource creation by designated users
- Proper visibility scope for resources

## Step 4: Test the Setup

1. Sign in with info@visualmotion.co.za / Imsocool123
2. Verify you see Educater Institute as the school
3. Try creating an assignment - it should auto-set to "All Schools Network"
4. Sign out and sign in with test@educater.co.za / Educater123
5. Verify same behavior

## Features Enabled

### For these accounts:
✅ Full principal features (all grades visible)
✅ Create assignments, announcements, resources
✅ View global dashboard across all schools
✅ Manage classes and teachers
✅ Access admin settings

### Global Resource Visibility:
When these accounts create learning materials, they automatically appear to:
- All teachers across all schools
- All students (if public)
- All parents (if public)

## Notes
- The app detects users from "educater-institute" schoolId
- Global visibility is enforced at the app level (HomeworkModule, ResourceViewer, etc.)
- These accounts are super admin level with normal school principal UI
