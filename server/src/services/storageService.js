import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import AWS from 'aws-sdk';
import multerS3 from 'multer-s3';

let uploader;

export function getResumeUploader() {
  if (uploader) return uploader;
  const hasS3 = process.env.AWS_ACCESS_KEY_ID && process.env.S3_BUCKET;
  const fileFilter = (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') return cb(new Error('PDF only'));
    cb(null, true);
  };
  const limits = { fileSize: 5 * 1024 * 1024 };
  if (hasS3) {
    const s3 = new AWS.S3({ region: process.env.AWS_REGION });
    uploader = multer({
      fileFilter,
      limits,
      storage: multerS3({
        s3,
        bucket: process.env.S3_BUCKET,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
          const key = `resumes/${Date.now()}_${file.originalname}`;
          cb(null, key);
        },
      }),
    });
  } else {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const uploadDir = path.join(__dirname, '../../uploads');
    const storage = multer.diskStorage({
      destination: uploadDir,
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
      },
    });
    uploader = multer({ storage, fileFilter, limits });
  }
  return uploader;
}


