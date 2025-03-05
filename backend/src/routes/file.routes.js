import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadFile } from '../controllers/file.controller.js';

const router = Router();

router.route('/upload').post(
    upload.single('file'),
    uploadFile
)

export default router;