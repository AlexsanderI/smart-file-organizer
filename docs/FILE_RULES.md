# Phase 1 File Rules

## Goal

Define deterministic Phase 1 file classification rules.

Phase 1 must classify files only by extension.

No filename analysis, content analysis, OCR, image analysis, PDF analysis, AI, or semantic classification is allowed.

---

## General Rules

- Extension matching must be case-insensitive.
- Files without extensions must be assigned to `06_To_Review`.
- Temporary download files such as `.crdownload`, `.part`, and `.tmp` must be assigned to `06_To_Review`.
- Unknown or unmapped extensions must be assigned to `07_Other`.
- Compound extensions such as `.tar.gz` must be supported explicitly.
- Directories must be ignored.
- Subfolders must not be scanned recursively in Phase 1.

---

## Documents

```txt
.pdf                         -> 01_Documents/PDF
.doc, .docx, .odt, .rtf       -> 01_Documents/Word
.xls, .xlsx, .ods, .csv       -> 01_Documents/Excel
.ppt, .pptx, .odp             -> 01_Documents/Presentations
.txt, .md                     -> 01_Documents/Text
```

---

## Media

```txt
.jpg, .jpeg, .png, .gif,
.webp, .bmp, .tiff, .heic     -> 02_Media/Images

.mp4, .mov, .avi, .mkv,
.webm                         -> 02_Media/Videos

.mp3, .wav, .m4a, .flac,
.ogg                          -> 02_Media/Audio
```

---

## Archives

```txt
.zip, .rar, .7z,
.tar, .gz, .tar.gz            -> 03_Archives
```

---

## Installers

```txt
.exe, .msi, .dmg, .pkg,
.deb, .rpm                    -> 04_Installers
```

---

## Code

```txt
.js, .ts, .tsx, .jsx,
.html, .css, .json, .xml,
.py, .java, .cpp, .cs         -> 05_Code
```

---

## To Review

```txt
.crdownload, .part, .tmp      -> 06_To_Review
files without extension       -> 06_To_Review
```

---

## Other

```txt
any unmapped extension        -> 07_Other
```

---

## Suggested Implementation Shape

Place the implementation source of truth in:

```txt
src/shared/fileRules.ts
```

Example:

```ts
export type FileCategory =
  | "01_Documents/PDF"
  | "01_Documents/Word"
  | "01_Documents/Excel"
  | "01_Documents/Presentations"
  | "01_Documents/Text"
  | "02_Media/Images"
  | "02_Media/Videos"
  | "02_Media/Audio"
  | "03_Archives"
  | "04_Installers"
  | "05_Code"
  | "06_To_Review"
  | "07_Other";

export const EXTENSION_RULES: Record<string, FileCategory> = {
  pdf: "01_Documents/PDF",

  doc: "01_Documents/Word",
  docx: "01_Documents/Word",
  odt: "01_Documents/Word",
  rtf: "01_Documents/Word",

  xls: "01_Documents/Excel",
  xlsx: "01_Documents/Excel",
  ods: "01_Documents/Excel",
  csv: "01_Documents/Excel",

  ppt: "01_Documents/Presentations",
  pptx: "01_Documents/Presentations",
  odp: "01_Documents/Presentations",

  txt: "01_Documents/Text",
  md: "01_Documents/Text",

  jpg: "02_Media/Images",
  jpeg: "02_Media/Images",
  png: "02_Media/Images",
  gif: "02_Media/Images",
  webp: "02_Media/Images",
  bmp: "02_Media/Images",
  tiff: "02_Media/Images",
  heic: "02_Media/Images",

  mp4: "02_Media/Videos",
  mov: "02_Media/Videos",
  avi: "02_Media/Videos",
  mkv: "02_Media/Videos",
  webm: "02_Media/Videos",

  mp3: "02_Media/Audio",
  wav: "02_Media/Audio",
  m4a: "02_Media/Audio",
  flac: "02_Media/Audio",
  ogg: "02_Media/Audio",

  zip: "03_Archives",
  rar: "03_Archives",
  "7z": "03_Archives",
  tar: "03_Archives",
  gz: "03_Archives",
  "tar.gz": "03_Archives",

  exe: "04_Installers",
  msi: "04_Installers",
  dmg: "04_Installers",
  pkg: "04_Installers",
  deb: "04_Installers",
  rpm: "04_Installers",

  js: "05_Code",
  ts: "05_Code",
  tsx: "05_Code",
  jsx: "05_Code",
  html: "05_Code",
  css: "05_Code",
  json: "05_Code",
  xml: "05_Code",
  py: "05_Code",
  java: "05_Code",
  cpp: "05_Code",
  cs: "05_Code",

  crdownload: "06_To_Review",
  part: "06_To_Review",
  tmp: "06_To_Review",
};

export function classifyExtension(extension: string | null): FileCategory {
  if (!extension) {
    return "06_To_Review";
  }

  const normalizedExtension = extension.toLowerCase().replace(/^\./, "");

  return EXTENSION_RULES[normalizedExtension] ?? "07_Other";
}
```
