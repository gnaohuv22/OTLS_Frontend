import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Khởi tạo API key từ environment variable
const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
  console.error('GOOGLE_AI_API_KEY không được cung cấp trong biến môi trường');
}

export const maxDuration = 60; // Reduced to 60s for Hobby plan compatibility

export async function POST(request: Request) {
  try {
    // Khởi tạo API
    const genAI = new GoogleGenerativeAI(apiKey || '');
    
    // Parse body
    const body = await request.json();
    const { 
      systemPrompt, 
      userPrompt, 
      pdfBase64,
      pdfMimeType,
      fileBase64,
      fileMimeType,
      fileName,
      numQuestions, 
      numOptions, 
      numCorrectOptions, 
      difficulty, 
      creativity 
    } = body;
    
    // Validate input
    if ((!userPrompt && !pdfBase64 && !fileBase64) || !systemPrompt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    console.log('Generating questions with AI:', { 
      hasPdf: !!pdfBase64,
      hasFile: !!fileBase64,
      fileName: fileName || 'No file name',
      numQuestions, 
      numOptions, 
      numCorrectOptions, 
      difficulty, 
      creativity 
    });
    
    // Lấy model với config phù hợp nhất
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        }
      ]
    });
    
    let result;
    
    const generationConfig = {
      temperature: creativity === 'creative' ? 0.8 : creativity === 'balanced' ? 0.5 : 0.2,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    };
    
    if (pdfBase64) {
      // Xử lý nếu có PDF file
      const pdfPrompt = `
        System: ${systemPrompt}
        
        Tôi đã tải lên tệp PDF để tạo câu hỏi trắc nghiệm. 
        Vui lòng phân tích nội dung của tệp PDF và tạo ${numQuestions} câu hỏi trắc nghiệm 
        phù hợp với hướng dẫn đã cung cấp.
        
        Lưu ý: 
        - Mỗi câu hỏi có ${numOptions} phương án, trong đó ${numCorrectOptions} là đáp án đúng
        - Độ khó: ${difficulty}
        - Phong cách: ${creativity}
        
        Bạn chỉ cần trả về kết quả ở định dạng JSON như sau:
        {
          "questions": [
            {
              "question": "Nội dung câu hỏi",
              "options": ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
              "correctOptions": [0, 2], // Các phương án đúng, bắt đầu từ 0
              "explanation": "Giải thích đáp án đúng"
            }
          ]
        }
      `;
      
      // Chuẩn bị content cho request với PDF
      const contents = [
        {
          role: "user",
          parts: [
            { text: pdfPrompt },
            {
              inlineData: {
                mimeType: pdfMimeType || "application/pdf",
                data: pdfBase64
              }
            }
          ]
        }
      ];
      
      // Gọi API với PDF
      result = await model.generateContent({
        contents,
        generationConfig,
      });
    } 
    else if (fileBase64) {
      // Xử lý các file khác (txt, docx, v.v.)
      const filePrompt = `
        System: ${systemPrompt}
        
        Tôi đã tải lên tệp "${fileName}" để tạo câu hỏi trắc nghiệm. 
        Vui lòng phân tích nội dung của tệp và tạo ${numQuestions} câu hỏi trắc nghiệm 
        phù hợp với hướng dẫn đã cung cấp.
        
        Lưu ý: 
        - Mỗi câu hỏi có ${numOptions} phương án, trong đó ${numCorrectOptions} là đáp án đúng
        - Độ khó: ${difficulty}
        - Phong cách: ${creativity}
        
        Bạn chỉ cần trả về kết quả ở định dạng JSON như sau:
        {
          "questions": [
            {
              "question": "Nội dung câu hỏi",
              "options": ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
              "correctOptions": [0, 2], // Các phương án đúng, bắt đầu từ 0
              "explanation": "Giải thích đáp án đúng"
            }
          ]
        }
      `;
      
      // Chuẩn bị content cho request với file khác
      const contents = [
        {
          role: "user",
          parts: [
            { text: filePrompt },
            {
              inlineData: {
                mimeType: fileMimeType || "text/plain",
                data: fileBase64
              }
            }
          ]
        }
      ];
      
      // Gọi API với file
      result = await model.generateContent({
        contents,
        generationConfig,
      });
    } 
    else {
      // Nếu không có file, sử dụng text prompt
      const chat = model.startChat();
      
      // Gửi system prompt
      await chat.sendMessage(systemPrompt);
      
      // Gửi user prompt
      result = await chat.sendMessage(userPrompt);
    }
    
    // Lấy và parse response
    const response = result.response;
    const textResponse = response.text();
    
    // Tìm JSON object trong kết quả
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        const jsonData = JSON.parse(jsonMatch[0]);
        return NextResponse.json(jsonData);
      } catch (err) {
        console.error('Error parsing JSON from response:', err);
        return NextResponse.json({ 
          error: 'Failed to parse JSON response', 
          raw: textResponse 
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      questions: [],
      error: 'No valid JSON found in response',
      raw: textResponse 
    }, { status: 500 });
    
  } catch (error) {
    console.error('AI Question Generation Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 