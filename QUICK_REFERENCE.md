# Quick Reference - Visibility Settings & File Formats

## File Upload Support Matrix

```
FILE FORMAT          PREVIEW      DOWNLOAD    MODULES
═════════════════════════════════════════════════════════════════
MP4 Video            ✅ Player     ✅ Yes      Homework, Resources
WebM Video           ✅ Player     ✅ Yes      Homework, Resources
OGG Video            ✅ Player     ✅ Yes      Homework, Resources
─────────────────────────────────────────────────────────────────
PDF                  ✅ Viewer     ✅ Yes      Homework, Resources
DOCX                 ✅ Preview    ✅ Yes      Homework, Resources
─────────────────────────────────────────────────────────────────
PNG/JPG/GIF          ✅ Gallery    ✅ Yes      Homework, Resources
WebP/SVG             ✅ Gallery    ✅ Yes      Homework, Resources
─────────────────────────────────────────────────────────────────
YouTube URL          ✅ Embedded   N/A         Resources
Vimeo URL            ✅ Embedded   N/A         Resources
```

## Visibility Settings at a Glance

```
SETTING                    ICON    AUDIENCE                          DEFAULT
═══════════════════════════════════════════════════════════════════════════════
All Schools Network        🌍     All staff & students everywhere    ❌ Not default
My School Only            🏢     All grades in your school          ✅ SAFE DEFAULT
Same Grade Only           🔒     Your grade only                     ❌ Not default
Select Specific Grades    🎯     Pick 2-4 grades manually           ❌ Not default
```

## How Students See Content

```
STUDENT IN GRADE 10, SCHOOL A
====================================
Sees:
├─ All Schools Network items (all educators)
├─ My School Only items from School A
├─ Same Grade Only items (because student = Grade 10)
├─ Specific Grades items that include Grade 10
│
Does NOT see:
├─ Items from School B (unless All Schools)
├─ Grade 9 "Same Grade Only" items
└─ Specific Grades that don't include Grade 10
```

## Creating Homework with Visibility

```
CREATE ASSIGNMENT FORM
════════════════════════════════════════════

[Subject] [Grade] [Title]
[Due Date] [Upload Cover Image]
[Instructions Textarea]
[Upload Attachments - MP4, PDF, DOCX, Images]

┌──────────────────────────────────────────┐
│ SHARE SETTINGS                           │
├──────────────────────────────────────────┤
│ ☐ 🌍 All Schools Network                 │
│    Visible to educators across all       │
│                                          │
│ ☑ 🏢 My School Only                      │
│    Visible to all grades in your school  │
│                                          │
│ ☐ 🔒 Same Grade Only                     │
│    Visible only to Grade 10              │
│                                          │
│ ☐ 🎯 Select Specific Grades             │
│    Choose which grades can view          │
│    [Grade 9] [Grade 10] [Grade 11]       │
│    [Grade 12]                            │
└──────────────────────────────────────────┘

[Publish Task Button]
```

## Creating Learning Resource with Visibility

```
CREATE RESOURCE FORM
════════════════════════════════════════════

[Title] [Subject] [Grade Level]
[Upload Thumbnail]
[Choose: Video/Link or Upload File]

Video/Link:
[Paste YouTube/Vimeo URL]

OR File:
[Select PDF/DOCX/MP4/Images]

[Description]

┌──────────────────────────────────────────┐
│ SHARE SETTINGS (Same 4 Options)          │
│                                          │
│ ☑ 🏢 My School Only  (DEFAULT)          │
│ ☐ 🌍 All Schools Network                │
│ ☐ 🔒 Same Grade Only                    │
│ ☐ 🎯 Select Specific Grades            │
└──────────────────────────────────────────┘

[Verify & Publish Entry Button]
```

## File Preview Capabilities

```
MP4 VIDEO
═════════════════════════════════════════
┌─────────────────────────────────────┐
│ Video Title        [X Close]         │
├─────────────────────────────────────┤
│                                     │
│      ▶ [PLAY BUTTON]                │
│      [HTML5 Video Player]           │
│      ◄──────────────────────►       │
│      [Volume] [Fullscreen] [Ctrl]   │
│                                     │
├─────────────────────────────────────┤
│ Description below                   │
└─────────────────────────────────────┘

PDF DOCUMENT
═════════════════════════════════════════
┌─────────────────────────────────────┐
│ Document Title     [X Close]         │
├─────────────────────────────────────┤
│                                     │
│      [Page Preview - Image]         │
│      [High Quality Rendering]       │
│                                     │
│  ◄ Previous  |  Page 3 of 50  |  ► Next
│                                     │
├─────────────────────────────────────┤
│ Description below                   │
└─────────────────────────────────────┘

WORD DOCUMENT (DOCX)
═════════════════════════════════════════
┌─────────────────────────────────────┐
│ Document Title     [X Close]         │
├─────────────────────────────────────┤
│                                     │
│  # Heading 1                        │
│  Formatted content with styles      │
│  **Bold text** and _italic_         │
│  • Bullet points                    │
│  • Are supported                    │
│  Scrollable area for long docs      │
│                                     │
├─────────────────────────────────────┤
│ Description below                   │
└─────────────────────────────────────┘

IMAGE
═════════════════════════════════════════
┌─────────────────────────────────────┐
│ Image Title        [X Close]         │
├─────────────────────────────────────┤
│                                     │
│         [Full-Size Image]           │
│         [Optimized Display]         │
│         [Maintains Aspect Ratio]    │
│                                     │
├─────────────────────────────────────┤
│ Description below                   │
└─────────────────────────────────────┘
```

## Database Rules Summary

```
BEFORE (Old Rules)
═════════════════════════════════════════
if (schoolId == mySchoolId) {
  allow read
}
→ Simple school-based access

AFTER (New Rules with Visibility)
═════════════════════════════════════════
if (visibility == 'all-schools') {
  allow read  // Everyone
}
else if (visibility == 'school' && schoolId == mySchoolId) {
  allow read  // My school only
}
else if (visibility == 'grade' && grade == myGrade) {
  allow read  // Same grade only
}
else if (visibility == 'specific-grade' && myGrade in visibleGrades) {
  allow read  // Specific grades
}
→ Four-tier granular access control
```

## Common Use Cases

```
SCENARIO 1: District Curriculum
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Resource: "NCERT Math Textbook Solutions"
Set to: 🌍 All Schools Network
Why: Share best practices across district
Who sees: Every school in the district

SCENARIO 2: School Event
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Assignment: "Science Fair - Submit Projects"
Set to: 🏢 My School Only
Why: Only relevant to our school
Who sees: All students in school

SCENARIO 3: Grade-Level Exam
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Assignment: "Grade 12 Final Exam Prep"
Set to: 🔒 Same Grade Only
Why: Prevents younger students seeing it
Who sees: Grade 12 only

SCENARIO 4: Differentiated Learning
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Resource: "Advanced Algebra - Grade 10-12"
Set to: 🎯 Select Specific Grades
Select: Grade 10, Grade 11, Grade 12
Why: Remedial students not ready yet
Who sees: Only selected advanced grades
```

## Keyboard Shortcuts & Tips

```
TIPS FOR EDUCATORS
════════════════════════════════════════
✓ Default to "My School Only" - safer
✓ Test visibility with one assignment first
✓ Use thumbnails for better UI
✓ Include file type in names: "Chapter5_PDF"
✓ Can't change visibility after creating?
  → Delete and recreate
✓ Check file formats are supported
  → Video: MP4/WebM/OGG
  → Doc: PDF/DOCX
  → Images: PNG/JPG/GIF/WebP
✓ Preview always available in-app
✓ Download always available
✓ Large files (>500MB)?
  → Compress before uploading
```

## Troubleshooting Checklist

```
CAN'T SEE ASSIGNMENT?
□ Check grade matches visibility
□ If "Specific Grades" - is your grade listed?
□ Check if in same school (for "My School Only")
□ Refresh browser
□ Check Firestore rules deployed

FILE WON'T PREVIEW?
□ Check file format is supported
□ Try download instead (fallback)
□ Check file isn't corrupted
□ Check file size < limits
□ Browser DevTools → Console for errors

VISIBILITY SETTINGS NOT SHOWING?
□ Clear browser cache
□ Refresh page
□ Check you have educator/principal role
□ Check currentUser.grade is set

RULES NOT WORKING?
□ Deploy rules: firebase deploy --only firestore:rules
□ Check myGrade() helper is present
□ Verify visibility field exists in data
□ Check visibleGrades array format
□ Test with Firebase Console
```

## Icons Used

```
🌍 Globe    = All Schools Network
🏢 Building = My School Only
🔒 Lock     = Same Grade Only / Select Specific
🎯 Target   = Select Specific Grades
📹 Video    = MP4/Video content
📄 Document = PDF/DOCX content
🖼️  Image    = Image files
🔗 Link     = YouTube/Vimeo
👁️ Eye      = View/Preview
⬇️ Download = Download file
```

## Version Info

```
Multimedia Viewer Version: 1.0
├─ MP4 Support: pdfjs-dist 3.11.174
├─ PDF Support: mammoth 1.8.1
├─ React: 19.2.0
└─ TypeScript: Latest

Visibility System Version: 1.0
├─ Firebase Rules: v2
├─ Multi-tenant: ✅ Supported
├─ Backward Compatible: ✅ Yes
└─ Roles Supported: Teacher, Principal
```

---

**Last Updated:** January 27, 2026
**Status:** ✅ Complete & Ready for Production
