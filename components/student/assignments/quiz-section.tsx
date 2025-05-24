"use client";

import React from 'react';
import { useState, useEffect, useRef, useCallback, memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import Image from "next/image";

export type Question = {
  id: string;
  type: "multiple_choice" | "drag_drop";
  question: string;
  options?: string[];
  correctAnswer?: string;
  items?: string[];
  image?: string;
};

interface QuizSectionProps {
  questions: Question[];
  onAnswersChange?: (answers: Record<string, string>) => void;
  isExam?: boolean;
}

// Memoize SortableItem to prevent unnecessary rerenders
const SortableItem = memo(({ id, value }: { id: string; value: string }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex items-center gap-2 p-2 bg-background border rounded-md mb-2 cursor-move"
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" {...attributes} {...listeners} />
      <span>{value}</span>
    </div>
  );
});

SortableItem.displayName = "SortableItem";

// Memoize the checkbox option component to improve performance
const CheckboxOption = memo(({ 
  questionId, 
  index, 
  option, 
  checked, 
  onChange 
}: { 
  questionId: string; 
  index: number; 
  option: string; 
  checked: boolean;
  onChange: (questionId: string, index: string, checked: boolean) => void;
}) => {
  const optionId = `${questionId}-option-${index}`;
  const indexStr = index.toString();
  
  // Create memoized handlers to prevent rerenders
  const handleCheckboxChange = useCallback(() => {
    onChange(questionId, indexStr, !checked);
  }, [onChange, questionId, indexStr, checked]);
  
  const handleLabelClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(questionId, indexStr, !checked);
  }, [onChange, questionId, indexStr, checked]);
  
  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id={optionId}
        checked={checked}
        onCheckedChange={handleCheckboxChange}
      />
      <Label 
        htmlFor={optionId}
        className="cursor-pointer"
        onClick={handleLabelClick}
      >
        {option}
      </Label>
    </div>
  );
});

CheckboxOption.displayName = "CheckboxOption";

// Memoize the CardQuestion component to prevent unnecessary rerenders
const CardQuestion = memo(({ 
  question, 
  multipleChoiceAnswers, 
  handleCheckboxChange,
  dragItems,
  handleDragEnd
}: { 
  question: Question;
  multipleChoiceAnswers: Record<string, Record<string, boolean>>;
  handleCheckboxChange: (questionId: string, optionIndex: string, checked: boolean) => void;
  dragItems: Record<string, string[]>;
  handleDragEnd: (event: DragEndEvent, questionId: string) => void;
}) => {
  return (
    <Card key={question.id} className="p-4" id={`question-${question.id}`}>
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="font-medium mb-2">{question.question}</h3>
            
            {question.type === "multiple_choice" && question.options && (
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <CheckboxOption
                    key={`${question.id}-${index}`}
                    questionId={question.id}
                    index={index}
                    option={option}
                    checked={multipleChoiceAnswers[question.id]?.[index.toString()] || false}
                    onChange={handleCheckboxChange}
                  />
                ))}
              </div>
            )}
            
            {question.type === "drag_drop" && dragItems[question.id] && (
              <div className="mt-4">
                <DndContext
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => handleDragEnd(event, question.id)}
                >
                  <SortableContext
                    items={dragItems[question.id]}
                    strategy={rectSortingStrategy}
                  >
                    <div>
                      {dragItems[question.id].map((item) => (
                        <SortableItem key={item} id={item} value={item} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>
          
          {question.image && (
            <div className="flex-shrink-0 w-1/3">
              <div className="relative h-40 w-full">
                <Image
                  src={question.image}
                  alt={question.question}
                  fill
                  className="object-contain rounded-md"
                />
              </div>
            </div>
          )}
        </div>
        
        {Object.values(multipleChoiceAnswers[question.id] || {}).some(Boolean) && question.type === "multiple_choice" && (
          <div className="text-sm text-green-600 font-medium">
            Đã trả lời
          </div>
        )}
      </div>
    </Card>
  );
});

CardQuestion.displayName = "CardQuestion";

// Utility function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const QuizSection = memo(({ questions, onAnswersChange, isExam = false }: QuizSectionProps) => {
  // Change state structure to track multiple choices
  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState<Record<string, Record<string, boolean>>>({});
  const [dragItems, setDragItems] = useState<Record<string, string[]>>({});
  // Add new ref to track if data is already formatted
  const formattedAnswersRef = useRef<Record<string, string>>({});
  const hasInitialized = useRef(false);
  const [randomizedQuestions, setRandomizedQuestions] = useState<Question[]>([]);
  const [originalToRandomMap, setOriginalToRandomMap] = useState<Record<string, number>>({});
  
  // Store the original question options mapping for exam mode
  const optionsMappingRef = useRef<Record<string, number[]>>({});
  
  // Initialize state only once for each unique set of questions
  useEffect(() => {
    if (hasInitialized.current) return;
    
    const initialDragItems: Record<string, string[]> = {};
    const initialMultipleChoiceAnswers: Record<string, Record<string, boolean>> = {};
    
    // For exam mode, randomize the questions and options
    if (isExam) {
      // First, create a shuffled copy of the questions array
      const shuffledQuestions = shuffleArray(questions);
      
      // Create a mapping between original question IDs and their new indices
      const mapping: Record<string, number> = {};
      questions.forEach((q, i) => {
        const newIndex = shuffledQuestions.findIndex(sq => sq.id === q.id);
        mapping[q.id] = newIndex;
      });
      
      // Set the randomized questions and mapping
      setRandomizedQuestions(shuffledQuestions);
      setOriginalToRandomMap(mapping);
      
      // Now randomize the options for each question and create option mappings
      const questionsWithRandomOptions = shuffledQuestions.map(q => {
        if (q.type === "multiple_choice" && q.options) {
          // Create arrays of indices for options
          const originalIndices = q.options.map((_, i) => i);
          
          // Shuffle the indices
          const shuffledIndices = shuffleArray(originalIndices);
          
          // Store the mapping for this question - maps new index to original index
          optionsMappingRef.current[q.id] = shuffledIndices;
          
          // Create a new array of options in the shuffled order
          const shuffledOptions = shuffledIndices.map(i => q.options![i]);
          
          return {
            ...q,
            options: shuffledOptions
          };
        }
        return q;
      });
      
      setRandomizedQuestions(questionsWithRandomOptions);
      
      // Initialize multiple choice answers for the randomized questions
      questionsWithRandomOptions.forEach((question) => {
        if (question.type === "multiple_choice" && question.options) {
          initialMultipleChoiceAnswers[question.id] = {};
          question.options.forEach((_, index) => {
            initialMultipleChoiceAnswers[question.id][index.toString()] = false;
          });
        }
        
        if (question.type === "drag_drop" && question.items) {
          initialDragItems[question.id] = [...question.items].sort(() => Math.random() - 0.5);
        }
      });
    } else {
      // For non-exam mode, just use the original questions
      setRandomizedQuestions(questions);
      
      // Initialize multiple choice answers for the original questions
      questions.forEach((question) => {
        if (question.type === "multiple_choice" && question.options) {
          initialMultipleChoiceAnswers[question.id] = {};
          question.options.forEach((_, index) => {
            initialMultipleChoiceAnswers[question.id][index.toString()] = false;
          });
        }
        
        if (question.type === "drag_drop" && question.items) {
          initialDragItems[question.id] = [...question.items].sort(() => Math.random() - 0.5);
        }
      });
    }
    
    setDragItems(initialDragItems);
    setMultipleChoiceAnswers(initialMultipleChoiceAnswers);
    hasInitialized.current = true;
  }, [questions, isExam]);
  
  // Convert multiple choice answers to a format for submission
  const getFormattedAnswers = useCallback(() => {
    const formattedAnswers: Record<string, string> = {};
    
    // Format multiple choice answers as comma-separated indices
    Object.keys(multipleChoiceAnswers).forEach(questionId => {
      const selections = multipleChoiceAnswers[questionId];
      
      if (isExam && optionsMappingRef.current[questionId]) {
        // For exam mode, map the selected indices back to the original indices
        const mapping = optionsMappingRef.current[questionId];
        const selectedIndices = Object.keys(selections)
          .filter(index => selections[index])
          .map(indexStr => {
            const randomIndex = parseInt(indexStr, 10);
            // Find the original index that was mapped to this random index
            return mapping[randomIndex];
          })
          .join(',');
        
        if (selectedIndices) {
          formattedAnswers[questionId] = selectedIndices;
        }
      } else {
        // For non-exam mode, just use the selected indices directly
        const selectedIndices = Object.keys(selections)
          .filter(index => selections[index])
          .join(',');
        
        if (selectedIndices) {
          formattedAnswers[questionId] = selectedIndices;
        }
      }
    });
    
    // Add drag-drop answers if any
    // (Keeping existing drag-drop logic)
    
    return formattedAnswers;
  }, [multipleChoiceAnswers, isExam]);
  
  // Notify parent component when answers change
  useEffect(() => {
    if (!hasInitialized.current) return;
    
    const newFormattedAnswers = getFormattedAnswers();
    
    // Only update if the formatted answers have actually changed
    if (JSON.stringify(newFormattedAnswers) !== JSON.stringify(formattedAnswersRef.current)) {
      formattedAnswersRef.current = newFormattedAnswers;
      
      if (onAnswersChange) {
        // Pass mapping information along with answers to handle question reordering
        onAnswersChange(newFormattedAnswers);
        
        // If we're in exam mode and the mapping exists, expose the mapping data through a custom event
        if (isExam && Object.keys(originalToRandomMap).length > 0) {
          // Use a custom event to transmit the mapping data without changing the API
          window.dispatchEvent(new CustomEvent('quiz-mapping-changed', {
            detail: {
              questionMapping: originalToRandomMap,
              optionsMapping: optionsMappingRef.current
            }
          }));
        }
      }
    }
  }, [multipleChoiceAnswers, dragItems, onAnswersChange, getFormattedAnswers, isExam, originalToRandomMap]);
  
  // Improve checkbox change handler to ensure state updates properly
  const handleCheckboxChange = useCallback((questionId: string, optionIndex: string, checked: boolean) => {
    console.log(`Checkbox changed - Question: ${questionId}, Option: ${optionIndex}, Checked: ${checked}`);
    
    setMultipleChoiceAnswers(prev => {
      // Create a deep copy of the previous state to avoid unintended state sharing
      const updatedAnswers = JSON.parse(JSON.stringify(prev));
      
      // Ensure the question entry exists
      if (!updatedAnswers[questionId]) {
        updatedAnswers[questionId] = {};
      }
      
      // Update the option
      updatedAnswers[questionId][optionIndex] = checked;
      
      return updatedAnswers;
    });
  }, []);
  
  const handleDragEnd = useCallback((event: DragEndEvent, questionId: string) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setDragItems((items) => {
        const oldIndex = items[questionId].indexOf(active.id.toString());
        const newIndex = items[questionId].indexOf(over.id.toString());
        
        return {
          ...items,
          [questionId]: arrayMove(items[questionId], oldIndex, newIndex),
        };
      });
    }
  }, []);
  
  // Memoize the question list to prevent unnecessary rerenders
  const questionCards = useMemo(() => {
    return randomizedQuestions.map((question) => (
      <CardQuestion 
        key={question.id}
        question={question}
        multipleChoiceAnswers={multipleChoiceAnswers}
        handleCheckboxChange={handleCheckboxChange}
        dragItems={dragItems}
        handleDragEnd={handleDragEnd}
      />
    ));
  }, [randomizedQuestions, multipleChoiceAnswers, handleCheckboxChange, dragItems, handleDragEnd]);
  
  return (
    <div className="space-y-6">
      {questionCards}
    </div>
  );
});

QuizSection.displayName = "QuizSection"; 