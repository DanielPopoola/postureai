import { api, Session, Snapshot } from "@/lib/api";
import { format, parseISO } from "date-fns";

export async function exportSessionsCSV() {
  const { data: sessions } = await api.get<Session[]>("/sessions");
  if (!sessions?.length) throw new Error("No sessions to export");

  const headers = ["Date", "Start Time", "End Time", "Duration (min)", "Avg Score", "Alerts"];
  const rows = sessions.map((s) => {
    const start = parseISO(s.started_at);
    const end = s.ended_at ? parseISO(s.ended_at) : null;
    const duration = end ? Math.round((end.getTime() - start.getTime()) / 60000) : "In progress";
    return [
      format(start, "yyyy-MM-dd"),
      format(start, "HH:mm:ss"),
      end ? format(end, "HH:mm:ss") : "—",
      String(duration),
      String(s.avg_posture_score ?? "—"),
      String(s.total_alerts ?? 0),
    ];
  });

  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  downloadFile(csv, "posture-sessions.csv", "text/csv");
}

export async function exportSnapshotsCSV() {
  const { data: snapshots } = await api.get<Snapshot[]>("/snapshots?limit=1000");
  if (!snapshots?.length) throw new Error("No snapshots to export");

  const headers = ["Timestamp", "Score", "Status", "Neck Angle", "Spine Angle", "Shoulder Tilt"];
  const rows = snapshots.map((s) => [
    format(parseISO(s.captured_at), "yyyy-MM-dd HH:mm:ss"),
    String(s.posture_score),
    s.posture_state,
    String(s.neck_angle ?? "—"),
    String(s.spine_angle ?? "—"),
    String(s.shoulder_tilt ?? "—"),
  ]);

  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  downloadFile(csv, "posture-snapshots.csv", "text/csv");
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function generatePDFReport() {
  const { data: sessions } = await api.get<Session[]>("/sessions?limit=30");
  if (!sessions?.length) throw new Error("No session data available");

  const scored = sessions.filter((s) => s.avg_posture_score != null);
  const avgScore = scored.length
    ? scored.reduce((sum, s) => sum + s.avg_posture_score!, 0) / scored.length
    : 0;

  const totalAlerts = sessions.reduce((sum, s) => sum + (s.total_alerts ?? 0), 0);
  const totalMinutes = sessions.reduce((sum, s) => {
    if (!s.ended_at) return sum;
    return sum + Math.round((parseISO(s.ended_at).getTime() - parseISO(s.started_at).getTime()) / 60000);
  }, 0);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>PostureAI Report</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 40px; color: #1a1a2e; max-width: 800px; margin: 0 auto; }
    h1 { color: #2d8a6e; border-bottom: 3px solid #2d8a6e; padding-bottom: 10px; }
    h2 { color: #2d8a6e; margin-top: 30px; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0; }
    .stat { background: #f0fdf4; border-radius: 12px; padding: 20px; text-align: center; }
    .stat .value { font-size: 32px; font-weight: bold; color: #2d8a6e; }
    .stat .label { font-size: 12px; color: #666; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e5e5; font-size: 13px; }
    th { background: #f9fafb; font-weight: 600; }
    .footer { margin-top: 40px; text-align: center; color: #999; font-size: 11px; }
  </style>
</head>
<body>
  <h1>📊 PostureAI Report</h1>
  <p>Generated on ${format(new Date(), "MMMM d, yyyy")} • Last ${sessions.length} sessions</p>
  <div class="stats">
    <div class="stat"><div class="value">${Math.round(avgScore)}</div><div class="label">Average Score</div></div>
    <div class="stat"><div class="value">${sessions.length}</div><div class="label">Total Sessions</div></div>
    <div class="stat"><div class="value">${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m</div><div class="label">Time Monitored</div></div>
  </div>
  <h2>Session History</h2>
  <table>
    <tr><th>Date</th><th>Duration</th><th>Avg Score</th><th>Alerts</th></tr>
    ${sessions.map((s) => {
      const start = parseISO(s.started_at);
      const end = s.ended_at ? parseISO(s.ended_at) : null;
      const dur = end ? Math.round((end.getTime() - start.getTime()) / 60000) : 0;
      return `<tr>
        <td>${format(start, "MMM d, yyyy h:mm a")}</td>
        <td>${dur > 0 ? `${Math.floor(dur / 60)}h ${dur % 60}m` : "—"}</td>
        <td>${s.avg_posture_score ?? "—"}</td>
        <td>${s.total_alerts ?? 0}</td>
      </tr>`;
    }).join("")}
  </table>
  <div class="footer"><p>PostureAI — AI-Powered Posture Monitoring</p></div>
</body>
</html>`;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => printWindow.print();
  }
}