# Educater Institute Setup - Quick Start

## What is Educater Institute?

Educater Institute is a special school in your system where:
- **Two principal accounts** operate with full administrative powers
- **All learning materials created** are automatically visible to the entire network (all schools)
- **Normal school features** are available (manage staff, announcements, assignments, resources)
- **Perfect for**: Creating global curriculum resources, training materials, templates

## Login Credentials

### Account 1: Super Admin / System Developer
```
Email: info@visualmotion.co.za
Password: Imsocool123
Role: Principal of Educater Institute
```

### Account 2: Test Account
```
Email: test@educater.co.za
Password: Educater123
Role: Principal of Educater Institute
```

## How to Set Up in Firebase

### Option A: Automatic Setup (Recommended)

1. Navigate to your school app
2. Open browser DevTools (F12 → Console)
3. Run this code:

```javascript
// Import the initializer
import { initializeEducaterInstitute } from './services/educaterInstituteInitializer.ts';

// Run initialization
await initializeEducaterInstitute();
```

4. Check the console for success messages
5. Refresh the page and test login

### Option B: Manual Firebase Console Setup

1. **Create the School Document**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project → Firestore Database
   - Create a new collection: `schools`
   - Add a document with ID: `educater-institute`
   - Add these fields:
     ```json
     {
       "id": "educater-institute",
       "name": "Educater Institute",
       "logoUrl": "https://ui-avatars.com/api/?name=Educater+Institute&background=072432&color=fff&size=256",
       "level": "Secondary"
     }
     ```

2. **Create User Accounts in Firebase Auth**
   - Go to Authentication tab
   - Click "Create User"
   - Add: `info@visualmotion.co.za` / `Imsocool123`
   - Copy the generated UID

3. **Create User Documents**
   - In Firestore, go to `users` collection
   - Add document with ID = (the UID from step 2)
   - Add these fields:
     ```json
     {
       "id": "{UID}",
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

4. **Repeat for test@educater.co.za account**

## What Happens When You Log In?

### ✅ You'll see:
- Dashboard showing Educater Institute
- Full principal controls
- All teacher management features
- All student management features

### ✅ When you create assignments/resources:
- **Automatic behavior**: All materials automatically visible network-wide
- **Share Settings**: Hidden - resources always go network-wide
- **Visual indicator**: Green banner saying "Global Content Creator"

### ✅ Features available:
- Create announcements (visible to all schools)
- Upload learning resources (visible to all schools)
- Create assignments (visible to all schools)
- Manage announcements and alerts
- View global dashboard
- Access all Educater Institute settings

## Example Workflow

### Creating Global Training Materials

1. Log in as `test@educater.co.za` / `Educater123`
2. Navigate to Homework/Resources section
3. Click "Create Assignment" or "Add Resource"
4. Add your content (title, description, files)
5. You'll see: "Global Content Creator - All materials visible network-wide"
6. Submit
7. ✨ Material is instantly available to all teachers and students

## Technical Details

### Code Changes Made

1. **LoginScreen.tsx** - Updated to handle both accounts
2. **types.ts** - Added `isGlobalResourceCreator` flag
3. **HomeworkModule.tsx** - Auto-sets visibility to 'all-schools'
4. **firebaseRules** - Already support CRM creating schools/principals

### Firestore Rules

The rules already support:
- CRM creating schools
- CRM creating principals
- Global visibility for designated users
- Proper access control

### Visibility Behavior

When a global resource creator makes content:
```
isGlobalCreator = true → visibility = 'all-schools' (forced)
Regular principal → visibility = user-selected
```

## Testing Checklist

- [ ] Log in with `info@visualmotion.co.za` / `Imsocool123`
- [ ] See "Educater Institute" as school name
- [ ] Create an assignment
- [ ] See "Global Content Creator" message instead of visibility options
- [ ] Assignment is saved with `visibility: 'all-schools'`
- [ ] Log out
- [ ] Log in with `test@educater.co.za` / `Educater123`
- [ ] Same behavior as above
- [ ] Log in with a regular school principal
- [ ] See normal visibility options (not global)

## Troubleshooting

### I can't log in with these credentials
**Solution**: Firebase Auth account doesn't exist
- Check Firebase Console → Authentication
- Create the user account manually if needed
- Then log in with the app (it will create Firestore document)

### I see visibility options (not the green banner)
**Solution**: `isGlobalResourceCreator` flag is missing
- Navigate to Firebase Console → Firestore
- Find the user document in `users` collection
- Add field: `isGlobalResourceCreator: true`
- Refresh the app and log back in

### Materials are not global (visible only to school)
**Solution**: Check the visibility field
- In Firestore, find the assignment document
- Check the `visibility` field
- It should be `'all-schools'` not `'school'` or `'grade'`
- If not, the auto-detection didn't work - verify `schoolId === 'educater-institute'`

## Support

If you have issues:
1. Check browser console for errors (F12)
2. Verify Firebase project is connected
3. Check Firestore has correct documents
4. Verify Firebase Rules allow the operations
5. Check network tab for failed requests

## Related Files

- [SETUP_EDUCATER_INSTITUTE.md](./SETUP_EDUCATER_INSTITUTE.md) - Detailed setup guide
- [educaterInstituteInitializer.ts](./services/educaterInstituteInitializer.ts) - Setup helper functions
- [LoginScreen.tsx](./components/LoginScreen.tsx) - Login logic (lines 343-385)
- [HomeworkModule.tsx](./components/HomeworkModule.tsx) - Auto-global visibility (lines 91-111)
