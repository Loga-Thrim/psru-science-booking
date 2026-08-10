import multer from "multer";
import path from "path";
import fs from "fs";
import { randomBytes } from "crypto";
import { Request, Response, NextFunction } from "express";

// Resolved from the working directory, not __dirname: a __dirname-relative path lands in
// dist/uploads at runtime, which is not where the Docker volume is mounted, so uploads
// disappeared on every rebuild.
export const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// SVG is deliberately excluded: it can carry script and we serve uploads from our own origin.
const ALLOWED = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/bmp", ".bmp"],
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = ALLOWED.get(file.mimetype) ?? ".bin";
    cb(null, `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter(_req, file, cb) {
    // A declared mimetype is only a hint; the real check happens in verifyImageFiles.
    ALLOWED.has(file.mimetype)
      ? cb(null, true)
      : cb(new Error("รองรับเฉพาะไฟล์รูปภาพ (jpg, png, webp, gif, bmp)"));
  },
});

const uploadArray = upload.array("images", 10);

function startsWith(buf: Buffer, bytes: number[], offset = 0): boolean {
  return bytes.every((b, i) => buf[offset + i] === b);
}

// Reads the file header so a text file renamed/relabelled as image/png is rejected.
function looksLikeImage(buf: Buffer): boolean {
  if (buf.length < 12) return false;
  if (startsWith(buf, [0xff, 0xd8, 0xff])) return true;                              // JPEG
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return true; // PNG
  if (startsWith(buf, [0x47, 0x49, 0x46, 0x38])) return true;                        // GIF8
  if (startsWith(buf, [0x42, 0x4d])) return true;                                    // BMP
  if (startsWith(buf, [0x52, 0x49, 0x46, 0x46]) && startsWith(buf, [0x57, 0x45, 0x42, 0x50], 8)) return true; // RIFF....WEBP
  return false;
}

async function verifyImageFiles(req: Request, res: Response, next: NextFunction) {
  const files = (req.files as Express.Multer.File[]) ?? [];
  const bad: string[] = [];

  for (const file of files) {
    let handle: fs.promises.FileHandle | undefined;
    try {
      handle = await fs.promises.open(file.path, "r");
      const buf = Buffer.alloc(12);
      await handle.read(buf, 0, 12, 0);
      if (!looksLikeImage(buf)) bad.push(file.originalname);
    } catch {
      bad.push(file.originalname);
    } finally {
      await handle?.close().catch(() => undefined);
    }
  }

  if (bad.length > 0) {
    // Nothing referenced these yet, so drop them rather than leave junk on disk.
    await Promise.all(files.map((f) => fs.promises.unlink(f.path).catch(() => undefined)));
    return res.status(400).json({ message: `ไฟล์ไม่ใช่รูปภาพที่ถูกต้อง: ${bad.join(", ")}` });
  }

  return next();
}

// Turns multer's thrown errors into JSON instead of Express' HTML stack-trace page.
export function uploadImages(req: Request, res: Response, next: NextFunction) {
  uploadArray(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        const message =
          err.code === "LIMIT_FILE_SIZE" ? "ไฟล์มีขนาดใหญ่เกิน 5 MB"
          : err.code === "LIMIT_FILE_COUNT" ? "อัปโหลดได้สูงสุด 10 ไฟล์"
          : "อัปโหลดไฟล์ไม่สำเร็จ";
        return res.status(400).json({ message });
      }
      return res.status(400).json({ message: err.message || "อัปโหลดไฟล์ไม่สำเร็จ" });
    }
    return verifyImageFiles(req, res, next);
  });
}

export default uploadImages;
