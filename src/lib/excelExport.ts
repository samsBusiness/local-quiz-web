import * as XLSX from "xlsx";
import type { Session } from "@/types/quiz";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    " " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
}

function formatSessionIdentifier(session: Session): string {
  const date = new Date(session.date);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${session.quizMaster?.name ?? "QM"}: ${day}-${month}-${year} ${hours}:${minutes}`;
}

/**
 * Exports a quiz's scoreboard (best score per attendee) and full session
 * history to a two-sheet .xlsx workbook and triggers a browser download.
 */
export function exportQuizToExcel(quizName: string, sessions: Session[]) {
  // --- Scoreboard sheet: best score per attendee across all sessions ---
  const employeeMap = new Map<
    string,
    {
      name: string;
      userId: string;
      score: number;
      correctAnswers?: number;
      totalQuestions?: number;
      sessionIdentifier: string;
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
          userId: attendee.userId,
          score: attendee.score,
          correctAnswers: attendee.correctAnswers,
          totalQuestions: attendee.totalQuestions,
          sessionIdentifier,
          sessionDate,
          sessionCount: existing?.sessionCount ?? 1,
        });
      } else {
        existing.sessionCount += 1;
      }
    }
  }

  const scoreboardRows = [...employeeMap.values()]
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({
      Rank: index + 1,
      "Emp Code": entry.userId || "",
      Name: entry.name,
      Score: entry.score,
      Correct: entry.correctAnswers ?? "",
      "Total Questions": entry.totalQuestions ?? "",
      "Sessions Attended": entry.sessionCount,
      "Latest Session": entry.sessionIdentifier,
      Date: formatDate(entry.sessionDate.toISOString()),
    }));

  if (scoreboardRows.length === 0) {
    scoreboardRows.push({
      Rank: 0,
      "Emp Code": "",
      Name: "No data",
      Score: 0,
      Correct: "",
      "Total Questions": "",
      "Sessions Attended": 0,
      "Latest Session": "",
      Date: "",
    });
  }

  // --- Sessions sheet: one table per session, each with its own title ---
  const sessionsAoa: (string | number)[][] = [];
  const sessionsMerges: { s: { r: number; c: number }; e: { r: number; c: number } }[] = [];
  const sessionColumnCount = 6;

  for (const session of sessions) {
    const sessionIdentifier = session.sessionName || formatSessionIdentifier(session);
    const sessionDateStr = formatDate(session.date);
    const sorted = [...session.attendees].sort((a, b) => b.score - a.score);

    const titleRow = sessionsAoa.length;
    sessionsAoa.push([`${sessionIdentifier} (${sessionDateStr})`]);
    sessionsMerges.push({
      s: { r: titleRow, c: 0 },
      e: { r: titleRow, c: sessionColumnCount - 1 },
    });

    sessionsAoa.push(["Rank", "Emp Code", "Name", "Score", "Correct", "Total Questions"]);

    if (sorted.length === 0) {
      sessionsAoa.push(["", "", "(no attendees)", "", "", ""]);
    } else {
      sorted.forEach((attendee, index) => {
        sessionsAoa.push([
          index + 1,
          attendee.userId || "",
          attendee.name,
          attendee.score,
          attendee.correctAnswers ?? "",
          attendee.totalQuestions ?? "",
        ]);
      });
    }

    sessionsAoa.push([]);
  }

  if (sessions.length === 0) {
    sessionsAoa.push(["No data"]);
  }

  const sessionsSheet = XLSX.utils.aoa_to_sheet(sessionsAoa);
  sessionsSheet["!merges"] = sessionsMerges;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(scoreboardRows), "Scoreboard");
  XLSX.utils.book_append_sheet(wb, sessionsSheet, "Sessions");

  const safeName = quizName.replace(/[^a-z0-9]+/gi, "_").slice(0, 40) || "quiz";
  const filename = `${safeName}_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}
