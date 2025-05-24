import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';

// Định nghĩa các kiểu dữ liệu
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctOptions: number[];
  points: number;
  explanation: string;
  isAIGenerated?: boolean;
  aiGeneratedTime?: string;
}

export interface AssignmentState {
  // Common fields
  title: string;
  subject: string;
  description: string;
  classIds: string[];
  dueDate: string;
  maxPoints: number;
  allowLateSubmissions: boolean;
  assignmentType: 'text' | 'quiz' | 'file' | 'ai-quiz';
  timer: number;
  
  // Text assignment fields
  textContent: string;
  
  // Quiz assignment fields
  quizQuestions: QuizQuestion[];
  
  // File assignment fields
  files: File[];
  fileDescription: string;
  
  // AI quiz settings
  aiPrompt: string;
  aiFileContent: string;
  aiFileName: string;
  aiNumQuestions: number;
  aiNumOptions: number;
  aiNumCorrectOptions: number;
  aiDifficulty: string;
  aiCreativity: string;
  aiGenerating: boolean;
  aiFileType: string;
  aiOriginalFile: File | null;
  
  // Other fields
  loading: boolean;
  error: string | null;
}

// Định nghĩa các action types
type AssignmentActionTypes =
  | { type: 'SET_COMMON_FIELD'; field: keyof AssignmentState; value: any }
  | { type: 'SET_TEXT_CONTENT'; content: string }
  | { type: 'SET_QUIZ_QUESTIONS'; questions: QuizQuestion[] }
  | { type: 'ADD_QUIZ_QUESTION'; isAIGenerated?: boolean }
  | { type: 'UPDATE_QUIZ_QUESTION'; index: number; field: keyof QuizQuestion; value: any }
  | { type: 'REMOVE_QUIZ_QUESTION'; index: number }
  | { type: 'ADD_FILES'; newFiles: File[] }
  | { type: 'REMOVE_FILE'; index: number }
  | { type: 'ADD_AI_GENERATED_QUESTIONS'; payload: QuizQuestion[] }
  | { type: 'SET_AI_SETTING'; setting: string; value: any }
  | { type: 'SET_AI_GENERATING'; value: boolean }
  | { type: 'CLEAR_AI_FILE' };

// Giá trị khởi tạo
const initialState: AssignmentState = {
  // Common fields
  title: '',
  subject: '',
  description: '',
  classIds: [],
  dueDate: (() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 0);
    return tomorrow.toISOString().slice(0, 16);
  })(),
  maxPoints: 10,
  allowLateSubmissions: true,
  assignmentType: 'text',
  timer: 0,
  
  // Text assignment fields
  textContent: '',
  
  // Quiz assignment fields
  quizQuestions: [],
  
  // File assignment fields
  files: [],
  fileDescription: '',
  
  // AI quiz settings
  aiPrompt: '',
  aiFileContent: '',
  aiFileName: '',
  aiNumQuestions: 5,
  aiNumOptions: 4,
  aiNumCorrectOptions: 1,
  aiDifficulty: 'bloom-understand',
  aiCreativity: 'balanced',
  aiGenerating: false,
  aiFileType: '',
  aiOriginalFile: null,
  
  // Other fields
  loading: false,
  error: null
};

// Reducer để xử lý các actions
const assignmentReducer = (state: AssignmentState, action: AssignmentActionTypes): AssignmentState => {
  switch (action.type) {
    case 'SET_COMMON_FIELD':
      return { ...state, [action.field]: action.value };
      
    case 'SET_TEXT_CONTENT':
      return { ...state, textContent: action.content };
      
    case 'SET_QUIZ_QUESTIONS':
      return { ...state, quizQuestions: action.questions };
      
    case 'ADD_QUIZ_QUESTION':
      return {
        ...state,
        quizQuestions: [
          ...state.quizQuestions,
          {
            id: Date.now(),
            question: '',
            options: ['', ''],
            correctOptions: [0],
            points: 10,
            explanation: '',
            isAIGenerated: action.isAIGenerated || false,
            aiGeneratedTime: action.isAIGenerated ? new Date().toISOString() : undefined
          }
        ]
      };
      
    case 'UPDATE_QUIZ_QUESTION':
      return {
        ...state,
        quizQuestions: state.quizQuestions.map(q => 
          q.id === action.index ? { ...q, [action.field]: action.value } : q
        )
      };
      
    case 'REMOVE_QUIZ_QUESTION':
      return {
        ...state,
        quizQuestions: state.quizQuestions.filter(q => q.id !== action.index)
      };
      
    case 'ADD_FILES':
      return { ...state, files: [...state.files, ...action.newFiles] };
      
    case 'REMOVE_FILE':
      return {
        ...state,
        files: state.files.filter((_, index) => index !== action.index)
      };
      
    case 'ADD_AI_GENERATED_QUESTIONS':
      if (!action.payload || !Array.isArray(action.payload)) {
        return state;
      }
      
      // Map the AI generated questions to the QuizQuestion format with proper IDs
      // Remove aiGeneratedTime to fix the numbering issue
      const newQuestions = action.payload.map((q, index) => ({
        ...q,
        id: Date.now() + index, // Ensure unique IDs for each question
        isAIGenerated: true
        // Removed aiGeneratedTime field to fix numbering issue
      }));
      
      return {
        ...state,
        quizQuestions: [...state.quizQuestions, ...newQuestions]
      };
      
    case 'SET_AI_SETTING':
      return { ...state, [action.setting]: action.value };
      
    case 'SET_AI_GENERATING':
      return { ...state, aiGenerating: action.value };
      
    case 'CLEAR_AI_FILE':
      return { ...state, aiFileContent: '', aiFileName: '', aiFileType: '', aiOriginalFile: null };
      
    default:
      return state;
  }
};

// Context để cung cấp state và dispatch
export type AssignmentContextType = {
  state: AssignmentState;
  dispatch: React.Dispatch<AssignmentActionTypes>;
  
  // Helper functions
  setCommonField: (field: keyof AssignmentState, value: any) => void;
  setTextContent: (content: string) => void;
  addQuizQuestion: (isAIGenerated?: boolean) => void;
  addAIGeneratedQuestions: (questions: QuizQuestion[]) => void;
  removeQuizQuestion: (id: number) => void;
  updateQuizQuestion: (id: number, field: keyof QuizQuestion, value: any) => void;
  addFiles: (newFiles: File[]) => void;
  removeFile: (index: number) => void;
  setAiSetting: (setting: string, value: any) => void;
  setAiGenerating: (generating: boolean) => void;
  clearAiFile: () => void;
};

const AssignmentContext = createContext<AssignmentContextType | null>(null);

// Provider component
export const AssignmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(assignmentReducer, initialState);
  
  // Helper functions
  const setCommonField = useCallback((field: keyof AssignmentState, value: any) => {
    dispatch({ type: 'SET_COMMON_FIELD', field, value });
  }, []);
  
  const setTextContent = useCallback((content: string) => {
    dispatch({ type: 'SET_TEXT_CONTENT', content });
  }, []);
  
  const addQuizQuestion = useCallback((isAIGenerated?: boolean) => {
    dispatch({ type: 'ADD_QUIZ_QUESTION', isAIGenerated });
  }, []);
  
  const removeQuizQuestion = useCallback((id: number) => {
    dispatch({ type: 'REMOVE_QUIZ_QUESTION', index: id });
  }, []);
  
  const updateQuizQuestion = useCallback((id: number, field: keyof QuizQuestion, value: any) => {
    dispatch({ type: 'UPDATE_QUIZ_QUESTION', index: id, field, value });
  }, []);
  
  const addFiles = useCallback((newFiles: File[]) => {
    dispatch({ type: 'ADD_FILES', newFiles });
  }, []);
  
  const removeFile = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_FILE', index });
  }, []);
  
  const setAiSetting = useCallback((setting: string, value: any) => {
    dispatch({ type: 'SET_AI_SETTING', setting, value });
  }, []);
  
  const setAiGenerating = useCallback((generating: boolean) => {
    dispatch({ type: 'SET_AI_GENERATING', value: generating });
  }, []);
  
  const clearAiFile = useCallback(() => {
    dispatch({ type: 'CLEAR_AI_FILE' });
  }, []);
  
  // Additional helper functions
  const addAIGeneratedQuestions = useCallback((questions: QuizQuestion[]) => {
    dispatch({
      type: 'ADD_AI_GENERATED_QUESTIONS',
      payload: questions
    });
  }, []);
  
  const contextValue: AssignmentContextType = {
    state,
    dispatch,
    setCommonField,
    setTextContent,
    addQuizQuestion,
    addAIGeneratedQuestions,
    removeQuizQuestion,
    updateQuizQuestion,
    addFiles,
    removeFile,
    setAiSetting,
    setAiGenerating,
    clearAiFile
  };
  
  return (
    <AssignmentContext.Provider value={contextValue}>
      {children}
    </AssignmentContext.Provider>
  );
};

// Hook để sử dụng context
export const useAssignment = () => {
  const context = useContext(AssignmentContext);
  if (!context) {
    throw new Error('useAssignment must be used within an AssignmentProvider');
  }
  return context;
}; 