import fs from "fs";
import path from "path";
import { app } from "electron";

export interface HistoryRecord {
  id: string;
  timestamp: string; // ISO
  operation: any; // opaque operation payload (move results / plan etc.)
}

export function getHistoryFilePath(): string {
  const userData = app.getPath("userData");
  const filePath = path.join(userData, "history.json");
  console.log("historyStore.getHistoryFilePath", { userData, filePath });
  return filePath;
}

export function readHistory(): HistoryRecord[] {
  const filePath = getHistoryFilePath();
  try {
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as HistoryRecord[];
    return [];
  } catch (err: any) {
    return [];
  }
}

export function writeHistory(
  records: HistoryRecord[],
): { ok: true } | { ok: false; error: string } {
  const filePath = getHistoryFilePath();
  try {
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(records, null, 2), "utf8");
    console.log("historyStore.writeHistory: history file written", {
      filePath,
    });
    return { ok: true };
  } catch (err: any) {
    console.error("historyStore.writeHistory: failed to write history", err);
    return { ok: false, error: String(err) };
  }
}

export function appendHistory(
  record: Omit<HistoryRecord, "timestamp"> &
    Partial<Pick<HistoryRecord, "timestamp">>,
) {
  try {
    const full: HistoryRecord = {
      id: record.id,
      timestamp: record.timestamp ?? new Date().toISOString(),
      operation: record.operation,
    };

    const current = readHistory();
    current.push(full);
    const w = writeHistory(current);
    if (w.ok) return { ok: true, record: full };
    return { ok: false, error: w.error };
  } catch (err: any) {
    return { ok: false, error: String(err) };
  }
}

export default {
  getHistoryFilePath,
  readHistory,
  writeHistory,
  appendHistory,
};
