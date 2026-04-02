"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  HelpCircle,
  MoreHorizontal,
  CalendarDays,
  RefreshCw,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
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
  const [sessionCounts, setSessionCounts] = useState<Record<string, number>>({});

  // Quiz form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  // Sessions modal state
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [selectedQuizName, setSelectedQuizName] = useState("");
  
  // Loading states
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);

  const fetchSessionCounts = useCallback(async (quizIds: string[]) => {
    try {
      const counts: Record<string, number> = {};
      
      // Fetch sessions for each quiz
      await Promise.all(
        quizIds.map(async (quizId) => {
          const res = await fetch(`/api/session?quizId=${quizId}`, {
            headers: getAuthHeaders(),
          });
          const data = await res.json();
          if (data.status === 200) {
            counts[quizId] = data.data.sessions?.length || 0;
          } else {
            counts[quizId] = 0;
          }
        })
      );
      
      setSessionCounts(counts);
    } catch (error) {
      console.error("Failed to fetch session counts:", error);
    }
  }, []);

  const fetchQuizzes = useCallback(async () => {
    try {
      const res = await fetch("/api/quiz", {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.status === 200) {
        const quizzes = data.data.quizzes ?? [];
        setQuizzes(quizzes);
        
        // Fetch session counts for all quizzes
        if (quizzes.length > 0) {
          await fetchSessionCounts(quizzes.map((q: Quiz) => q._id));
        }
      }
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchSessionCounts]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleCreate = () => {
    setEditingQuiz(null);
    setFormOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchQuizzes();
    setIsRefreshing(false);
  };

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setFormOpen(true);
  };

  const handleDelete = async (quizId: string) => {
    const quiz = quizzes.find(q => q._id === quizId);
    if (!quiz) return;
    setQuizToDelete(quiz);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!quizToDelete) return;
    
    setIsDeleting(quizToDelete._id);
    try {
      const res = await fetch(`/api/quiz/${quizToDelete._id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.status === 200) {
        setQuizzes((prev) => prev.filter((q) => q._id !== quizToDelete._id));
        // Remove session count for deleted quiz
        setSessionCounts((prev) => {
          const newCounts = { ...prev };
          delete newCounts[quizToDelete._id];
          return newCounts;
        });
        toast.success(`Quiz "${quizToDelete.quizName}" deleted successfully`);
      } else {
        toast.error(data.message || "Failed to delete quiz");
      }
    } catch (error) {
      console.error("Failed to delete quiz:", error);
      toast.error("Failed to delete quiz");
    } finally {
      setIsDeleting(null);
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
    }
  };

  const handleSave = async (formData: {
    quizName: string;
    quizCode: string;
    description: string;
    questions: Question[];
  }) => {
    setIsSaving(true);
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
          toast.success(`Quiz "${formData.quizName}" updated successfully`);
        } else {
          toast.error(data.message || "Failed to update quiz");
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
          toast.success(`Quiz "${formData.quizName}" created successfully`);
        } else {
          toast.error(data.message || "Failed to create quiz");
        }
      }
    } catch (error) {
      console.error("Failed to save quiz:", error);
      toast.error("Failed to save quiz");
    } finally {
      setIsSaving(false);
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
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={handleCreate} disabled={isSaving}>
            <Plus className="mr-2 h-4 w-4" />
            Create Quiz
          </Button>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Sessions</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 mx-auto" />
                    <Skeleton className="h-3 w-24 mx-auto" />
                    <Skeleton className="h-3 w-20 mx-auto" />
                  </div>
                </TableCell>
              </TableRow>
            ) : quizzes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
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
                      className="font-medium text-primary hover:text-primary/80 hover:underline transition-colors text-left"
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
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {sessionCounts[quiz._id] || 0}
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
                          disabled={isDeleting === quiz._id}
                        >
                          {isDeleting === quiz._id ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </>
                          )}
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
        isSaving={isSaving}
      />

      <SessionsModal
        open={sessionsOpen}
        onOpenChange={setSessionsOpen}
        quizId={selectedQuizId}
        quizName={selectedQuizName}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Quiz</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{quizToDelete?.quizName}&quot;? This action cannot be undone and will also delete all associated sessions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting !== null}>
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={isDeleting !== null}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
