# Visibility & Sharing Settings - Complete Guide

## Overview

Educators and principals can now control who can view their homework assignments and learning resources using granular visibility settings. This feature supports multi-school networks while maintaining complete privacy control.

## Features

### Four-Tier Visibility Options

#### 1. **All Schools Network** 🌍
- **Visible to:** Educators and staff across ALL connected schools
- **Use case:** High-quality resources that benefit the entire network
- **Example:** "NCERT Mathematics Chapter 5 - Complete Solutions"
- **Icon:** Globe

#### 2. **My School Only** 🏢
- **Visible to:** All grades within YOUR school (students, parents, teachers)
- **Use case:** School-specific curricula, internal policies, school events
- **Example:** "Tuesday Assembly Reading List"
- **Icon:** Building

#### 3. **Same Grade Only** 🔒
- **Visible to:** Only students in YOUR current grade
- **Use case:** Grade-specific material (class-appropriate content)
- **Example:** "Grade 10 Physics - Motion & Forces" (only to Grade 10)
- **Icon:** Lock

#### 4. **Select Specific Grades** 🎯
- **Visible to:** Manually chosen grades in your school
- **Use case:** Advanced/remedial content for selected grades
- **Example:** "Remedial Algebra - Available to Grade 9 & 10"
- **Icon:** Lock

## File Types Supported for Upload

Teachers and principals can upload ALL of these file formats:

| Format | Type | Preview | Download |
|--------|------|---------|----------|
| **MP4** | Video | ✅ In-app player | ✅ Yes |
| **WebM/OGG** | Video | ✅ In-app player | ✅ Yes |
| **PDF** | Document | ✅ Page-by-page viewer | ✅ Yes |
| **DOCX** | Document | ✅ HTML preview | ✅ Yes |
| **PNG/JPG/GIF** | Image | ✅ Gallery viewer | ✅ Yes |
| **YouTube Link** | Video | ✅ Embedded player | N/A |
| **Vimeo Link** | Video | ✅ Embedded player | N/A |

## How It Works

### For Educators Creating Homework

```
1. Click "Create Academic Task" button
2. Fill in:
   - Subject Focus
   - Task Title
   - Task Instructions
   - Due Date
   - Upload any files (MP4, PDF, DOCX, images)
   
3. Set visibility:
   ☐ All Schools Network     (green badge - most open)
   ☐ My School Only          (yellow badge)
   ☐ Same Grade Only         (red badge)
   ☐ Select Specific Grades  (red badge - custom)
   
4. Click "Publish Task"
```

### For Educators Creating Learning Resources

```
1. Click "Create Learning Resource" button
2. Fill in:
   - Entry Title
   - Subject Focus
   - Choose format (Video/Link or Upload File)
   - Add cover image (optional)
   - Add description
   
3. Set visibility (same 4 options as homework)
   
4. Click "Verify & Publish Entry"
```

### For Students Viewing Content

**Students automatically see:**
- All resources shared to "All Schools Network"
- All resources shared to "My School Only"
- Resources shared to their current grade
- Resources shared to "My Grade Only"
- Custom resources that include their grade

**Students cannot see:**
- Resources from other schools (unless "All Schools Network")
- Resources from other grades (unless specifically included)

## Security & Firebase Rules

### Firestore Rules Enforcement

Your `firestore.rules` has been updated to validate visibility:

```typescript
function canReadAssignment(assign) {
  let visibility = assign.visibility;
  return visibility == 'all-schools' ||
         (visibility == 'school' && assign.schoolId == mySchoolId()) ||
         (visibility == 'grade' && assign.grade == myGrade()) ||
         (visibility == 'specific-grade' && myGrade() in assign.visibleGrades);
}

function canReadResource(res) {
  let visibility = res.visibility;
  return visibility == 'all-schools' ||
         (visibility == 'school' && res.schoolId == mySchoolId()) ||
         (visibility == 'grade' && res.grade == myGrade()) ||
         (visibility == 'specific-grade' && myGrade() in res.visibleGrades);
}
```

### What This Means

✅ **Security is enforced at database level:**
- Students cannot query assignments they shouldn't see
- Firestore will block reads that violate visibility rules
- No client-side workarounds possible
- Multi-tenant isolation maintained

### Data Structure

#### Assignments Document
```typescript
{
  id: string;
  title: string;
  description: string;
  visibility: 'school' | 'grade' | 'specific-grade' | 'all-schools';
  visibleGrades?: ['Grade 10', 'Grade 11'];  // Only if specific-grade
  schoolId: string;
  grade: string;  // Author's grade
  attachments: { url, name, type }[];
  // ... other fields
}
```

#### Resources Document
```typescript
{
  id: string;
  title: string;
  description: string;
  visibility: 'school' | 'grade' | 'specific-grade' | 'all-schools';
  visibleGrades?: ['Grade 9', 'Grade 10'];  // Only if specific-grade
  schoolId: string;
  grade: string;  // Author's grade
  url?: string;
  fileName?: string;
  // ... other fields
}
```

## Usage Examples

### Example 1: District-Wide Resource Share
**Scenario:** Principal creates math tutorial for all schools in district

1. Create Resource: "NCERT Calculus Chapter 3"
2. Upload File: "Calculus_Chapter3.pdf"
3. Set Visibility: **All Schools Network** 🌍
4. Result: All educators and students across district can access it

### Example 2: School-Specific Homework
**Scenario:** Teacher creates assignment specific to their school

1. Create Task: "School Science Fair Instructions"
2. Upload Files: "FairRules.pdf", "JudgingRubric.docx"
3. Set Visibility: **My School Only** 🏢
4. Result: Only students in that school can see it

### Example 3: Grade-Level Content
**Scenario:** Teacher creates remedial material for Grade 9 & 10

1. Create Resource: "Algebra Basics - Extra Practice"
2. Upload File: "AlgebraReview.pdf"
3. Set Visibility: **Select Specific Grades** 🎯
4. Select: Grade 9, Grade 10
5. Result: Only Grade 9 and Grade 10 students see it

### Example 4: Grade-Exclusive Content
**Scenario:** Teacher creates Grade 12-only exam preparation

1. Create Task: "Grade 12 Final Exam Review"
2. Upload Files: "ExamPatterns.pdf", "PracticePaper.docx"
3. Set Visibility: **Same Grade Only** 🔒
4. Result: Only Grade 12 students in their school see it

## Filtering in Firestore Queries

The app automatically filters based on current user:

```typescript
// HomeworkModule: When fetching assignments
const filteredAssignments = useMemo(() => {
  return assignments.filter(a => a.grade === currentUser.grade)
    .sort((a, b) => b.timestamp - a.timestamp);
}, [assignments, currentUser.grade]);
```

The Firestore rules prevent loading unauthorized documents before this filter runs.

## Common Scenarios

| Scenario | Best Setting | Why |
|----------|--------------|-----|
| National curriculum resource | All Schools | Share best practices network-wide |
| School assembly date | My School Only | Irrelevant to other schools |
| Class-specific homework | Same Grade Only | Age-appropriate content |
| Advanced math for Grade 10-12 | Select Specific Grades | Only advanced students |
| Tutorial that works for all | All Schools Network | Maximum reach & help |

## Troubleshooting

### "Why can't my student see this assignment?"
1. Check visibility setting - is it set correctly?
2. Verify student's grade matches the visibility
3. If specific grades selected, verify student's grade is included
4. Refresh browser to clear cache

### "Why can't I change visibility after publishing?"
- Currently, visibility is set at creation time
- To change: Delete and recreate with new visibility
- Consider keeping originals private until finalized

### "Can parent accounts see these resources?"
- Yes, parents see what their linked student sees
- Parent visibility matches student grade
- Parents can view all file types

## File Upload Limits & Recommendations

### Recommended File Sizes
- **MP4 Videos:** < 500MB (consider compression)
- **PDFs:** < 100MB (large PDFs render slower)
- **DOCX:** < 50MB
- **Images:** < 10MB per image
- **Video Links:** Unlimited (YouTube/Vimeo hosted)

### Storage Efficiency
- Compress videos before uploading
- Optimize PDFs with tools like ILovePDF
- Use image compression for thumbnails
- Prefer YouTube/Vimeo links over large video files

## Best Practices

1. **Use "My School Only" as default** - Safer, can expand if needed
2. **Test visibility before major rollout** - Try with one assignment first
3. **Document why you chose each visibility** - Helps consistency
4. **Use "All Schools Network" sparingly** - Should be exceptional resources
5. **Include file type in resource name** - "Chapter5_PDF" vs "Chapter5"
6. **Create thumbnails for better UX** - Helps students choose resources
7. **Regular cleanup** - Archive old assignments, remove duplicates

## FAQs

**Q: Can a student see resources from another school?**
A: No, unless marked "All Schools Network"

**Q: Can teachers see each other's resources?**
A: Yes, teachers can see any resource they have visibility to (same rules as students apply)

**Q: What if I create a resource for Grade 9-10 but I'm Grade 11?**
A: You can still create it and students in those grades will see it

**Q: Can I change visibility after publishing?**
A: Not directly - you'd need to delete and recreate

**Q: Are visibility rules enforced at database?**
A: Yes! Firestore rules prevent unauthorized reads at the database level

**Q: What happens if I accidentally set something to "All Schools"?**
A: Delete it and recreate with correct visibility setting

## Data Migration (If Applicable)

If you had existing assignments without visibility settings:

```typescript
// They will default to:
visibility: 'school'  // Safe default (visible only to your school)
```

To update existing documents, use Firebase Console or CLI:
```bash
# CLI command to update all assignments to 'school' visibility
firebase firestore:delete assignments --recursive
# Then update manually or via code
```

## Support

For issues with visibility:
1. Check Firestore rules are deployed correctly
2. Verify user's schoolId and grade in their profile
3. Check browser console for any Firebase errors
4. Test with simple visibility first before complex rules

## Next Steps

1. ✅ Deploy updated `firestore.rules`
2. ✅ Test visibility with sample assignments
3. ✅ Create user documentation for educators
4. ✅ Train staff on visibility options
5. ✅ Monitor for any access issues
