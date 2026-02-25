# Multimedia Viewer Implementation Guide

## Overview
Your app now supports in-app viewing of multiple file formats including MP4 videos, PDFs, Word documents, images, and YouTube/Vimeo links.

## New Features Implemented

### 1. **Video Support (MP4)**
- Native HTML5 `<video>` element with built-in controls
- Play, pause, seek, and volume controls
- Fullscreen support
- No external dependencies required

### 2. **PDF Viewer**
- Client-side PDF rendering using `pdfjs-dist`
- Page-by-page navigation with Previous/Next buttons
- Page counter showing current page and total pages
- Automatic rendering of first 50 pages
- High-quality image conversion (2x scale for clarity)

### 3. **Word Document Viewer (DOCX)**
- Converts DOCX files to HTML using `mammoth` library
- Preserves formatting, fonts, and styling
- Responsive layout with proper spacing
- Scrollable content area

### 4. **Image Viewer**
- Supports: JPG, JPEG, PNG, GIF, WebP, SVG
- Optimized display with max-width and max-height
- Maintains aspect ratio

### 5. **Video Links (YouTube & Vimeo)**
- Embedded iframe players (already working, now enhanced)
- YouTube URL formats: youtube.com/watch?v= and youtu.be/
- Vimeo URL formats: vimeo.com/

## Installation

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: New Packages Added
The following packages were added to `package.json`:
- `pdfjs-dist@^3.11.174` - PDF rendering
- `mammoth@^1.8.1` - DOCX to HTML conversion

## How It Works

### HomeworkModule Changes
**File:** `components/HomeworkModule.tsx`

**Before:** Attachments could only be downloaded
**After:** Clicking attachments opens them in ResourceViewer modal

**New State Variables:**
```typescript
const [viewingAttachmentUrl, setViewingAttachmentUrl] = useState<string | null>(null);
const [viewingAttachmentName, setViewingAttachmentName] = useState<string>('');
const [viewingAttachmentType, setViewingAttachmentType] = useState<string>('');
```

**Button Change:**
- Changed from "DOWNLOAD" button to "VIEW FILE" button
- Clicking opens the file in the ResourceViewer modal instead of downloading

### ResourceViewer Enhancements
**File:** `components/ResourceViewer.tsx`

**New Detection Logic:**
The component automatically detects file type based on:
- File extension (.pdf, .mp4, .docx, etc.)
- URL domain (youtube.com, vimeo.com)
- MIME type (application/pdf, etc.)
- Custom type hints passed as props

**Supported File Types & Rendering:**
1. **MP4/WebM/OGG** → HTML5 Video Player
2. **PDF** → PDF.js Canvas Renderer (page-by-page)
3. **DOCX** → Mammoth Converter → HTML Preview
4. **Images** → Direct IMG tag
5. **YouTube/Vimeo** → Embedded IFrame
6. **Unknown** → External Link Fallback

## Usage

### For Teachers (Uploading Resources)

#### Homework Attachments:
1. Click "Create Assignment" button
2. Upload files (images, PDFs, MP4s, DOCX files)
3. Files will automatically be viewable in-app when students click them

#### Learning Resources:
1. Use Tutoring Module
2. Select "Upload File" or paste video links
3. Both resource types can now preview in-app

### For Students (Viewing Resources)

#### Homework:
1. Click assignment card to open details
2. See "Learning Materials" section with attachments
3. Click "VIEW FILE" button to open in modal viewer
4. For PDFs: Use Previous/Next buttons to navigate pages
5. For MP4s: Use video player controls

#### Learning Resources:
1. Browse resources by subject
2. Click "Open" button to view
3. See full content inline without leaving app

## Technical Implementation

### PDF.js Worker Setup
```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
```

### File Type Detection Function
```typescript
const getFileType = (urlOrType: string): string => {
  const lowerUrl = urlOrType.toLowerCase();
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'youtube';
  if (lowerUrl.endsWith('.pdf')) return 'pdf';
  if (lowerUrl.endsWith('.docx')) return 'docx';
  if (lowerUrl.match(/\.(mp4|webm|ogg)$/i)) return 'mp4';
  if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
  return 'unknown';
};
```

### Async Loading States
- **Loading State:** Shows spinning loader while content is being processed
- **Error State:** Displays error message with option to open externally
- **Ready State:** Displays full content in optimized viewer

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| MP4 Video | ✅ | ✅ | ✅ | ✅ |
| PDF Viewer | ✅ | ✅ | ✅ | ✅ |
| DOCX Preview | ✅ | ✅ | ✅ | ✅ |
| Images | ✅ | ✅ | ✅ | ✅ |
| YouTube/Vimeo | ✅ | ✅ | ✅ | ✅ |

## Performance Notes

### PDF Optimization
- Only first 50 pages are rendered (prevents memory issues with large documents)
- Pages are rendered at 2x scale for clarity
- Rendering happens asynchronously to prevent UI blocking

### File Size Recommendations
- **MP4 Videos:** < 500MB (consider compression)
- **PDFs:** < 100MB (large PDFs may slow down rendering)
- **Images:** < 10MB per image
- **DOCX:** < 50MB (very rare)

## Error Handling

If a file fails to load, users see:
1. Error message explaining what went wrong
2. "Open External File" button as fallback
3. Link opens in new tab/window

## Future Enhancements (Optional)

1. **PowerPoint Support:** Add pptx-js or libreoffice.js
2. **Excel Support:** Add excel.js or handsontable
3. **Video Compression:** Add FFMPEG for server-side compression
4. **Caching:** Cache rendered PDFs for faster subsequent views
5. **Annotations:** Add PDF annotation tools
6. **Full-text Search:** Index PDF content for searching

## Troubleshooting

### PDF won't load
- Check file is valid PDF (not corrupted)
- Ensure CORS headers are set if loading from external server
- Check browser console for specific errors

### MP4 won't play
- Verify video codec is supported (H.264 recommended)
- Check CORS headers for cross-origin videos
- Try converting to WebM or OGG format

### DOCX conversion failed
- Ensure file is valid DOCX (not DOC or other format)
- Check file isn't password-protected
- Verify file isn't corrupted

### All files show external link fallback
- Check network requests in browser DevTools
- Verify URLs are accessible
- Ensure CORS is properly configured on backend

## Testing the Implementation

```bash
# Run dev server
npm run dev

# Test with sample files:
# 1. Upload a PDF to homework assignment
# 2. Upload an MP4 video
# 3. Upload a DOCX file
# 4. Upload a PNG image
# 5. Paste a YouTube link

# Click each resource to verify it opens correctly
```

## Files Modified

1. ✅ `package.json` - Added dependencies
2. ✅ `components/ResourceViewer.tsx` - Enhanced with all formats
3. ✅ `components/HomeworkModule.tsx` - Integrated ResourceViewer for attachments

## No Breaking Changes

- All existing functionality remains intact
- Old download behavior can still be used via right-click "Save As"
- All user roles (Student, Parent, Teacher, Principal) have access to viewers
