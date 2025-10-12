import multer from "multer";
import path from "path";

const dirPath = path.resolve(__dirname,"../uploads");
const upload = multer({
  dest: dirPath,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const ok = /^image\/(jpe?g|png|webp|gif|bmp|svg\+xml)$/.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error("Only image files are allowed"));
  },
});

export const uploadImages = upload.array("images", 10);

export default uploadImages;
