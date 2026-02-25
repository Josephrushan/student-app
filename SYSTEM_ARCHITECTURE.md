# System Architecture: Educater Institute Global Content

```
┌─────────────────────────────────────────────────────────────────┐
│                         LOGIN SCREEN                           │
│                                                                 │
│  Email: info@visualmotion.co.za    Educater Institute       │
│  Password: Imsocool123              info@visualmotion.co.za  │
│            OR                       test@educater.co.za      │
│  test@educater.co.za / Educater123                           │
│                                                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────────┐
         │ Firebase Auth Verification│
         │ (auto-create if needed)   │
         └────────────┬──────────────┘
                      │
                      ▼
      ┌──────────────────────────────────┐
      │ Assign to Educater Institute     │
      │ - schoolId: educater-institute   │
      │ - role: Principal                │
      │ - isGlobalResourceCreator: true  │
      └───────────┬──────────────────────┘
                  │
                  ▼
         ┌──────────────────────┐
         │  PRINCIPAL DASHBOARD │
         │                      │
         │ • All Grades (8-12) │
         │ • Full Features      │
         │ • Global Reach       │
         │                      │
         └──────────────┬───────┘
                        │
    ┌───────────────────┼───────────────────┐
    │                   │                   │
    ▼                   ▼                   ▼
┌─────────┐       ┌─────────┐       ┌──────────┐
│Homework │       │Announce │       │ Resources│
│Module   │       │ Module  │       │ Module   │
└────┬────┘       └────┬────┘       └────┬─────┘
     │                 │                 │
     ▼                 ▼                 ▼
┌──────────────────────────────────────────────────┐
│  CONTENT CREATION FORM                          │
│  ☐ Title                                        │
│  ☐ Description                                  │
│  ☐ Files/Resources                              │
└──────────┬───────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────┐
    │ DETECT GLOBAL CREATOR                │
    │                                      │
    │ if (schoolId === 'educater-inst') { │
    │   isGlobal = true;                   │
    │ }                                    │
    └──────────────┬───────────────────────┘
                   │
           ┌───────┴────────┐
           │                │
           ▼                ▼
    ┌────────────────┐  ┌──────────────────────┐
    │ GLOBAL CREATOR │  │ REGULAR PRINCIPAL    │
    │                │  │                      │
    │ Green Banner:  │  │ Visibility Options:  │
    │ ✨ Global      │  │ ○ All Schools        │
    │ Content        │  │ ○ My School Only     │
    │ Creator        │  │ ○ Same Grade Only    │
    │                │  │ ○ Specific Grades    │
    │ No options     │  │                      │
    │ shown          │  │ User selects scope   │
    └────┬───────────┘  └──────┬───────────────┘
         │                     │
         ▼                     ▼
    vis='all-schools'   vis=user-selected
         │                     │
         └─────────┬───────────┘
                   │
                   ▼
        ┌────────────────────────┐
        │ SAVE TO FIRESTORE      │
        │                        │
        │ Assignment {           │
        │   id: ..               │
        │   title: ..            │
        │   schoolId: ..         │
        │   visibility: ..       │
        │   timestamp: ..        │
        │ }                      │
        └────────────┬───────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    visibility=               visibility=
    'all-schools'             'school'
         │                     │
    ┌────┴─────────────┐  ┌────┴──────────┐
    │                  │  │               │
    ▼                  ▼  ▼               ▼
  All Schools      Network Grade    School  Grade
  Teachers  ────> Students  ────> Teachers Students
  Students         Parents          Parents
  Parents          Parents
    │                  │
    │                  │
    └────────┬─────────┘
             │
             ▼
      ┌──────────────┐
      │ FINAL ACCESS │
      │    MATRIX    │
      │              │
      │ School A     │ ✓ Read
      │ School B     │ ✓ Read
      │ School C     │ ✓ Read
      │ Global       │ ✓ Access
      └──────────────┘
```

---

## User Role & Permission Matrix

```
┌─────────────────┬──────────────┬──────────────┬──────────────┐
│ Action          │ Educater Inst│ Regular Prin │ Regular Teach│
│                 │ (Global)     │ (School)     │ (School)     │
├─────────────────┼──────────────┼──────────────┼──────────────┤
│ Create Assign   │ ✓ Global     │ ✓ School-w   │ ✓ Grade-w    │
│ Create Resource │ ✓ Global     │ ✓ School-w   │ ✓ Grade-w    │
│ Create Announce │ ✓ Global     │ ✓ School-w   │ ✗            │
│                 │              │              │              │
│ View All Schools│ ✓ Yes        │ ✗ No         │ ✗ No         │
│ Manage Teachers │ ✓ (Edu Inst) │ ✓ (School)   │ ✗            │
│ View All Grades │ ✓ Yes        │ ✓ Yes        │ ✓ Assigned   │
│                 │              │              │              │
│ Content Visible │ All Schools  │ Own School   │ Own Grade    │
│ Students See    │ Network-wide │ School-wide  │ Grade-wide   │
│ Teachers See    │ Network-wide │ School-wide  │ Off limits   │
└─────────────────┴──────────────┴──────────────┴──────────────┘
```

---

## Data Flow Diagram

```
USER LOGIN
    │
    ├──[Educater Institute Account]──────────┐
    │                                         │
    └──[Regular School Account]──────────┐   │
                                         │   │
                                         ▼   ▼
                                  Firebase Auth
                                         │
                                         ▼
                              Load User from Firestore
                                         │
                            ┌────────────┴────────────┐
                            │                         │
                      Edu Inst Check?                │
                       YES    /  NO                   │
                       /           \                  │
                      ▼             ▼                 ▼
                  ┌────────┐   ┌──────────┐
                  │Set flag │   │No flag   │
                  │isGlobal=│   │isGlobal= │
                  │true     │   │false     │
                  └───┬─────┘   └────┬─────┘
                      │              │
                      └──────┬───────┘
                             │
                             ▼
                      Load Dashboard
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
              Content Creation?   No - Just view
                    │
            ┌───────┤
            │       │
         YES│       └─→ Show normal content
            │
            ▼
      isGlobal flag?
            │
        ┌───┴───┐
      YES│      │NO
        │       │
        ▼       ▼
    Force     Show user
  visibility  options
   'all-schls'
```

---

## Database Structure

```
FIRESTORE DATABASE
│
├── schools/
│   ├── educater-institute/
│   │   ├── id: "educater-institute"
│   │   ├── name: "Educater Institute"
│   │   ├── level: "Secondary"
│   │   └── logoUrl: "..."
│   │
│   ├── school-001/
│   │   └── ...
│   └── school-002/
│       └── ...
│
├── users/
│   ├── {uid-1}/
│   │   ├── name: "System"
│   │   ├── email: "info@visualmotion.co.za"
│   │   ├── schoolId: "educater-institute"
│   │   ├── isGlobalResourceCreator: true  ← KEY
│   │   └── ...
│   │
│   ├── {uid-2}/
│   │   ├── name: "Test"
│   │   ├── email: "test@educater.co.za"
│   │   ├── schoolId: "educater-institute"
│   │   ├── isGlobalResourceCreator: true  ← KEY
│   │   └── ...
│   │
│   ├── {uid-3}/
│   │   ├── name: "Principal A"
│   │   ├── email: "principal_a@school.co.za"
│   │   ├── schoolId: "school-001"
│   │   └── ... (no isGlobalResourceCreator)
│   └── ...
│
├── assignments/
│   ├── {assignment-1}/
│   │   ├── title: "Global Math Assignment"
│   │   ├── schoolId: "educater-institute"
│   │   ├── visibility: "all-schools"  ← KEY
│   │   ├── createdBy: info@visualmotion.co.za
│   │   └── ...
│   │
│   ├── {assignment-2}/
│   │   ├── title: "School Math Assignment"
│   │   ├── schoolId: "school-001"
│   │   ├── visibility: "school"         ← Different
│   │   ├── createdBy: principal_a@school.co.za
│   │   └── ...
│   │
│   └── ...
│
├── resources/
│   ├── {resource-1}/
│   │   ├── fileName: "Global Template.pdf"
│   │   ├── schoolId: "educater-institute"
│   │   ├── visibility: "all-schools"
│   │   └── ...
│   │
│   └── ...
│
└── announcements/
    ├── {announce-1}/
    │   ├── message: "Global Announcement"
    │   ├── schoolId: "educater-institute"
    │   ├── visibility: "all-schools"
    │   └── ...
    │
    └── ...
```

---

## Access Control Rules

```
FIRESTORE RULES LOGIC
┌─ New Account detects: info@visualmotion.co.za

    IF schoolId === 'educater-institute' THEN
        isGlobalResourceCreator = true
        visibility = 'all-schools' (forced)
        
        Assignment is created with:
        {
            schoolId: 'educater-institute',
            visibility: 'all-schools'
        }
        
        This allows:
        • All authenticated users to read (via rules)
        • Teachers to access network-wide content
        • Students to see global assignments
        • Parents to view global resources
        
    ELSE (regular school principal)
    
        User selects visibility:
        • 'school' → schoolId only
        • 'grade' → same grade only
        • 'all-schools' → (manual option)
        • 'specific-grade' → selected grades
        
        Assignment is created with user selection
```

---

## Feature Comparison Table

```
╔════════════════════╦═══════════════════╦══════════════════╗
║ Aspect             ║ Educater Institute║ Regular School   ║
╠════════════════════╬═══════════════════╬══════════════════╣
║ School             ║ Educater Institute║ Any School       ║
║ Login              ║ special keywords  ║ email/password   ║
║ Dashboard          ║ Principal view    ║ Principal view   ║
║ Content Created    ║ Automatically     ║ User selected    ║
║                    ║ global            ║ per item         ║
║ Share UI           ║ Green banner      ║ Option buttons   ║
║                    ║ No selection      ║ Full selection   ║
║ Student Sees       ║ All materials     ║ School/grade     ║
║ Teacher Sees       ║ Network-wide      ║ School-wide      ║
║ Default Scope      ║ All Schools (100%)║ Own School (1%)  ║
╚════════════════════╩═══════════════════╩══════════════════╝
```

---

## Implementation Summary

✅ **Login Layer**
- Special account detection
- Automatic Firebase Auth sync

✅ **Data Layer**  
- User marked with isGlobalResourceCreator
- schoolId = educater-institute

✅ **Logic Layer**
- Auto-detection on content creation
- Force global visibility

✅ **UI Layer**
- Green banner for global creators
- Hidden visibility options
- Normal options for regular users

✅ **Rules Layer**
- Firestore allows all-schools visibility
- Proper access control maintained
- No breaking changes

---

**Result**: Seamless global content creation with no friction! 🚀
