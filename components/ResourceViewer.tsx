import React, { useState, useEffect } from 'react';
import { X, ExternalLink, FileText, PlayCircle, Image as ImageIcon, Loader, AlertCircle, Download } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ResourceViewerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  type: string;
  description?: string;
  fileName?: string;
}

const ResourceViewer: React.FC<ResourceViewerProps> = ({ isOpen, onClose, title, url, type, description, fileName })  => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [currentPdfPage, setCurrentPdfPage] = useState(0);
  const [pdfZoom, setPdfZoom] = useState(1);
  const [imageZoom, setImageZoom] = useState(1);
  const [docHtml, setDocHtml] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');

  if (!isOpen) return null;

  // Detect file type - enhanced with more fallbacks
  const getFileType = (urlOrType: string): string => {
    const lowerUrl = urlOrType.toLowerCase();
    
    // Check YouTube/Vimeo
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') || lowerUrl.includes('vimeo.com') || type.toLowerCase().includes('video')) {
      return 'youtube';
    }
    
    // Check PDF
    if (lowerUrl.includes('.pdf') || lowerUrl.includes('pdf')) {
      return 'pdf';
    }
    
    // Check DOCX
    if (lowerUrl.includes('.docx') || lowerUrl.includes('application/vnd.openxmlformats') || lowerUrl.includes('application/vnd.ms-word') || lowerUrl.includes('.doc')) {
      return 'docx';
    }
    
    // Check MP4/Video files - be more aggressive in detection
    if (lowerUrl.includes('.mp4') || lowerUrl.includes('.webm') || lowerUrl.includes('.ogg') || lowerUrl.includes('video/mp4') || lowerUrl.includes('video/') || type.toLowerCase().includes('mp4') || type.toLowerCase().includes('video')) {
      console.log('Detected as MP4: URL:', urlOrType, 'Type:', type);
      return 'mp4';
    }
    
    // Check Images
    if (lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg') || lowerUrl.includes('.png') || lowerUrl.includes('.gif') || lowerUrl.includes('.webp') || lowerUrl.includes('.svg') || lowerUrl.includes('image/')) {
      return 'image';
    }
    
    console.log('File type detection: URL =', urlOrType, 'Type =', type, ' - defaulting to unknown');
    return 'unknown';
  };

  const fileType = getFileType(url);

  // Load PDF
  useEffect(() => {
    if (fileType === 'pdf' && isOpen && !pdfPages.length) {
      loadPdf();
    }
  }, [isOpen, fileType]);

  // Load DOCX
  useEffect(() => {
    if (fileType === 'docx' && isOpen && !docHtml) {
      loadDocx();
    }
  }, [isOpen, fileType]);

  // Load Video as Blob to avoid Firebase Storage redirect
  useEffect(() => {
    if (fileType === 'mp4' && isOpen && !videoUrl) {
      loadVideo();
    }
  }, [isOpen, fileType]);

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

  const loadPdf = async () => {
    setLoading(true);
    setError(null);
    try {
      const pdf = await pdfjsLib.getDocument(url).promise;
      const pages: string[] = [];
      
      for (let i = 1; i <= Math.min(pdf.numPages, 50); i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (context) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
          
          pages.push(canvas.toDataURL('image/png'));
        }
      }
      setPdfPages(pages);
      setCurrentPdfPage(0);
    } catch (err) {
      setError('Failed to load PDF. Please try opening it externally.');
      console.error('PDF loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDocx = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setDocHtml(result.value);
    } catch (err) {
      setError('Failed to load Word document. Please try opening it externally.');
      console.error('DOCX loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    console.log('Rendering content - fileType:', fileType, 'loading:', loading, 'error:', error);
    
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500">
          <Loader className="w-12 h-12 mb-4 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Loading content...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-red-50 rounded-2xl border-4 border-dashed border-red-100">
          <AlertCircle className="w-20 h-20 mb-6 opacity-20 text-red-400" />
          <h4 className="text-xl font-black text-red-900 uppercase tracking-tight mb-2">Error Loading Content</h4>
          <p className="text-sm font-medium mb-8 max-w-xs text-center leading-relaxed text-red-700">{error}</p>
          <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center px-10 py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all hover:bg-red-700">
            Open External File <ExternalLink className="ml-3 w-4 h-4" />
          </a>
        </div>
      );
    }

    // Image
    if (fileType === 'image') {
      console.log('Rendering image');
      return (
        <div className="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden">
          <div className="flex-1 flex items-center justify-center bg-black overflow-auto">
            <img 
              src={url} 
              className="max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-200"
              style={{ transform: `scale(${imageZoom})` }}
              alt={title} 
            />
          </div>
          <div className="bg-slate-800 p-4 border-t border-slate-700 flex items-center justify-center gap-4">
            <button
              onClick={() => setImageZoom(Math.max(0.5, imageZoom - 0.2))}
              className="px-3 py-2 bg-slate-700 text-white rounded-lg font-bold text-sm hover:bg-slate-600 transition-all"
            >
              −
            </button>
            <span className="text-sm font-bold text-white min-w-12 text-center">
              {Math.round(imageZoom * 100)}%
            </span>
            <button
              onClick={() => setImageZoom(Math.min(3, imageZoom + 0.2))}
              className="px-3 py-2 bg-slate-700 text-white rounded-lg font-bold text-sm hover:bg-slate-600 transition-all"
            >
              +
            </button>
            <button
              onClick={() => setImageZoom(1)}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      );
    }

    // MP4 Video
    if (fileType === 'mp4') {
      console.log('Rendering MP4 video');
      return (
        <div className="w-full h-full bg-black rounded-2xl overflow-hidden relative shadow-2xl flex items-center justify-center" onContextMenu={(e) => e.preventDefault()}>
          {videoUrl ? (
            <video 
              src={videoUrl}
              controls
              autoPlay={false}
              className="w-full h-full object-contain"
              style={{ maxHeight: '100%', maxWidth: '100%' }}
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : (
            <div className="text-center">
              <Loader className="w-12 h-12 animate-spin text-indigo-500 mb-4 mx-auto" />
              <p className="text-white text-sm font-medium">Loading video...</p>
            </div>
          )}
        </div>
      );
    }

    // YouTube / Vimeo
    if (fileType === 'youtube') {
      console.log('Rendering YouTube/Vimeo');
      let embedUrl = url;
      if (url.includes('youtube.com/watch?v=')) embedUrl = url.replace('watch?v=', 'embed/');
      else if (url.includes('youtu.be/')) embedUrl = url.replace('youtu.be/', 'youtube.com/embed/');
      else if (url.includes('vimeo.com/')) embedUrl = url.replace('vimeo.com/', 'player.vimeo.com/video/');

      return (
        <div className="w-full h-full bg-black rounded-2xl overflow-hidden relative shadow-2xl">
          <iframe 
            src={embedUrl} 
            className="absolute inset-0 w-full h-full border-0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          />
        </div>
      );
    }

    // PDF
    if (fileType === 'pdf') {
      console.log('Rendering PDF - pages loaded:', pdfPages.length);
      return (
        <div className="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden">
          <div className="flex-1 flex items-center justify-center bg-black overflow-auto p-4">
            {pdfPages.length > 0 ? (
              <img 
                src={pdfPages[currentPdfPage]} 
                alt={`Page ${currentPdfPage + 1}`}
                className="h-full object-contain rounded-lg shadow-2xl transition-transform duration-200"
                style={{ transform: `scale(${pdfZoom})`, maxHeight: '100%', width: 'auto' }}
              />
            ) : (
              <div className="text-center">
                <Loader className="w-12 h-12 animate-spin text-indigo-500 mb-4 mx-auto" />
                <p className="text-white text-sm font-medium">Loading PDF...</p>
              </div>
            )}
          </div>
          {pdfPages.length > 0 && (
            <div className="bg-slate-800 p-4 border-t border-slate-700 space-y-3">
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPdfZoom(Math.max(0.5, pdfZoom - 0.2))}
                  className="px-3 py-2 bg-slate-700 text-white rounded-lg font-bold text-sm hover:bg-slate-600 transition-all"
                >
                  −
                </button>
                <span className="text-sm font-bold text-white min-w-16 text-center">
                  {Math.round(pdfZoom * 100)}%
                </span>
                <button
                  onClick={() => setPdfZoom(Math.min(3, pdfZoom + 0.2))}
                  className="px-3 py-2 bg-slate-700 text-white rounded-lg font-bold text-sm hover:bg-slate-600 transition-all"
                >
                  +
                </button>
                <button
                  onClick={() => setPdfZoom(1)}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all"
                >
                  Reset
                </button>
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentPdfPage(Math.max(0, currentPdfPage - 1))}
                  disabled={currentPdfPage === 0}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg font-bold text-sm disabled:opacity-50 hover:bg-slate-600 transition-all"
                >
                  ← Previous
                </button>
                <span className="text-sm font-bold text-white">
                  Page {currentPdfPage + 1} of {pdfPages.length}
                </span>
                <button
                  onClick={() => setCurrentPdfPage(Math.min(pdfPages.length - 1, currentPdfPage + 1))}
                  disabled={currentPdfPage === pdfPages.length - 1}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg font-bold text-sm disabled:opacity-50 hover:bg-slate-600 transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // DOCX
    if (fileType === 'docx') {
      console.log('Rendering DOCX');
      return (
        <div className="w-full h-full overflow-auto bg-slate-100 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="bg-white rounded-lg p-8 sm:p-12 shadow-md max-w-4xl mx-auto min-h-full">
            {docHtml ? (
              <div 
                className="prose prose-sm sm:prose-base max-w-none text-left text-slate-800 leading-relaxed
                  prose-p:mb-4 prose-p:text-base prose-p:leading-relaxed
                  prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-6 prose-h1:mt-8
                  prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-4 prose-h2:mt-6
                  prose-h3:text-xl prose-h3:font-bold prose-h3:mb-3 prose-h3:mt-4
                  prose-strong:font-bold prose-strong:text-slate-900
                  prose-em:italic prose-em:text-slate-700
                  prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4
                  prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4
                  prose-li:mb-2
                  prose-table:border-collapse prose-table:w-full prose-table:mb-4
                  prose-thead:bg-slate-100
                  prose-th:border prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-bold
                  prose-td:border prose-td:px-4 prose-td:py-2
                  prose-a:text-indigo-600 prose-a:underline hover:prose-a:text-indigo-700
                  prose-code:bg-slate-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-red-600 prose-code:font-mono
                  prose-blockquote:border-l-4 prose-blockquote:border-slate-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600"
                dangerouslySetInnerHTML={{ __html: docHtml }}
              />
            ) : (
              <div className="text-center py-20">
                <Loader className="w-12 h-12 animate-spin text-indigo-500 mb-4 mx-auto" />
                <p className="text-slate-600 text-sm font-medium">Loading document...</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Unknown type
    console.log('Rendering unknown type');
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-slate-50 rounded-2xl border-4 border-dashed border-slate-100">
        <FileText className="w-20 h-20 mb-6 opacity-20" />
        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Preview Not Supported</h4>
        <p className="text-sm font-medium mb-8 max-w-xs text-center leading-relaxed">File type cannot be previewed in-app. Click the download button or open the external link.</p>
        <div className="flex gap-3">
          <a href={url} target="_blank" rel="noreferrer" download={fileName} className="inline-flex items-center px-10 py-4 bg-[#072432] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all hover:brightness-110">
            Download <Download className="ml-3 w-4 h-4" />
          </a>
          <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all hover:bg-indigo-700">
            Open External <ExternalLink className="ml-3 w-4 h-4" />
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 sm:p-8 bg-slate-950/95 backdrop-blur-xl animate-fade-in">
      <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-6xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-up border border-white/10">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50 bg-white flex-shrink-0">
            <div className="text-left overflow-hidden">
                <h3 className="text-xl font-black text-slate-900 truncate uppercase tracking-tight leading-none mb-1">{title}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{type}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
                {url && (
                    <a 
                        href={url} 
                        target="_blank" 
                        rel="noreferrer" 
                        download={fileName}
                        className="p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-2xl transition-all shadow-sm flex items-center gap-2"
                        title="Download file"
                    >
                        <ExternalLink className="w-5 h-5" />
                    </a>
                )}
                <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all shadow-sm flex-shrink-0">
                    <X className="w-6 h-6" />
                </button>
            </div>
        </div>
        <div className="flex-1 bg-slate-100/50 p-6 sm:p-10 overflow-hidden flex flex-col gap-6 min-h-0">
            <div className="flex-1 min-h-0">
                {renderContent()}
            </div>
            {description && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left flex-shrink-0">
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{description}</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ResourceViewer;