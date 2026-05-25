"use client";

import { useEffect, useState, useMemo } from "react";
import { CalendarDays, Users, Trophy, Trash2, History, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Session } from "@/types/quiz";

type SortField = "rank" | "name" | "empCode" | "date";
type SortDir = "asc" | "desc";

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
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Scoreboard sort + filter
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filterEmpCode, setFilterEmpCode] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterSession, setFilterSession] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Session drill-down modal
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // History sub-modal state
  const [historyUser, setHistoryUser] = useState<{
    name: string;
    userId: string;
    entries: { sessionIdentifier: string; score: number; date: Date }[];
  } | null>(null);

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

  // Reset sort/filter when modal opens for a new quiz
  useEffect(() => {
    if (open) {
      setSortField("rank");
      setSortDir("desc");
      setFilterEmpCode("");
      setFilterName("");
      setFilterSession("");
      setFilterDate("");
    }
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
    if (sessionToDelete) handleDeleteSession(sessionToDelete._id);
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

  // Map of userId → all session entries (for multi-session detection)
  const userSessionHistory = useMemo(() => {
    const map = new Map<
      string,
      { name: string; userId: string; entries: { sessionIdentifier: string; score: number; date: Date }[] }
    >();

    for (const session of sessions) {
      const sessionDate = new Date(session.date);
      const sessionIdentifier = session.sessionName || formatSessionIdentifier(session);
      for (const attendee of session.attendees) {
        const key = attendee.userId || attendee.name;
        const existing = map.get(key);
        const entry = { sessionIdentifier, score: attendee.score, date: sessionDate };
        if (existing) {
          existing.entries.push(entry);
        } else {
          map.set(key, { name: attendee.name, userId: attendee.userId || attendee.name, entries: [entry] });
        }
      }
    }

    for (const userData of map.values()) {
      userData.entries.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    return map;
  }, [sessions]);

  const overallScoreboard = useMemo(() => {
    const employeeMap = new Map<
      string,
      {
        name: string;
        totalScore: number;
        sessionIdentifier: string;
        sessionId: string;
        userId: string;
        sessionDate: Date;
        sessionCount: number;
      }
    >();

    for (const session of sessions) {
      const sessionDate = new Date(session.date);
      const sessionIdentifier = session.sessionName || formatSessionIdentifier(session);

      for (const attendee of session.attendees) {
        const key = attendee.userId || attendee.name;
        const existing = employeeMap.get(key);

        if (!existing || sessionDate > existing.sessionDate) {
          employeeMap.set(key, {
            name: attendee.name,
            totalScore: attendee.score,
            sessionIdentifier,
            sessionId: session._id,
            userId: attendee.userId,
            sessionDate,
            sessionCount: existing?.sessionCount ?? 1,
          });
        } else if (existing) {
          existing.sessionCount += 1;
        }
      }
    }

    for (const [key, entry] of employeeMap.entries()) {
      const historyEntry = userSessionHistory.get(key);
      if (historyEntry) entry.sessionCount = historyEntry.entries.length;
    }

    return [...employeeMap.values()].sort((a, b) => b.totalScore - a.totalScore);
  }, [sessions, userSessionHistory]);

  const handleSortClick = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "rank" ? "desc" : "asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-40" />;
    return sortDir === "asc"
      ? <ArrowUp className="ml-1 h-3.5 w-3.5" />
      : <ArrowDown className="ml-1 h-3.5 w-3.5" />;
  };

  const sortedFilteredScoreboard = useMemo(() => {
    let filtered = overallScoreboard;

    if (filterEmpCode.trim()) {
      const q = filterEmpCode.trim().toLowerCase();
      filtered = filtered.filter((e) => (e.userId ?? "").toLowerCase().includes(q));
    }
    if (filterName.trim()) {
      const q = filterName.trim().toLowerCase();
      filtered = filtered.filter((e) => e.name.toLowerCase().includes(q));
    }
    if (filterSession.trim()) {
      const q = filterSession.trim().toLowerCase();
      filtered = filtered.filter((e) => e.sessionIdentifier.toLowerCase().includes(q));
    }
    if (filterDate) {
      filtered = filtered.filter((e) => {
        const d = e.sessionDate;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}` === filterDate;
      });
    }

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortField === "rank") cmp = b.totalScore - a.totalScore;
      else if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "empCode") cmp = (a.userId ?? "").localeCompare(b.userId ?? "");
      else if (sortField === "date") cmp = a.sessionDate.getTime() - b.sessionDate.getTime();
      return sortDir === "asc" ? -cmp : cmp;
    });
  }, [overallScoreboard, sortField, sortDir, filterEmpCode, filterName, filterSession, filterDate]);

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  };

  return (
    <>
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
                <TabsTrigger value="sessions">
                  <CalendarDays className="h-4 w-4" />
                  Sessions
                </TabsTrigger>
              </TabsList>

              {/* ── Overall Scoreboard ── */}
              <TabsContent value="scoreboard" className="flex-1 h-0 mt-2 flex flex-col gap-2">
                <ScrollArea className="flex-1 pr-4 -mr-4">
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
                            <TableHead>
                              <button type="button" className="flex items-center hover:text-foreground" onClick={() => handleSortClick("empCode")}>
                                Emp Code <SortIcon field="empCode" />
                              </button>
                            </TableHead>
                            <TableHead>
                              <button type="button" className="flex items-center hover:text-foreground" onClick={() => handleSortClick("name")}>
                                Name <SortIcon field="name" />
                              </button>
                            </TableHead>
                            <TableHead>Session</TableHead>
                            <TableHead>
                              <button type="button" className="flex items-center hover:text-foreground" onClick={() => handleSortClick("date")}>
                                Date <SortIcon field="date" />
                              </button>
                            </TableHead>
                            <TableHead className="text-right">
                              <button type="button" className="flex items-center ml-auto hover:text-foreground" onClick={() => handleSortClick("rank")}>
                                Score <SortIcon field="rank" />
                              </button>
                            </TableHead>
                          </TableRow>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="py-1" />
                            <TableHead className="py-1">
                              <Input
                                placeholder="Filter…"
                                value={filterEmpCode}
                                onChange={(e) => setFilterEmpCode(e.target.value)}
                                className="h-6 text-xs px-2"
                              />
                            </TableHead>
                            <TableHead className="py-1">
                              <Input
                                placeholder="Filter…"
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                                className="h-6 text-xs px-2"
                              />
                            </TableHead>
                            <TableHead className="py-1">
                              <Input
                                placeholder="Filter…"
                                value={filterSession}
                                onChange={(e) => setFilterSession(e.target.value)}
                                className="h-6 text-xs px-2"
                              />
                            </TableHead>
                            <TableHead className="py-1">
                              <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="h-6 w-full rounded border border-input bg-background px-1.5 text-xs text-foreground"
                              />
                            </TableHead>
                            <TableHead className="py-1" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedFilteredScoreboard.map((entry, index) => {
                            const userId = entry.userId || entry.name;
                            const hasMultipleSessions = entry.sessionCount > 1;
                            return (
                              <TableRow key={entry.userId ?? entry.name}>
                                <TableCell>
                                  {index === 0 && sortField === "rank" && sortDir === "desc" ? (
                                    <Trophy className="h-4 w-4 text-yellow-500" />
                                  ) : (
                                    index + 1
                                  )}
                                </TableCell>
                                <TableCell className="font-mono text-sm">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-muted-foreground">{entry.userId}</span>
                                    {hasMultipleSessions && (
                                      <button
                                        type="button"
                                        title={`${entry.sessionCount} sessions — click to view history`}
                                        onClick={() => {
                                          const userData = userSessionHistory.get(userId);
                                          if (userData) setHistoryUser(userData);
                                        }}
                                        className="inline-flex items-center gap-0.5 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 hover:bg-blue-200 transition-colors dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/70"
                                      >
                                        <History className="h-3 w-3" />
                                        {entry.sessionCount}
                                      </button>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">{entry.name}</TableCell>
                                <TableCell>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedSessionId(entry.sessionId)}
                                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-200 text-left"
                                  >
                                    {entry.sessionIdentifier}
                                  </button>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                  {formatShortDate(entry.sessionDate)}
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                  {entry.totalScore}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {sortedFilteredScoreboard.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                                No results match your filter.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              {/* ── Sessions ── */}
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
                                {session.sessionName && (
                                  <span className="text-sm font-semibold">
                                    {session.sessionName}
                                  </span>
                                )}
                                <span className="text-sm text-muted-foreground">
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
                                    <TableHead>Emp Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-right">Score</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {[...session.attendees]
                                    .sort((a, b) => b.score - a.score)
                                    .map((attendee, index) => {
                                      const key = attendee.userId || attendee.name;
                                      const userData = userSessionHistory.get(key);
                                      const hasMultipleSessions = (userData?.entries.length ?? 0) > 1;
                                      return (
                                        <TableRow key={attendee.name}>
                                          <TableCell>
                                            {index === 0 ? (
                                              <Trophy className="h-4 w-4 text-yellow-500" />
                                            ) : (
                                              index + 1
                                            )}
                                          </TableCell>
                                          <TableCell className="font-mono text-sm">
                                            <div className="flex items-center gap-1.5">
                                              <span className="text-muted-foreground">{attendee.userId}</span>
                                              {hasMultipleSessions && (
                                                <button
                                                  type="button"
                                                  title={`${userData!.entries.length} sessions — click to view history`}
                                                  onClick={() => setHistoryUser(userData!)}
                                                  className="inline-flex items-center gap-0.5 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 hover:bg-blue-200 transition-colors dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/70"
                                                >
                                                  <History className="h-3 w-3" />
                                                  {userData!.entries.length}
                                                </button>
                                              )}
                                            </div>
                                          </TableCell>
                                          <TableCell className="font-medium">{attendee.name}</TableCell>
                                          <TableCell className="text-right">
                                            {attendee.score}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
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
                  Are you sure you want to delete this session? This action cannot be undone.
                  {sessionToDelete && (
                    <div className="mt-2 p-2 bg-muted rounded text-sm">
                      {sessionToDelete.sessionName && (
                        <div><strong>Session:</strong> {sessionToDelete.sessionName}</div>
                      )}
                      <div><strong>QM:</strong> {sessionToDelete.quizMaster?.name}</div>
                      <div><strong>Date:</strong> {new Date(sessionToDelete.date).toLocaleDateString()}</div>
                      <div><strong>Attendees:</strong> {sessionToDelete.attendees.length}</div>
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

      {/* Per-user session history sub-modal */}
      <Dialog open={!!historyUser} onOpenChange={(o) => { if (!o) setHistoryUser(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Session History — {historyUser?.name}
            </DialogTitle>
            <DialogDescription>
              Emp Code: {historyUser?.userId} &middot; {historyUser?.entries.length} session
              {(historyUser?.entries.length ?? 0) > 1 ? "s" : ""} &middot; showing latest first
            </DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Session</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyUser?.entries.map((e, i) => (
                <TableRow key={i}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-50 truncate" title={e.sessionIdentifier}>
                    {e.sessionIdentifier}
                    {i === 0 && (
                      <span className="ml-1.5 rounded bg-green-100 px-1 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">
                        latest
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{e.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryUser(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Session drill-down modal */}
      {(() => {
        const drillSession = sessions.find((s) => s._id === selectedSessionId);
        return (
          <Dialog open={!!selectedSessionId} onOpenChange={(o) => { if (!o) setSelectedSessionId(null); }}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {drillSession?.sessionName || (drillSession ? formatSessionIdentifier(drillSession) : "Session")}
                </DialogTitle>
                <DialogDescription>
                  {drillSession && new Date(drillSession.date).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                  {drillSession && ` · ${drillSession.attendees.length} attendee${drillSession.attendees.length !== 1 ? "s" : ""}`}
                </DialogDescription>
              </DialogHeader>
              {drillSession && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Emp Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...drillSession.attendees]
                      .sort((a, b) => b.score - a.score)
                      .map((attendee, i) => (
                        <TableRow key={attendee.userId ?? attendee.name}>
                          <TableCell>
                            {i === 0 ? <Trophy className="h-4 w-4 text-yellow-500" /> : i + 1}
                          </TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {attendee.userId}
                          </TableCell>
                          <TableCell className="font-medium">{attendee.name}</TableCell>
                          <TableCell className="text-right font-semibold">{attendee.score}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedSessionId(null)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </>
  );
}
