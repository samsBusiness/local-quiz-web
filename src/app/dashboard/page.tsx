"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Clock,
  HelpCircle,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { QuizFormModal } from "@/components/quiz-form-modal";
import { SessionsModal } from "@/components/sessions-modal";
import type { Quiz, Question } from "@/types/quiz";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function DashboardPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  // Quiz form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  // Sessions modal state
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [selectedQuizName, setSelectedQuizName] = useState("");

  const fetchQuizzes = useCallback(async () => {
    try {
      const res = await fetch("/api/quiz", {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.status === 200) {
        setQuizzes(data.data.quizzes ?? []);
      }
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleCreate = () => {
    setEditingQuiz(null);
    setFormOpen(true);
  };

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setFormOpen(true);
  };

  const handleDelete = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;

    try {
      const res = await fetch(`/api/quiz/${quizId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.status === 200) {
        setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
      }
    } catch (error) {
      console.error("Failed to delete quiz:", error);
    }
  };

  const handleSave = async (formData: {
    quizName: string;
    quizCode: string;
    description: string;
    questions: Question[];
  }) => {
    try {
      if (editingQuiz) {
        const res = await fetch(`/api/quiz/${editingQuiz._id}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.status === 200) {
          setQuizzes((prev) =>
            prev.map((q) =>
              q._id === editingQuiz._id ? { ...q, ...data.data.quiz } : q
            )
          );
        }
      } else {
        const res = await fetch("/api/quiz", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.status === 201 || data.status === 200) {
          fetchQuizzes();
        }
      }
    } catch (error) {
      console.error("Failed to save quiz:", error);
    }
  };

  const handleViewSessions = (quiz: Quiz) => {
    setSelectedQuizId(quiz._id);
    setSelectedQuizName(quiz.quizName);
    setSessionsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quizzes</h2>
          <p className="text-muted-foreground">
            Manage your quizzes and view sessions.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Quiz
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <p className="text-muted-foreground">Loading quizzes...</p>
                </TableCell>
              </TableRow>
            ) : quizzes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <HelpCircle className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No quizzes yet. Create your first quiz!
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCreate}
                      className="mt-2"
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Create Quiz
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              quizzes.map((quiz) => (
                <TableRow key={quiz._id}>
                  <TableCell>
                    <button
                      onClick={() => handleViewSessions(quiz)}
                      className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline transition-colors text-left"
                    >
                      {quiz.quizName}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {quiz.quizCode}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <HelpCircle className="h-3.5 w-3.5" />
                      {quiz.questions.length}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(quiz.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(quiz)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(quiz._id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <QuizFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        quiz={editingQuiz}
        onSave={handleSave}
      />

      <SessionsModal
        open={sessionsOpen}
        onOpenChange={setSessionsOpen}
        quizId={selectedQuizId}
        quizName={selectedQuizName}
      />
    </div>
  );
}
