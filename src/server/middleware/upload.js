/**
 * KreazyAI Secure File Upload Middleware
 * Uses multer with strict validation — no public static exposure.
 * Files stored in /data/uploads/* (private, served via authenticated endpoints only).
 */
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { errorResponse, HTTP_STATUS, API_ERROR_CODES } from '../utils/response.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Accepted MIME types ──────────────────────────────────────────────────────
const AVATAR_MIME_WHITELIST = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const DOCUMENT_MIME_WHITELIST = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
const AVATAR_MAX_BYTES = 5 * 1024 * 1024;   // 5 MB
const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// ── Private upload directories ───────────────────────────────────────────────
const UPLOAD_BASE = path.resolve(__dirname, '../../../data/uploads');
const AVATAR_DIR = path.join(UPLOAD_BASE, 'avatars');
const DOCUMENT_DIR = path.join(UPLOAD_BASE, 'documents');

[UPLOAD_BASE, AVATAR_DIR, DOCUMENT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── Secure random filename generator ─────────────────────────────────────────
function secureFilename(originalname) {
  const ext = path.extname(originalname).toLowerCase();
  const randomName = crypto.randomBytes(20).toString('hex');
  return `${randomName}${ext}`;
}

// ── Avatar storage ────────────────────────────────────────────────────────────
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, AVATAR_DIR),
  filename: (req, file, cb) => cb(null, secureFilename(file.originalname)),
});

const avatarFilter = (req, file, cb) => {
  if (AVATAR_MIME_WHITELIST.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('INVALID_MIME_TYPE: Only JPG, PNG, and WebP images are accepted for profile photos.'), false);
  }
};

export const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: avatarFilter,
  limits: { fileSize: AVATAR_MAX_BYTES, files: 1 },
});

// ── Document storage ──────────────────────────────────────────────────────────
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, DOCUMENT_DIR),
  filename: (req, file, cb) => cb(null, secureFilename(file.originalname)),
});

const documentFilter = (req, file, cb) => {
  if (DOCUMENT_MIME_WHITELIST.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('INVALID_MIME_TYPE: Only JPG, PNG, WebP, and PDF files are accepted for documents.'), false);
  }
};

export const documentUpload = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: { fileSize: DOCUMENT_MAX_BYTES, files: 1 },
});

// ── Multer error handler middleware ──────────────────────────────────────────
export function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'File is too large. Maximum size is 10 MB for documents, 5 MB for profile photos.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }
    return errorResponse(res, `Upload error: ${err.message}`, API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
  }
  if (err && err.message?.startsWith('INVALID_MIME_TYPE')) {
    return errorResponse(res, err.message.replace('INVALID_MIME_TYPE: ', ''), API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
  }
  next(err);
}
