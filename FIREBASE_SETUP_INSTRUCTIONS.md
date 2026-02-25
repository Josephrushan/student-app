# Firebase Firestore Manual Setup

Copy and execute these steps in your Firebase Console to set up Educater Institute.

## Step 1: Create Schools Collection (if it doesn't exist)

In Firestore Database:
1. Click "+ Start collection"
2. Collection ID: `schools`
3. Click "Next"
4. Skip the auto-document creation (click "Finish")

## Step 2: Create Educater Institute School Document

In the `schools` collection:
1. Click "Add document"
2. Document ID: `educater-institute`
3. Add these fields:

| Field | Type | Value |
|-------|------|-------|
| `id` | String | `educater-institute` |
| `name` | String | `Educater Institute` |
| `level` | String | `Secondary` |
| `logoUrl` | String | `https://ui-avatars.com/api/?name=Educater+Institute&background=072432&color=fff&size=256` |

4. Click "Save"

**Expected Result:**
```
schools/educater-institute
├── id: "educater-institute"
├── name: "Educater Institute"
├── level: "Secondary"
└── logoUrl: "https://ui-avatars.com/api/..."
```

## Step 3: Auto-Create User Documents on First Login

When you log in with the app, the user documents will be created automatically.

**But if you want to create them manually:**

### For info@visualmotion.co.za:

1. Go to `users` collection
2. Click "Add document"
3. Document ID: `{Firebase_UID}` (you'll get this from Firebase Auth)
4. Add these fields:

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

### For test@educater.co.za:

Document ID: `{Firebase_UID}` (from Auth)

```json
{
  "id": "{UID}",
  "name": "Test",
  "surname": "Principal",
  "email": "test@educater.co.za",
  "role": "Principal",
  "school": "Educater Institute",
  "schoolId": "educater-institute",
  "schoolLogo": "https://ui-avatars.com/api/?name=Educater+Institute&background=072432&color=fff&size=256",
  "grade": "All",
  "avatar": "https://ui-avatars.com/api/?name=Test+Principal&background=072432&color=fff",
  "isPaid": true,
  "allowedGrades": ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
  "isGlobalResourceCreator": true
}
```

## Step 4: Create Auth Accounts (if not already created)

In **Firebase Console → Authentication:**

1. Click "Add user"
2. Email: `info@visualmotion.co.za`
3. Password: `Imsocool123`
4. Click "Add user"
5. Copy the **UID** (you'll need this for the user document)
6. Repeat for `test@educater.co.za` with password `Educater123`

## Step 5: Verify Setup

After login, check Firestore:

Your user document should show:
```
schoolId: "educater-institute" ✓
isGlobalResourceCreator: true ✓
```

Assignments created should show:
```
visibility: "all-schools" ✓
schoolId: "educater-institute" ✓
```

---

## Quick Copy-Paste JSON

If your Firestore UI allows import, use this format:

### School Document
```json
{
  "educater-institute": {
    "id": "educater-institute",
    "name": "Educater Institute",
    "level": "Secondary",
    "logoUrl": "https://ui-avatars.com/api/?name=Educater+Institute&background=072432&color=fff&size=256"
  }
}
```

### User Document (to paste field-by-field)
```
id: educater-institute
name: System
surname: Admin
email: info@visualmotion.co.za
role: Principal
school: Educater Institute
schoolId: educater-institute
schoolLogo: https://ui-avatars.com/api/?name=Educater+Institute&background=072432&color=fff&size=256
grade: All
avatar: https://ui-avatars.com/api/?name=System+Admin&background=072432&color=fff
isPaid: true
allowedGrades: [Grade 8, Grade 9, Grade 10, Grade 11, Grade 12]
isGlobalResourceCreator: true
```

---

## Troubleshooting

### ❌ Error: "schoolId is required"
Check that the user document has `schoolId: "educater-institute"`

### ❌ Assignment shows "school" not "all-schools"
Check that user document has `isGlobalResourceCreator: true`

### ❌ Can't find the user's UID
1. Go to Authentication tab
2. Click the user email
3. Copy the "User UID" at the top

---

## What Happens After Setup

| Action | Result |
|--------|--------|
| Log in | User loads with schoolId=educater-institute |
| Create assignment | visibility auto-set to "all-schools" |
| See share settings | Green banner appears instead of options |
| Publish material | Content visible network-wide ✓ |

---

**All set!** Test by logging in with the credentials. 🚀
