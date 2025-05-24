/**
 * File type detection and viewer utilities
 */

// Office file extensions that can be viewed with Microsoft Office Online Viewer
const OFFICE_EXTENSIONS = [
  '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'
];

// PDF extension
const PDF_EXTENSION = '.pdf';

/**
 * File viewer utilities
 */
export const FileViewer = {
  /**
   * Checks if the file can be previewed with Office Online Viewer
   * @param url The file URL
   * @returns boolean indicating if the file can be previewed
   */
  isOfficeFile: (url: string): boolean => {
    if (!url) return false;
    return OFFICE_EXTENSIONS.some(ext => url.toLowerCase().endsWith(ext));
  },

  /**
   * Checks if the file is a PDF
   * @param url The file URL
   * @returns boolean indicating if the file is a PDF
   */
  isPdfFile: (url: string): boolean => {
    if (!url) return false;
    return url.toLowerCase().endsWith(PDF_EXTENSION);
  },

  /**
   * Gets the file extension from a URL
   * @param url The file URL
   * @returns The file extension or empty string if not found
   */
  getFileExtension: (url: string): string => {
    if (!url) return '';
    const match = url.match(/\.([^.]+)$/);
    return match ? `.${match[1].toLowerCase()}` : '';
  },
  
  /**
   * Creates a Microsoft Office Online Viewer URL
   * @param url The document URL to preview
   * @returns The URL to view the document online
   */
  getOfficeViewerUrl: (url: string): string => {
    const encodedUrl = encodeURIComponent(url);
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}`;
  },
  
  /**
   * Determines the appropriate preview URL based on file type
   * @param url The file URL
   * @returns The URL to use for preview
   */
  getPreviewUrl: (url: string): string => {
    if (!url) return '';
    
    if (FileViewer.isOfficeFile(url)) {
      return FileViewer.getOfficeViewerUrl(url);
    }
    
    // For PDFs and other file types, return the original URL
    return url;
  },
  
  /**
   * Initiates a direct download for a file
   * @param url The file URL
   * @param filename Optional filename for the download
   */
  downloadFile: (url: string, filename?: string): void => {
    const link = document.createElement('a');
    link.href = url;
    
    // If filename is provided, use it, otherwise let browser decide
    if (filename) {
      link.download = filename;
    } else {
      link.download = '';
    }
    
    // Append to document, click and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}; 