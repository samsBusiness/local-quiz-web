"use client";

import { useEffect, useState, useMemo } from "react";
import { CalendarDays, Users, Trophy, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Session } from "@/types/quiz";

interface SessionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizId: string | null;
  quizName: string;
}

export function SessionsModal({
  open,
  onOpenChange,
  quizId,
  quizName,
}: SessionsModalProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null,
  );
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!open || !quizId) return;

    const fetchSessions = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/session?quizId=${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.status === 200) {
          setSessions(data.data.sessions ?? []);
        }
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [open, quizId]);

  const handleDeleteSession = async (sessionId: string) => {
    setDeletingSessionId(sessionId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/session/${sessionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.status === 200) {
        setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    } finally {
      setDeletingSessionId(null);
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    }
  };

  const confirmDelete = () => {
    if (sessionToDelete) {
      handleDeleteSession(sessionToDelete._id);
    }
  };

  const initiateDelete = (session: Session) => {
    setSessionToDelete(session);
    setDeleteDialogOpen(true);
  };

  const formatSessionIdentifier = (session: Session): string => {
    const date = new Date(session.date);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${session.quizMaster.name}: ${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const overallScoreboard = useMemo(() => {
    const employeeMap = new Map<
      string,
      {
        name: string;
        totalScore: number;
        sessionIdentifier: string;
        userId: string;
        sessionDate: Date;
      }
    >();

    // Process all sessions to find earliest for each employee
    for (const session of sessions) {
      const sessionDate = new Date(session.date);
      const sessionIdentifier = formatSessionIdentifier(session);

      for (const attendee of session.attendees) {
        const key = attendee.userId || attendee.name;
        const existing = employeeMap.get(key);

        if (!existing || sessionDate < existing.sessionDate) {
          // If no existing entry or this session is earlier, update
          employeeMap.set(key, {
            name: attendee.name,
            totalScore: attendee.score,
            sessionIdentifier,
            userId: attendee.userId,
            sessionDate,
          });
        }
      }
    }

    return [...employeeMap.values()].sort(
      (a, b) => b.totalScore - a.totalScore,
    );
  }, [sessions]);

  const detailedScores = useMemo(() => {
    const allScores: {
      name: string;
      userId: string;
      sessionIdentifier: string;
      score: number;
    }[] = [];

    // Collect all session scores
    for (const session of sessions) {
      const sessionIdentifier = formatSessionIdentifier(session);
      for (const attendee of session.attendees) {
        allScores.push({
          name: attendee.name,
          userId: attendee.userId || attendee.name,
          sessionIdentifier,
          score: attendee.score,
        });
      }
    }

    // Sort by employee code (userId)
    return allScores.sort((a, b) => a.userId.localeCompare(b.userId));
  }, [sessions]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[85vh] max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Sessions for {quizName}
          </DialogTitle>
          <DialogDescription>
            View the overall scoreboard or individual session results.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading sessions...</p>
          </div>
        ) : (
          <Tabs defaultValue="scoreboard" className="flex-1 h-0 flex flex-col">
            <TabsList className="shrink-0 w-fit">
              <TabsTrigger value="scoreboard">
                <Trophy className="h-4 w-4" />
                Overall Scoreboard
              </TabsTrigger>
              <TabsTrigger value="detailed">
                <Users className="h-4 w-4" />
                Detailed Scores
              </TabsTrigger>
              <TabsTrigger value="sessions">
                <CalendarDays className="h-4 w-4" />
                Sessions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scoreboard" className="flex-1 h-0 mt-2">
              <ScrollArea className="h-full pr-4 -mr-4">
                {overallScoreboard.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Trophy className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No scores yet.</p>
                  </div>
                ) : (
                  <div className="pb-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Attendee</TableHead>
                          <TableHead>Emp Code</TableHead>
                          <TableHead className="text-left">Session</TableHead>
                          <TableHead className="text-right">
                            Total Score
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {overallScoreboard.map((entry, index) => (
                          <TableRow key={entry.name}>
                            <TableCell>
                              {index === 0 ? (
                                <Trophy className="h-4 w-4 text-yellow-500" />
                              ) : (
                                index + 1
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              {entry.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {entry.userId}
                            </TableCell>
                            <TableCell className="text-left text-muted-foreground max-w-xs">
                              <div
                                className="text-xs truncate"
                                title={entry.sessionIdentifier}
                              >
                                {entry.sessionIdentifier}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {entry.totalScore}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="detailed" className="flex-1 h-0 mt-2">
              <ScrollArea className="h-full pr-4 -mr-4">
                {detailedScores.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No scores yet.</p>
                  </div>
                ) : (
                  <div className="pb-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Emp Name</TableHead>
                          <TableHead>Emp Code</TableHead>
                          <TableHead>Session</TableHead>
                          <TableHead className="text-right">Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailedScores.map((entry, index) => (
                          <TableRow key={`${entry.userId}-${index}`}>
                            <TableCell className="font-medium">
                              {entry.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {entry.userId}
                            </TableCell>
                            <TableCell className="text-muted-foreground max-w-xs">
                              <div
                                className="text-xs truncate"
                                title={entry.sessionIdentifier}
                              >
                                {entry.sessionIdentifier}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {entry.score}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="sessions" className="flex-1 h-0 mt-2">
              <ScrollArea className="h-full pr-4 -mr-4">
                {sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CalendarDays className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                      No sessions found for this quiz.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 pb-4">
                    {sessions.map((session) => (
                      <div
                        key={session._id}
                        className="rounded-lg border p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                QM: {session.quizMaster?.name ?? "N/A"}
                              </span>
                              <Badge
                                variant={
                                  session.isActive ? "default" : "secondary"
                                }
                              >
                                {session.isActive ? "Active" : "Ended"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(session.date).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              {session.attendees.length}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => initiateDelete(session)}
                              disabled={deletingSessionId === session._id}
                            >
                              {deletingSessionId === session._id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {session.attendees.length > 0 && (
                          <>
                            <Separator />
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-12">#</TableHead>
                                  <TableHead>Attendee</TableHead>
                                  <TableHead>Emp Code</TableHead>
                                  <TableHead className="text-right">
                                    Score
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {[...session.attendees]
                                  .sort((a, b) => b.score - a.score)
                                  .map((attendee, index) => (
                                    <TableRow key={attendee.name}>
                                      <TableCell>
                                        {index === 0 ? (
                                          <Trophy className="h-4 w-4 text-yellow-500" />
                                        ) : (
                                          index + 1
                                        )}
                                      </TableCell>
                                      <TableCell className="font-medium">
                                        {attendee.name}
                                      </TableCell>
                                      <TableCell className="text-muted-foreground">
                                        {attendee.userId}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {attendee.score}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent style={{ maxWidth: "28rem", width: "28rem" }}>
            <DialogHeader>
              <DialogTitle>Delete Session</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this session? This action cannot
                be undone.
                {sessionToDelete && (
                  <div className="mt-2 p-2 bg-muted rounded text-sm">
                    <div>
                      <strong>QM:</strong> {sessionToDelete.quizMaster?.name}
                    </div>
                    <div>
                      <strong>Date:</strong>{" "}
                      {new Date(sessionToDelete.date).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Attendees:</strong>{" "}
                      {sessionToDelete.attendees.length}
                    </div>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deletingSessionId !== null}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deletingSessionId !== null}
              >
                {deletingSessionId ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  "Delete Session"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
