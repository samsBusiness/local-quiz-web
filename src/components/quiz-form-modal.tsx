"use client";

import { useMemo } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import type { Quiz, Question } from "@/types/quiz";

const optionSchema = z.object({
  id: z.string(),
  text: z.string().trim().min(1, "Option text is required").max(200, "Option text must be 200 characters or less"),
});

const questionSchema = z.object({
  id: z.string(),
  question: z.string().trim().min(1, "Question text is required").max(500, "Question text must be 500 characters or less"),
  options: z.array(optionSchema).min(2, "At least 2 options are required"),
  correctOption: z.string().min(1, "Select the correct option"),
  points: z.number(),
  timeLimit: z.number().min(5, "Time must be at least 5 seconds").max(300, "Time must be 300 seconds or less"),
});

const quizFormSchema = z.object({
  quizName: z.string().trim().min(1, "Quiz name is required").max(100, "Quiz name must be 100 characters or less"),
  quizCode: z.string().trim().min(1, "Quiz code is required").max(20, "Quiz code must be 20 characters or less"),
  description: z.string().trim().min(1, "Description is required").max(500, "Description must be 500 characters or less"),
  questions: z.array(questionSchema).min(1, "Add at least one question"),
});

type QuizFormValues = z.infer<typeof quizFormSchema>;

interface QuizFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz?: Quiz | null;
  onSave: (data: {
    quizName: string;
    quizCode: string;
    description: string;
    questions: Question[];
  }) => void;
  isSaving?: boolean;
}

function createOption(): QuizFormValues["questions"][number]["options"][number] {
  return { id: uuidv4(), text: "" };
}

function normalizeQuestion(question: Question): QuizFormValues["questions"][number] {
  return {
    id: question.id,
    question: question.question,
    options: question.options.map((option) => ({
      id: option.id,
      text: option.text,
    })),
    correctOption: question.correctOption,
    points: 10,
    timeLimit: question.timeLimit ?? 30,
  };
}

function createQuestion(): QuizFormValues["questions"][number] {
  const options = [createOption(), createOption()];
  return {
    id: uuidv4(),
    question: "",
    options,
    correctOption: "",
    points: 10,
    timeLimit: 30,
  };
}

function QuizFormContent({
  quiz,
  onSave,
  onClose,
  isSaving,
}: {
  quiz?: Quiz | null;
  onSave: QuizFormModalProps["onSave"];
  onClose: () => void;
  isSaving?: boolean;
}) {
  const initialState = useMemo<QuizFormValues>(() => {
    if (quiz) {
      return {
        quizName: quiz.quizName,
        quizCode: quiz.quizCode,
        description: quiz.description,
        questions: quiz.questions.map(normalizeQuestion),
      };
    }
    return {
      quizName: "",
      quizCode: "",
      description: "",
      questions: [createQuestion()],
    };
  }, [quiz]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: initialState,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const questions = watch("questions");

  const addQuestion = () => {
    setValue("questions", [...getValues("questions"), createQuestion()], {
      shouldDirty: true,
    });
    
    // Scroll to the bottom after adding a new question
    setTimeout(() => {
      const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }, 0);
  };

  const removeQuestion = (qIndex: number) => {
    if (questions.length <= 1) return;
    setValue(
      "questions",
      getValues("questions").filter((_, i) => i !== qIndex),
      { shouldDirty: true, shouldValidate: true }
    );
  };

  const updateQuestion = (qIndex: number, field: string, value: string | number) => {
    setValue(
      "questions",
      getValues("questions").map((q, i) =>
        i === qIndex ? { ...q, [field]: value } : q
      ),
      { shouldDirty: true }
    );
  };

  const addOption = (qIndex: number) => {
    setValue(
      "questions",
      getValues("questions").map((q, i) =>
        i === qIndex
          ? { ...q, options: [...q.options, createOption()] }
          : q
      ),
      { shouldDirty: true }
    );
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    setValue(
      "questions",
      getValues("questions").map((q, i) => {
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
      }),
      { shouldDirty: true, shouldValidate: true }
    );
  };

  const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
    setValue(
      "questions",
      getValues("questions").map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((o, j) =>
                j === oIndex ? { ...o, text } : o
              ),
            }
          : q
      ),
      { shouldDirty: true }
    );
  };

  const setCorrectOption = (qIndex: number, optionId: string) => {
    setValue(
      "questions",
      getValues("questions").map((q, i) =>
        i === qIndex ? { ...q, correctOption: optionId } : q
      ),
      { shouldDirty: true, shouldValidate: true }
    );
  };

  const handleFormSubmit = (values: QuizFormValues) => {
    onSave({
      quizName: values.quizName.trim(),
      quizCode: values.quizCode.trim().toUpperCase(),
      description: values.description.trim(),
      questions: values.questions.map((question) => ({
        ...question,
        question: question.question.trim(),
        options: question.options.map((option) => ({
          ...option,
          text: option.text.trim(),
        })),
        points: 10,
      })),
    });
    onClose();
  };

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

      <div className="flex-1 overflow-hidden">
        <div className="space-y-6 pb-4 h-full flex flex-col">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quizName">Quiz Name</Label>
            <Input
              id="quizName"
              {...register("quizName")}
              placeholder="Enter quiz name"
            />
            {errors.quizName ? (
              <p className="text-sm text-destructive">
                {errors.quizName.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="quizCode">Quiz Code</Label>
            <Input
              id="quizCode"
              {...register("quizCode", {
                onChange: (event) => {
                  setValue("quizCode", event.target.value.toUpperCase(), {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                },
              })}
              placeholder="e.g. QUIZ001"
              className="uppercase"
            />
            {errors.quizCode ? (
              <p className="text-sm text-destructive">
                {errors.quizCode.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            {...register("description")}
            placeholder="Brief description"
          />
          {errors.description ? (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          ) : null}
        </div>

        <Separator />

        <div className="space-y-4 flex flex-col h-full">
          <div className="flex items-center justify-between border-b pb-4 shrink-0">
            <h3 className="text-sm font-semibold">
              Questions ({questions.length})
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addQuestion}
              className="cursor-pointer"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Question
            </Button>
          </div>
          <ScrollArea className="flex-1 min-h-[200px] max-h-[500px] pb-48">
            <div className="space-y-8">
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
                        <Label className="text-xs">Time:</Label>
                        <Input
                          type="number"
                          min={5}
                          value={q.timeLimit ?? 30}
                          onChange={(e) => {
                            updateQuestion(
                              qIndex,
                              "timeLimit",
                              Number(e.target.value),
                            );
                            void trigger(`questions.${qIndex}.timeLimit`);
                          }}
                          onKeyDown={(e) => {
                            const input = e.currentTarget;
                            if (
                              input.value === "0" &&
                              e.key !== "Backspace" &&
                              e.key !== "Tab"
                            ) {
                              input.value = "";
                            }
                          }}
                          className="h-7 w-16 text-xs"
                        />
                        <span className="text-xs text-muted-foreground">sec</span>
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

                  {errors.questions?.[qIndex]?.timeLimit ? (
                    <p className="text-sm text-destructive">
                      {errors.questions[qIndex]?.timeLimit?.message as string}
                    </p>
                  ) : null}

                  <Input
                    value={q.question}
                    onChange={(e) => {
                      updateQuestion(qIndex, "question", e.target.value);
                      void trigger(`questions.${qIndex}.question`);
                    }}
                    placeholder={`Enter question ${qIndex + 1}`}
                  />
                  {errors.questions?.[qIndex]?.question ? (
                    <p className="text-sm text-destructive">
                      {errors.questions[qIndex]?.question?.message as string}
                    </p>
                  ) : null}

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Options (click to mark as correct)
                    </Label>
                    {errors.questions?.[qIndex]?.correctOption ? (
                      <p className="text-sm text-destructive">
                        {
                          errors.questions[qIndex]?.correctOption
                            ?.message as string
                        }
                      </p>
                    ) : null}
                    {typeof errors.questions?.[qIndex]?.options?.message ===
                    "string" ? (
                      <p className="text-sm text-destructive">
                        {errors.questions[qIndex]?.options?.message as string}
                      </p>
                    ) : null}
                    {q.options.map((opt, oIndex) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCorrectOption(qIndex, opt.id);
                            void trigger(`questions.${qIndex}.correctOption`);
                          }}
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
                          onChange={(e) => {
                            updateOptionText(qIndex, oIndex, e.target.value);
                            void trigger(
                              `questions.${qIndex}.options.${oIndex}.text`,
                            );
                          }}
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
                    {q.options.map((_, oIndex) =>
                      errors.questions?.[qIndex]?.options?.[oIndex]?.text ? (
                        <p
                          key={`option-error-${q.id}-${oIndex}`}
                          className="text-sm text-destructive"
                        >
                          {
                            errors.questions[qIndex]?.options?.[oIndex]?.text
                              ?.message as string
                          }
                        </p>
                      ) : null,
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => addOption(qIndex)}
                      className="text-xs cursor-pointer"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add Option
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          </div>
        </div>
      </div>
      {/* <ScrollArea className="flex-1 h-0 pr-4 -mr-4">
      </ScrollArea> */}

      <DialogFooter className="shrink-0">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(handleFormSubmit)} disabled={isSaving}>
          {isSaving ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {quiz ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{quiz ? "Update Quiz" : "Create Quiz"}</>
          )}
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
  isSaving,
}: QuizFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] h-[85vh] max-h-[85vh] flex flex-col overflow-hidden">
        {open && (
          <QuizFormContent
            key={quiz?._id ?? "new"}
            quiz={quiz}
            onSave={onSave}
            onClose={() => onOpenChange(false)}
            isSaving={isSaving}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
