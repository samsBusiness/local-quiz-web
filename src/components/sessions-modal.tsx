"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Users, Trophy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[85vh] max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Sessions for {quizName}
          </DialogTitle>
          <DialogDescription>
            View all sessions and attendee scores for this quiz.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 h-0 pr-4 -mr-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
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
                          variant={session.isActive ? "default" : "secondary"}
                        >
                          {session.isActive ? "Active" : "Ended"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {session.attendees.length}
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
                            <TableHead className="text-right">Score</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[...session.attendees]
                            .sort((a, b) => b.score - a.score)
                            .map((attendee, index) => (
                              <TableRow key={attendee.userId}>
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
      </DialogContent>
    </Dialog>
  );
}
