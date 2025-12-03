import fs from "fs";
import multer from "multer";

// Define allowed file types
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/mpeg",
  "video/quicktime",
];

const MAX_FILE_SIZE = parseInt(process.env.FILE_SIZE || 3 * 1024 * 1024, 10);

// Upload Full File
// const storage = multer.memoryStorage();
// const fileFilter = (req, file, cb) => {
//   if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
//     return cb(
//       new Error("Invalid file type. Only images and videos are allowed."),
//     );
//   }
//   cb(null, true);
// };
//
// export const multerUpload = multer({
//   storage,
//   limits: { fileSize: MAX_FILE_SIZE },
//   fileFilter,
// });

// Upload via file path
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "./uploads";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

export const multerUpload = multer({
  storage,
});

export default multerUpload;
// Single usage: upload.single("file")
// For multiple: upload.array("files", 5)
