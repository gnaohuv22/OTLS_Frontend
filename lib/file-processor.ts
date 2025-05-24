import mammoth from 'mammoth';
// Thay thế import pdf-parse (phụ thuộc vào 'fs' của Node.js)
// import pdfParse from 'pdf-parse';
import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist';

// Đảm bảo worker được thiết lập đúng cách (chỉ cần trong môi trường browser)
if (typeof window !== 'undefined') {
  // Sử dụng file worker đã sao chép vào thư mục public
  GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

/**
 * Lấy nội dung văn bản từ các loại file khác nhau (txt, pdf, docx, md)
 */
export async function extractTextFromFile(file: File): Promise<string> {
  try {
    const fileType = file.type;
    const buffer = await file.arrayBuffer();

    // Xử lý file text
    if (fileType === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      return new TextDecoder().decode(buffer);
    }
    
    // Xử lý file PDF với pdf.js thay vì pdf-parse
    if (fileType === 'application/pdf' || file.name.endsWith('.pdf')) {
      const uint8Array = new Uint8Array(buffer);
      const pdfDoc = await getDocument(uint8Array).promise;
      
      let fullText = '';
      
      // Xử lý từng trang để trích xuất text
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const textItems = textContent.items;
        
        // Nối các phần text lại với nhau
        const pageText = textItems
          .map((item: any) => item.str)
          .join(' ');
          
        fullText += pageText + '\n';
      }
      
      return fullText;
    }
    
    // Xử lý file Word (docx)
    if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({
        arrayBuffer: buffer
      });
      return result.value;
    }
    
    // Xử lý file Word cũ (doc)
    if (fileType === 'application/msword' || file.name.endsWith('.doc')) {
      throw new Error('Định dạng .doc không được hỗ trợ. Vui lòng chuyển đổi sang .docx hoặc .pdf');
    }
    
    throw new Error(`Định dạng file ${fileType} không được hỗ trợ`);
  } catch (error) {
    console.error('Lỗi khi xử lý file:', error);
    throw error;
  }
}

/**
 * Chuyển đổi file sang base64 để gửi cho API
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Loại bỏ phần tiền tố data:xxx;base64, để lấy chuỗi base64 thuần túy
      const base64Content = base64String.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Kiểm tra kích thước file PDF 
 * @param file File PDF cần kiểm tra
 * @param maxSizeMB Kích thước tối đa cho phép (mặc định 20MB theo giới hạn của Gemini)
 */
export function checkPdfFileSize(file: File, maxSizeMB: number = 20): boolean {
  const fileSizeMB = file.size / (1024 * 1024);
  return fileSizeMB <= maxSizeMB;
} 