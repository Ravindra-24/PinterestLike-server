import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
  fileFilter: (_req, file, callback) => {
    const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
    callback(allowed.has(file.mimetype) ? null : new multer.MulterError("LIMIT_UNEXPECTED_FILE", "image"), allowed.has(file.mimetype));
  },
});

export default upload;
