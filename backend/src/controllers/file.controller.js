import { encrypt, decryptBuffer,generateIv} from '../utils/encryptAndDecryptFile.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {uploadToS3,getFromS3 } from '../utils/awsS3.js';
import Files from '../models/file.models.js';
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';


const fetchFiles = asyncHandler(async(req,res) => {
    try {
        const userEmail = req.user.email;
    
        const files = await Files.findAll({
            where: { userEmail },
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'originalName', 'size', 's3Key']
        });
    
        if (!files.length) {
            return res.status(404).json({ message: 'No files found for this user.' });
        }
    
        res.status(200).json({ files });
    } catch (error) {
        console.error("Error fetching files:", error);
        res.status(500).json({ message: 'Internal server error.' });
        
    }
});


const uploadFile = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded!' });
    }

    const timestamp = Date.now();
    const s3Key = `users/${req.user.email}/${timestamp}_${req.file.originalname}`;

    try {
        const decryptedKeyHex = req.user.getDecryptedKey();
        const decryptedKey = Buffer.from(decryptedKeyHex, 'hex');
        
        const iv = generateIv(); 

        if (iv.length !== 16) {
            throw new Error("IV generation failed: IV must be 16 bytes long.");
        }

        // Define file paths
        const filePath = req.file.path;
        const encryptedFilePath = `${filePath}.enc`;

        // Encrypt the file data in the temp path
        await encrypt(filePath, decryptedKey, iv);

        // Ensure the encrypted file exists before uploading
        await fs.promises.access(encryptedFilePath, fs.constants.F_OK);

        // Upload the encrypted data to S3
        const encryptedStream = fs.createReadStream(encryptedFilePath);
        await uploadToS3(encryptedStream, s3Key, req.file.mimetype);

        // Save file metadata to the database
        const newFile = await Files.create({
            id: uuidv4(),
            originalName: req.file.originalname,
            size: req.file.size,
            iv: iv.toString('hex'), // Store IV in hex format
            userEmail: req.user.email, // Foreign key linking to User
            s3Key,
        });

        // Ensure the temp file is deleted
        try {
            await fs.promises.unlink(encryptedFilePath);
        } catch (err) {
            console.warn(`Failed to delete temp encrypted file: ${err.message}`);
        }

        return res.status(200).json({
            message: 'File uploaded successfully!',
            filename: req.file.originalname,
        });
    } catch (error) {
        console.error("Error:", error);

        // Cleanup on failure
        try {
            if (fs.existsSync(encryptedFilePath)) {
                await fs.promises.unlink(encryptedFilePath);
            }
        } catch (err) {
            console.warn(`Cleanup failed: ${err.message}`);
        }


        return res.status(500).json({ error: "File upload failed!" });
    }
});


const downloadFile = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Fetch file metadata from DB
    const file = await Files.findOne({
        where: { id: { [Op.eq]: id }, userEmail: req.user.email },
    });
    if (!file) return res.status(404).json({ error: "File not found!" });

    const { s3Key, iv, originalName } = file;

    try {
        // Fetch encrypted file from S3
        const encryptedBuffer = await getFromS3(s3Key);
        if (!encryptedBuffer || encryptedBuffer.length === 0) {
            return res.status(500).json({ error: "Failed to retrieve encrypted file from S3" });
        }

        // Retrieve and decrypt user's stored encryption key
        const decryptedKey = Buffer.from(req.user.getDecryptedKey(), 'hex');
        if (decryptedKey.length !== 32) {
            return res.status(400).json({ error: "Invalid encryption key: Key must be 32 bytes" });
        }

        const ivBuffer = Buffer.from(iv, 'hex');
        if (ivBuffer.length !== 16) {
            return res.status(400).json({ error: "Invalid IV: IV must be 16 bytes" });
        }

        // Decrypt the file
        let decryptedBuffer;
        try {
            decryptedBuffer = decryptBuffer(encryptedBuffer, decryptedKey, ivBuffer);
        } catch (decryptError) {
            console.error("Decryption Error:", decryptError);
            return res.status(500).json({ error: "File decryption failed!" });
        }

        // Ensure original filename exists before setting headers
        const safeFilename = originalName ? originalName.replace(/[^a-zA-Z0-9.\-_]/g, "_") : "downloaded_file";

        // Send the decrypted file as a response
        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        return res.send(decryptedBuffer);

    } catch (error) {
        console.error("Download Error:", error);
        return res.status(500).json({ error: "File download failed!" });
    }
});


export { uploadFile, downloadFile,fetchFiles };

