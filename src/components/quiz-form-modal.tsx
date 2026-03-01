"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { Quiz, Question, Option } from "@/types/quiz";

interface QuizFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz?: Quiz | null;
  onSave: (data: {
    quizName: string;
    quizCode: string;
    timeLimit: number;
    description: string;
    questions: Question[];
  }) => void;
}

function createOption(): Option {
  return { id: uuidv4(), text: "" };
}

function createQuestion(): Question {
  const options = [createOption(), createOption()];
  return {
    id: uuidv4(),
    question: "",
    options,
    correctOption: "",
    points: 1,
  };
}

function QuizFormContent({
  quiz,
  onSave,
  onClose,
}: {
  quiz?: Quiz | null;
  onSave: QuizFormModalProps["onSave"];
  onClose: () => void;
}) {
  const initialState = useMemo(() => {
    if (quiz) {
      return {
        quizName: quiz.quizName,
        quizCode: quiz.quizCode,
        timeLimit: quiz.timeLimit,
        description: quiz.description,
        questions: quiz.questions,
      };
    }
    return {
      quizName: "",
      quizCode: "",
      timeLimit: 10,
      description: "",
      questions: [createQuestion()],
    };
  }, [quiz]);

  const [quizName, setQuizName] = useState(initialState.quizName);
  const [quizCode, setQuizCode] = useState(initialState.quizCode);
  const [timeLimit, setTimeLimit] = useState(initialState.timeLimit);
  const [description, setDescription] = useState(initialState.description);
  const [questions, setQuestions] = useState<Question[]>(initialState.questions);

  const addQuestion = () => {
    setQuestions([...questions, createQuestion()]);
  };

  const removeQuestion = (qIndex: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== qIndex));
  };

  const updateQuestion = (qIndex: number, field: string, value: string | number) => {
    setQuestions(
      questions.map((q, i) =>
        i === qIndex ? { ...q, [field]: value } : q
      )
    );
  };

  const addOption = (qIndex: number) => {
    setQuestions(
      questions.map((q, i) =>
        i === qIndex
          ? { ...q, options: [...q.options, createOption()] }
          : q
      )
    );
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    setQuestions(
      questions.map((q, i) => {
        if (i !== qIndex) return q;
        if (q.options.length <= 2) return q;
        const removedOption = q.options[oIndex];
        const newOptions = q.options.filter((_, j) => j !== oIndex);
        return {
          ...q,
          options: newOptions,
          correctOption:
            q.correctOption === removedOption.id ? "" : q.correctOption,
        };
      })
    );
  };

  const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
    setQuestions(
      questions.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((o, j) =>
                j === oIndex ? { ...o, text } : o
              ),
            }
          : q
      )
    );
  };

  const setCorrectOption = (qIndex: number, optionId: string) => {
    setQuestions(
      questions.map((q, i) =>
        i === qIndex ? { ...q, correctOption: optionId } : q
      )
    );
  };

  const handleSubmit = () => {
    onSave({
      quizName,
      quizCode: quizCode.toUpperCase(),
      timeLimit,
      description,
      questions,
    });
    onClose();
  };

  const isValid =
    quizName.trim() &&
    quizCode.trim() &&
    timeLimit > 0 &&
    description.trim() &&
    questions.length > 0 &&
    questions.every(
      (q) =>
        q.question.trim() &&
        q.options.length >= 2 &&
        q.options.every((o) => o.text.trim()) &&
        q.correctOption
    );

  return (
    <>
      <DialogHeader className="shrink-0">
        <DialogTitle>{quiz ? "Edit Quiz" : "Create Quiz"}</DialogTitle>
        <DialogDescription>
          {quiz
            ? "Update your quiz details and questions."
            : "Fill in the details below to create a new quiz."}
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className="flex-1 h-0 pr-4 -mr-4">
        <div className="space-y-6 pb-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quizName">Quiz Name</Label>
              <Input
                id="quizName"
                value={quizName}
                onChange={(e) => setQuizName(e.target.value)}
                placeholder="Enter quiz name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quizCode">Quiz Code</Label>
              <Input
                id="quizCode"
                value={quizCode}
                onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
                placeholder="e.g. QUIZ001"
                className="uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
              <Input
                id="timeLimit"
                type="number"
                min={1}
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                Questions ({questions.length})
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addQuestion}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Question
              </Button>
            </div>

            {questions.map((q, qIndex) => (
              <div
                key={q.id}
                className="rounded-lg border bg-muted/30 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary">Q{qIndex + 1}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Label className="text-xs">Points:</Label>
                      <Input
                        type="number"
                        min={1}
                        value={q.points ?? 1}
                        onChange={(e) =>
                          updateQuestion(qIndex, "points", Number(e.target.value))
                        }
                        className="h-7 w-16 text-xs"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeQuestion(qIndex)}
                      disabled={questions.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Input
                  value={q.question}
                  onChange={(e) =>
                    updateQuestion(qIndex, "question", e.target.value)
                  }
                  placeholder={`Enter question ${qIndex + 1}`}
                />

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Options (click to mark as correct)
                  </Label>
                  {q.options.map((opt, oIndex) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCorrectOption(qIndex, opt.id)}
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${
                          q.correctOption === opt.id
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-muted-foreground/30 hover:border-green-400"
                        }`}
                      >
                        {String.fromCharCode(65 + oIndex)}
                      </button>
                      <Input
                        value={opt.text}
                        onChange={(e) =>
                          updateOptionText(qIndex, oIndex, e.target.value)
                        }
                        placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                        className="h-8"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-destructive"
                        onClick={() => removeOption(qIndex, oIndex)}
                        disabled={q.options.length <= 2}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addOption(qIndex)}
                    className="text-xs"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add Option
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>

      <DialogFooter className="shrink-0">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!isValid}>
          {quiz ? "Update Quiz" : "Create Quiz"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function QuizFormModal({
  open,
  onOpenChange,
  quiz,
  onSave,
}: QuizFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[85vh] max-h-[85vh] flex flex-col overflow-hidden">
        {open && (
          <QuizFormContent
            key={quiz?._id ?? "new"}
            quiz={quiz}
            onSave={onSave}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
