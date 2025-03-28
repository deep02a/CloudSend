import multer from "multer";
import path from "path";
import fs from "fs";

// File size limit (200MB)
const FILE_SIZE_LIMIT = 200 * 1024 * 1024; // 200MB in bytes

// Directory where files will be temporarily stored
const TEMP_DIR = path.join("public", "temp");

// Ensure the temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// File filter function with proper error handling
const fileFilter = (req, file, cb) => {
    const videoMimeTypes = [
        "video/mp4",       
        "video/x-mpegurl",  
        "video/quicktime",  
        "video/webm",    
        "video/x-msvideo"  
    ];

    if (videoMimeTypes.includes(file.mimetype)) {
        return cb(new Error("Video files are not allowed!"), false); // Reject with error message
    }

    cb(null, true); // Accept other files
};

// Configure Multer for disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, TEMP_DIR); // Save files to public/temp
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Keep the original filename
    }
});

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: FILE_SIZE_LIMIT }
});

