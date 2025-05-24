import { NextRequest, NextResponse } from 'next/server';

// Định nghĩa kiểu dữ liệu cho question
interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctOptions: number[];
  points: number;
  explanation: string;
}

/**
 * API route để phân tích file bài tập
 * @param request - NextRequest object
 * @returns NextResponse với kết quả phân tích
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Không tìm thấy file trong request' },
        { status: 400 }
      );
    }

    // Đọc nội dung file
    const content = await file.text();
    
    // Phân tích nội dung file dựa trên định dạng
    const result = await parseFileContent(content, file.name);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error parsing file:', error);
    return NextResponse.json(
      { error: 'Lỗi khi phân tích file' },
      { status: 500 }
    );
  }
}

/**
 * Phân tích nội dung file dựa vào định dạng
 * @param content - Nội dung file
 * @param fileName - Tên file
 * @returns Dữ liệu đã phân tích
 */
async function parseFileContent(content: string, fileName: string) {
  // Kiểm tra định dạng file
  if (fileName.endsWith('.txt')) {
    return parseTextFile(content);
  } else if (fileName.endsWith('.csv')) {
    return parseCSVFile(content);
  } else {
    throw new Error('Định dạng file không được hỗ trợ');
  }
}

/**
 * Phân tích file text
 * @param content - Nội dung file text
 * @returns Dữ liệu đã phân tích
 */
function parseTextFile(content: string) {
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  const questions: QuizQuestion[] = [];
  
  let currentQuestion: QuizQuestion | null = null;
  let lineIndex = 0;
  let readingExplanation = false;

  while (lineIndex < lines.length) {
    const line = lines[lineIndex].trim();

    // Bắt đầu một câu hỏi mới nếu dòng bắt đầu với Q: hoặc Câu hỏi:
    if (line.startsWith('Q:') || line.startsWith('Câu hỏi:')) {
      if (currentQuestion) {
        questions.push(currentQuestion);
      }

      const questionText = line.replace(/^(Q:|Câu hỏi:)\s*/, '').trim();
      const newId = questions.length > 0
        ? Math.max(...questions.map(q => q.id)) + 1
        : 1;

      currentQuestion = {
        id: newId,
        question: questionText,
        options: [],
        correctOptions: [],
        points: 10,
        explanation: ''
      };

      readingExplanation = false;
      lineIndex++;
      continue;
    }

    // Đọc các lựa chọn
    if (currentQuestion && !readingExplanation && (
      line.match(/^[A-D]:/) ||
      line.match(/^[1-4]:/) ||
      line.match(/^Lựa chọn [1-4]:/) ||
      line.match(/^Phương án [1-4]:/)
    )) {
      const optionText = line.replace(/^([A-D]:|[1-4]:|Lựa chọn [1-4]:|Phương án [1-4]:)\s*/, '').trim();

      // Kiểm tra xem đây có phải là đáp án đúng không
      const isCorrectOption = optionText.includes('*') || line.includes('*');
      const cleanOptionText = optionText.replace(/\*/g, '').trim();

      currentQuestion.options.push(cleanOptionText);

      if (isCorrectOption) {
        currentQuestion.correctOptions.push(currentQuestion.options.length - 1);
      }

      lineIndex++;
      continue;
    }

    // Kiểm tra điểm số
    if (currentQuestion && !readingExplanation && (line.startsWith('Points:') || line.startsWith('Điểm:'))) {
      const pointsText = line.replace(/^(Points:|Điểm:)\s*/, '').trim();
      const points = parseInt(pointsText);

      if (!isNaN(points)) {
        currentQuestion.points = points;
      }

      lineIndex++;
      continue;
    }

    // Kiểm tra phần giải thích
    if (currentQuestion && (line.startsWith('Explanation:') || line.startsWith('Giải thích:'))) {
      readingExplanation = true;
      currentQuestion.explanation = '';
      lineIndex++;
      continue;
    }

    // Đọc nội dung giải thích
    if (currentQuestion && readingExplanation) {
      // Kết thúc phần giải thích nếu gặp dòng bắt đầu cho câu hỏi mới
      if (line.startsWith('Q:') || line.startsWith('Câu hỏi:')) {
        readingExplanation = false;
        continue; // Không tăng lineIndex để xử lý lại dòng này trong vòng lặp tiếp theo
      }

      // Kết thúc phần giải thích nếu gặp dòng trống
      if (line === '') {
        readingExplanation = false;
        lineIndex++;
        continue;
      }

      if (currentQuestion.explanation) {
        currentQuestion.explanation += '\n' + line;
      } else {
        currentQuestion.explanation = line;
      }

      lineIndex++;
      continue;
    }

    // Nếu không khớp với bất kỳ mẫu nào, chuyển sang dòng tiếp theo
    lineIndex++;
  }

  // Thêm câu hỏi cuối cùng nếu có
  if (currentQuestion) {
    questions.push(currentQuestion);
  }
  
  return { questions, format: 'text' };
}

/**
 * Phân tích file CSV
 * @param content - Nội dung file CSV
 * @returns Dữ liệu đã phân tích
 */
function parseCSVFile(content: string) {
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  const questions: QuizQuestion[] = [];
  
  // Lấy header
  const headers = lines[0].split(',').map(h => h.trim());
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    
    // Tạo đối tượng question từ values và headers
    const question: QuizQuestion = {
      id: i,
      question: values[headers.indexOf('question')] || '',
      options: [],
      correctOptions: [],
      points: 10,
      explanation: values[headers.indexOf('explanation')] || ''
    };
    
    // Thêm các options
    for (let j = 0; j < 4; j++) {
      const optionIdx = headers.indexOf(`option${j + 1}`);
      if (optionIdx !== -1 && values[optionIdx]) {
        question.options.push(values[optionIdx]);
      }
    }
    
    // Thêm các correctOptions
    const correctOptionIdx = headers.indexOf('correctOptions');
    if (correctOptionIdx !== -1 && values[correctOptionIdx]) {
      const correctIndices = values[correctOptionIdx].split(';').map(v => parseInt(v.trim()) - 1);
      question.correctOptions = correctIndices.filter(idx => !isNaN(idx) && idx >= 0);
    }
    
    // Thêm điểm
    const pointsIdx = headers.indexOf('points');
    if (pointsIdx !== -1 && values[pointsIdx]) {
      const points = parseInt(values[pointsIdx]);
      if (!isNaN(points)) {
        question.points = points;
      }
    }
    
    questions.push(question);
  }
  
  return { questions, format: 'csv' };
} 