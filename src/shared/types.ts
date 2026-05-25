export type FileStatus =
  | "Ready"
  | "Conflict"
  | "Skipped"
  | "Moved"
  | "Failed"
  | "Undone"
  | "To Review";

export interface ScannedFile {
  id: string;
  name: string;
  extension: string;
  size: number; // bytes
  category: string; // Phase 1 category like 01_Documents
  target: string; // target folder name
  status: FileStatus;
  path: string; // original path (mock)
  // Classification pipeline metadata (reserved for future phases)
  classificationSource?: string; // e.g. 'extension', 'filename', 'ai'
  confidence?: number | null; // 0-1 confidence score (null if N/A)
  reason?: string | null; // human-readable reason or rule
  manualCategory?: string | null; // user override category
  overridden?: boolean; // whether manual override is active
}

export interface ScanSummary {
  total: number;
  ready: number;
  conflicts: number;
  skipped: number;
  toReview: number;
}

export interface MockScanResult {
  files: ScannedFile[];
  summary: ScanSummary;
}
