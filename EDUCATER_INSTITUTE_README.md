# 🎓 EDUCATER INSTITUTE - QUICK REFERENCE

## What You Now Have

✅ **Dual Principal Accounts** for Educater Institute  
✅ **Automatic Global Content** - Materials visible to entire network  
✅ **Normal Principal UI** - Full school management features  
✅ **No Config Needed** - Just log in and use  

---

## Login Credentials

### Account 1: You (System Admin)
```
Email: info@visualmotion.co.za
Password: Imsocool123
```

### Account 2: Test Account
```
Email: test@educater.co.za
Password: Educater123
```

---

## What Happens When You Log In

```
┌─────────────────────────────────────┐
│ info@visualmotion.co.za             │
│ Imsocool123                         │
└──────────────┬──────────────────────┘
               │
               ▼
       ┌───────────────────────┐
       │ Firebase Auth Check   │
       │ (create if needed)    │
       └───────────┬───────────┘
                   │
                   ▼
      ┌────────────────────────────────┐
      │ Load User as Principal         │
      │ - School: Educater Institute   │
      │ - Role: Principal              │
      │ - Grades: All (8-12)          │
      │ - Global Creator: TRUE         │
      └────────────┬───────────────────┘
                   │
                   ▼
       ┌───────────────────────┐
       │ Normal Dashboard      │
       │ (look like principal) │
       └───────────────────────┘
```

---

## Creating Global Materials

```
Click "Create Assignment"
        ↓
Fill out title, description, files
        ↓
See GREEN BANNER:
"Global Content Creator - 
 All materials visible network-wide"
        ↓
Click "Publish"
        ↓
Material instantly visible to:
✓ All teachers (all schools)
✓ All students (if public)
✓ All parents (if public)
```

---

## Feature Comparison

| Feature | Regular Principal | Educater Institute |
|---------|------------------|-------------------|
| Manage classes | ✓ Their school only | ✓ (Educater Institute) |
| Create assignments | ✓ School-wide | ✓ **NETWORK-WIDE** |
| Upload resources | ✓ School-wide | ✓ **NETWORK-WIDE** |
| View all schools | ✗ | ✓ |
| Global visibility | Manual option | Automatic |

---

## Setup Steps

### Step 1: Create School (One Time)
In Firebase Console → Firestore:
- Collection: `schools`
- Document ID: `educater-institute`
- Fields:
  ```
  id: educater-institute
  name: Educater Institute
  logoUrl: https://ui-avatars.com/api/?name=Educater+Institute&background=072432&color=fff
  level: Secondary
  ```

### Step 2: Just Log In!
The app will:
- ✓ Create Firebase Auth account if needed
- ✓ Create user profile in Firestore
- ✓ Set up as Principal of Educater Institute
- ✓ Enable global content creation

---

## Common Tasks

### Create Global Assignment
1. Click Homework module
2. Click "Create Assignment"
3. Fill in details (auto-set to global)
4. Publish
5. ✨ Visible to all schools

### Create Global Resource
1. Click Homework module  
2. Click "Add Resource"
3. Upload file (auto-set to global)
4. Publish
5. ✨ Available network-wide

### Create Announcement
1. Click Announcements module
2. Click "New Announcement"
3. Write message (auto-set to global)
4. Publish
5. ✨ Schools worldwide see it

---

## If Something Goes Wrong

### Can't Log In?
1. Go to Firebase Console
2. Create account manually in Authentication
3. Try login again

### See visibility options (not green banner)?
1. Firebase Console → Firestore
2. Find user in `users` collection
3. Add: `isGlobalResourceCreator: true`
4. Refresh app

### Materials only show in one school?
1. Check Firestore assignment document
2. Look for `visibility` field
3. Should be `all-schools` not `school`

---

## Files You Need to Know

📄 **EDUCATER_INSTITUTE_QUICK_START.md**  
→ Full setup and testing guide

📄 **EDUCATER_INSTITUTE_IMPLEMENTATION.md**  
→ Technical details and architecture

📄 **services/educaterInstituteInitializer.ts**  
→ Helper functions for setup

📄 **components/LoginScreen.tsx**  
→ Login logic (lines 343-385)

📄 **components/HomeworkModule.tsx**  
→ Auto-global visibility (lines 85-127)

---

## Quick Checklist

Before you start:
- [ ] School document created in Firestore
- [ ] Firebase project connected
- [ ] App running locally or deployed

Testing:
- [ ] Can log in with both credentials
- [ ] See "Educater Institute" as school
- [ ] See green "Global Content Creator" banner
- [ ] Can create assignments/resources
- [ ] Materials marked with "all-schools" visibility

---

## Key Concept

> **Educater Institute = System Administrator School**

It's a real school in the system that principals of, but with one special property: everything they create is automatically global.

Think of it as:
- Same features as a regular school principal
- But operating at network level instead of school level
- Automatic global visibility for all content
- No special permissions needed - just schoolId

---

## Support

Having issues? Check:
1. Browser console (F12) for errors
2. Firebase Console for missing documents
3. Firestore for correct field values
4. Network tab for failed requests

See documentation files for detailed troubleshooting.

---

**Ready to test?** 

Log in with: `info@visualmotion.co.za` / `Imsocool123`

Enjoy! 🚀
